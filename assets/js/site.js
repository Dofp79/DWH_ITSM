// ===============================================
// 📁 Datei: assets/js/site.js
// ===============================================

/* ============================================================
   📧 1) E-Mail-Obfuskation
   ------------------------------------------------------------
   Baut aus data-Attributen eine klickbare Mailadresse.
   Betroffene Elemente:
     - #contactEmail
     - Alle mit data-email-user + data-email-domain
   Ziel: Schutz vor Spam-Crawlern durch JavaScript-generierte Adresse
=============================================================== */
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

    const rel = (link.rel || '').trim();
    link.rel = rel.includes('nofollow') ? rel : `${rel} nofollow`.trim();
  });
})();


/* ============================================================
   🔍 2) Lightbox-Funktion für Bilder mit data-full
   ------------------------------------------------------------
   Ermöglicht Vergrößern, Drag/Pan, ESC-Schließen, Tastaturnavigation
   Ziel: moderne Bildanzeige mit Zoom + Barrierefreiheit
=============================================================== */
(() => {
  const zoomables = [...document.querySelectorAll('img[data-full]:not(.no-zoom)')]
    .filter(img => !img.closest('#ki-agents'));

  if (!zoomables.length) return;

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

  const imgEl = lb.querySelector('.lightbox__img');
  const capEl = lb.querySelector('.lightbox__caption');
  const btnClose = lb.querySelector('.lightbox__close');
  const btnZoomIn = lb.querySelector('.lightbox__zoomIn');
  const btnZoomOut = lb.querySelector('.lightbox__zoomOut');
  const getFocusables = () => [btnClose, btnZoomIn, btnZoomOut];

  let scale = 1, tx = 0, ty = 0, isDrag = false, sx = 0, sy = 0;

  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
  const applyTransform = () => imgEl.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
  const resetTransform = () => { scale = 1; tx = 0; ty = 0; applyTransform(); };

  const openLB = (src, alt = '') => {
    imgEl.src = src;
    imgEl.alt = alt;
    capEl.textContent = alt;
    resetTransform();
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lb-lock');
    btnClose.focus({ preventScroll: true });
  };

  const closeLB = () => {
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lb-lock');
    imgEl.src = '';
    resetTransform();
  };

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

  btnClose.addEventListener('click', closeLB);
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLB();
  });

  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLB();
    }

    if (e.key === 'Tab') {
      const f = getFocusables();
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus(); e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus(); e.preventDefault();
      }
    }
  });

  btnZoomIn.addEventListener('click', () => {
    scale = clamp(scale + 0.25, 1, 4); applyTransform();
  });

  btnZoomOut.addEventListener('click', () => {
    scale = clamp(scale - 0.25, 1, 4);
    if (scale === 1) tx = ty = 0;
    applyTransform();
  });

  imgEl.addEventListener('wheel', (e) => {
    if (lb.getAttribute('aria-hidden') === 'true') return;
    e.preventDefault();
    const dir = Math.sign(e.deltaY);
    scale = clamp(scale + (dir < 0 ? 0.25 : -0.25), 1, 4);
    if (scale === 1) tx = ty = 0;
    applyTransform();
  }, { passive: false });

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


/* ============================================================
   🍔 3) Burger-Menü Funktion für mobile Navigation
   ------------------------------------------------------------
   Öffnet und schließt das Menü durch Klick auf den Burger.
   Nutzt: aria-expanded & data-open für CSS-Steuerung
=============================================================== */
/* Toggle-Button nur auf Mobilgeräten sichtbar */
.nav-toggle {
  display: block;
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 999;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* Hauptnavigation: off-canvas */
.mainnav {
  position: fixed;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 300px;
  height: 100vh;
  background: #fff;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  transform: translateX(100%); /* 👈 Startposition außerhalb */
  transition: transform 0.3s ease-in-out;
  z-index: 998;
  padding: 2rem 1rem;
}

/* Menü sichtbar bei data-open=true */
.mainnav[data-open="true"] {
  transform: translateX(0); /* 👉 eingeschoben */
}

/* Menüelemente */
.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-list li {
  margin-bottom: 1.5rem;
}

.nav-list a {
  text-decoration: none;
  color: #333;
  font-size: 1.2rem;
}

/* Ab Tabletgröße: Menü immer sichtbar, horizontal */
@media (min-width: 768px) {
  .nav-toggle {
    display: none;
  }

  .mainnav {
    position: static;
    transform: none;
    width: auto;
    height: auto;
    box-shadow: none;
    display: block;
    padding: 0;
  }

  .nav-list {
    display: flex;
    gap: 2rem;
  }

  .nav-list li {
    margin: 0;
  }
}


  // ESC-Taste schließt Menü
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.dataset.open = 'false';
    }
  });
})();


  // ESC schließt das Menü
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      navToggle.setAttribute('aria-expanded', 'false');
      nav.dataset.open = 'false';
    }
  });
})();
