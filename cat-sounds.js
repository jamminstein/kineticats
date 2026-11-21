// Small real-cat recordings; no looping, overlapping voices or visual UI.
let context;
let current;
let hovered;
let hoverTimer;
let localURL;
let initialized = false;
let request = 0;
const buffers = new Map();
const bound = new WeakSet();
const lastPlayed = new WeakMap();

function audioContext() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return null;
  return context ||= new AudioContext();
}

function buffer(name) {
  if (!buffers.has(name)) {
    const pending = fetch(localURL(`_audio/${name}.mp3`))
      .then(response => {
        if (!response.ok) throw new Error('Cat sound unavailable');
        return response.arrayBuffer();
      }).then(data => audioContext().decodeAudioData(data));
    buffers.set(name, pending);
    pending.catch(() => buffers.delete(name));
  }
  return buffers.get(name);
}

function stop() {
  request++;
  clearTimeout(hoverTimer);
  if (!current) return;
  const { source, gain, target } = current;
  const now = context.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(0, now, .025);
  source.stop(now + .12);
  target.dataset.soundState = 'idle';
  current = null;
}

async function play(target) {
  if (!target || document.hidden || current || performance.now() - (lastPlayed.get(target) ?? -Infinity) < 4000) return;
  const ctx = audioContext();
  if (!ctx) return;
  const token = ++request;
  try {
    // A hover alone cannot unlock audio in browsers that require a user gesture.
    if (ctx.state !== 'running' && navigator.userActivation?.hasBeenActive) await ctx.resume();
    const audio = await buffer(target.dataset.catSound);
    if (token !== request || hovered !== target || !target.isConnected || document.hidden || ctx.state !== 'running') return;
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    source.buffer = audio;
    gain.gain.value = .65;
    source.connect(gain).connect(ctx.destination);
    current = { source, gain, target };
    source.onended = () => {
      source.disconnect();
      gain.disconnect();
      if (current?.source === source) current = null;
      target.dataset.soundState = 'idle';
    };
    source.start();
    lastPlayed.set(target, performance.now());
    target.dataset.soundState = 'playing';
  } catch {
    // Easter eggs stay optional if sound is blocked or an asset cannot load.
  }
}

function bind(target, name, label) {
  if (bound.has(target)) return;
  bound.add(target);
  target.dataset.catSound = name;
  target.dataset.soundState = 'idle';
  target.tabIndex = 0;
  target.setAttribute('role', 'button');
  target.setAttribute('aria-label', label);
  const enter = () => {
    if (hovered === target) return;
    stop();
    hovered = target;
    hoverTimer = setTimeout(() => play(target), 120);
  };
  const leave = () => {
    if (hovered !== target) return;
    hovered = null;
    stop();
  };
  target.addEventListener('pointerenter', enter);
  target.addEventListener('pointerleave', leave);
  target.addEventListener('focus', enter);
  target.addEventListener('blur', leave);
  target.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    hovered = target;
    play(target);
  });
  target.addEventListener('keydown', event => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    event.stopPropagation();
    hovered = target;
    play(target);
  });
}

export function enhanceCatSounds(container, local) {
  localURL = local;
  if (!initialized) {
    initialized = true;
    const unlock = () => {
      const ctx = audioContext();
      if (!ctx || ctx.state === 'running') return;
      ctx.resume().then(() => play(hovered)).catch(() => {});
    };
    document.addEventListener('pointerdown', unlock, { capture: true });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') { hovered = null; stop(); }
      else unlock();
    }, { capture: true });
    document.addEventListener('visibilitychange', () => { if (document.hidden) { hovered = null; stop(); } });
    window.addEventListener('blur', () => { hovered = null; stop(); });
  }
  if (hovered && !hovered.isConnected) { hovered = null; stop(); }
  container.querySelectorAll('img[src*="8bb3e73d927ecb1bdbcf5db597ead6f5a61f4dfd.svg"]').forEach(image => {
    bind(image.parentElement, 'purr', 'Kineticats — play a quiet purr');
  });
  container.querySelectorAll('p').forEach(paragraph => {
    if (paragraph.textContent.trim() === 'The Bradbury Building') {
      bind(paragraph.parentElement, 'meow', 'The Bradbury Building, Los Angeles, California — play a meow');
    }
  });
}
