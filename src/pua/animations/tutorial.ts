import { easings, resolveEasing } from '../core/easing.js';
import { find, run } from '../core/engine.js';
import { DEG_TO_RAD, DIRECTIONS } from '../core/geometry.js';
import { resolveEnd } from '../core/options.js';
import { keepRestAlpha, takeRestAlpha, takeRestPosition, takeRestRotation, takeRestScale } from '../core/rest.js';
import type { PuaEnd, PuaOptions, PuaTarget, SlideDirection } from '../types.js';

export interface TutorialTapOptions {
  interval?: number;
  duration?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialSwipeOptions {
  interval?: number;
  duration?: number;
  delay?: number;
}

export interface TutorialDragOptions {
  interval?: number;
  duration?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialPointOptions {
  duration?: number;
  distance?: number;
  direction?: SlideDirection;
  delay?: number;
}

function fadeEdges(u: number, edge: number): number {
  if (u >= 1) return 0;
  if (u < edge) return u / edge;
  if (u > 1 - edge) return (1 - u) / edge;
  return 1;
}

export function tutorialTap(hand: PuaTarget, options: TutorialTapOptions = {}): void {
  const rest = takeRestScale(hand);
  const interval = options.interval ?? 1100;
  const active = Math.min(1, (options.duration ?? 300) / interval);
  const depth = options.depth ?? 0.85;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      const s = u >= 1 ? 1 : 1 - (1 - depth) * Math.sin(u * Math.PI);
      hand.scale.set(rest.x * s, rest.y * s);
    }
  });
}

export function tutorialSwipe(
  hand: PuaTarget,
  direction: SlideDirection,
  distance: number,
  options: TutorialSwipeOptions = {}
): void {
  const rest = takeRestPosition(hand);
  const alpha = takeRestAlpha(hand);
  const dir = DIRECTIONS[direction];
  const interval = options.interval ?? 1400;
  const active = Math.min(1, (options.duration ?? 700) / interval);
  hand.visible = true;

  run({
    target: hand,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      const t = u >= 1 ? 0 : easings.cubicInOut(u);
      hand.position.set(rest.x + dir.x * distance * t, rest.y + dir.y * distance * t);
    }
  });

  run({
    target: hand,
    channel: 'alpha',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      hand.alpha = alpha * fadeEdges(p / active, 0.18);
    }
  });
}

export function tutorialDrag(hand: PuaTarget, x: number, y: number, options: TutorialDragOptions = {}): void {
  const restPosition = takeRestPosition(hand);
  const restScale = takeRestScale(hand);
  const alpha = takeRestAlpha(hand);
  const interval = options.interval ?? 1800;
  const active = Math.min(1, (options.duration ?? 1000) / interval);
  const depth = options.depth ?? 0.85;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const u = p / active;
      let s = 1;
      if (u < 0.15) s = 1 - (1 - depth) * easings.quadOut(u / 0.15);
      else if (u < 0.8) s = depth;
      else if (u < 1) s = depth + (1 - depth) * easings.quadOut((u - 0.8) / 0.2);
      hand.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  run({
    target: hand,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restPosition,
    onUpdate: (p) => {
      const u = p / active;
      let t = 0;
      if (u >= 0.8 && u < 1) t = 1;
      else if (u >= 0.15 && u < 0.8) t = easings.cubicInOut((u - 0.15) / 0.65);
      hand.position.set(restPosition.x + (x - restPosition.x) * t, restPosition.y + (y - restPosition.y) * t);
    }
  });

  run({
    target: hand,
    channel: 'alpha',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      hand.alpha = alpha * fadeEdges(p / active, 0.1);
    }
  });
}

export function tutorialPoint(hand: PuaTarget, options: TutorialPointOptions = {}): void {
  const rest = takeRestPosition(hand);
  const dir = DIRECTIONS[options.direction ?? 'bottom'];
  const distance = options.distance ?? 14;
  hand.visible = true;

  run({
    target: hand,
    channel: 'position',
    duration: options.duration ?? 900,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const t = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
      hand.position.set(rest.x + dir.x * distance * t, rest.y + dir.y * distance * t);
    }
  });
}

export interface TutorialDoubleTapOptions {
  interval?: number;
  duration?: number;
  gap?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialHoldOptions {
  interval?: number;
  hold?: number;
  depth?: number;
  delay?: number;
  press?: number;
}

export interface TutorialCircleOptions {
  duration?: number;
  radius?: number;
  clockwise?: boolean;
  delay?: number;
}

export interface TutorialPathOptions {
  interval?: number;
  duration?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialTapSequenceOptions {
  interval?: number;
  tapDuration?: number;
  moveDuration?: number;
  depth?: number;
  delay?: number;
}

export interface Point {
  x: number;
  y: number;
}

export function tutorialDoubleTap(hand: PuaTarget, options: TutorialDoubleTapOptions = {}): void {
  const rest = takeRestScale(hand);
  const interval = options.interval ?? 1400;
  const tap = options.duration ?? 160;
  const gap = options.gap ?? 120;
  const depth = options.depth ?? 0.85;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const t = p * interval;
      const first = t < tap ? Math.sin((t / tap) * Math.PI) : 0;
      const second = t >= tap + gap && t < tap * 2 + gap ? Math.sin(((t - tap - gap) / tap) * Math.PI) : 0;
      const s = 1 - (1 - depth) * Math.max(first, second);
      hand.scale.set(rest.x * s, rest.y * s);
    }
  });
}

export function tutorialHold(hand: PuaTarget, options: TutorialHoldOptions = {}): void {
  const rest = takeRestScale(hand);
  const interval = options.interval ?? 2000;
  const hold = options.hold ?? 800;
  const depth = options.depth ?? 0.85;
  const press = options.press ?? 150;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const t = p * interval;
      let k = 0;
      if (t < press) k = easings.quadOut(t / press);
      else if (t < press + hold) k = 1;
      else if (t < press * 2 + hold) k = 1 - easings.quadOut((t - press - hold) / press);
      const s = 1 - (1 - depth) * k;
      hand.scale.set(rest.x * s, rest.y * s);
    }
  });
}

export function tutorialCircle(hand: PuaTarget, options: TutorialCircleOptions = {}): void {
  const rest = takeRestPosition(hand);
  const radius = options.radius ?? 50;
  const direction = options.clockwise === false ? -1 : 1;
  hand.visible = true;

  run({
    target: hand,
    channel: 'position',
    duration: options.duration ?? 1600,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const a = -Math.PI / 2 + direction * p * Math.PI * 2;
      hand.position.set(rest.x + Math.cos(a) * radius, rest.y + radius + Math.sin(a) * radius);
    }
  });
}

export function tutorialPath(hand: PuaTarget, points: Point[], options: TutorialPathOptions = {}): void {
  const rest = takeRestPosition(hand);
  const restScale = takeRestScale(hand);
  const alpha = takeRestAlpha(hand);
  const interval = options.interval ?? 2600;
  const active = Math.min(1, (options.duration ?? 1800) / interval);
  const depth = options.depth ?? 0.85;
  const route = [rest, ...points];
  const lengths = route.slice(1).map((point, i) => Math.hypot(point.x - route[i].x, point.y - route[i].y));
  const total = lengths.reduce((sum, length) => sum + length, 0) || 1;
  hand.visible = true;

  run({
    target: hand,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      const t = u >= 1 || u < 0.15 ? 0 : u >= 0.85 ? 1 : easings.sineInOut((u - 0.15) / 0.7);
      const position = alongRoute(route, lengths, total * t);
      hand.position.set(position.x, position.y);
    }
  });

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const u = p / active;
      let s = 1;
      if (u < 0.15) s = 1 - (1 - depth) * easings.quadOut(u / 0.15);
      else if (u < 0.85) s = depth;
      else if (u < 1) s = depth + (1 - depth) * easings.quadOut((u - 0.85) / 0.15);
      hand.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  run({
    target: hand,
    channel: 'alpha',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      hand.alpha = alpha * fadeEdges(p / active, 0.1);
    }
  });
}

export function tutorialTapSequence(hand: PuaTarget, points: Point[], options: TutorialTapSequenceOptions = {}): void {
  const rest = takeRestPosition(hand);
  const restScale = takeRestScale(hand);
  const alpha = takeRestAlpha(hand);
  const tap = options.tapDuration ?? 300;
  const move = options.moveDuration ?? 350;
  const depth = options.depth ?? 0.85;
  const stops = [rest, ...points];
  const step = tap + move;
  const length = stops.length * step;
  const interval = Math.max(options.interval ?? length + 600, length);
  hand.visible = true;

  const stopAt = (t: number): number => Math.min(stops.length - 1, Math.floor(t / step));

  run({
    target: hand,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const t = p * interval;
      if (t >= length) {
        hand.position.set(rest.x, rest.y);
        return;
      }
      const i = stopAt(t);
      const local = t - i * step;
      const from = stops[i];
      const to = stops[Math.min(i + 1, stops.length - 1)];
      const k = local < tap ? 0 : easings.sineInOut((local - tap) / move);
      hand.position.set(from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k);
    }
  });

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const t = p * interval;
      const local = t - stopAt(t) * step;
      const k = t < length && local < tap ? Math.sin((local / tap) * Math.PI) : 0;
      const s = 1 - (1 - depth) * k;
      hand.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  run({
    target: hand,
    channel: 'alpha',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      const t = p * interval;
      const tail = interval - length;
      const fade = t < length ? 1 : tail > 0 ? Math.max(0, 1 - (t - length) / Math.min(300, tail)) : 1;
      hand.alpha = alpha * fade;
    }
  });
}

function alongRoute(route: Point[], lengths: number[], distance: number): Point {
  let remaining = distance;
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const k = lengths[i] === 0 ? 1 : Math.min(1, remaining / lengths[i]);
      return { x: route[i].x + (route[i + 1].x - route[i].x) * k, y: route[i].y + (route[i + 1].y - route[i].y) * k };
    }
    remaining -= lengths[i];
  }
  return route[route.length - 1];
}

export interface TutorialScrubOptions {
  duration?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialFlickOptions {
  interval?: number;
  duration?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialArcOptions {
  interval?: number;
  duration?: number;
  height?: number;
  depth?: number;
  delay?: number;
}

export interface TutorialWaveOptions {
  interval?: number;
  angle?: number;
  waves?: number;
  delay?: number;
  duration?: number;
}

export interface TutorialFigureEightOptions {
  duration?: number;
  width?: number;
  height?: number;
  delay?: number;
}

export interface TutorialInOptions extends PuaOptions {
  duration?: number;
  direction?: SlideDirection;
  distance?: number;
}

const WAVE_LENGTH = 900;

export function tutorialScrub(
  hand: PuaTarget,
  direction: SlideDirection,
  distance: number,
  options: TutorialScrubOptions = {}
): void {
  const rest = takeRestPosition(hand);
  const restScale = takeRestScale(hand);
  const dir = DIRECTIONS[direction];
  const duration = options.duration ?? 900;
  const depth = options.depth ?? 0.85;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: () => {
      hand.scale.set(restScale.x * depth, restScale.y * depth);
    }
  });

  run({
    target: hand,
    channel: 'position',
    duration,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const t = 0.5 - 0.5 * Math.cos(p * Math.PI * 2);
      hand.position.set(rest.x + dir.x * distance * t, rest.y + dir.y * distance * t);
    }
  });
}

export function tutorialFlick(
  hand: PuaTarget,
  direction: SlideDirection,
  distance: number,
  options: TutorialFlickOptions = {}
): void {
  const rest = takeRestPosition(hand);
  const restScale = takeRestScale(hand);
  const alpha = takeRestAlpha(hand);
  const dir = DIRECTIONS[direction];
  const interval = options.interval ?? 1500;
  const active = Math.min(1, (options.duration ?? 550) / interval);
  const depth = options.depth ?? 0.85;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const u = p / active;
      let s = 1;
      if (u < 0.3) s = 1 - (1 - depth) * easings.quadOut(u / 0.3);
      else if (u < 1) s = depth + (1 - depth) * easings.quadOut((u - 0.3) / 0.7);
      hand.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  run({
    target: hand,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      const t = u < 0.3 || u >= 1 ? 0 : easings.cubicOut((u - 0.3) / 0.7);
      hand.position.set(rest.x + dir.x * distance * t, rest.y + dir.y * distance * t);
    }
  });

  run({
    target: hand,
    channel: 'alpha',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      const u = p / active;
      const k = u >= 1 ? 0 : u < 0.15 ? u / 0.15 : u > 0.6 ? (1 - u) / 0.4 : 1;
      hand.alpha = alpha * k;
    }
  });
}

export function tutorialArc(hand: PuaTarget, x: number, y: number, options: TutorialArcOptions = {}): void {
  const restPosition = takeRestPosition(hand);
  const restScale = takeRestScale(hand);
  const alpha = takeRestAlpha(hand);
  const interval = options.interval ?? 1800;
  const active = Math.min(1, (options.duration ?? 1000) / interval);
  const height = options.height ?? 60;
  const depth = options.depth ?? 0.85;
  hand.visible = true;

  run({
    target: hand,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const u = p / active;
      let s = 1;
      if (u < 0.15) s = 1 - (1 - depth) * easings.quadOut(u / 0.15);
      else if (u < 0.8) s = depth;
      else if (u < 1) s = depth + (1 - depth) * easings.quadOut((u - 0.8) / 0.2);
      hand.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  run({
    target: hand,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restPosition,
    onUpdate: (p) => {
      const u = p / active;
      let t = 0;
      if (u >= 0.8 && u < 1) t = 1;
      else if (u >= 0.15 && u < 0.8) t = easings.sineInOut((u - 0.15) / 0.65);
      hand.position.set(
        restPosition.x + (x - restPosition.x) * t,
        restPosition.y + (y - restPosition.y) * t - height * Math.sin(t * Math.PI)
      );
    }
  });

  run({
    target: hand,
    channel: 'alpha',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      hand.alpha = alpha * fadeEdges(p / active, 0.1);
    }
  });
}

export function tutorialWave(hand: PuaTarget, options: TutorialWaveOptions = {}): void {
  const rest = takeRestRotation(hand);
  const interval = options.interval ?? 1800;
  const angle = (options.angle ?? 14) * DEG_TO_RAD;
  const waves = options.waves ?? 2;
  const active = Math.min(1, (options.duration ?? WAVE_LENGTH) / interval);
  hand.visible = true;

  run({
    target: hand,
    channel: 'rotation',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { rotation: rest },
    onUpdate: (p) => {
      const u = p / active;
      hand.rotation = u >= 1 ? rest : rest + Math.sin(u * Math.PI * 2 * waves) * Math.sin(u * Math.PI) * angle;
    }
  });
}

export function tutorialFigureEight(hand: PuaTarget, options: TutorialFigureEightOptions = {}): void {
  const rest = takeRestPosition(hand);
  const width = options.width ?? 120;
  const height = options.height ?? 50;
  hand.visible = true;

  run({
    target: hand,
    channel: 'position',
    duration: options.duration ?? 2200,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const a = p * Math.PI * 2;
      hand.position.set(rest.x + Math.sin(a) * width * 0.5, rest.y + Math.sin(a * 2) * height * 0.5);
    }
  });
}

export function tutorialIn(hand: PuaTarget, end?: PuaEnd<TutorialInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(hand);
  const alpha = takeRestAlpha(hand);
  const dir = DIRECTIONS[o.direction ?? 'bottom'];
  const distance = o.distance ?? 40;
  const duration = o.duration ?? 350;

  hand.visible = true;
  if (!find(hand, 'alpha')) hand.alpha = 0;
  hand.position.set(rest.x + dir.x * distance, rest.y + dir.y * distance);

  run({
    target: hand,
    channel: 'alpha',
    object: hand,
    to: { alpha },
    duration,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });
  run({
    target: hand,
    channel: 'position',
    object: hand.position,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'cubicOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function tutorialOut(hand: PuaTarget, end?: PuaEnd<TutorialInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(hand);
  const alpha = takeRestAlpha(hand);
  const dir = DIRECTIONS[o.direction ?? 'bottom'];
  const distance = o.distance ?? 40;
  const duration = o.duration ?? 300;

  run({
    target: hand,
    channel: 'alpha',
    object: hand,
    to: { alpha: 0 },
    duration,
    easing: easings.quadIn,
    delay: o.delay,
    base: { alpha },
    onComplete: () => keepRestAlpha(hand, alpha)
  });
  run({
    target: hand,
    channel: 'position',
    object: hand.position,
    to: { x: rest.x + dir.x * distance, y: rest.y + dir.y * distance },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      hand.visible = false;
      hand.position.set(rest.x, rest.y);
      o.onComplete?.();
    }
  });
}
