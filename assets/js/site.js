// ===== Globales Skript: assets/js/site.js =====

// 1) E‑Mail-Obfuskation (auf allen Seiten gleich)
(() => {
  const nodes = document.querySelectorAll('#contactEmail, [data-email-user][data-email-domain]');
  nodes.forEach((link) => {
    const user   = link.getAttribute('data-email-user');
    const domain = link.getAttribute('data-email-domain');
    if (!user || !domain) return;

    const address = `${user}@${domain}`;
    link.textContent = address;
    link.href = `mailto:${address}`;
    link.setAttribute('aria-label', `E-Mail an ${address}`);
    link.rel = (link.rel || '').includes('nofollow') ? link.rel : `${link.rel || ''} nofollow`.trim();
  });
})();

// 2) Lightbox für Bilder mit data-full
//    - Gilt für alle Seiten.
//    - Ausnahmen: Bilder innerhalb #ki-agents (nur Verlinkung, kein Zoom)
//                 oder Bilder mit Klasse .no-zoom
(() => {
  // Wähle alle zoombaren Bilder
  const zoomables = Array.from(
    document.querySelectorAll('img[data-full]:not(.no-zoom)')
  ).filter(img => !img.closest('#ki-agents')); // KI-Agenten ausnehmen

  if (!zoomables.length) return;

  // Overlay (Lightbox) erzeugen
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <div class="lightbox__inner">
      <button class="lightbox__close" aria-label="Schließen">✕</button>
      <button class="lightbox__zoom" aria-label="Vergrößern">＋</button>
      <button class="lightbox__zoom lightbox__zoom--out" aria-label="Verkleinern">−</button>
      <img class="lightbox__img" alt="">
      <div class="lightbox__caption" aria-live="polite"></div>
    </div>
  `;
  document.body.appendChild(lb);

  const imgEl     = lb.querySelector('.lightbox__img');
  const capEl     = lb.querySelector('.lightbox__caption');
  const btnClose  = lb.querySelector('.lightbox__close');
  const btnZoomIn = lb.querySelector('.lightbox__zoom:not(.lightbox__zoom--out)');
  const btnZoomOut= lb.querySelector('.lightbox__zoom--out');

  // Zoom-/Pan‑State
  let scale = 1, tx = 0, ty = 0, isDrag = false, sx = 0, sy = 0;

  const applyTransform = () => {
    imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };
  const resetTransform = () => { scale = 1; tx = 0; ty = 0; applyTransform(); };

  // Öffnen / Schließen
  const openLB = (src, alt) => {
    imgEl.src = src;
    imgEl.alt = alt || '';
    capEl.textContent = alt || '';
    resetTransform();
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-lock');
    btnClose.focus();
  };
  const closeLB = () => {
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-lock');
    imgEl.src = '';
    resetTransform();
  };

  // Aktivierung auf allen passenden Bildern
  zoomables.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.tabIndex = 0;

    const src = img.getAttribute('data-full') || img.currentSrc || img.src;
    const alt = img.getAttribute('alt') || '';

    const open = () => openLB(src, alt);
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  });

  // Buttons / Hintergrund
  btnClose.addEventListener('click', closeLB);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });

  // Tastatur: ESC & Focus-Trap
  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;

    if (e.key === 'Escape') closeLB();
    if (e.key === 'Tab') {
      const focusables = [btnClose, btnZoomIn, btnZoomOut];
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
  });

  // Zoom per Buttons / Mausrad
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  btnZoomIn.addEventListener('click', () => { scale = clamp(scale + 0.25, 1, 4); applyTransform(); });
  btnZoomOut.addEventListener('click', () => { scale = clamp(scale - 0.25, 1, 4); if (scale === 1) { tx = ty = 0; } applyTransform(); });

  imgEl.addEventListener('wheel', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;
    e.preventDefault();
    scale = clamp(scale + (e.deltaY < 0 ? 0.1 : -0.1), 1, 4);
    if (scale === 1) { tx = ty = 0; }
    applyTransform();
  }, { passive: false });

  // Drag/Pan bei vergrößertem Bild
  imgEl.style.cursor = 'grab';
  imgEl.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDrag = true; imgEl.style.cursor = 'grabbing';
    sx = e.clientX - tx; sy = e.clientY - ty;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDrag) return;
    tx = e.clientX - sx; ty = e.clientY - sy; applyTransform();
  });
  document.addEventListener('mouseup', () => { isDrag = false; imgEl.style.cursor = 'grab'; });

  // Touch‑Support (einfaches Panning)
  imgEl.addEventListener('touchstart', (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const t = e.touches[0];
    isDrag = true; sx = t.clientX - tx; sy = t.clientY - ty;
  }, { passive: true });
  imgEl.addEventListener('touchmove', (e) => {
    if (!isDrag || e.touches.length !== 1) return;
    const t = e.touches[0];
    tx = t.clientX - sx; ty = t.clientY - sy; applyTransform();
  }, { passive: true });
  imgEl.addEventListener('touchend', () => { isDrag = false; }, { passive: true });
})();
