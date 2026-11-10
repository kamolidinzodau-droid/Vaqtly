// Lightweight in-memory audio alerts using the Web Audio API (no asset needed).
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function tone(freq: number, start: number, duration: number, gain = 0.18, type: OscillatorType = 'sine') {
  const c = getCtx();
  if (!c) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(g);
  g.connect(c.destination);
  const t = c.currentTime + start;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration);
  osc.start(t);
  osc.stop(t + duration + 0.05);
}

// Task alert — pleasant ascending two-tone chime
export function playAlert() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  tone(880, 0, 0.35);
  tone(1320, 0.18, 0.45);
}

// Timer completion — gentle three-tone
export function playTimerEnd() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  tone(523, 0, 0.3);
  tone(659, 0.2, 0.3);
  tone(784, 0.4, 0.5);
}

// Click feedback — short blip
export function playClick() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  tone(1200, 0, 0.08, 0.08, 'triangle');
}

// Game success
export function playSuccess() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  tone(659, 0, 0.15);
  tone(784, 0.12, 0.15);
  tone(988, 0.24, 0.3);
}

// Game fail
export function playFail() {
  const c = getCtx();
  if (!c) return;
  if (c.state === 'suspended') c.resume();
  tone(300, 0, 0.2, 0.12, 'sawtooth');
  tone(200, 0.15, 0.3, 0.12, 'sawtooth');
}

// Call once on a user gesture to unlock audio on mobile/Safari.
export function unlockAudio() {
  const c = getCtx();
  if (c && c.state === 'suspended') c.resume();
}
