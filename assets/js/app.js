import { runLoader } from './loader.js';
import { initHeaderNav } from './header-nav.js';
import { initCursor } from './cursor.js';
import { initDistortion } from './webgl-hover.js';
import { initLightbox } from './lightbox.js';
import { initSmoothScroll, getSmoothScroll } from './smooth-scroll.js';
import { initRouter } from './router.js';

function revealHero() {
  const hero = document.querySelector('.hero');
  if (hero) requestAnimationFrame(() => hero.classList.add('is-in'));
}

function initPage() {
  initHeaderNav();
  initDistortion('.js-distort');
  initLightbox('.photo-grid');
  initCursor();
  getSmoothScroll()?.resize();
}

async function boot() {
  initSmoothScroll();
  initRouter();
  await runLoader();
  revealHero();
  initPage();
}

document.addEventListener('router:navigated', () => {
  initPage();
  revealHero();
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
