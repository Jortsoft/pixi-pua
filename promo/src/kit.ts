import { Application, Container, Graphics, Sprite, Text, Texture, Ticker } from 'pixi.js';
import { stop } from 'pua';

export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const DURATION = 40;

export const COLOR = {
  night: 0x0b0c1a,
  deep: 0x08091a,
  panel: 0x14162a,
  panelAlt: 0x1a1d36,
  line: 0x2f3460,
  ink: 0xeef0fb,
  muted: 0x9a9fc0,
  volt: 0xc8f547,
  iris: 0x7c5cff,
  dark: 0x15172e,
  white: 0xffffff,
  sky: 0x6cc9ff,
  rose: 0xff8ac0,
  mint: 0x4fe3b0,
  sun: 0xffd447
};

export const FONT = {
  head: 'Bricolage Grotesque',
  body: 'DM Sans',
  mono: 'JetBrains Mono',
  game: 'Lilita One'
};

export type SoundKind =
  | 'pop'
  | 'whoosh'
  | 'whooshOut'
  | 'tick'
  | 'ding'
  | 'sparkle'
  | 'chime'
  | 'impact'
  | 'riser'
  | 'rattle'
  | 'tap';

export interface SoundCue {
  t: number;
  kind: SoundKind;
  a?: number;
  g?: number;
}

interface Cue {
  t: number;
  order: number;
  fn: () => void;
}

export interface Scene extends Container {
  loops: Container[];
}

export const sounds: SoundCue[] = [];
const cues: Cue[] = [];
let cursor = 0;
let clock = 0;
let virtual = 1000;

// Pixi's shared ticker is driven by hand so every frame of the export lands on an exact timestamp.
export function initClock(): void {
  Ticker.shared.autoStart = false;
  Ticker.shared.stop();
  Ticker.shared.update(virtual);
}

export function at(t: number, fn: () => void): void {
  cues.push({ t, order: cues.length, fn });
}

export function every(from: number, to: number, interval: number, fn: (index: number) => void): void {
  let index = 0;
  for (let t = from; t < to - 1e-6; t += interval) {
    const i = index++;
    at(t, () => fn(i));
  }
}

export function sound(t: number, kind: SoundKind, a?: number, g?: number): void {
  sounds.push({ t, kind, a, g });
}

export function typing(t: number, duration: number, gain = 1): void {
  for (let k = 0; k < duration; k += 0.066) sound(t + k, 'tick', 0.8 + ((k * 37) % 1) * 0.5, gain);
}

export function seal(): void {
  cues.sort((a, b) => a.t - b.t || a.order - b.order);
}

export function time(): number {
  return clock;
}

export function advance(dt: number): void {
  clock += dt;
  while (cursor < cues.length && cues[cursor].t <= clock + 1e-6) cues[cursor++].fn();
  virtual += dt * 1000;
  Ticker.shared.update(virtual);
}

export function createApp(): Application {
  return new Application({
    width: W,
    height: H,
    backgroundColor: COLOR.night,
    antialias: true,
    autoStart: false,
    autoDensity: false,
    resolution: 1,
    preserveDrawingBuffer: true
  });
}

export function scene(): Scene {
  const container = new Container() as Scene;
  container.pivot.set(W / 2, H / 2);
  container.position.set(W / 2, H / 2);
  container.loops = [];
  return container;
}

export function looping<T extends Container>(owner: Scene, target: T): T {
  owner.loops.push(target);
  return target;
}

export function release(owner: Scene): void {
  owner.loops.forEach((target) => stop(target));
  owner.loops = [];
}

interface TextOptions {
  font?: string;
  size?: number;
  weight?: '400' | '500' | '600' | '700' | '800';
  color?: number;
  anchor?: [number, number];
  spacing?: number;
  wrap?: number;
  align?: 'left' | 'center' | 'right';
  lineHeight?: number;
  stroke?: number;
  strokeWidth?: number;
}

export function label(value: string, x: number, y: number, options: TextOptions = {}): Text {
  const text = new Text(value, {
    fontFamily: options.font ?? FONT.body,
    fontSize: options.size ?? 40,
    fontWeight: options.weight ?? '500',
    fill: options.color ?? COLOR.ink,
    letterSpacing: options.spacing ?? 0,
    align: options.align ?? 'left',
    wordWrap: options.wrap !== undefined,
    wordWrapWidth: options.wrap ?? 0,
    lineHeight: options.lineHeight,
    stroke: options.stroke ?? 0x000000,
    strokeThickness: options.strokeWidth ?? 0
  });
  const anchor = options.anchor ?? [0.5, 0.5];
  text.anchor.set(anchor[0], anchor[1]);
  text.position.set(x, y);
  return text;
}

interface BoxOptions {
  stroke?: number;
  strokeWidth?: number;
  alpha?: number;
}

export function box(width: number, height: number, radius: number, fill: number, options: BoxOptions = {}): Graphics {
  const g = new Graphics();
  if (options.stroke !== undefined) g.lineStyle(options.strokeWidth ?? 2, options.stroke, 1, 0.5);
  g.beginFill(fill, options.alpha ?? 1);
  g.drawRoundedRect(-width / 2, -height / 2, width, height, radius);
  g.endFill();
  return g;
}

export function disc(radius: number, fill: number, stroke?: number, strokeWidth = 4): Graphics {
  const g = new Graphics();
  if (stroke !== undefined) g.lineStyle(strokeWidth, stroke);
  g.beginFill(fill);
  g.drawCircle(0, 0, radius);
  g.endFill();
  return g;
}

export function group(x: number, y: number, ...children: Container[]): Container {
  const container = new Container();
  container.position.set(x, y);
  if (children.length > 0) container.addChild(...children);
  return container;
}

export function glow(color: number, radius: number, alpha: number): Sprite {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d') as CanvasRenderingContext2D;
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1)`);
  gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  context.fillStyle = gradient;
  context.fillRect(0, 0, size, size);

  const sprite = new Sprite(Texture.from(canvas));
  sprite.anchor.set(0.5);
  sprite.width = radius * 2;
  sprite.height = radius * 2;
  sprite.alpha = alpha;
  return sprite;
}

export function dotGrid(width: number, height: number, gap: number, color: number, alpha: number): Graphics {
  const g = new Graphics();
  g.beginFill(color, alpha);
  for (let y = gap / 2; y < height; y += gap) {
    for (let x = gap / 2; x < width; x += gap) g.drawCircle(x - width / 2, y - height / 2, 2);
  }
  g.endFill();
  return g;
}

export function logoMark(size: number): Container {
  const unit = size / 64;
  const tile = box(size, size, 18 * unit, COLOR.volt);

  const curve = new Graphics();
  curve.lineStyle({ width: 6 * unit, color: COLOR.dark, cap: 'round' as never });
  curve.moveTo((14 - 32) * unit, (46 - 32) * unit);
  curve.bezierCurveTo(
    (27 - 32) * unit,
    (46 - 32) * unit,
    (27 - 32) * unit,
    (15 - 32) * unit,
    (47 - 32) * unit,
    (19 - 32) * unit
  );

  const start = disc(4 * unit, COLOR.dark);
  start.alpha = 0.35;
  start.position.set((14 - 32) * unit, (46 - 32) * unit);
  const end = disc(7 * unit, COLOR.dark);
  end.position.set((47 - 32) * unit, (19 - 32) * unit);

  return group(0, 0, tile, curve, start, end);
}

export function gameButton(text: string, width: number, height: number, fill = COLOR.volt): Container {
  const face = box(width, height, height * 0.34, fill, { stroke: COLOR.dark, strokeWidth: Math.max(3, height * 0.055) });
  const caption = label(text, 0, -height * 0.02, { font: FONT.game, size: height * 0.48, weight: '400', color: COLOR.dark });
  return group(0, 0, face, caption);
}

export function gameCard(width: number, height: number): Container {
  const card = box(width, height, height * 0.18, COLOR.white, {
    stroke: COLOR.dark,
    strokeWidth: Math.max(3, height * 0.04)
  });
  const star = new Graphics();
  star.lineStyle(Math.max(2, height * 0.03), COLOR.dark);
  star.beginFill(COLOR.volt);
  const points: number[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? height * 0.2 : height * 0.09;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(Math.cos(a) * r, -height * 0.14 + Math.sin(a) * r);
  }
  star.drawPolygon(points);
  star.endFill();
  const caption = label('PUA', 0, height * 0.25, { font: FONT.game, size: height * 0.28, weight: '400', color: COLOR.dark });
  return group(0, 0, card, star, caption);
}

export function hand(scale = 1): Container {
  const ring = new Graphics();
  ring.lineStyle(3, COLOR.iris, 0.6);
  ring.drawCircle(0, 0, 18);

  const shape = new Graphics();
  shape.lineStyle(3, COLOR.dark, 1);
  shape.beginFill(COLOR.white);
  shape.drawRoundedRect(-7, -2, 14, 46, 7);
  shape.drawRoundedRect(-7, 26, 38, 34, 12);
  shape.endFill();
  shape.beginFill(COLOR.white);
  shape.drawRoundedRect(6, 14, 12, 36, 6);
  shape.drawRoundedRect(17, 20, 12, 32, 6);
  shape.endFill();

  const container = group(0, 0, ring, shape);
  container.scale.set(scale);
  return container;
}

let seed = 20261117;

export function rand(): number {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 4294967296;
}

const smooth = (t: number): number => t * t * (3 - 2 * t);

export function tween(duration: number, update: (p: number) => void, done?: () => void): void {
  let elapsed = 0;
  const tick = (): void => {
    elapsed += Ticker.shared.deltaMS;
    const p = Math.min(1, elapsed / duration);
    update(smooth(p));
    if (p < 1) return;
    Ticker.shared.remove(tick);
    done?.();
  };
  Ticker.shared.add(tick);
}

export function moveTo(target: Container, x: number, y: number, duration: number, done?: () => void): void {
  const fromX = target.x;
  const fromY = target.y;
  tween(duration, (p) => target.position.set(fromX + (x - fromX) * p, fromY + (y - fromY) * p), done);
}

interface Piece {
  shape: Graphics;
  vx: number;
  vy: number;
  spin: number;
  life: number;
}

export function burst(parent: Container, x: number, y: number, count: number, power: number): void {
  const colors = [COLOR.volt, COLOR.iris, COLOR.sky, COLOR.rose, COLOR.sun, COLOR.mint];
  const pieces: Piece[] = [];
  for (let i = 0; i < count; i++) {
    const shape = new Graphics();
    shape.beginFill(colors[i % colors.length]);
    if (i % 3 === 0) shape.drawCircle(0, 0, 6);
    else shape.drawRoundedRect(-8, -5, 16, 10, 3);
    shape.endFill();
    shape.position.set(x, y);
    shape.rotation = rand() * Math.PI;
    const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 1.5;
    const speed = power * (0.45 + rand() * 0.55);
    pieces.push({
      shape,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: (rand() - 0.5) * 14,
      life: 1.1 + rand() * 0.6
    });
    parent.addChild(shape);
  }

  let age = 0;
  const tick = (): void => {
    const dt = Ticker.shared.deltaMS / 1000;
    age += dt;
    let alive = 0;
    for (const piece of pieces) {
      if (age >= piece.life) {
        piece.shape.visible = false;
        continue;
      }
      alive++;
      piece.vy += 1500 * dt;
      piece.vx *= 1 - 1.2 * dt;
      piece.shape.x += piece.vx * dt;
      piece.shape.y += piece.vy * dt;
      piece.shape.rotation += piece.spin * dt;
      piece.shape.alpha = Math.min(1, (piece.life - age) / 0.35);
    }
    if (alive > 0) return;
    Ticker.shared.remove(tick);
    pieces.forEach((piece) => piece.shape.destroy());
  };
  Ticker.shared.add(tick);
}

export function ambient(root: Container): void {
  const layer = new Container();
  const dots = Array.from({ length: 36 }, (_, index) => {
    const dot = disc(2 + rand() * 3, index % 5 === 0 ? COLOR.volt : COLOR.iris);
    dot.alpha = 0.16 + rand() * 0.3;
    dot.position.set(rand() * W, rand() * H);
    layer.addChild(dot);
    return { dot, speed: 12 + rand() * 26, sway: rand() * Math.PI * 2 };
  });
  root.addChild(layer);

  Ticker.shared.add(() => {
    const dt = Ticker.shared.deltaMS / 1000;
    for (const item of dots) {
      item.sway += dt;
      item.dot.y -= item.speed * dt;
      item.dot.x += Math.sin(item.sway) * 8 * dt;
      if (item.dot.y < -10) item.dot.y = H + 10;
    }
  });
}

export function pointer(): Container {
  const arrow = new Graphics();
  arrow.lineStyle({ width: 4, color: COLOR.dark, join: 'round' as never });
  arrow.beginFill(COLOR.white);
  arrow.drawPolygon([0, 0, 0, 46, 12, 36, 20, 54, 29, 50, 21, 33, 37, 33]);
  arrow.endFill();
  return group(0, 0, arrow);
}

export function gem(scale = 1): Container {
  const shape = new Graphics();
  shape.lineStyle(6, COLOR.dark);
  shape.beginFill(COLOR.sky);
  shape.drawPolygon([0, -100, 88, 0, 0, 100, -88, 0]);
  shape.endFill();
  shape.lineStyle(0);
  shape.beginFill(COLOR.white, 0.45);
  shape.drawPolygon([0, -72, 44, -8, 0, -8, -44, -8]);
  shape.endFill();
  const container = group(0, 0, shape);
  container.scale.set(scale);
  return container;
}

export function headline(parts: (string | [string, number])[], x: number, y: number, size: number): Container {
  const row = group(x, y);
  let offset = 0;
  for (const part of parts) {
    const [value, color] = typeof part === 'string' ? [part, COLOR.ink] : part;
    const word = label(value, offset, 0, { font: FONT.head, size, weight: '800', color, anchor: [0, 0.5] });
    word.visible = false;
    row.addChild(word);
    offset += word.width + size * 0.26;
  }
  return row;
}

export function rowWidth(row: Container): number {
  const last = row.children[row.children.length - 1] as Text;
  return last.x + last.width;
}
