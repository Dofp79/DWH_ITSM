// ===== Globales Skript: assets/js/site.js =====

// -----------------------------
// 1) Lightbox (falls vorhanden)
// -----------------------------
(() => {
  const lb     = document.getElementById('lightbox');
  if (!lb) return; // Seiten ohne Lightbox ignorieren

  const lbImg  = document.getElementById('lightboxImg');
  const lbClose= document.getElementById('lightboxClose');

  const openLB = (src) => {
    lbImg.src = src;
    lb.classList.add('is-open');
    lb.setAttribute('aria-hidden', 'false');
  };

  const closeLB = () => {
    lb.classList.remove('is-open');
    lb.setAttribute('aria-hidden', 'true');
    // kleines Timeout, damit CSS-Transition (falls vorhanden) sauber läuft
    setTimeout(() => { lbImg.src = ''; }, 150);
  };

  document.addEventListener('click', (e) => {
    const t = e.target;

    // Nur Card-Bilder öffnen, die ein data-full mit großem Bild haben
    // Ausnahme: im #gpt-agents sind die Bilder klickbare Links -> keine Lightbox
    if (
      t.matches('.card img') &&
      t.dataset.full &&
      !t.closest('#gpt-agents a')
    ) {
      e.preventDefault();
      openLB(t.dataset.full);
      return;
    }

    // Klick auf Overlay-Hintergrund oder Schließen-Button
    if (t === lb || t === lbClose) {
      e.preventDefault();
      closeLB();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) {
      closeLB();
    }
  });
})();

// ---------------------------------------------------------
// 2) E-Mail-Obfuskation (Spam-Schutz, global auf allen Seiten)
//    Sucht Links mit data-email-user & data-email-domain
// ---------------------------------------------------------
(() => {
  const nodes = document.querySelectorAll('#contactEmail, [data-email-user][data-email-domain]');
  nodes.forEach((link) => {
    const user   = link.getAttribute('data-email-user');
    const domain = link.getAttribute('data-email-domain');
    if (!user || !domain) return;

    const address = `${user}@${domain}`;
    link.textContent = address;                         // sichtbarer Text
    link.setAttribute('href', `mailto:${address}`);     // klickbarer Link
    link.setAttribute('aria-label', `E-Mail an ${address}`);
    link.rel = (link.rel || '') + ' nofollow';          // Bots eher fernhalten
  });
})();
