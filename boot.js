import { enhancePaw } from './paw-interactions.js';
import { enhanceFooterFilms } from './footer-film.js?v=2';
import { enhanceCatSounds } from './cat-sounds.js';
import { choosePawTrio } from './paw-collection.js?v=2';
import { SitesRuntime } from './_runtimes/sites-runtime.790e4395bedccd325cd4f781fda0945d3eb5bbe6a527c108de2a4fae7131b9bc.js';

// Use module-relative URLs so the mirror runs at /kineticats/ or a custom domain.
const base = new URL('./', import.meta.url);
const local = path => new URL(path.replace(/^\//, ''), base).href;
// The exported runtime sometimes resolves image hashes directly at responsive breakpoints.
const pawTrio = choosePawTrio();
const pawAssets = {
  'a23190a470543c751ad84176066316c93a38fd10.png': pawTrio.Film.standard,
  '798254cfa0dea63d8c1992c4798cf2ea5cfbab0f.png': pawTrio.Design.standard,
  '445b95a23f2f378c5cd193ed9ad0cf6a08b77048.png': pawTrio.Coding.standard,
};
const enhancePaws = () => {
  document.querySelectorAll('main img[src*="paw-photo-"][src*="-standard.png"]').forEach(image => {
    const title = image.parentElement.parentElement.querySelector('p')?.textContent.trim();
    const selected = pawTrio[title];
    if (!selected) return;
    const standardURL = local(selected.standard);
    if (image.src !== standardURL) image.src = standardURL;
    image.alt = `${title} — realistic centered paw with its pads facing the viewer`;
    image.parentElement.dataset.pawVariant = selected.id;
    enhancePaw(image.parentElement, image, local(selected.hover), `${title} paw`);
  });
};
const enhancePage = () => {
  enhancePaws();
  enhanceFooterFilms(document.getElementById('container'), local);
  enhanceCatSounds(document.getElementById('container'), local);
};
const pawObserver = new MutationObserver(enhancePage);
let pawsObserved = false;
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
  onPageRendered: () => {
    // Add interactive layers only after React has hydrated the exported page.
    if (!pawsObserved) {
      pawObserver.observe(document.getElementById('container'), {
        childList: true, subtree: true, attributes: true, attributeFilter: ['src'],
      });
      pawsObserved = true;
    }
    enhancePage();
  },
  getPage: async () => {
    const response = await fetch(local('_json/bc999f27-8c3a-4f10-80e6-85356deb7234/_index.json?v=8'));
    if (!response.ok) throw new Error('Unable to load the local page data');
    return { resource: await response.json(), cmsResource: null };
  },
  getAssetURL: filename => local(pawAssets[filename] || '_assets/v11/' + filename),
  getFontURL: filename => local(filename),
  getVideoURL: (_, hash) => local('_videos/v1/' + hash + '.mp4'),
  renderOptions: { metronomeEnabled: true, transform3dEnabled: false },
});
runtime.setLocation(siteHistory.current, true);
