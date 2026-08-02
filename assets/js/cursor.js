// Small magnetic cursor dot. No-ops on touch/coarse pointers.

let dot = null;
let raf = null;
const pos = { x: -100, y: -100 };
const target = { x: -100, y: -100 };

export function initCursor() {
  if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  if (!dot) {
    dot = document.createElement('div');
    dot.className = 'cursor-dot';
    document.body.appendChild(dot);

    window.addEventListener('mousemove', (e) => {
      target.x = e.clientX;
      target.y = e.clientY;
    });

    const tick = () => {
      pos.x += (target.x - pos.x) * 0.25;
      pos.y += (target.y - pos.y) * 0.25;
      dot.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
  }

  bindHoverTargets();
}

function bindHoverTargets() {
  document.querySelectorAll('a, button, .tile, .project-card__media').forEach((el) => {
    el.addEventListener('mouseenter', () => dot?.setAttribute('data-hover', 'true'));
    el.addEventListener('mouseleave', () => dot?.removeAttribute('data-hover'));
  });
}
