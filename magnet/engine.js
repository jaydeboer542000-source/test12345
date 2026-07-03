/* ============================================================
   DE MACHINE (motor) — niet aanpassen per sectie.
   Leest het kaartje (window.CINEMATIC.worlds uit config.js),
   bouwt de slides en regelt de besturing.
   ============================================================ */
(function () {
  const WORLDS = (window.CINEMATIC && window.CINEMATIC.worlds) || [];
  const brandEl = document.getElementById('brand');
  if (brandEl) brandEl.textContent = (window.CINEMATIC && window.CINEMATIC.brand) || '';

  function ambient(mood) {
    if (mood === 'aqua')  return '<div class="ambient"><div class="amb-sweep"></div></div>';
    if (mood === 'abyss') return '<div class="ambient"><div class="amb-fog"></div></div>';
    if (mood === 'crystal') {
      let s = '';
      for (let i = 0; i < 14; i++) {
        const sz = (3 + Math.random() * 5).toFixed(1);
        s += `<span class="amb-spark" style="left:${(6 + Math.random() * 88).toFixed(1)}%;top:${(8 + Math.random() * 72).toFixed(1)}%;width:${sz}px;height:${sz}px;animation-delay:${(Math.random() * 3.2).toFixed(2)}s;animation-duration:${(2.4 + Math.random() * 2).toFixed(2)}s"></span>`;
      }
      return `<div class="ambient">${s}</div>`;
    }
    if (mood === 'verde') {
      let s = '';
      for (let i = 0; i < 9; i++) {
        s += `<span class="amb-mote" style="left:${(Math.random() * 100).toFixed(1)}%;animation-duration:${(7 + Math.random() * 6).toFixed(1)}s;animation-delay:${(Math.random() * 6).toFixed(1)}s"></span>`;
      }
      return `<div class="ambient">${s}</div>`;
    }
    return '';
  }

  const track = document.getElementById('track');
  const dotsWrap = document.getElementById('dots');

  WORLDS.forEach((w, i) => {
    const s = document.createElement('section');
    s.className = 'slide mood-' + w.mood;
    s.style.setProperty('--world', `url("${w.bg}")`);
    s.style.setProperty('--glow', w.glow);
    if (w.grade != null) s.style.setProperty('--grade-op', w.grade);
    if (w.tint != null) s.style.setProperty('--tint-op', w.tint);
    s.innerHTML =
      '<div class="world"></div><div class="pool"></div>' + ambient(w.mood) +
      '<div class="glow"></div><div class="flash"></div>' +
      `<div class="product"><img src="${w.product}" alt="">${w.tint > 0 ? `<span class="ptint" style="-webkit-mask:url('${w.product}') center/contain no-repeat;mask:url('${w.product}') center/contain no-repeat"></span>` : ''}</div>` +
      '<div class="grade"></div><div class="vign"></div>' +
      `<div class="copy"><div class="kicker">${w.kicker}</div><div class="title">${w.title}</div><div class="sub">${w.sub}</div></div>`;
    track.appendChild(s);
    const d = document.createElement('span');
    d.className = 'dot' + (i === 0 ? ' on' : '');
    d.addEventListener('click', () => go(i));
    dotsWrap.appendChild(d);
  });

  const slides = [...track.children];
  const dots = [...dotsWrap.children];
  let index = 0;

  // de entree-animatie speelt maar één keer per wereld; daarna zweeft het horloge gewoon (nooit onzichtbaar)
  const seen = new Set();
  function playIntro(i) {
    const s = slides[i];
    if (!s || seen.has(i)) return;
    seen.add(i);
    s.classList.add('intro');
    const img = s.querySelector('.product img');
    if (img) img.addEventListener('animationend', e => {
      if (e.animationName === 'introIn') s.classList.remove('intro');
    }, { once: true });
  }

  function render(animate = true) {
    track.classList.toggle('anim', animate);
    track.style.transform = `translateX(${-index * 100}%)`;
    slides.forEach((s, i) => { s.classList.toggle('active', i === index); if (i !== index) s.classList.remove('intro'); });
    dots.forEach((d, i) => d.classList.toggle('on', i === index));
    playIntro(index);
  }
  function go(i) {
    i = Math.max(0, Math.min(WORLDS.length - 1, i));
    if (i === index) return;
    index = i;
    render(true);
    const car = document.getElementById('carousel');
    car.classList.add('transitioning');
    clearTimeout(go._t); go._t = setTimeout(() => car.classList.remove('transitioning'), 560);
  }
  const next = () => go(index + 1), prev = () => go(index - 1);

  // null-veilig: pijl-knoppen zijn optioneel (de magnet-schil heeft ze niet)
  const nextBtn = document.getElementById('next'); if (nextBtn) nextBtn.addEventListener('click', next);
  const prevBtn = document.getElementById('prev'); if (prevBtn) prevBtn.addEventListener('click', prev);
  window.addEventListener('keydown', e => { if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') prev(); });

  let wheelLock = false;
  window.addEventListener('wheel', e => {
    if (wheelLock) return;
    const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(d) < 18) return;
    wheelLock = true; d > 0 ? next() : prev();
    setTimeout(() => wheelLock = false, 700);
  }, { passive: true });

  const car = document.getElementById('carousel');
  let down = false, startX = 0, dx = 0, w = innerWidth;
  car.addEventListener('pointerdown', e => { down = true; startX = e.clientX; dx = 0; w = innerWidth; car.classList.add('grabbing'); track.classList.remove('anim'); });
  car.addEventListener('pointermove', e => {
    if (!down) return; dx = e.clientX - startX;
    const res = (index === 0 && dx > 0) || (index === WORLDS.length - 1 && dx < 0) ? .35 : 1;
    track.style.transform = `translateX(calc(${-index * 100}% + ${dx * res}px))`;
  });
  function endDrag() {
    if (!down) return; down = false; car.classList.remove('grabbing');
    if (Math.abs(dx) > w * 0.12) { dx < 0 ? next() : prev(); } else { render(true); }
    dx = 0;
  }
  car.addEventListener('pointerup', endDrag);
  car.addEventListener('pointercancel', endDrag);
  car.addEventListener('pointerleave', endDrag);
  addEventListener('resize', () => { w = innerWidth; render(false); });

  render(false);
})();
