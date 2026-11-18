import { SitesRuntime } from './_runtimes/sites-runtime.790e4395bedccd325cd4f781fda0945d3eb5bbe6a527c108de2a4fae7131b9bc.js';

// Use module-relative URLs so the mirror runs at /kineticats/ or a custom domain.
const base = new URL('./', import.meta.url);
const local = path => new URL(path.replace(/^\//, ''), base).href;
// The exported runtime sometimes resolves image hashes directly at responsive breakpoints.
const pawAssets = {
  'a23190a470543c751ad84176066316c93a38fd10.png': 'paw-sticker-production-v2.png',
  '798254cfa0dea63d8c1992c4798cf2ea5cfbab0f.png': 'paw-sticker-design-v2.png',
  '374d3dc1882bb2d7023aa5d3ba855cfc17155ffa.png': 'paw-sticker-writing-v2.png',
  '445b95a23f2f378c5cd193ed9ad0cf6a08b77048.png': 'paw-sticker-coding-v2.png',
};
const labelStickers = () => {
  document.querySelectorAll('main img[src*="paw-sticker-"]').forEach(image => {
    const role = image.src.match(/paw-sticker-(production|design|writing|coding)-/)?.[1];
    if (!role) return;
    const title = role[0].toUpperCase() + role.slice(1);
    image.alt = `${title} — black-and-white paw sticker showing the furry back and five toes`;
  });
};
new MutationObserver(labelStickers).observe(document.getElementById('container'), {
  childList: true, subtree: true, attributes: true, attributeFilter: ['src'],
});
labelStickers();
const siteHistory = {
  current: { url: '/', search: location.search },
  get href() { return location.href; },
  push() {},
  back() { history.back(); },
  forward() { history.forward(); },
};
const runtime = new SitesRuntime({
  container: document.getElementById('container'),
  env: 'published',
  bundleId: 'bc999f27-8c3a-4f10-80e6-85356deb7234',
  history: siteHistory,
  loadComponentsOverNetwork: false,
  withBaseStyles: true,
  isFigmake: false,
  enableMetaTags: false,
  getPage: async () => {
    const response = await fetch(local('_json/bc999f27-8c3a-4f10-80e6-85356deb7234/_index.json'));
    if (!response.ok) throw new Error('Unable to load the local page data');
    return { resource: await response.json(), cmsResource: null };
  },
  getAssetURL: filename => local('_assets/v11/' + (pawAssets[filename] || filename)),
  getFontURL: filename => local(filename),
  getVideoURL: (_, hash) => local('_videos/v1/' + hash + '.mp4'),
  renderOptions: { metronomeEnabled: true, transform3dEnabled: false },
});
runtime.setLocation(siteHistory.current, true);
