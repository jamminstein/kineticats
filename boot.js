import { SitesRuntime } from './_runtimes/sites-runtime.790e4395bedccd325cd4f781fda0945d3eb5bbe6a527c108de2a4fae7131b9bc.js';

// Use module-relative URLs so the mirror runs at /kineticats/ or a custom domain.
const base = new URL('./', import.meta.url);
const local = path => new URL(path.replace(/^\//, ''), base).href;
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
  getAssetURL: filename => local('_assets/v11/' + filename),
  getFontURL: filename => local(filename),
  getVideoURL: (_, hash) => local('_videos/v1/' + hash + '.mp4'),
  renderOptions: { metronomeEnabled: true, transform3dEnabled: false },
});
runtime.setLocation(siteHistory.current, true);
