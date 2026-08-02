// Lightweight same-origin page transitions using the native View Transitions
// API. This is pure progressive enhancement: any browser without support
// (or if a fetch fails) just falls through to a normal, full navigation.

function isInternalLink(a) {
  if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
  if (a.origin !== window.location.origin) return false;
  if (a.getAttribute('href')?.startsWith('#')) return false;
  return true;
}

async function swapTo(url, { push = true } = {}) {
  let html;
  try {
    const res = await fetch(url, { headers: { 'X-Requested-With': 'router' } });
    if (!res.ok) throw new Error('bad status');
    html = await res.text();
  } catch (e) {
    window.location.href = url;
    return;
  }

  const doc = new DOMParser().parseFromString(html, 'text/html');
  const newMain = doc.querySelector('main.view');
  const oldMain = document.querySelector('main.view');
  if (!newMain || !oldMain) {
    window.location.href = url;
    return;
  }

  const applySwap = () => {
    oldMain.replaceWith(newMain);
    document.title = doc.title;
    document.body.setAttribute('data-page', doc.body.getAttribute('data-page') || '');
    window.scrollTo(0, 0);
    document.dispatchEvent(new CustomEvent('router:navigated'));
  };

  if (document.startViewTransition) {
    document.startViewTransition(applySwap);
  } else {
    applySwap();
  }

  if (push) window.history.pushState({}, '', url);
}

export function initRouter() {
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!isInternalLink(a)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;

    const url = new URL(a.href);
    if (url.pathname === window.location.pathname) return;

    e.preventDefault();
    swapTo(url.href);
  });

  window.addEventListener('popstate', () => {
    swapTo(window.location.href, { push: false });
  });
}
