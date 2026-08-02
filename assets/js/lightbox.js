// Minimal fullscreen lightbox for the photo grid — no external dependency.

let lightboxEl = null;
let items = [];
let index = 0;

function build() {
  if (lightboxEl) return lightboxEl;

  const el = document.createElement('div');
  el.className = 'lightbox';
  el.innerHTML = `
    <button class="lightbox__btn lightbox__close" aria-label="Close">✕</button>
    <button class="lightbox__btn lightbox__prev" aria-label="Previous">‹</button>
    <img class="lightbox__img" alt="">
    <button class="lightbox__btn lightbox__next" aria-label="Next">›</button>
    <div class="lightbox__count"></div>
  `;
  document.body.appendChild(el);
  lightboxEl = el;

  el.querySelector('.lightbox__close').addEventListener('click', close);
  el.querySelector('.lightbox__prev').addEventListener('click', () => show(index - 1));
  el.querySelector('.lightbox__next').addEventListener('click', () => show(index + 1));
  el.addEventListener('click', (e) => { if (e.target === el) close(); });

  document.addEventListener('keydown', (e) => {
    if (!el.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });

  return el;
}

function show(i) {
  if (!items.length) return;
  index = (i + items.length) % items.length;
  const img = lightboxEl.querySelector('.lightbox__img');
  img.src = items[index].full;
  img.alt = items[index].alt || '';
  lightboxEl.querySelector('.lightbox__count').textContent = `${index + 1} / ${items.length}`;
}

function open(i) {
  build();
  document.body.style.overflow = 'hidden';
  show(i);
  requestAnimationFrame(() => lightboxEl.classList.add('is-open'));
}

function close() {
  if (!lightboxEl) return;
  lightboxEl.classList.remove('is-open');
  document.body.style.overflow = '';
}

export function initLightbox(gridSelector = '.photo-grid') {
  const grid = document.querySelector(gridSelector);
  if (!grid) return;

  const tiles = Array.from(grid.querySelectorAll('.tile'));
  items = tiles.map((tile) => ({
    full: tile.dataset.full || tile.querySelector('img')?.src,
    alt: tile.querySelector('img')?.alt,
  }));

  tiles.forEach((tile, i) => {
    tile.addEventListener('click', () => open(i));
  });
}
