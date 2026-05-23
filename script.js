/* ============================================================
   CHELSEA & DEREK — script.js
   ============================================================ */

/* ---------- NAV SCROLL STATE ---------- */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

/* ---------- MOBILE HAMBURGER ---------- */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
  // close on link click
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

/* ---------- HERO PARALLAX ---------- */
const heroBg = document.getElementById('heroBg');
if (heroBg) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    heroBg.style.transform = `scale(1.04) translateY(${y * 0.35}px)`;
  }, { passive: true });
}

/* ---------- COUNTDOWN ---------- */
function updateCountdown() {
  // Wedding: July 31, 2027 at 4:00 PM Pacific
  const target = new Date('2027-07-31T16:00:00-07:00');
  const now = new Date();
  const diff = target - now;

  if (diff <= 0) {
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '0';
    });
    return;
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = String(val).padStart(2, '0');
  };
  set('cd-days',  days);
  set('cd-hours', hours);
  set('cd-mins',  mins);
  set('cd-secs',  secs);
}

updateCountdown();
setInterval(updateCountdown, 1000);

/* ---------- PAGE TRANSITIONS ---------- */
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (!link) return;
  const href = link.getAttribute('href');
  // skip hash-only, external, or blank-target links
  if (!href || href.startsWith('#') || href.startsWith('mailto:') || link.target === '_blank') return;
  e.preventDefault();
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.style.opacity = '0';
  setTimeout(() => { window.location.href = href; }, 300);
});


