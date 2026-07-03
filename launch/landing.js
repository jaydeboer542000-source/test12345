/* ============================================================
   LANDING-LAAG — opent/sluit het signup-paneel + herstijlt het
   MailerLite-formulier met inline-stijlen (verslaat MailerLite's
   ID-scoped CSS). Carousel (engine.js) blijft onaangeroerd.
   ============================================================ */
(function () {
  const openBtn  = document.getElementById('openPanel');
  const closeBtn = document.getElementById('closePanel');
  const backdrop = document.getElementById('panelBackdrop');
  if (!openBtn || !backdrop) return;

  /* ---- MailerLite-form herstijlen naar de kalme kaart (inline = wint altijd) ---- */
  function setImp(el, props) { for (const k in props) el.style.setProperty(k, props[k], 'important'); }
  function styleForm() {
    backdrop.querySelectorAll('input[type=email], input.form-control').forEach(el => {
      setImp(el, { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.18)',
        color: '#fff', 'border-radius': '11px', padding: '14px 16px', height: 'auto', 'box-shadow': 'none' });
      if (!el.getAttribute('placeholder')) el.setAttribute('placeholder', 'Your email');
    });
    backdrop.querySelectorAll('button.primary, button[type=submit]').forEach(el => {
      setImp(el, { background: '#ffffff', color: '#0a1422', border: '0', 'border-radius': '11px', 'box-shadow': 'none' });
    });
    backdrop.querySelectorAll('.ml-form-checkboxRow label, .ml-form-checkboxRow .label-description, .ml-form-checkboxRow p, .ml-form-embedPermissions p')
      .forEach(el => setImp(el, { color: 'rgba(255,255,255,0.62)' }));
  }
  // herstijl zodra MailerLite het formulier inspuit + bij elke open
  const obs = new MutationObserver(styleForm);
  obs.observe(backdrop, { childList: true, subtree: true });
  setTimeout(styleForm, 1200);

  let lastFocus = null;
  const isOpen = () => document.body.classList.contains('panel-open');

  function open() {
    lastFocus = document.activeElement;
    backdrop.removeAttribute('hidden');
    document.body.classList.add('panel-open');
    styleForm();
    const first = backdrop.querySelector('input[type=email]') || closeBtn;
    setTimeout(() => { try { first && first.focus(); } catch (e) {} }, 80);
  }
  function close() {
    backdrop.setAttribute('hidden', '');
    document.body.classList.remove('panel-open');
    if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {}
  }

  openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', e => { if (e.target === backdrop) close(); });

  // Esc sluit; pijltjes niet doorlaten naar de carousel als 't paneel open is
  window.addEventListener('keydown', e => {
    if (!isOpen()) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') e.stopImmediatePropagation();
  }, true);
  // muiswiel niet doorlaten naar de carousel (native scrollen in de kaart blijft werken)
  window.addEventListener('wheel', e => { if (isOpen()) e.stopImmediatePropagation(); }, true);

  /* pitch-regel boven de knop tonen zodra de LAATSTE wereld actief is */
  const track = document.getElementById('track');
  const pitch = document.getElementById('ctaPitch');
  function updatePitch() {
    if (!track || !pitch) return;
    const slides = track.children;
    const last = slides[slides.length - 1];
    pitch.classList.toggle('on', !!(last && last.classList.contains('active')));
  }
  if (track) new MutationObserver(updatePitch).observe(track, { subtree: true, attributes: true, attributeFilter: ['class'] });
  setTimeout(updatePitch, 400);
})();
