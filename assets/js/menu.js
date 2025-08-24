// Burger-Menü toggeln (mobil)
const btn = document.getElementById('navToggle');
const nav = document.getElementById('mainnav');

if (btn && nav) {
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    nav.setAttribute('data-open', String(open));
  };

  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    setOpen(!open);
  });

  // ESC schließt
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });

  // Klick außerhalb schließt
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.site-header')) setOpen(false);
  });

  // Beim Resize zurücksetzen (Desktop)
  window.addEventListener('resize', () => { if (window.innerWidth > 980) setOpen(false); });
}
