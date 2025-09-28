// =========================================================
//   Globales Skript: assets/js/site.js
// =========================================================

/* ============================================================================
 * 1)  E-Mail-Obfuskation
 * ----------------------------------------------------------------------------
 * Baut aus data-Attributen echte, klickbare Mailadressen.
 * Betrifft alle Elemente mit:
 *    - id="contactEmail"
 *    - data-email-user + data-email-domain
 * ============================================================================
 */
(() => {
  const nodes = document.querySelectorAll('#contactEmail, [data-email-user][data-email-domain]');
  nodes.forEach((link) => {
    const user = link.getAttribute('data-email-user');
    const domain = link.getAttribute('data-email-domain');
    if (!user || !domain) return;

    const address = `${user}@${domain}`;
    link.textContent = address;
    link.href = `mailto:${address}`;
    link.setAttribute('aria-label', `E-Mail an ${address}`);

    // Verhindert doppelte "nofollow"-Einträge
    const rel = (link.rel || '').trim();
    link.rel = rel.includes('nofollow') ? rel : `${rel} nofollow`.trim();
  });
})();

/* ============================================================================
 * 2)  Lightbox mit Zoom, Pan, ESC, Fokusfalle & Touch-Support
 * ----------------------------------------------------------------------------
 * Für alle Bilder mit `data-full` – außer in #ki-agents oder mit .no-zoom
 * ============================================================================
 */
(() => {
  const zoomables = [...document.querySelectorAll('img[data-full]:not(.no-zoom)')]
    .filter(img => !img.closest('#ki-agents'));

  if (!zoomables.length) return;

  //  Overlay mit Buttons & Bildstruktur erzeugen
  const lb = document.createElement('div');
  lb.className = 'lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-hidden', 'true');
  lb.innerHTML = `
    <div class="lightbox__inner">
      <button class="lightbox__close lightbox__btn" aria-label="Schließen">✕</button>
      <button class="lightbox__zoomIn lightbox__btn" aria-label="Vergrößern">＋</button>
      <button class="lightbox__zoomOut lightbox__btn" aria-label="Verkleinern">−</button>
      <img class="lightbox__img" alt="">
      <div class="lightbox__caption" aria-live="polite"></div>
    </div>
  `;
  document.body.appendChild(lb);

  //  Referenzen zu DOM-Elementen im Lightbox-Overlay
  const imgEl = lb.querySelector('.lightbox__img');
  const capEl = lb.querySelector('.lightbox__caption');
  const btnClose = lb.querySelector('.lightbox__close');
  const btnZoomIn = lb.querySelector('.lightbox__zoomIn');
  const btnZoomOut = lb.querySelector('.lightbox__zoomOut');
  const getFocusables = () => [btnClose, btnZoomIn, btnZoomOut];

  //  Zoom-Status & Transformation
  let scale = 1, tx = 0, ty = 0, isDrag = false, sx = 0, sy = 0;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const applyTransform = () => {
    imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  };
  const resetTransform = () => {
    scale = 1; tx = 0; ty = 0; applyTransform();
  };

  //  Öffnet die Lightbox mit gegebenem Bild
  const openLB = (src, alt = '') => {
    imgEl.src = src;
    imgEl.alt = alt;
    capEl.textContent = alt;
    resetTransform();
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-lock');
    btnClose.focus({ preventScroll: true });
  };

  //  Schließt die Lightbox
  const closeLB = () => {
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-lock');
    imgEl.src = '';
    resetTransform();
  };

  //  Klickbare Bilder vorbereiten
  zoomables.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.tabIndex = 0;

    const src = img.getAttribute('data-full') || img.currentSrc || img.src;
    const alt = img.getAttribute('alt') || '';
    const open = () => openLB(src, alt);

    img.addEventListener('click', open);
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        open();
      }
    });
  });

  //  Button-Events & Overlay-Verhalten
  btnClose.addEventListener('click', closeLB);
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLB(); // Klick auf dunklen Hintergrund
  });

  //  Tastatur-Navigation & Fokussteuerung
  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLB();
      return;
    }

    // Fokusfalle innerhalb der Buttons
    if (e.key === 'Tab') {
      const f = getFocusables();
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  });

  //  Zoom per Buttons
  btnZoomIn.addEventListener('click', () => {
    scale = clamp(scale + 0.25, 1, 4);
    applyTransform();
  });
  btnZoomOut.addEventListener('click', () => {
    scale = clamp(scale - 0.25, 1, 4);
    if (scale === 1) { tx = ty = 0; }
    applyTransform();
  });

  //  Zoom mit Mausrad
  imgEl.addEventListener('wheel', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;
    e.preventDefault();
    const dir = Math.sign(e.deltaY);
    scale = clamp(scale + (dir < 0 ? 0.25 : -0.25), 1, 4);
    if (scale === 1) { tx = ty = 0; }
    applyTransform();
  }, { passive: false });

  //  Drag/Pan mit Maus
  imgEl.style.cursor = 'grab';
  imgEl.addEventListener('mousedown', (e) => {
    if (scale <= 1) return;
    isDrag = true;
    imgEl.style.cursor = 'grabbing';
    sx = e.clientX - tx;
    sy = e.clientY - ty;
  });
  document.addEventListener('mousemove', (e) => {
    if (!isDrag) return;
    tx = e.clientX - sx;
    ty = e.clientY - sy;
    applyTransform();
  });
  document.addEventListener('mouseup', () => {
    isDrag = false;
    imgEl.style.cursor = 'grab';
  });

  //  Touch-Pan (nur 1 Finger)
  imgEl.addEventListener('touchstart', (e) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    const t = e.touches[0];
    isDrag = true;
    sx = t.clientX - tx;
    sy = t.clientY - ty;
  }, { passive: true });

  imgEl.addEventListener('touchmove', (e) => {
    if (!isDrag || e.touches.length !== 1) return;
    const t = e.touches[0];
    tx = t.clientX - sx;
    ty = t.clientY - sy;
    applyTransform();
  }, { passive: true });

  imgEl.addEventListener('touchend', () => {
    isDrag = false;
  }, { passive: true });
})();

/* ============================================================================
 * 3)  Burger-Menü für Mobilgeräte
 * ----------------------------------------------------------------------------
 * Toggelt das Attribut data-open auf .mainnav bei Klick auf .nav-toggle
 * ============================================================================
 */
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.mainnav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const isOpen = nav.getAttribute('data-open') === 'true';
      nav.setAttribute('data-open', isOpen ? 'false' : 'true');
    });
  }
})();
