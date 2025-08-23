// ===== Globales Skript: assets/js/site.js =====
// Lightbox für alle Seiten, die .lightbox enthalten
(function(){
  const lb = document.getElementById('lightbox');
  if(!lb) return; // Seiten ohne Lightbox ignorieren

  const lbImg   = document.getElementById('lightboxImg');
  const lbClose = document.getElementById('lightboxClose');

  document.addEventListener('click', e => {
    const t = e.target;
    // Bilder in Cards mit data-full öffnen (außer Bereiche, die explizit Links sind)
    if (t.matches('.card img') && t.dataset.full && !t.closest('#gpt-agents a')) {
      e.preventDefault();
      lbImg.src = t.dataset.full;
      lb.classList.add('is-open');
    }
    if (t === lb || t === lbClose) {
      lb.classList.remove('is-open');
      lbImg.src = '';
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) {
      lb.classList.remove('is-open');
      lbImg.src = '';
    }
  });
})();
