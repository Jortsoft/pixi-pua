import { Color } from 'pixi.js';
import type { Text } from 'pixi.js';
import { easings, resolveEasing, timeWarp } from '../core/easing.js';
import { find, run } from '../core/engine.js';
import { resolveEnd } from '../core/options.js';
import { getStroke, restoreStroke, setStroke } from '../core/compat.js';
import { keepRestAlpha, takeRestAlpha, takeRestScale } from '../core/rest.js';
import type { PuaEnd, PuaOptions } from '../types.js';

export interface TypewriterOptions extends PuaOptions {
  by?: 'char' | 'word';
  cursor?: string;
  cursorBlink?: number;
}

export interface ScrambleOptions extends PuaOptions {
  chars?: string;
}

export interface CountOptions extends PuaOptions {
  from?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
}

export interface TrackOptions extends PuaOptions {
  spacing?: number;
}

const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&?';

export function typewriter(text: Text, duration: number, end?: PuaEnd<TypewriterOptions>): void {
  const o = resolveEnd(end);
  const full = text.text;
  const units = o.by === 'word' ? full.match(/\S+\s*/g) ?? [full] : Array.from(full);
  const easing = resolveEasing(o.easing, 'linear');
  const cursor = o.cursor ?? '';
  const blink = Math.max(1, o.cursorBlink ?? 250);
  text.visible = true;
  text.text = cursor;

  run({
    target: text,
    channel: 'text',
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      const count = Math.min(units.length, Math.floor(easing(p) * units.length + 1e-6));
      const caret = cursor && Math.floor((p * duration) / blink) % 2 === 0 ? cursor : '';
      const next = units.slice(0, count).join('') + caret;
      if (next !== text.text) text.text = next;
    },
    onStop: () => {
      text.text = full;
    },
    onComplete: () => {
      text.text = full;
      o.onComplete?.();
    }
  });
}

export function scramble(text: Text, duration: number, end?: PuaEnd<ScrambleOptions>): void {
  const o = resolveEnd(end);
  const full = Array.from(text.text);
  const chars = o.chars ?? SCRAMBLE_CHARS;
  const easing = resolveEasing(o.easing, 'quadOut');
  const render = (resolved: number): void => {
    text.text = full
      .map((ch, i) => (i < resolved || ch.trim() === '' ? ch : chars[Math.floor(Math.random() * chars.length)]))
      .join('');
  };
  text.visible = true;
  render(0);

  run({
    target: text,
    channel: 'text',
    duration,
    delay: o.delay,
    onUpdate: (p) => render(Math.floor(easing(p) * full.length + 1e-6)),
    onStop: () => {
      text.text = full.join('');
    },
    onComplete: () => {
      text.text = full.join('');
      o.onComplete?.();
    }
  });
}

export function countTo(text: Text, to: number, duration: number, end?: PuaEnd<CountOptions>): void {
  const o = resolveEnd(end);
  const from = o.from ?? parseNumber(text.text);
  const decimals = o.decimals ?? 0;
  const easing = resolveEasing(o.easing, 'quadOut');
  const format = (value: number): string =>
    (o.prefix ?? '') + withSeparator(value.toFixed(decimals), o.separator) + (o.suffix ?? '');
  let last = '';

  run({
    target: text,
    channel: 'text',
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      const next = format(from + (to - from) * easing(p));
      if (next === last) return;
      last = next;
      text.text = next;
    },
    onComplete: () => {
      text.text = format(to);
      o.onComplete?.();
    }
  });
}

export function trackIn(text: Text, duration: number, end?: PuaEnd<TrackOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestSpacing(text);
  const spacing = o.spacing ?? 24;
  const alpha = takeRestAlpha(text);
  const easing = resolveEasing(o.easing, 'cubicOut');

  text.visible = true;
  if (!find(text, 'alpha')) text.alpha = 0;
  text.style.letterSpacing = rest + spacing;

  run({
    target: text,
    channel: 'alpha',
    object: text,
    to: { alpha },
    duration,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });

  run({
    target: text,
    channel: 'spacing',
    duration,
    delay: o.delay,
    base: { spacing: rest },
    onUpdate: (p) => {
      text.style.letterSpacing = rest + spacing * (1 - easing(p));
    },
    onComplete: () => {
      text.style.letterSpacing = rest;
      o.onComplete?.();
    }
  });
}

export function trackOut(text: Text, duration: number, end?: PuaEnd<TrackOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestSpacing(text);
  const spacing = o.spacing ?? 24;
  const alpha = takeRestAlpha(text);
  const easing = resolveEasing(o.easing, 'cubicIn');

  run({
    target: text,
    channel: 'alpha',
    object: text,
    to: { alpha: 0 },
    duration,
    easing: easings.quadIn,
    delay: o.delay,
    base: { alpha },
    onComplete: () => keepRestAlpha(text, alpha)
  });

  run({
    target: text,
    channel: 'spacing',
    duration,
    delay: o.delay,
    base: { spacing: rest },
    onUpdate: (p) => {
      text.style.letterSpacing = rest + spacing * easing(p);
    },
    onComplete: () => {
      text.style.letterSpacing = rest;
      o.onComplete?.();
    }
  });
}

export function textColor(text: Text, color: number, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const from = fillToHex(text.style.fill);
  const easing = resolveEasing(o.easing, 'quadOut');

  run({
    target: text,
    channel: 'color',
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      text.style.fill = lerpColor(from, color, easing(p));
    },
    onComplete: () => {
      text.style.fill = color;
      o.onComplete?.();
    }
  });
}

function takeRestSpacing(text: Text): number {
  return find(text, 'spacing')?.base?.spacing ?? text.style.letterSpacing;
}

function parseNumber(value: string): number {
  const parsed = parseFloat(value.replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function withSeparator(value: string, separator?: string): string {
  if (!separator) return value;
  const [whole, fraction] = value.split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return fraction === undefined ? grouped : `${grouped}.${fraction}`;
}

function fillToHex(fill: unknown): number {
  let value = Array.isArray(fill) ? fill[0] : fill;
  if (value !== null && typeof value === 'object' && 'color' in value) value = value.color;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return new Color(value).toNumber();
  return 0xffffff;
}

function lerpColor(from: number, to: number, t: number): number {
  const channel = (shift: number): number => {
    const a = (from >> shift) & 255;
    const b = (to >> shift) & 255;
    return Math.round(a + (b - a) * t);
  };
  return (channel(16) << 16) | (channel(8) << 8) | channel(0);
}

export interface BackspaceOptions extends PuaOptions {
  by?: 'char' | 'word';
}

export interface TextCycleOptions {
  interval?: number;
  duration?: number;
  delay?: number;
}

export interface CountdownOptions extends PuaOptions {
  from?: number;
  interval?: number;
  end?: string;
  punch?: number;
}

export interface TextColorPulseOptions {
  duration?: number;
  delay?: number;
}

export interface TextStrokePulseOptions {
  duration?: number;
  thickness?: number;
  color?: number;
  delay?: number;
}

export function backspace(text: Text, duration: number, end?: PuaEnd<BackspaceOptions>): void {
  const o = resolveEnd(end);
  const full = text.text;
  const units = o.by === 'word' ? full.match(/\S+\s*/g) ?? [full] : Array.from(full);
  const easing = resolveEasing(o.easing, 'linear');
  let shown = -1;

  run({
    target: text,
    channel: 'text',
    duration,
    delay: o.delay,
    onUpdate: (p) => {
      const count = Math.max(0, units.length - Math.floor(easing(p) * units.length + 1e-6));
      if (count === shown) return;
      shown = count;
      text.text = units.slice(0, count).join('');
    },
    onStop: () => {
      text.text = full;
    },
    onComplete: () => {
      text.text = '';
      o.onComplete?.();
    }
  });
}

export function textCycle(text: Text, words: string[], options: TextCycleOptions = {}): void {
  const original = text.text;
  const alpha = takeRestAlpha(text);
  const list = words.length > 0 ? words : [original];
  const interval = options.interval ?? 1500;
  const fade = Math.min(options.duration ?? 300, interval / 2);
  let index = -1;
  text.visible = true;

  run({
    target: text,
    channel: 'text',
    duration: interval * list.length,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      const t = p * list.length * interval;
      const i = Math.min(list.length - 1, Math.floor(t / interval));
      const local = t - i * interval;
      if (i !== index) {
        index = i;
        text.text = list[i];
      }
      const k = local < fade ? local / fade : local > interval - fade ? (interval - local) / fade : 1;
      text.alpha = alpha * easings.quadOut(Math.max(0, Math.min(1, k)));
    },
    onStop: () => {
      text.text = original;
      text.alpha = alpha;
    }
  });
}

export function countdown(text: Text, end?: PuaEnd<CountdownOptions>): void {
  const o = resolveEnd(end);
  const from = Math.max(1, Math.round(o.from ?? 3));
  const interval = o.interval ?? 800;
  const finale = o.end ?? 'GO!';
  const punch = o.punch ?? 0.3;
  const rest = takeRestScale(text);
  const steps = from + 1;
  let index = -1;
  text.visible = true;

  run({
    target: text,
    channel: 'text',
    duration: interval * steps,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      const t = p * steps;
      const i = Math.min(steps - 1, Math.floor(t));
      if (i !== index) {
        index = i;
        text.text = i < from ? String(from - i) : finale;
      }
      const s = 1 + punch * (1 - easings.quadOut(Math.min(1, (t - i) * 2)));
      text.scale.set(rest.x * s, rest.y * s);
    },
    onStop: () => {
      text.scale.set(rest.x, rest.y);
    },
    onComplete: () => {
      text.scale.set(rest.x, rest.y);
      o.onComplete?.();
    }
  });
}

export function textColorPulse(text: Text, color: number, options: TextColorPulseOptions = {}): void {
  const from = fillToHex(text.style.fill);

  run({
    target: text,
    channel: 'color',
    duration: options.duration ?? 1000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      text.style.fill = lerpColor(from, color, 0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    },
    onStop: () => {
      text.style.fill = from;
    }
  });
}

export function textStrokePulse(text: Text, options: TextStrokePulseOptions = {}): void {
  const rest = getStroke(text);
  const thickness = options.thickness ?? rest.width + 6;
  const color = options.color ?? rest.color;

  run({
    target: text,
    channel: 'stroke',
    duration: options.duration ?? 1000,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      setStroke(text, color, rest.width + (thickness - rest.width) * (0.5 - 0.5 * Math.cos(p * Math.PI * 2)));
    },
    onStop: () => restoreStroke(text, rest)
  });
}

export interface TextSwapOptions extends PuaOptions {
  duration?: number;
}

export interface TextTimerOptions extends PuaOptions {
  to?: number;
  format?: 'mm:ss' | 'ss';
}

export interface EllipsisOptions {
  interval?: number;
  count?: number;
  dot?: string;
  delay?: number;
}

export interface TypeCycleOptions {
  speed?: number;
  hold?: number;
  cursor?: string;
  delay?: number;
  deleteSpeed?: number;
}

export interface TextRainbowOptions {
  duration?: number;
  saturation?: number;
  lightness?: number;
  delay?: number;
}

export interface TextFlashOptions extends PuaOptions {
  duration?: number;
  flashes?: number;
}

export interface SlotCountOptions extends PuaOptions {
  digits?: number;
  prefix?: string;
  suffix?: string;
}

export interface TrackPulseOptions {
  duration?: number;
  spacing?: number;
  delay?: number;
}

export function textSwap(text: Text, value: string, end?: PuaEnd<TextSwapOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(text);
  let swapped = false;
  const settle = (): void => {
    text.text = value;
    text.scale.set(rest.x, rest.y);
  };
  text.visible = true;

  run({
    target: text,
    channel: 'text',
    duration: o.duration ?? 320,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      if (p >= 0.5 && !swapped) {
        swapped = true;
        text.text = value;
      }
      const s = p < 0.5 ? 1 - easings.quadIn(p / 0.5) : easings.backOut((p - 0.5) / 0.5);
      text.scale.set(rest.x * s, rest.y * s);
    },
    onStop: settle,
    onComplete: () => {
      settle();
      o.onComplete?.();
    }
  });
}

export function textTimer(text: Text, seconds: number, end?: PuaEnd<TextTimerOptions>): void {
  const o = resolveEnd(end);
  const to = o.to ?? 0;
  const format = o.format ?? 'mm:ss';
  let last = '';
  const render = (value: number): void => {
    const whole = Math.max(0, Math.ceil(value - 1e-6));
    const rest = whole % 60;
    const next = format === 'ss' ? String(whole) : Math.floor(whole / 60) + ':' + (rest < 10 ? '0' : '') + rest;
    if (next === last) return;
    last = next;
    text.text = next;
  };
  text.visible = true;
  render(seconds);

  run({
    target: text,
    channel: 'text',
    duration: Math.abs(seconds - to) * 1000,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => render(seconds + (to - seconds) * p),
    onComplete: () => {
      render(to);
      o.onComplete?.();
    }
  });
}

export function ellipsis(text: Text, options: EllipsisOptions = {}): void {
  const original = text.text;
  const count = Math.max(1, Math.round(options.count ?? 3));
  const dot = options.dot ?? '.';
  let shown = -1;
  text.visible = true;

  run({
    target: text,
    channel: 'text',
    duration: (options.interval ?? 350) * (count + 1),
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      const dots = Math.min(count, Math.floor(p * (count + 1)));
      if (dots === shown) return;
      shown = dots;
      text.text = original + dot.repeat(dots);
    },
    onStop: () => {
      text.text = original;
    }
  });
}

export function typeCycle(text: Text, words: string[], options: TypeCycleOptions = {}): void {
  const original = text.text;
  const list = (words.length > 0 ? words : [original]).map((word) => Array.from(word));
  const speed = options.speed ?? 70;
  const hold = options.hold ?? 900;
  const erase = Math.max(1, options.deleteSpeed ?? speed / 2);
  const cursor = options.cursor ?? '';
  const spans = list.map((letters) => letters.length * (speed + erase) + hold);
  const total = spans.reduce((sum, span) => sum + span, 0);
  let last: string | undefined;
  text.visible = true;

  run({
    target: text,
    channel: 'text',
    duration: total,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      let t = p * total;
      let i = 0;
      while (i < list.length - 1 && t >= spans[i]) {
        t -= spans[i];
        i++;
      }
      const letters = list[i];
      const typing = letters.length * speed;
      let count = letters.length;
      if (t < typing) count = Math.floor(t / speed);
      else if (t >= typing + hold) count = Math.max(0, letters.length - Math.floor((t - typing - hold) / erase));
      const next = letters.slice(0, count).join('') + cursor;
      if (next === last) return;
      last = next;
      text.text = next;
    },
    onStop: () => {
      text.text = original;
    }
  });
}

export function textRainbow(text: Text, options: TextRainbowOptions = {}): void {
  const from = text.style.fill;
  const saturation = options.saturation ?? 0.9;
  const lightness = options.lightness ?? 0.6;

  run({
    target: text,
    channel: 'color',
    duration: options.duration ?? 2400,
    delay: options.delay,
    loop: true,
    onUpdate: (p) => {
      text.style.fill = hslToHex(p, saturation, lightness);
    },
    onStop: () => {
      text.style.fill = from;
    }
  });
}

export function textFlash(text: Text, color: number, end?: PuaEnd<TextFlashOptions>): void {
  const o = resolveEnd(end);
  const from = fillToHex(text.style.fill);
  const flashes = o.flashes ?? 2;

  run({
    target: text,
    channel: 'color',
    duration: o.duration ?? 500,
    delay: o.delay,
    timing: timeWarp(o.easing),
    onUpdate: (p) => {
      text.style.fill = lerpColor(from, color, Math.abs(Math.sin(p * Math.PI * flashes)));
    },
    onStop: () => {
      text.style.fill = from;
    },
    onComplete: () => {
      text.style.fill = from;
      o.onComplete?.();
    }
  });
}

export function slotCount(text: Text, to: number, duration: number, end?: PuaEnd<SlotCountOptions>): void {
  const o = resolveEnd(end);
  const easing = resolveEasing(o.easing, 'quadOut');
  let value = String(Math.abs(Math.round(to)));
  while (value.length < (o.digits ?? 0)) value = '0' + value;
  const reel = Array.from(value);
  const render = (locked: number): void => {
    text.text =
      (o.prefix ?? '') +
      reel.map((digit, i) => (i < locked ? digit : String(Math.floor(Math.random() * 10)))).join('') +
      (o.suffix ?? '');
  };
  text.visible = true;
  render(0);

  run({
    target: text,
    channel: 'text',
    duration,
    delay: o.delay,
    onUpdate: (p) => render(Math.floor(easing(p) * reel.length + 1e-6)),
    onStop: () => render(reel.length),
    onComplete: () => {
      render(reel.length);
      o.onComplete?.();
    }
  });
}

export function trackPulse(text: Text, options: TrackPulseOptions = {}): void {
  const rest = takeRestSpacing(text);
  const spacing = options.spacing ?? 8;

  run({
    target: text,
    channel: 'spacing',
    duration: options.duration ?? 1600,
    delay: options.delay,
    loop: true,
    base: { spacing: rest },
    onUpdate: (p) => {
      text.style.letterSpacing = rest + spacing * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
    },
    onStop: () => {
      text.style.letterSpacing = rest;
    }
  });
}

function hslToHex(h: number, s: number, l: number): number {
  const a = s * Math.min(l, 1 - l);
  const part = (n: number): number => {
    const k = (n + h * 12) % 12;
    return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))));
  };
  return (part(0) << 16) | (part(8) << 8) | part(4);
}
