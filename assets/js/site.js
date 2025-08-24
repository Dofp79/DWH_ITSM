// ===== Globales Skript: assets/js/site.js =====

// 1) E‑Mail-Obfuskation
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
    link.rel = (link.rel || '') + ' nofollow';
  });
})();

// 2) Lightbox für Bilder mit data-full (nur im Bereich #projekte)
(() => {
  const imgs = document.querySelectorAll('#projekte img[data-full]');
  if (!imgs.length) return;

  // Overlay bauen
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role','dialog');
  lb.setAttribute('aria-modal','true');
  lb.setAttribute('aria-hidden','true');
  lb.innerHTML = `
    <div class="lightbox__inner">
      <button class="lightbox__close lightbox__btn" aria-label="Schließen">✕</button>
      <button class="lightbox__zoom lightbox__btn" aria-label="Vergrößern">＋</button>
      <button class="lightbox__zoom lightbox__zoom--out lightbox__btn" aria-label="Verkleinern">−</button>
      <img class="lightbox__img" alt="">
      <div class="lightbox__caption" aria-live="polite"></div>
    </div>
  `;
  document.body.appendChild(lb);

  const imgEl = lb.querySelector('.lightbox__img');
  const capEl = lb.querySelector('.lightbox__caption');
  const btnClose = lb.querySelector('.lightbox__close');
  const btnZoomIn = lb.querySelector('.lightbox__zoom');
  const btnZoomOut = lb.querySelector('.lightbox__zoom--out');
  const focusables = () => [btnClose, btnZoomIn, btnZoomOut];

  let scale = 1, tx = 0, ty = 0, isDrag = false, sx = 0, sy = 0;

  const applyTransform = () => {
    imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };

  const resetTransform = () => { scale = 1; tx = 0; ty = 0; applyTransform(); };

  const openLB = (src, alt) => {
    imgEl.src = src;
    imgEl.alt = alt || '';
    capEl.textContent = alt || '';
    resetTransform();
    lb.setAttribute('aria-hidden','false');
    document.body.classList.add('lb-lock');
    btnClose.focus();
  };

  const closeLB = () => {
    lb.setAttribute('aria-hidden','true');
    document.body.classList.remove('lb-lock');
    imgEl.src = '';
    resetTransform();
  };

  // Öffnen
  imgs.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.tabIndex = 0;
    const open = () => openLB(img.dataset.full || img.src, img.alt);
    img.addEventListener('click', open);
    img.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });

  // Schließen/Hintergrund
  btnClose.addEventListener('click', closeLB);
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });
  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false') {
      if (e.key === 'Escape') closeLB();
      if (e.key === 'Tab') { // Focus-Trap
        const f = focusables();
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
        else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
  });

  // Zoom
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  btnZoomIn.addEventListener('click', () => { scale = clamp(scale + 0.25, 1, 4); applyTransform(); });
  btnZoomOut.addEventListener('click', () => { scale = clamp(scale - 0.25, 1, 4); if (scale===1){tx=ty=0;} applyTransform(); });
  imgEl.addEventListener('wheel', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;
    e.preventDefault();
    scale = clamp(scale + (e.deltaY < 0 ? 0.1 : -0.1), 1, 4);
    if (scale === 1) { tx = ty = 0; }
    applyTransform();
  }, { passive: false });

  // Drag/Pan
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
})();
