// Every entry is a matched photograph pair. A visit picks three once, so resizing
// never changes a paw or separates it from its claws-and-dirt hover photograph.
export const pawCollection = [
  { id: 'classic-black', standard: '_assets/v11/paw-photo-production-standard.png', hover: '_assets/v11/paw-photo-production-hover.png' },
  { id: 'classic-gray', standard: '_assets/v11/paw-photo-design-standard.png', hover: '_assets/v11/paw-photo-design-hover.png' },
  { id: 'classic-soft', standard: '_assets/v11/paw-photo-writing-standard.png', hover: '_assets/v11/paw-photo-writing-hover.png' },
  { id: 'classic-tabby', standard: '_assets/v11/paw-photo-coding-standard.png', hover: '_assets/v11/paw-photo-coding-hover.png' },
  { id: 'ginger', standard: '_assets/v12/paw-photo-ginger-standard.png', hover: '_assets/v12/paw-photo-ginger-hover.png' },
  { id: 'white', standard: '_assets/v12/paw-photo-white-standard.png', hover: '_assets/v12/paw-photo-white-hover.png' },
  { id: 'calico', standard: '_assets/v12/paw-photo-calico-standard.png', hover: '_assets/v12/paw-photo-calico-hover.png' },
  { id: 'silver', standard: '_assets/v12/paw-photo-silver-standard.png', hover: '_assets/v12/paw-photo-silver-hover.png' },
];

export function choosePawTrio() {
  const storageKey = 'kineticats:paws:last-visit:v1';
  let previous = [];
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (Array.isArray(saved)) previous = saved;
  } catch { /* Private browsing and disabled storage still get a random trio. */ }
  const unseen = pawCollection.filter(paw => !previous.includes(paw.id));
  const pool = [...(unseen.length >= 3 ? unseen : pawCollection)];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const chosen = pool.slice(0, 3);
  if (chosen.every((paw, i) => paw.id === previous[i])) chosen.push(chosen.shift());
  try { localStorage.setItem(storageKey, JSON.stringify(chosen.map(paw => paw.id))); } catch {}
  return Object.fromEntries(['Film', 'Design', 'Coding'].map((label, i) => [label, chosen[i]]));
}
