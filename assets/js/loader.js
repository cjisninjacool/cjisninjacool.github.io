// Percentage-based preloader. Resolves once critical above-the-fold images
// have loaded (or after a timeout, so a slow/broken image never hangs the site).

function preload(img) {
  return new Promise((resolve) => {
    if (img.complete && img.naturalWidth > 0) return resolve();
    const done = () => resolve();
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', done, { once: true });
  });
}

export function runLoader({ scope = document, timeout = 4500 } = {}) {
  const loader = document.querySelector('.loader');
  const countEl = document.querySelector('.loader__count');
  const barEl = document.querySelector('.loader__bar span');

  if (!loader) return Promise.resolve();

  document.body.classList.add('--is-loading');

  const images = Array.from(scope.querySelectorAll('img[data-preload]'));
  const total = Math.max(images.length, 1);
  let loaded = 0;

  const setProgress = (pct) => {
    const clamped = Math.min(100, Math.round(pct));
    if (countEl) countEl.textContent = `${clamped}%`;
    if (barEl) barEl.style.width = `${clamped}%`;
  };

  setProgress(0);

  const tasks = images.length
    ? images.map((img) => preload(img).then(() => setProgress((++loaded / total) * 100)))
    : [new Promise((r) => {
        let p = 0;
        const id = setInterval(() => { p += 20; setProgress(p); if (p >= 100) { clearInterval(id); r(); } }, 90);
      })];

  const guard = new Promise((r) => setTimeout(r, timeout));

  return Promise.race([Promise.all(tasks), guard]).then(() => {
    setProgress(100);
    return new Promise((resolve) => {
      setTimeout(() => {
        loader.classList.add('is-done');
        document.body.classList.remove('--is-loading');
        resolve();
      }, 220);
    });
  });
}
