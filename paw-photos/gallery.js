const grid = document.querySelector('#grid');
const coats = { production: 'Black short fur', design: 'Silver tabby', writing: 'White short fur', coding: 'Black and white' };
function showMode(mode) {
  const stickers = mode === 'stickers';
  grid.classList.toggle('mode-stickers', stickers);
  document.querySelectorAll('[data-mode]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.mode === mode)));
  grid.querySelectorAll('article').forEach(card => {
    const paw = card.dataset.paw;
    const src = stickers ? `../_assets/v11/paw-sticker-${paw}-v2.png` : `photos/${paw}-centered.png`;
    const image = card.querySelector('img');
    image.src = src;
    image.alt = `${stickers ? 'Black-and-white ink sticker — cat front paw showing its furry back' : 'Realistic ' + coats[paw].toLowerCase() + ' — cat front paw centered upright, with flexed toes and its soft underside pads facing the viewer'}`;
    card.querySelector('.artwork').href = src;
    card.querySelector('.download').href = src;
    card.querySelector('.coat').textContent = stickers ? 'Black ink · white paper' : coats[paw];
  });
  document.querySelector('#status').textContent = stickers ? 'Monochrome stickers · all four furry backs' : 'Realistic studies · centered, pads facing you';
}
document.querySelectorAll('[data-mode]').forEach(button => button.addEventListener('click', () => showMode(button.dataset.mode)));
