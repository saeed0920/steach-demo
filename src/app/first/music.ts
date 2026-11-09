// Generative calm piano in the spirit of Minecraft's ambient score (original, procedural).
// Cheap: a few short-lived oscillator nodes per note, scheduled ~2s ahead from one timer.

const CHORDS = [
  [53, 57, 60, 64], // Fmaj7
  [48, 52, 55, 59], // Cmaj7
  [45, 48, 52, 55], // Am7
  [43, 47, 50, 55], // G
  [50, 53, 57, 60], // Dm7
  [48, 52, 55, 59], // Cmaj7
];
const SCALE = [60, 62, 64, 67, 69, 72, 74, 76, 79]; // C major pentatonic-ish melody pool
const BEAT = 0.95; // seconds; slow and unhurried
const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

export function createMusic() {
  let ctx: AudioContext | null = null;
  let master: GainNode;
  let bus: GainNode;
  let timer = 0;
  let next = 0;
  let bar = 0;
  let on = false;

  function setup() {
    ctx = new AudioContext();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
    // Soft reverb from a generated decaying-noise impulse.
    const len = Math.floor(ctx.sampleRate * 3);
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = ir.getChannelData(ch);
      for (let i = 0; i < len; i++)
        d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
    }
    const verb = ctx.createConvolver();
    verb.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.45;
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 2400;
    bus = ctx.createGain();
    bus.connect(lp);
    lp.connect(master);
    lp.connect(verb);
    verb.connect(wet);
    wet.connect(master);
  }

  function note(n: number, t: number, vel: number, len = 3.2) {
    if (!ctx) return;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vel, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    g.connect(bus);
    const f = midi(n);
    for (const [type, mul, amp] of [
      ["sine", 1, 1],
      ["triangle", 2, 0.18],
      ["sine", 3, 0.06],
    ] as const) {
      const o = ctx.createOscillator();
      const a = ctx.createGain();
      o.type = type;
      o.frequency.value = f * mul;
      o.detune.value = (Math.random() - 0.5) * 6;
      a.gain.value = amp;
      o.connect(a).connect(g);
      o.start(t);
      o.stop(t + len + 0.05);
    }
  }

  function scheduleBar(t: number) {
    const chord = CHORDS[bar % CHORDS.length];
    // Slow broken chord in the left hand.
    note(chord[0] - 12, t, 0.16, 4.5);
    note(chord[1], t + BEAT * 1.02, 0.08);
    note(chord[2], t + BEAT * 2.05, 0.08);
    // Sparse melody; some bars stay silent, like the real thing.
    if (bar % 6 !== 5) {
      let last = SCALE[4];
      for (let b = 0; b < 4; b++) {
        if (Math.random() < 0.45) continue;
        const near = SCALE.filter((s) => Math.abs(s - last) <= 5);
        last = near[Math.floor(Math.random() * near.length)];
        note(
          last,
          t + b * BEAT + (Math.random() < 0.3 ? BEAT / 2 : 0),
          0.11 + Math.random() * 0.05,
        );
      }
    }
    bar++;
  }

  function tick() {
    if (!ctx) return;
    while (next < ctx.currentTime + 2) {
      scheduleBar(next);
      next += BEAT * 4;
    }
  }

  const onVisibility = () => {
    if (!ctx) return;
    if (document.hidden) ctx.suspend();
    else if (on) ctx.resume();
  };
  document.addEventListener("visibilitychange", onVisibility);

  return {
    /** Must be called from a user gesture (autoplay policy). */
    start() {
      if (!ctx) setup();
      const c = ctx as AudioContext;
      on = true;
      c.resume();
      next = Math.max(next, c.currentTime + 0.1);
      master.gain.cancelScheduledValues(c.currentTime);
      master.gain.setTargetAtTime(0.5, c.currentTime, 0.8);
      clearInterval(timer);
      timer = window.setInterval(tick, 500);
      tick();
    },
    stop() {
      on = false;
      clearInterval(timer);
      if (!ctx) return;
      const c = ctx;
      master.gain.setTargetAtTime(0, c.currentTime, 0.3);
      setTimeout(() => !on && c.suspend(), 1500);
    },
    /** Small arrival ding. */
    chime() {
      if (!ctx || !on) return;
      const t = ctx.currentTime + 0.02;
      note(79, t, 0.12, 1.6);
      note(84, t + 0.12, 0.1, 2);
    },
    dispose() {
      on = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
      ctx?.close();
    },
  };
}
