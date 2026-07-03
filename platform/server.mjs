// Cinematic Command Center — local server (files + /api). No deps (Node built-ins).
// Run: node platform/server.mjs   → http://127.0.0.1:8788
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));         // .../platform
const CLIENTS = path.join(ROOT, 'clients');
const PORT = 8788;
const MIME = { '.html':'text/html', '.js':'text/javascript', '.mjs':'text/javascript',
  '.json':'application/json', '.css':'text/css', '.png':'image/png', '.jpg':'image/jpeg',
  '.jpeg':'image/jpeg', '.webp':'image/webp', '.svg':'image/svg+xml', '.ico':'image/x-icon' };

const send = (res, code, body, type='application/json') => {
  res.writeHead(code, { 'Content-Type': type });   // same-origin only, no CORS wildcard
  res.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body));
};
const ORIGIN = `http://127.0.0.1:${PORT}`;
const sameOrigin = req => { const o=req.headers.origin; return !o || o===ORIGIN || o===`http://localhost:${PORT}`; };
const readBody = req => new Promise((resolve,reject) => {
  let d='', n=0;
  req.on('data',c=>{ n+=c.length; if(n>262144){ reject(new Error('body te groot')); req.destroy(); } else d+=c; });
  req.on('end',()=>{ try{resolve(d?JSON.parse(d):{})}catch{resolve({})} });
  req.on('error',reject);
});
const safeSlug = s => /^[a-z0-9-]+$/.test(s||'') ? s : null;
const writeJSON = (fp,obj) => { const t=fp+'.tmp'; fs.writeFileSync(t, typeof obj==='string'?obj:JSON.stringify(obj,null,2)); fs.renameSync(t,fp); };
function readEnv(file, key){
  try{
    const p = path.join(process.env.HOME, '.config', 'cinematic', file);
    const line = fs.readFileSync(p,'utf8').split('\n').find(l=>l.startsWith(key+'='));
    return line ? line.slice(key.length+1).trim() : null;
  }catch{ return null; }
}

// ---- POORTWACHTER (fail-closed) ----
// Een build telt pas als klaar wanneer er BEWIJS is, niet wanneer de AI klaar is met typen.
// Bewijs = craft-lint slaagt + jury-eindscores allemaal >= 8 + qc.pass true.
// Uitkomst wordt in status.json.gate gezet; dashboard en runs.jsonl volgen dit oordeel.
function runGate(slug){
  const dir = path.join(CLIENTS, slug);
  const checks = {}; const redenen = [];

  const sitePad = path.join(dir, 'site.html');
  if (!fs.existsSync(sitePad)) { checks.site = false; redenen.push('geen site.html'); }
  else {
    checks.site = true;
    const r = spawnSync('node', [path.join(ROOT,'lib','craft-lint.mjs'), sitePad], { encoding:'utf8', timeout: 30000 });
    let lint = null; try { lint = JSON.parse(r.stdout); } catch {}
    checks.lint = !!lint?.pass;
    if (!lint) redenen.push('craft-lint kon niet draaien');
    else if (!lint.pass) redenen.push(...lint.fouten.map(f => 'lint: ' + f));
  }

  let st = {}; try { st = JSON.parse(fs.readFileSync(path.join(dir,'status.json'),'utf8')); } catch {}
  const scores = st.jury?.eind
    || (Array.isArray(st.jury?.rondes) && st.jury.rondes.length ? st.jury.rondes[st.jury.rondes.length-1].scores : null);
  const nums = scores ? Object.values(scores).filter(v => typeof v === 'number') : [];
  checks.jury = nums.length >= 4 && nums.every(v => v >= 8);
  if (!checks.jury) redenen.push(scores ? 'jury: niet alle eind-scores >= 8' : 'jury: geen eind-scores gevonden (jury-lus niet afgemaakt)');

  checks.qc = st.qc?.pass === true;
  if (!checks.qc) redenen.push('qc: pass is niet true (echte screenshot-QC ontbreekt of faalde)');

  const gate = { pass: Object.values(checks).every(Boolean), checks, redenen, ts: new Date().toISOString() };
  writeJSON(path.join(dir,'status.json'), { ...st, gate, updated: gate.ts });
  try { fs.appendFileSync(path.join(dir,'activity.jsonl'),
    JSON.stringify({ ts: gate.ts, msg: `poortwachter: ${gate.pass ? 'GESLAAGD ✓' : 'AFGEKEURD — ' + redenen.slice(0,3).join(' · ')}`, ok: gate.pass }) + '\n'); } catch {}
  rebuildIndex();
  return gate;
}

function rebuildIndex(){
  const out = { clients: [] };
  if (fs.existsSync(CLIENTS)) for (const slug of fs.readdirSync(CLIENTS)) {
    const dir = path.join(CLIENTS, slug);
    if (!fs.statSync(dir).isDirectory()) continue;
    let biz={}, st={};
    try{ biz=JSON.parse(fs.readFileSync(path.join(dir,'business.json'),'utf8')); }catch{}
    try{ st=JSON.parse(fs.readFileSync(path.join(dir,'status.json'),'utf8')); }catch{}
    out.clients.push({ slug,
      name: biz.identity?.name || slug,
      category: biz.identity?.category || '',
      stage: st.stage || 'available',
      flags: st.flags || {},
      success_probability: st.lead?.success_probability ?? null,
      // demo_url only when there is actually a site.html (or an explicit override) — no dead links
      demo_url: st.demo_url || (fs.existsSync(path.join(dir,'site.html')) ? `clients/${slug}/site.html` : null),
      gate: st.gate ? !!st.gate.pass : null,
      updated: st.updated || null });
  }
  writeJSON(path.join(CLIENTS,'index.json'), out);
  return out;
}

const server = http.createServer(async (req, res) => {
  const u = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const p = decodeURIComponent(u.pathname);

  // ---- API ----
  if (p.startsWith('/api/')) {
    if (req.method==='POST' && !sameOrigin(req)) return send(res,403,{error:'forbidden origin'});
    try {
      if (p === '/api/reindex' && req.method==='POST') return send(res,200,rebuildIndex());

      if (p === '/api/gate' && req.method==='POST') {
        const { slug } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        if(!fs.existsSync(path.join(CLIENTS,s))) return send(res,404,{error:'klant bestaat niet'});
        return send(res,200,runGate(s));
      }

      if (p === '/api/status' && req.method==='POST') {
        const { slug, patch } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const f = path.join(CLIENTS,s,'status.json');
        const cur = fs.existsSync(f)?JSON.parse(fs.readFileSync(f,'utf8')):{};
        // QC-gate (fail-closed): een demo mag pas 'sent'/'live' als de echte QC geslaagd is
        if (patch?.stage && ['sent','live'].includes(patch.stage) && !cur.qc?.pass) {
          return send(res,409,{error:'QC-gate: qc.pass is niet true — eerst de echte QC-run (screenshots) laten slagen'});
        }
        // Poortwachter-gate: en het volledige bewijs (lint + jury >= 8 + qc) moet er zijn
        if (patch?.stage && ['sent','live'].includes(patch.stage) && cur.gate?.pass !== true) {
          return send(res,409,{error:'Poortwachter: nog niet goedgekeurd — draai de poortwachter-check en fix de redenen eerst'});
        }
        const next = { ...cur, ...patch, flags:{...(cur.flags||{}),...(patch?.flags||{})}, updated:new Date().toISOString() };
        writeJSON(f, next);
        rebuildIndex();
        return send(res,200,next);
      }

      if (p === '/api/activity' && req.method==='POST') {
        const { slug, entry } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const line = JSON.stringify({ ts:new Date().toISOString(), ok:true, ...entry })+'\n';
        fs.appendFileSync(path.join(CLIENTS,s,'activity.jsonl'), line);
        return send(res,200,{ok:true});
      }

      if (p === '/api/leads' && req.method==='POST') {
        const { niche, city, max } = await readBody(req);
        const key = readEnv('places.env','GOOGLE_PLACES_KEY');
        if(!key) return send(res,200,{error:'geen Places key', added:0});
        if(!niche || !city) return send(res,200,{error:'branche en plaats zijn verplicht (werkt voor elke lokale zaak)', added:0});
        const q = `${niche} in ${city}`;
        try{
          const r = await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',
            headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,
              'X-Goog-FieldMask':'places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.websiteUri,places.nationalPhoneNumber,places.primaryType'},
            body:JSON.stringify({textQuery:q, maxResultCount: Math.min(max||10,20)})});
          const d = await r.json();
          const slugify = s => (s||'').toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40);
          // dedupe on website-domain + phone across ALL existing clients (voorkomt dubbels met andere slug-spelling)
          const normDomain = u => { try{ return new URL(u).hostname.replace(/^www\./,'').toLowerCase(); }catch{ return null; } };
          const normPhone = ph => { const d=(ph||'').replace(/\D/g,''); return d ? d.replace(/^31/,'0') : null; };
          const seenDomains = new Set(), seenPhones = new Set();
          if (fs.existsSync(CLIENTS)) for (const sl of fs.readdirSync(CLIENTS)) {
            try{
              const b = JSON.parse(fs.readFileSync(path.join(CLIENTS,sl,'business.json'),'utf8'));
              const dm = normDomain(b.contact?.website); if(dm) seenDomains.add(dm);
              for (const loc of (b.locations||[])) { const pn = normPhone(loc.phone); if(pn) seenPhones.add(pn); }
            }catch{}
          }
          let added=0;
          for(const pl of (d.places||[])){
            const name = pl.displayName?.text; if(!name) continue;
            let slug = slugify(name); if(!safeSlug(slug)) continue;
            const dir = path.join(CLIENTS,slug);
            if(fs.existsSync(dir)) continue;                       // don't overwrite existing
            const dm = normDomain(pl.websiteUri), pn = normPhone(pl.nationalPhoneNumber);
            if((dm && seenDomains.has(dm)) || (pn && seenPhones.has(pn))) continue;   // dubbel (zelfde site/telefoon)
            if(dm) seenDomains.add(dm); if(pn) seenPhones.add(pn);
            const hasSite = !!pl.websiteUri, hasPhone = !!pl.nationalPhoneNumber;
            const rc = pl.userRatingCount||0, rat = pl.rating||0;
            const clamp=(x)=>Math.max(0,Math.min(1,x));
            const budget = .5*clamp(rc/200) + .3*clamp((rat-3.5)/1.5) + .2*(hasSite?0.5:0.3);
            const need   = hasSite ? 0.6 : 0.9;                     // no site = high need to build one
            const reach  = 0.5 + (hasPhone?0.3:0) + (hasSite?0.2:0);
            const score  = Math.round(100*(0.55*budget+0.45*need)*Math.min(reach,1));
            const band = score>=70?'green':score>=40?'amber':'red';
            fs.mkdirSync(dir,{recursive:true});
            fs.writeFileSync(path.join(dir,'business.json'), JSON.stringify({
              meta:{slug, source:'Google Places lead-finder', query:q},
              identity:{name, category:(pl.primaryType||niche||'').replace(/_/g,' '), language:'nl'},
              locations:[{id:'main', label:name, address:pl.formattedAddress||'', phone:pl.nationalPhoneNumber||null}],
              contact:{ website: pl.websiteUri||null },
              reviews:{ google:{ rating:rat||null, count:rc||null } },
              _review_queue:['photos','services','hours (scrape/confirm)']
            },null,2));
            fs.writeFileSync(path.join(dir,'status.json'), JSON.stringify({
              stage:'available', flags:{},
              lead:{ success_probability:score, band, budget:+budget.toFixed(2), need:+need.toFixed(2), reach:+Math.min(reach,1).toFixed(2),
                     top_positive:[`${rc} reviews`, hasSite?'heeft site (verouderbaar)':'GEEN site'], top_blocker: hasSite?'site vervangen':'geen site → grote kans' },
              qc:{pass:false, notes:['lead — nog geen demo']}, updated:new Date().toISOString()
            },null,2));
            fs.writeFileSync(path.join(dir,'activity.jsonl'),
              JSON.stringify({ts:new Date().toISOString(),stage:'sourced',msg:`lead gevonden via Places (${q}) — score ${score}`,ok:true})+'\n');
            added++;
          }
          rebuildIndex();
          return send(res,200,{query:q, found:(d.places||[]).length, added});
        }catch(e){ return send(res,200,{error:String(e.message||e), added:0}); }
      }

      if (p === '/api/draft' && req.method==='POST') {
        const { slug } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const dir = path.join(CLIENTS,s);
        let biz={}; try{ biz=JSON.parse(fs.readFileSync(path.join(dir,'business.json'),'utf8')); }catch{}
        const name = biz.identity?.name || s;
        const draft =
`Onderwerp: Foto's voor je nieuwe website — ${name}

Hoi,

Ik ben bezig met een nieuwe, moderne website voor ${name}. Om 'm écht goed te maken heb ik een paar foto's van jullie zaak nodig:

• de gevel / ingang
• het interieur (2–3 stuks)
• een paar mooie kapsels of het team aan het werk

Een goede telefoon-foto is prima — hoe recenter hoe beter. Stuur je er ~8? Dan zet ik ze er cinematisch in en maak ik de site af.

Alvast bedankt!
Groet,
Jay`;
        const ddir = path.join(dir,'drafts'); fs.mkdirSync(ddir,{recursive:true});
        const ts = new Date().toISOString().replace(/[:.]/g,'-');
        fs.writeFileSync(path.join(ddir,`ask_photos_${ts}.md`), draft);
        return send(res,200,{draft});
      }

      if (p === '/api/photos' && req.method==='POST') {
        const { slug } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const key = readEnv('places.env','GOOGLE_PLACES_KEY');
        if(!key) return send(res,200,{error:'geen Places key (~/.config/cinematic/places.env)', photos:[]});
        const dir = path.join(CLIENTS,s);
        let biz={}; try{ biz=JSON.parse(fs.readFileSync(path.join(dir,'business.json'),'utf8')); }catch{}
        const q = `${biz.identity?.name||s} ${biz.locations?.[0]?.address||''}`.trim();
        try{
          const sr = await fetch('https://places.googleapis.com/v1/places:searchText',{method:'POST',
            headers:{'Content-Type':'application/json','X-Goog-Api-Key':key,'X-Goog-FieldMask':'places.id,places.displayName,places.photos,places.rating,places.userRatingCount'},
            body:JSON.stringify({textQuery:q})});
          const sd = await sr.json();
          const out={ query:q, places:[] };
          const sdir = path.join(dir,'assets','scraped'); fs.mkdirSync(sdir,{recursive:true});
          for(const pl of (sd.places||[]).slice(0,3)){
            const rec={ name:pl.displayName?.text, rating:pl.rating, count:pl.userRatingCount, photos:[] };
            for(let i=0;i<Math.min(6,(pl.photos||[]).length);i++){
              const ph=pl.photos[i];
              const url=`https://places.googleapis.com/v1/${ph.name}/media?maxHeightPx=1200&maxWidthPx=1200&key=${key}`;
              try{
                const ir=await fetch(url); const buf=Buffer.from(await ir.arrayBuffer());
                const fn=`${(rec.name||'p').replace(/[^a-z0-9]/gi,'_')}_${i}.jpg`;
                fs.writeFileSync(path.join(sdir,fn),buf);
                rec.photos.push(`assets/scraped/${fn}`);
              }catch{}
            }
            out.places.push(rec);
          }
          return send(res,200,out);
        }catch(e){ return send(res,200,{error:String(e.message||e), photos:[]}); }
      }

      if (p === '/api/assets' && req.method==='POST') {
        // All local photos for a client + which ones Jay approved (photo-picker).
        const { slug } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const adir = path.join(CLIENTS,s,'assets');
        const found = [];
        const walk = (d,rel)=>{ if(!fs.existsSync(d)) return;
          for(const f of fs.readdirSync(d)){
            const fp=path.join(d,f), r=rel?rel+'/'+f:f;
            if(fs.statSync(fp).isDirectory()) walk(fp,r);
            else if(/\.(jpe?g|png|webp)$/i.test(f) && !/^(old_site|new_site)/.test(f)) found.push('assets/'+r);
          }};
        walk(adir,'');
        let biz={}; try{ biz=JSON.parse(fs.readFileSync(path.join(CLIENTS,s,'business.json'),'utf8')); }catch{}
        return send(res,200,{ photos:found, approved:biz.photos?.approved||[], mode:biz.photos?.mode||null });
      }

      if (p === '/api/photos-select' && req.method==='POST') {
        // Save Jay's photo choice: approved list, or explicit no-photos (sfeer-route).
        const { slug, approved, mode } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const ok = Array.isArray(approved) ? approved.filter(a=>typeof a==='string' && a.startsWith('assets/') && !a.includes('..')) : [];
        const bp = path.join(CLIENTS,s,'business.json');
        const biz = fs.existsSync(bp)?JSON.parse(fs.readFileSync(bp,'utf8')):{};
        biz.photos = { approved: ok, mode: mode==='no-photos'?'no-photos':'photos',
          note:'alleen deze foto\'s gebruiken; leeg + mode no-photos = sfeer-route (géén nep-interieurs)',
          decided_by:'Jay', decided:new Date().toISOString().slice(0,10) };
        writeJSON(bp,biz);
        try{ fs.appendFileSync(path.join(CLIENTS,s,'activity.jsonl'),
          JSON.stringify({ts:new Date().toISOString(),msg:`foto-selectie: ${biz.photos.mode==='no-photos'?'sfeer-route (geen foto\'s)':ok.length+' foto\'s goedgekeurd'}`,ok:true})+'\n'); }catch{}
        return send(res,200,{saved:true, approved:ok, mode:biz.photos.mode});
      }

      if (p === '/api/metrics' && req.method==='GET') {
        // Aggregated numbers the terminal can't show: runs, cost, duration, QC pass rate, pipeline.
        const runsFile = path.join(ROOT,'runs.jsonl');
        const runs = fs.existsSync(runsFile)
          ? fs.readFileSync(runsFile,'utf8').split('\n').filter(Boolean).map(l=>{try{return JSON.parse(l)}catch{return null}}).filter(Boolean)
          : [];
        const today = new Date().toISOString().slice(0,10);
        const todayRuns = runs.filter(r=>(r.ts||'').startsWith(today));
        const idx = rebuildIndex();
        const stages = {};
        for(const c of idx.clients) stages[c.stage]=(stages[c.stage]||0)+1;
        let qcPass=0, qcTotal=0;
        for(const c of idx.clients){
          try{ const st=JSON.parse(fs.readFileSync(path.join(CLIENTS,c.slug,'status.json'),'utf8'));
            if(st.qc && typeof st.qc.pass==='boolean' && st.stage!=='available'){ qcTotal++; if(st.qc.pass) qcPass++; } }catch{}
        }
        const sum=(a,k)=>a.reduce((n,r)=>n+(r[k]||0),0);
        return send(res,200,{
          today:{ runs:todayRuns.length, cost_usd:+sum(todayRuns,'cost_usd').toFixed(4), minutes:+(sum(todayRuns,'duration_ms')/60000).toFixed(1), failed:todayRuns.filter(r=>!r.ok).length },
          total:{ runs:runs.length, cost_usd:+sum(runs,'cost_usd').toFixed(2) },
          qc:{ pass:qcPass, total:qcTotal },
          stages,
          last:runs.slice(-8).reverse()
        });
      }

      if (p === '/api/run' && req.method==='POST') {
        // One-click agent action per client. Streams text, logs metrics to runs.jsonl.
        const { slug, action } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const PROMPTS = {
          build: 'Jij draait de WOW-MACHINE voor deze klant. Lees eerst ../../AGENTS.md volledig (Fixed build steps + THE FORM zijn wet). Stappen: (0) LAAD HET FUNDAMENT uit ../../lib/: motion-tokens.css (beweging ALLEEN hieruit), typografie-recepten.md (kies één duo), blokken/ (start van bewezen bouwstenen), grain-licht.css (standaard korrel+licht), referentie/ANKER.md (jury vergelijkt hiertegen). (1) CONCEPT-TREKKER: bestaat concept.json niet of is die zwak, destilleer dan uit logo/naam/echte data hét ene merk-idee met een doorlopende VERTELLER en per scène een HOOFDROLSPELER; schrijf concept.json. (2) BOUW site.html volgens THE FORM (toneel, één schermhoogte), gedreven door concept.json. FOTO-REGIE: uitsluitend business.json photos.approved; leeg + mode no-photos = sfeer zonder nep-interieurs; geen photos-veld = stoppen en melden dat Jay moet kiezen. Na de build MOET `node ../../lib/craft-lint.mjs site.html` slagen; faalt hij, fix eerst tot hij slaagt. EXTRA HARDE FOTO-REGELS: gescrapete/Street View-foto’s NOOIT als achtergrond-behang (donker gewassen foto met tekst erover = de standaard-template-fout); echte foto’s zijn HELD (gekaderd/gecomponeerd) of doen niet mee; zonder sterke goedgekeurde foto’s bouw je de held-formule (donkere sfeerwereld + één held in merkgloed — zie Stijl-les in AGENTS.md). (3) JURY-LUS: spawn 6 kritische juryleden (lenzen: concept/rode-draad, typografie, motion, eerlijkheid/data, mobiel, deelbaarheid — die laatste vraagt: snapt een partner die ’s avonds meekijkt zonder uitleg wat dit is, waarom het goed is en wat de volgende stap is? zie ../../lib/verkoop-regels.md) die met ECHTE screenshots (bash ../../qc-client.sh of playwright) scoren /10 + topfix geven; fix alles; herhaal tot ALLE scores >=8; schrijf de rondes in status.json onder jury.rondes en de eindscores onder jury.eind. (4) Draai de QC en zet qc in status.json (alleen pass:true na echte screenshot-controle). (5) POORTWACHTER: de server controleert daarna ZELF het bewijs (craft-lint + jury.eind allemaal >=8 + qc.pass). Zonder dat bewijs wordt deze build als MISLUKT geregistreerd — klaar-typen zonder bewijs heeft dus geen zin. Rapporteer aan het eind: concept in 1 zin, juryscores per ronde, wat er nog open staat.',
          qc: 'Draai EERST het echte QC-script: bash ../../qc-client.sh (maakt Chrome-screenshots desktop+mobiel in qc/). Bekijk daarna die screenshots ZELF stuk voor stuk + check console/404s. Pas als alles echt klopt: zet qc {pass:true, notes:[...]} in status.json; anders pass:false met wat er mis is. Nooit pass:true zonder de screenshots gezien te hebben.',
          mail: 'Lees EERST ../../lib/verkoop-regels.md en pas ALLE regels daaruit toe. Schrijf dan een korte Nederlandse outreach-mail voor deze klant (business.json, max ~120 woorden): (1) herkenning eerst — open over HÚN zaak met echte data, (2) één zin probleem + één zin oplossing met de demo-link, (3) één bewijszin (Milano) + risico-omkering, (4) deelbaarheids-zin ("stuur gerust door naar je partner/compagnon"), (5) afsluiten met één concrete kleine vraag — nooit "laat maar weten". Geen prijzen in mail 1. Sla op als drafts/outreach_<datum>.md. NOOIT versturen.'
        };
        const base = PROMPTS[action]; if(!base) return send(res,400,{error:'onbekende actie'});
        const cwd = path.join(CLIENTS,s);
        if(!fs.existsSync(cwd)) return send(res,404,{error:'klant bestaat niet'});
        try{ const sp=path.join(cwd,'site.html'); if(fs.existsSync(sp)) fs.copyFileSync(sp, path.join(cwd,'site.bak.html')); }catch{}
        res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','X-Accel-Buffering':'no'});
        const t0 = Date.now();
        const prompt = `Je werkt in het Cinematic Rebuild project voor klant "${s}". Lees ../../AGENTS.md. Verzin nooit klantdata. Opdracht: ${base}`;
        const cp = spawn('claude', ['-p', prompt, '--output-format','stream-json','--verbose','--permission-mode','acceptEdits','--add-dir',cwd,'--add-dir',path.join(ROOT,'..')], { cwd, env:process.env, stdio:['ignore','pipe','pipe'] });
        let meta=null, buf='';
        cp.stdout.on('data', d=>{
          buf += d.toString();
          let i;
          while((i=buf.indexOf('\n'))>=0){
            const line=buf.slice(0,i); buf=buf.slice(i+1);
            if(!line.trim()) continue;
            try{
              const ev=JSON.parse(line);
              if(ev.type==='assistant'){
                for(const c of (ev.message?.content||[])) if(c.type==='text' && c.text) res.write(c.text);
              } else if(ev.type==='result'){ meta=ev; }
            }catch{}
          }
        });
        cp.stderr.on('data', d=>res.write('\n[fout] '+d));
        cp.on('close', (code)=>{
          const rec={ ts:new Date().toISOString(), slug:s, action, ok:code===0 && !(meta?.is_error),
            duration_ms:Date.now()-t0, cost_usd:meta?.total_cost_usd||0,
            tokens:(meta?.usage?.input_tokens||0)+(meta?.usage?.output_tokens||0) };
          // Poortwachter: na build/qc beoordeelt de SERVER het bewijs — de AI keurt nooit z'n eigen werk goed.
          let gateTxt = '';
          if (action==='build' || action==='qc') {
            try {
              const gate = runGate(s);
              rec.gate = gate.pass;
              if (action==='build') rec.ok = rec.ok && gate.pass;   // build zonder bewijs = mislukt (fail-closed)
              gateTxt = gate.pass ? '\n[poortwachter] GESLAAGD ✓'
                : '\n[poortwachter] AFGEKEURD:\n- ' + gate.redenen.slice(0,6).join('\n- ');
            } catch(e){ gateTxt = '\n[poortwachter] kon niet draaien: ' + (e.message||e); rec.ok=false; }
          }
          fs.appendFileSync(path.join(ROOT,'runs.jsonl'), JSON.stringify(rec)+'\n');
          try{ fs.appendFileSync(path.join(cwd,'activity.jsonl'),
            JSON.stringify({ts:rec.ts, msg:`actie "${action}" (${(rec.duration_ms/1000).toFixed(0)}s, $${rec.cost_usd.toFixed(3)})`, ok:rec.ok})+'\n'); }catch{}
          rebuildIndex();
          res.end(`${gateTxt}\n\n[klaar] ${(rec.duration_ms/1000).toFixed(0)}s · $${rec.cost_usd.toFixed(3)}`);
        });
        cp.on('error', e=>{ res.write('\n[server] kon claude niet starten: '+e.message); res.end(); });
        req.on('close', ()=>{ try{cp.kill()}catch{} });
        return;
      }

      if (p === '/api/chat' && req.method==='POST') {
        // Talk to the AI (same engine as Claude Code) scoped to the client folder.
        const { slug, msg } = await readBody(req);
        const s = safeSlug(slug); if(!s) return send(res,400,{error:'bad slug'});
        const cwd = path.join(CLIENTS,s);
        // backup the site before the AI can overwrite it
        try{ const sp=path.join(cwd,'site.html'); if(fs.existsSync(sp)) fs.copyFileSync(sp, path.join(cwd,'site.bak.html')); }catch{}
        const clean = String(msg||'').slice(0,4000);
        res.writeHead(200,{'Content-Type':'text/plain; charset=utf-8','X-Accel-Buffering':'no'});
        const prompt = `You are working in the Cinematic Rebuild project for client "${s}". Read ../../AGENTS.md and ../../platform/VISION.md for the rules. Never fabricate client data. Task: ${clean}`;
        const cp = spawn('claude', ['-p', prompt, '--permission-mode','acceptEdits','--add-dir',cwd,'--add-dir',path.join(ROOT,'..')], { cwd, env:process.env, stdio:['ignore','pipe','pipe'] });
        cp.stdout.on('data', d=>res.write(d));
        cp.stderr.on('data', d=>res.write(d));
        cp.on('close', ()=>res.end());
        cp.on('error', e=>{ res.write('\n[server] kon claude niet starten: '+e.message); res.end(); });
        req.on('close', ()=>{ try{cp.kill()}catch{} });
        return;
      }

      return send(res,404,{error:'unknown api'});
    } catch(e){ return send(res,500,{error:String(e.message||e)}); }
  }

  // ---- static ----
  let rel = p === '/' ? '/dashboard.html' : p;
  const fp = path.join(ROOT, rel.replace(/^\/+/,''));
  if (!fp.startsWith(ROOT)) return send(res,403,'forbidden','text/plain');
  fs.stat(fp, (err, st) => {
    if (err || !st.isFile()) return send(res,404,'not found','text/plain');
    const type = MIME[path.extname(fp).toLowerCase()]||'application/octet-stream';
    const range = req.headers.range;
    if (range) {
      // Range-support (nodig om video te kunnen spoelen/scrubben)
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] ? parseInt(m[1],10) : 0;
      let end = m && m[2] ? parseInt(m[2],10) : st.size-1;
      if (isNaN(start)||start>end||end>=st.size) { res.writeHead(416,{'Content-Range':`bytes */${st.size}`}); return res.end(); }
      res.writeHead(206,{ 'Content-Type':type, 'Accept-Ranges':'bytes',
        'Content-Range':`bytes ${start}-${end}/${st.size}`, 'Content-Length':end-start+1 });
      fs.createReadStream(fp,{start,end}).pipe(res);
    } else {
      res.writeHead(200,{ 'Content-Type':type, 'Accept-Ranges':'bytes', 'Content-Length':st.size });
      fs.createReadStream(fp).pipe(res);
    }
  });
});

rebuildIndex();
server.listen(PORT, '127.0.0.1', ()=>console.log(`Command Center → http://127.0.0.1:${PORT}`));
