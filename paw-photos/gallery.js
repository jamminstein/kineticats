import { enhancePaw } from '../paw-interactions.js';

const grid = document.querySelector('#grid');
const coats = { production: 'Black short fur', design: 'Silver tabby', writing: 'White short fur', coding: 'Black and white' };
const interactions = new Map();
grid.querySelectorAll('article').forEach(card => {
  const paw = card.dataset.paw;
  const image = card.querySelector('img');
  interactions.set(paw, enhancePaw(card.querySelector('.artwork'), image, `photos/${paw}-claws-dirt.png`, `${paw[0].toUpperCase() + paw.slice(1)} paw`));
});

function showMode(mode) {
  const stickers = mode === 'stickers';
  grid.classList.toggle('mode-stickers', stickers);
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  grid.querySelectorAll('article').forEach(card => {
    const paw = card.dataset.paw;
    const src = stickers ? `../_assets/v11/paw-sticker-${paw}-v2.png` : `photos/${paw}-centered.png`;
    const image = card.querySelector('.paw-base-image');
    image.src = src;
    image.alt = stickers ? 'Black-and-white ink sticker — cat front paw showing its furry back' : `Realistic ${coats[paw].toLowerCase()} — centered cat front paw with relaxed toes and its underside pads facing the viewer`;
    interactions.get(paw).setEnabled(!stickers);
    card.querySelector('.artwork').setAttribute('aria-label', stickers ? `${paw} paw sticker` : `${paw[0].toUpperCase() + paw.slice(1)} paw — reveal claws and dirt`);
    card.querySelector('.download').href = src;
    card.querySelector('.download').textContent = stickers ? 'Full image ↓' : 'Standard ↓';
    card.querySelector('.download-hover').hidden = stickers;
    card.querySelector('.coat').textContent = stickers ? 'Black ink · white paper' : coats[paw];
  });
  document.querySelector('#status').textContent = stickers ? 'Monochrome stickers · all four furry backs' : 'Hover or tap a paw · claws out';
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => showMode(button.dataset.mode)));
