/* Tiny WebAudio sound effects. Client only. */

let ctx: AudioContext | null = null;
let muted = false;

export function setMuted(m: boolean) {
  muted = m;
}

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType = "sine", vol = 0.08, when = 0) {
  if (muted) return;
  const c = ac();
  if (!c) return;
  const t = c.currentTime + when;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  tap: () => tone(720, 0.05, "sine", 0.05),
  err: () => tone(140, 0.12, "square", 0.06),
  line: () => {
    tone(520, 0.08, "sine", 0.07);
    tone(780, 0.1, "sine", 0.07, 0.08);
  },
  star: (n: number) =>
    [523, 659, 784, 1047].slice(0, n + 1).forEach((f, i) => tone(f, 0.16, "triangle", 0.09, i * 0.12)),
  pop: () => {
    tone(880, 0.07, "triangle", 0.09);
    tone(1320, 0.05, "sine", 0.06, 0.05);
  },
  zap: () => tone(980, 0.06, "sawtooth", 0.05),
  lose: () => {
    tone(300, 0.15, "square", 0.07);
    tone(220, 0.2, "square", 0.07, 0.13);
  },
  win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.18, "triangle", 0.09, i * 0.11)),
};
