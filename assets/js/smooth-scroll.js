// Thin wrapper around Lenis (loaded via CDN script tag in <head>).
// Falls back to native scrolling silently if Lenis failed to load
// or the user prefers reduced motion.

let instance = null;

export function initSmoothScroll() {
  if (instance) return instance;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  if (typeof window.Lenis !== 'function') return null;

  instance = new window.Lenis({
    autoRaf: true,
    anchors: true,
    lerp: 0.11,
    wheelMultiplier: 1,
    syncTouch: false,
  });

  return instance;
}

export function getSmoothScroll() {
  return instance;
}

export function destroySmoothScroll() {
  instance?.destroy();
  instance = null;
}
