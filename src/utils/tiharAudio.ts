// Procedural Web Audio synthesizer for Nepali Tihar brass bell (Ghanta) & Madal drum cadence.
// Zero external audio files — purely synthesized on user gesture.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    void audioCtx.resume();
  }
  return audioCtx;
}

export function playGhantaChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const partials = [
      { freq: 528, gain: 0.14, decay: 1.8 },
      { freq: 1056, gain: 0.08, decay: 1.3 },
      { freq: 1588, gain: 0.045, decay: 0.9 },
      { freq: 2310, gain: 0.025, decay: 0.55 },
    ];

    partials.forEach(({ freq, gain, decay }) => {
      const osc = ctx.createOscillator();
      const amp = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      amp.gain.setValueAtTime(0.0001, now);
      amp.gain.exponentialRampToValueAtTime(gain, now + 0.012);
      amp.gain.exponentialRampToValueAtTime(0.0001, now + decay);

      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + decay + 0.05);
    });
  } catch {
    // Audio playback is optional and non-blocking
  }
}

export function playMadalBeat(accent: 'dhin' | 'ta' | 'na'): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();

    if (accent === 'dhin') {
      // Resonant deep bass head of the Nepali Madal
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(145, now);
      osc.frequency.exponentialRampToValueAtTime(68, now + 0.18);
      amp.gain.setValueAtTime(0.001, now);
      amp.gain.exponentialRampToValueAtTime(0.24, now + 0.01);
      amp.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (accent === 'ta') {
      // Crisp high treble slap
      osc.type = 'sine';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.08);
      amp.gain.setValueAtTime(0.001, now);
      amp.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
      amp.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } else {
      // Bright brass cymbal (Jhyali) tick
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      amp.gain.setValueAtTime(0.001, now);
      amp.gain.exponentialRampToValueAtTime(0.05, now + 0.005);
      amp.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(amp);
      amp.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    }
  } catch {
    // Non-blocking
  }
}
