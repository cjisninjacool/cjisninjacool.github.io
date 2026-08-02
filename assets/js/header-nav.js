// Hides the hairline header + floating nav pill on scroll-down, reveals on
// scroll-up. Also marks the active nav link based on the current path.

let bound = false;

export function initHeaderNav() {
  const header = document.querySelector('.site-header');
  const nav = document.querySelector('.float-nav');
  if (!header && !nav) return;

  markActiveLink(nav);

  if (bound) return;
  bound = true;

  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const goingDown = y > lastY + 4;
    const goingUp = y < lastY - 4;
    const pastThreshold = y > 80;

    if (goingDown && pastThreshold) {
      header?.setAttribute('data-hidden', 'true');
      nav?.setAttribute('data-hidden', 'true');
    } else if (goingUp || y < 80) {
      header?.removeAttribute('data-hidden');
      nav?.removeAttribute('data-hidden');
    }

    lastY = y;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
}

function markActiveLink(nav) {
  if (!nav) return;
  const path = window.location.pathname.replace(/\/index\.html$/, '/');
  nav.querySelectorAll('.float-nav__link').forEach((link) => {
    const href = link.getAttribute('href')?.replace(/\/index\.html$/, '/');
    if (href === path || (href === '/' && (path === '/' || path === ''))) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}
