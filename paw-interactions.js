// Shared by the homepage and the artwork comparison. Keep the standard image
// visible until the second image has loaded, including on slow connections.
export function enhancePaw(control, image, hoverURL, label) {
  if (control.pawInteraction) return control.pawInteraction;
  let enabled = true;
  let hovering = false;
  let pinned = false;
  const nativeButton = control.tagName === 'BUTTON';
  control.classList.add('paw-state');
  image.classList.add('paw-base-image');
  if (!nativeButton) {
    control.setAttribute('role', 'button');
    control.tabIndex = 0;
  }
  control.setAttribute('aria-label', `${label} — reveal claws and dirt`);
  control.setAttribute('aria-pressed', 'false');
  const hover = document.createElement('img');
  hover.className = 'paw-hover-image';
  hover.alt = '';
  hover.setAttribute('aria-hidden', 'true');
  hover.width = image.width || 1254;
  hover.height = image.height || 1254;
  hover.decoding = 'async';
  hover.onload = () => { control.dataset.hoverReady = 'true'; };
  hover.src = hoverURL;
  control.append(hover);
  if (hover.complete && hover.naturalWidth) control.dataset.hoverReady = 'true';

  function render() {
    const active = enabled && (hovering || pinned);
    control.classList.toggle('is-revealed', active);
    control.setAttribute('aria-pressed', String(active));
  }
  function toggle() { pinned = !pinned; render(); }
  control.addEventListener('pointerenter', event => {
    if (event.pointerType === 'mouse') { hovering = true; render(); }
  });
  control.addEventListener('pointerleave', () => { hovering = false; render(); });
  control.addEventListener('click', event => {
    if (!enabled) return;
    // Mouse users get a temporary hover; touch and keyboard users can toggle.
    if (event.detail === 0 || event.pointerType === 'touch' || event.pointerType === 'pen' || matchMedia('(hover: none)').matches) toggle();
  });
  control.addEventListener('keydown', event => {
    if (!enabled) return;
    if (!nativeButton && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      toggle();
    }
    if (event.key === 'Escape') { pinned = false; hovering = false; render(); }
  });
  control.addEventListener('blur', () => { pinned = false; render(); });
  const interaction = {
    setEnabled(value) {
      enabled = value;
      hovering = false;
      pinned = false;
      if (nativeButton) control.disabled = !enabled;
      control.classList.toggle('paw-disabled', !enabled);
      render();
    },
  };
  control.pawInteraction = interaction;
  return interaction;
}
