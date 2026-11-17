import { DURATION, SoundCue } from './kit';

export const SAMPLE_RATE = 48000;

const BEAT = 0.5;
const BAR = 2;

interface Chord {
  bass: number;
  notes: number[];
}

const C: Chord = { bass: 65.41, notes: [261.63, 329.63, 392.0] };
const G: Chord = { bass: 98.0, notes: [246.94, 293.66, 392.0] };
const AM: Chord = { bass: 110.0, notes: [261.63, 329.63, 440.0] };
const F: Chord = { bass: 87.31, notes: [261.63, 349.23, 440.0] };
const PROGRESSION: Chord[] = [C, G, AM, F, C, G, AM, F, C, G, AM, F, C, G, AM, F, F, G, C, C];

export async function renderAudio(cues: SoundCue[]): Promise<AudioBuffer> {
  const ctx = new OfflineAudioContext(2, SAMPLE_RATE * DURATION, SAMPLE_RATE);

  const master = ctx.createGain();
  master.gain.value = 0.9;
  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -16;
  compressor.knee.value = 12;
  compressor.ratio.value = 3;
  compressor.attack.value = 0.004;
  compressor.release.value = 0.22;
  master.connect(compressor).connect(ctx.destination);

  const music = ctx.createGain();
  music.gain.value = 0.5;
  music.connect(master);
  const effects = ctx.createGain();
  effects.gain.value = 0.85;
  effects.connect(master);

  const noise = ctx.createBuffer(1, SAMPLE_RATE * 2, SAMPLE_RATE);
  const samples = noise.getChannelData(0);
  let seed = 1234567;
  for (let i = 0; i < samples.length; i++) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    samples[i] = (seed / 4294967296) * 2 - 1;
  }

  const shape = (gain: AudioParam, t: number, attack: number, peak: number, decay: number): void => {
    gain.setValueAtTime(0.0001, t);
    gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + attack);
    gain.exponentialRampToValueAtTime(0.0001, t + attack + decay);
  };

  const output = (dest: AudioNode, pan: number): AudioNode => {
    if (pan === 0) return dest;
    const panner = ctx.createStereoPanner();
    panner.pan.value = pan;
    panner.connect(dest);
    return panner;
  };

  const tone = (
    dest: AudioNode,
    type: OscillatorType,
    from: number,
    to: number,
    t: number,
    attack: number,
    peak: number,
    decay: number,
    pan = 0
  ): void => {
    if (t < 0 || t >= DURATION) return;
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, t);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
    const gain = ctx.createGain();
    shape(gain.gain, t, attack, peak, decay);
    osc.connect(gain).connect(output(dest, pan));
    osc.start(t);
    osc.stop(Math.min(DURATION, t + attack + decay + 0.05));
  };

  const hiss = (
    dest: AudioNode,
    kind: BiquadFilterType,
    from: number,
    to: number,
    q: number,
    t: number,
    attack: number,
    peak: number,
    decay: number,
    pan = 0
  ): void => {
    if (t < 0 || t >= DURATION) return;
    const source = ctx.createBufferSource();
    source.buffer = noise;
    source.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = kind;
    filter.Q.value = q;
    filter.frequency.setValueAtTime(from, t);
    if (to !== from) filter.frequency.exponentialRampToValueAtTime(to, t + attack + decay);
    const gain = ctx.createGain();
    shape(gain.gain, t, attack, peak, decay);
    source.connect(filter).connect(gain).connect(output(dest, pan));
    source.start(t, (t * 0.37) % 1.5);
    source.stop(Math.min(DURATION, t + attack + decay + 0.05));
  };

  const bell = (dest: AudioNode, t: number, frequency: number, peak: number, decay: number, pan = 0): void => {
    tone(dest, 'sine', frequency, frequency, t, 0.004, peak, decay, pan);
    tone(dest, 'sine', frequency * 2.01, frequency * 2.01, t, 0.004, peak * 0.3, decay * 0.5, pan);
  };

  PROGRESSION.forEach((chord, bar) => {
    const t = bar * BAR;
    const last = bar >= 18;
    const level = bar < 2 ? 0.7 : 1;

    chord.notes.forEach((note, index) => {
      [-5, 5].forEach((cents, side) => {
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = note * Math.pow(2, cents / 1200);
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1500;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.09 * level, t + 0.35);
        gain.gain.setValueAtTime(0.09 * level, t + BAR - 0.25);
        gain.gain.linearRampToValueAtTime(0.0001, t + BAR + (last ? 1.2 : 0.25));
        osc
          .connect(filter)
          .connect(gain)
          .connect(output(music, (index - 1) * 0.35 + (side - 0.5) * 0.2));
        osc.start(t);
        osc.stop(Math.min(DURATION, t + BAR + 1.3));
      });
    });

    if (bar >= 2 && bar < 19) {
      [0, 1].forEach((half) => {
        tone(music, 'sine', chord.bass, chord.bass, t + half * 1, 0.01, 0.34, 0.85);
        tone(music, 'triangle', chord.bass * 2, chord.bass * 2, t + half * 1, 0.01, 0.09, 0.5);
      });
    }

    if (bar < 19) {
      const order = [0, 1, 2, 1, 0, 2, 1, 2];
      order.forEach((step, eighth) => {
        const quiet = bar < 2 ? 0.6 : 1;
        tone(
          music,
          'triangle',
          chord.notes[step] * 2,
          chord.notes[step] * 2,
          t + eighth * 0.25,
          0.004,
          0.16 * quiet,
          0.2,
          eighth % 2 === 0 ? -0.35 : 0.35
        );
      });
    }

    for (let beat = 0; beat < 4; beat++) {
      const bt = t + beat * BEAT;
      if (bt >= 4 && bt < 36) {
        const light = bt < 11 && beat % 2 === 1;
        if (!light) tone(music, 'sine', 150, 46, bt, 0.003, 0.5, 0.26);
      }
      if (bt >= 11 && bt < 36) {
        hiss(music, 'highpass', 7500, 7500, 0.7, bt + 0.25, 0.002, 0.11, 0.045, 0.2);
        if (beat % 2 === 1) hiss(music, 'bandpass', 1700, 1700, 0.9, bt, 0.002, 0.22, 0.13);
      }
    }
  });

  bell(music, 36, 1046.5, 0.12, 2.4);
  bell(music, 36, 1318.5, 0.08, 2.4, 0.3);

  for (const cue of cues) {
    const t = cue.t;
    const a = cue.a;
    let bus: AudioNode = effects;
    if (cue.g !== undefined && cue.g !== 1) {
      const trim = ctx.createGain();
      trim.gain.value = cue.g;
      trim.connect(effects);
      bus = trim;
    }
    switch (cue.kind) {
      case 'pop': {
        const pitch = a ?? 1;
        tone(bus, 'sine', 560 * pitch, 190 * pitch, t, 0.004, 0.5, 0.13);
        hiss(bus, 'highpass', 3200, 3200, 0.7, t, 0.001, 0.07, 0.03);
        break;
      }
      case 'whoosh':
        hiss(bus, 'bandpass', 380, 3400, 1.1, t, 0.26, 0.26 * (a ?? 1), 0.24);
        break;
      case 'whooshOut':
        hiss(bus, 'bandpass', 3200, 420, 1.1, t, 0.12, 0.22, 0.3);
        break;
      case 'tick': {
        const pitch = a ?? 1;
        tone(bus, 'sine', 2100 * pitch, 1500 * pitch, t, 0.001, 0.055, 0.022);
        hiss(bus, 'highpass', 5200, 5200, 0.7, t, 0.001, 0.035, 0.018);
        break;
      }
      case 'ding':
        bell(bus, t, a ?? 1320, 0.2, 0.7);
        break;
      case 'sparkle':
        [1568, 1976, 2349, 3136].forEach((frequency, index) =>
          bell(bus, t + index * 0.07, frequency, 0.11, 0.45, index % 2 === 0 ? -0.3 : 0.3)
        );
        break;
      case 'chime':
        [523.25, 659.25, 783.99, 1046.5].forEach((frequency, index) => bell(bus, t + index * 0.09, frequency, 0.17, 0.8));
        break;
      case 'impact':
        tone(bus, 'sine', 120, 38, t, 0.003, 0.5, 0.45);
        hiss(bus, 'lowpass', 900, 180, 0.7, t, 0.002, 0.2, 0.25);
        break;
      case 'riser': {
        const length = a ?? 0.8;
        const source = ctx.createBufferSource();
        source.buffer = noise;
        source.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.value = 1.4;
        filter.frequency.setValueAtTime(300, t);
        filter.frequency.exponentialRampToValueAtTime(5200, t + length);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.2, t + length);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + length + 0.06);
        source.connect(filter).connect(gain).connect(bus);
        source.start(t);
        source.stop(t + length + 0.1);
        tone(bus, 'sine', 220, 1100, t, length, 0.05, 0.05);
        break;
      }
      case 'rattle':
        for (let i = 0; i < 6; i++)
          tone(bus, 'triangle', 190 - i * 8, 150, t + i * 0.07, 0.002, 0.22, 0.045, i % 2 === 0 ? -0.4 : 0.4);
        break;
      case 'tap':
        tone(bus, 'sine', 320, 150, t, 0.002, 0.3, 0.07);
        hiss(bus, 'highpass', 4200, 4200, 0.7, t, 0.001, 0.05, 0.02);
        break;
    }
  }

  const buffer = await ctx.startRendering();
  finish(buffer);
  return buffer;
}

function finish(buffer: AudioBuffer): void {
  let peak = 0;
  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) peak = Math.max(peak, Math.abs(data[i]));
  }
  const scale = peak > 0 ? 0.89 / peak : 1;
  const fadeIn = Math.floor(SAMPLE_RATE * 0.02);
  const fadeOut = Math.floor(SAMPLE_RATE * 1.4);

  for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < data.length; i++) {
      let k = scale;
      if (i < fadeIn) k *= i / fadeIn;
      const tail = data.length - i;
      if (tail < fadeOut) k *= tail / fadeOut;
      data[i] *= k;
    }
  }
}
