// Keep the exported responsive layouts intact. Each original wordmark supplies
// its own exact SVG silhouette, so whitespace and letter counters never hover.
const wordmarks = new Set([
  '1387c7b3c1f458308e24f50164fe9885dd58cdc5.svg',
  '0f292d78569a0c45c572159d54b5b4318c5e613a.svg',
  'f7705051b4c77088f71b444aa0a68a88b87354e6.svg',
  '90899e58cd2901eb763f3c9c9f05a746c4f4d184.svg',
]);
const mounted = new Map();

export function enhanceFooterFilms(container, local) {
  for (const [image, state] of mounted) {
    if (image.isConnected) continue;
    state.cancelled = true;
    state.cleanup?.();
    mounted.delete(image);
  }
  for (const image of container.querySelectorAll('img[src$=".svg"]')) {
    if (!wordmarks.has(new URL(image.src).pathname.split('/').pop()) || mounted.has(image)) continue;
    const state = { cancelled: false };
    mounted.set(image, state);
    mountFooter(image, local).then(cleanup => {
      if (state.cancelled) cleanup?.();
      else state.cleanup = cleanup;
    }).catch(error => console.warn('Footer film could not initialize:', error));
  }
}

async function mountFooter(image, local) {
  const response = await fetch(image.src);
  if (!response.ok) throw new Error('Unable to load the footer wordmark');
  const documentSVG = new DOMParser().parseFromString(await response.text(), 'image/svg+xml');
  if (!image.isConnected) return;
  const silhouette = documentSVG.documentElement;
  if (silhouette.localName !== 'svg') throw new Error('Invalid footer wordmark');
  const control = image.parentElement;
  const breakpoint = image.closest('[data-breakpoint]');
  let footer = control;
  while (footer.parentElement && footer.parentElement !== breakpoint) footer = footer.parentElement;
  if (!breakpoint || footer.parentElement !== breakpoint) return;

  const events = new AbortController();
  const listen = (target, type, listener) => target.addEventListener(type, listener, { signal: events.signal });
  let hovering = false;
  let pinned = false;
  let active = false;
  let loaded = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

  const layer = document.createElement('div');
  layer.className = 'footer-film-layer';
  layer.setAttribute('aria-hidden', 'true');
  const video = document.createElement('video');
  video.className = 'footer-film-video';
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.poster = local('_assets/v11/footer-film-poster.jpg');
  video.tabIndex = -1;
  layer.append(video);

  footer.classList.add('film-footer');
  footer.prepend(layer);
  image.classList.add('footer-wordmark-image');
  control.classList.add('footer-wordmark-control');
  control.setAttribute('role', 'button');
  control.setAttribute('aria-label', 'Kineticats — reveal the cat film');
  control.setAttribute('aria-pressed', 'false');
  control.tabIndex = 0;
  silhouette.classList.add('footer-wordmark-hitarea');
  silhouette.setAttribute('aria-hidden', 'true');
  silhouette.setAttribute('focusable', 'false');
  silhouette.querySelectorAll('[id]').forEach(element => element.removeAttribute('id'));
  control.append(silhouette);

  function load() {
    if (loaded) return;
    loaded = true;
    video.preload = navigator.connection?.saveData ? 'metadata' : 'auto';
    video.src = local('_videos/v2/kineticats-100-cover.mp4');
    video.load();
  }
  function render() {
    active = (hovering || pinned) && !document.hidden && image.isConnected;
    footer.classList.toggle('is-film-active', active);
    control.setAttribute('aria-pressed', String(active));
    if (active) load();
    if (active && (!reducedMotion.matches || pinned)) {
      video.play().then(() => { if (!active) video.pause(); }).catch(() => {});
    } else video.pause();
  }
  function reset() {
    hovering = false;
    pinned = false;
    render();
  }

  // SVG fill hit-testing respects every actual contour and hole in the logo.
  // The image remains the visible artwork; this transparent twin only receives input.
  for (const path of silhouette.querySelectorAll('path')) {
    listen(path, 'pointerenter', event => {
      if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
        hovering = true;
        render();
      }
    });
    listen(path, 'pointerleave', () => { hovering = false; render(); });
  }
  listen(control, 'click', event => {
    // Some original mobile footers are wrapped in an Instagram link.
    // The wordmark is a film control, including its otherwise inert whitespace.
    event.preventDefault();
    event.stopPropagation();
    if (!event.target.closest('.footer-wordmark-hitarea path')) return;
    if (event.pointerType === 'touch' || matchMedia('(hover: none)').matches) {
      pinned = !pinned;
      render();
    }
  });
  listen(control, 'keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      pinned = !pinned;
      render();
    } else if (event.key === 'Escape') reset();
  });
  listen(control, 'blur', () => { pinned = false; render(); });
  listen(control, 'pointerleave', () => { hovering = false; render(); });
  listen(window, 'blur', reset);
  listen(window, 'resize', reset);
  listen(document, 'visibilitychange', () => { if (document.hidden) reset(); });
  listen(reducedMotion, 'change', render);

  // Load near the footer, not alongside the cover at the top of the page.
  const preloader = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) { load(); preloader.disconnect(); }
  }, { rootMargin: '500px' });
  preloader.observe(footer);
  const visibility = new IntersectionObserver(entries => {
    if (entries.every(entry => !entry.isIntersecting)) reset();
  });
  visibility.observe(footer);

  return () => {
    reset();
    events.abort();
    preloader.disconnect();
    visibility.disconnect();
    video.removeAttribute('src');
    video.load();
    layer.remove();
    silhouette.remove();
  };
}
