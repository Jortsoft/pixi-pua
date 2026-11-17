import { easings, resolveEasing } from '../core/easing.js';
import { find, run } from '../core/engine.js';
import { DEG_TO_RAD, offscreenOffset, visualSize } from '../core/geometry.js';
import { resolveEnd } from '../core/options.js';
import {
  keepRestAlpha,
  keepRestPosition,
  keepRestScale,
  takeRestAlpha,
  takeRestPosition,
  takeRestRotation,
  takeRestScale
} from '../core/rest.js';
import type { PuaCallback, PuaEasing, PuaEnd, PuaOptions, PuaTarget, SlideDirection } from '../types.js';
import { bounce, jelly, pop, pulse, tada } from './presets.js';

export interface PopupOptions extends PuaOptions {
  scale?: number;
}

export interface CtaParts {
  overlay?: PuaTarget;
  panel?: PuaTarget;
  title?: PuaTarget;
  button?: PuaTarget;
}

export interface CtaOptions extends PuaOptions {
  duration?: number;
  stagger?: number;
  pulseButton?: boolean;
  entrance?: CtaEntrance;
  exit?: CtaExit;
  overlayAlpha?: number;
  titleOffset?: number;
}

interface Step {
  length: number;
  play: (delay: number, done: PuaCallback) => void;
}

const OVERLAY_ALPHA = 0.6;
const TITLE_RISE = 16;

export function popupIn(popup: PuaTarget, duration: number, end?: PuaEnd<PopupOptions>): void {
  const o = resolveEnd(end);
  const from = o.scale ?? 0.6;
  const rest = takeRestScale(popup);
  const alpha = takeRestAlpha(popup);

  popup.visible = true;
  popup.scale.set(rest.x * from, rest.y * from);
  if (!find(popup, 'alpha')) popup.alpha = 0;

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha },
    duration: duration * 0.6,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'backOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupOut(popup: PuaTarget, duration: number, end?: PuaEnd<PopupOptions>): void {
  const o = resolveEnd(end);
  const to = o.scale ?? 0.6;
  const rest = takeRestScale(popup);
  const alpha = takeRestAlpha(popup);

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha: 0 },
    duration,
    easing: easings.cubicIn,
    delay: o.delay,
    base: { alpha },
    onComplete: () => keepRestAlpha(popup, alpha)
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: { x: rest.x * to, y: rest.y * to },
    duration,
    easing: resolveEasing(o.easing, 'backIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestScale(popup, rest);
      o.onComplete?.();
    }
  });
}

export function popupDrop(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(popup);
  popup.visible = true;
  popup.position.set(rest.x, rest.y);

  const offset = offscreenOffset(popup, 'top');
  popup.position.set(rest.x + offset.x, rest.y + offset.y);

  run({
    target: popup,
    channel: 'position',
    object: popup.position,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'bounceOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function ctaShow(parts: CtaParts, end?: PuaEnd<CtaOptions>): void {
  const o = resolveEnd(end);
  const duration = o.duration ?? 350;
  const steps: Step[] = [];

  if (parts.overlay) {
    const overlay = parts.overlay;
    steps.push({
      length: duration,
      play: (delay, done) => {
        const alpha = o.overlayAlpha ?? takeRestAlpha(overlay, OVERLAY_ALPHA);
        overlay.visible = true;
        overlay.alpha = 0;
        run({
          target: overlay,
          channel: 'alpha',
          object: overlay,
          to: { alpha },
          duration,
          easing: easings.quadOut,
          delay,
          base: { alpha },
          onComplete: done
        });
      }
    });
  }

  if (parts.panel) {
    const panel = parts.panel;
    const entrance = o.entrance ?? 'pop';
    steps.push({
      length: duration * ENTRANCE_LENGTH[entrance],
      play: (delay, done) => enter(panel, entrance, duration, { delay, easing: o.easing, onComplete: done })
    });
  }

  if (parts.title) {
    const title = parts.title;
    steps.push({ length: duration, play: (delay, done) => rise(title, duration, delay, o.titleOffset ?? TITLE_RISE, done) });
  }

  if (parts.button) {
    const button = parts.button;
    steps.push({
      length: 420,
      play: (delay, done) =>
        pop(button, {
          delay,
          onComplete: () => {
            if (o.pulseButton !== false) pulse(button);
            done();
          }
        })
    });
  }

  schedule(steps, o.delay ?? 0, o.stagger ?? 120, o.onComplete);
}

export function ctaHide(parts: CtaParts, end?: PuaEnd<CtaOptions>): void {
  const o = resolveEnd(end);
  const duration = o.duration ?? 250;
  const steps: Step[] = [];

  if (parts.button) {
    const button = parts.button;
    steps.push({
      length: duration,
      play: (delay, done) => shrink(button, duration, delay, o.easing, () => hide(button, done))
    });
  }

  if (parts.title) {
    const title = parts.title;
    steps.push({
      length: duration,
      play: (delay, done) => {
        const alpha = takeRestAlpha(title);
        run({
          target: title,
          channel: 'alpha',
          object: title,
          to: { alpha: 0 },
          duration,
          easing: easings.quadOut,
          delay,
          base: { alpha },
          onComplete: () => hide(title, done)
        });
      }
    });
  }

  if (parts.panel) {
    const panel = parts.panel;
    const kind = o.exit ?? 'shrink';
    steps.push({
      length: duration * EXIT_LENGTH[kind],
      play: (delay, done) => exit(panel, kind, duration, { delay, easing: o.easing, onComplete: () => hide(panel, done) })
    });
  }

  if (parts.overlay) {
    const overlay = parts.overlay;
    steps.push({
      length: duration,
      play: (delay, done) => {
        const alpha = takeRestAlpha(overlay, OVERLAY_ALPHA);
        run({
          target: overlay,
          channel: 'alpha',
          object: overlay,
          to: { alpha: 0 },
          duration,
          easing: easings.quadOut,
          delay,
          base: { alpha },
          onComplete: () => {
            keepRestAlpha(overlay, alpha);
            hide(overlay, done);
          }
        });
      }
    });
  }

  schedule(steps, o.delay ?? 0, o.stagger ?? 80, o.onComplete);
}

function rise(title: PuaTarget, duration: number, delay: number, offset: number, done: PuaCallback): void {
  const rest = takeRestPosition(title);
  const alpha = takeRestAlpha(title);
  title.visible = true;
  title.alpha = 0;
  title.position.set(rest.x, rest.y - offset);

  run({
    target: title,
    channel: 'alpha',
    object: title,
    to: { alpha },
    duration,
    easing: easings.quadOut,
    delay,
    base: { alpha }
  });
  run({
    target: title,
    channel: 'position',
    object: title.position,
    to: rest,
    duration,
    easing: easings.cubicOut,
    delay,
    base: rest,
    onComplete: done
  });
}

function shrink(target: PuaTarget, duration: number, delay: number, easing: PuaEasing | undefined, done: PuaCallback): void {
  const rest = takeRestScale(target);

  run({
    target,
    channel: 'scale',
    object: target.scale,
    to: { x: 0, y: 0 },
    duration,
    easing: resolveEasing(easing, 'backIn'),
    delay,
    base: rest,
    onComplete: () => {
      keepRestScale(target, rest);
      done();
    }
  });
}

function hide(target: PuaTarget, done: PuaCallback): void {
  target.visible = false;
  done();
}

// Fires each step with an increasing delay; onComplete is attached to the step that ends last.
function schedule(steps: Step[], start: number, stagger: number, onComplete?: PuaCallback): void {
  let last = -1;
  let lastEnd = -Infinity;

  steps.forEach((step, i) => {
    const end = start + i * stagger + step.length;
    if (end > lastEnd) {
      lastEnd = end;
      last = i;
    }
  });

  steps.forEach((step, i) => step.play(start + i * stagger, i === last ? () => onComplete?.() : noop));
}

function noop(): void {}

export type CtaEntrance = 'pop' | 'drop' | 'slide' | 'flip' | 'bounce' | 'swing' | 'elastic' | 'unfold' | 'whirl';
export type CtaExit = 'shrink' | 'slide' | 'zoom' | 'flip' | 'swing' | 'fall';

export interface OverlayOptions extends PuaOptions {
  alpha?: number;
}

export interface SwingInOptions extends PuaOptions {
  angle?: number;
  scale?: number;
}

export interface CelebrateOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

const ENTRANCE_LENGTH: Record<CtaEntrance, number> = {
  pop: 1,
  drop: 2,
  slide: 1.5,
  flip: 1,
  bounce: 2,
  swing: 1,
  elastic: 2.5,
  unfold: 1,
  whirl: 1.5
};
const EXIT_LENGTH: Record<CtaExit, number> = { shrink: 1, slide: 1.5, zoom: 1, flip: 1, swing: 1, fall: 1.5 };

export function popupSlideUp(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(popup);
  popup.visible = true;
  popup.position.set(rest.x, rest.y);

  const offset = offscreenOffset(popup, 'bottom');
  popup.position.set(rest.x + offset.x, rest.y + offset.y);

  run({
    target: popup,
    channel: 'position',
    object: popup.position,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'backOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupSlideDown(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(popup);
  const offset = offscreenOffset(popup, 'bottom');

  run({
    target: popup,
    channel: 'position',
    object: popup.position,
    to: { x: popup.x + offset.x, y: popup.y + offset.y },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestPosition(popup, rest);
      popup.visible = false;
      o.onComplete?.();
    }
  });
}

export function popupFlipIn(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  const alpha = takeRestAlpha(popup);
  popup.visible = true;
  popup.scale.set(0, rest.y);
  if (!find(popup, 'alpha')) popup.alpha = 0;

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha },
    duration: duration * 0.4,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'backOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupBounceIn(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  const alpha = takeRestAlpha(popup);
  popup.visible = true;
  popup.scale.set(0);
  if (!find(popup, 'alpha')) popup.alpha = 0;

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha },
    duration: duration * 0.3,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'bounceOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupSwingIn(popup: PuaTarget, duration: number, end?: PuaEnd<SwingInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  const rotation = takeRestRotation(popup);
  const alpha = takeRestAlpha(popup);
  const angle = (o.angle ?? 12) * DEG_TO_RAD;
  const easing = resolveEasing(o.easing, 'backOut');
  popup.visible = true;
  popup.rotation = rotation - angle;
  const from = o.scale ?? 0.8;
  popup.scale.set(rest.x * from, rest.y * from);
  if (!find(popup, 'alpha')) popup.alpha = 0;

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha },
    duration: duration * 0.5,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });

  run({
    target: popup,
    channel: 'rotation',
    object: popup,
    to: { rotation },
    duration,
    easing,
    delay: o.delay,
    base: { rotation }
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing,
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function overlayIn(overlay: PuaTarget, duration: number, end?: PuaEnd<OverlayOptions>): void {
  const o = resolveEnd(end);
  const alpha = o.alpha ?? takeRestAlpha(overlay, OVERLAY_ALPHA);
  overlay.visible = true;
  overlay.alpha = 0;

  run({
    target: overlay,
    channel: 'alpha',
    object: overlay,
    to: { alpha },
    duration,
    easing: resolveEasing(o.easing, 'quadOut'),
    delay: o.delay,
    base: { alpha },
    onComplete: o.onComplete
  });
}

export function overlayOut(overlay: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const alpha = takeRestAlpha(overlay, OVERLAY_ALPHA);

  run({
    target: overlay,
    channel: 'alpha',
    object: overlay,
    to: { alpha: 0 },
    duration,
    easing: resolveEasing(o.easing, 'quadOut'),
    delay: o.delay,
    base: { alpha },
    onComplete: () => {
      keepRestAlpha(overlay, alpha);
      overlay.visible = false;
      o.onComplete?.();
    }
  });
}

export function ctaCelebrate(parts: CtaParts, end?: PuaEnd<CelebrateOptions>): void {
  const o = resolveEnd(end);
  const duration = o.duration ?? 900;
  const strength = o.strength ?? 1;
  let pending = 0;
  const done = (): void => {
    pending--;
    if (pending === 0) o.onComplete?.();
  };

  if (parts.panel) {
    pending++;
    jelly(parts.panel, { duration, strength: 0.08 * strength, delay: o.delay, easing: o.easing, onComplete: done });
  }
  if (parts.title) {
    pending++;
    tada(parts.title, {
      duration,
      strength: 0.1 * strength,
      angle: 4 * strength,
      delay: o.delay,
      easing: o.easing,
      onComplete: done
    });
  }
  if (parts.button) {
    pending++;
    bounce(parts.button, {
      duration,
      height: Math.max(16, visualSize(parts.button).height * 0.35) * strength,
      delay: o.delay,
      easing: o.easing,
      onComplete: done
    });
  }
  if (pending === 0) o.onComplete?.();
}

function enter(panel: PuaTarget, entrance: CtaEntrance, duration: number, end: PopupOptions): void {
  if (entrance === 'drop') popupDrop(panel, duration * ENTRANCE_LENGTH.drop, end);
  else if (entrance === 'slide') popupSlideUp(panel, duration * ENTRANCE_LENGTH.slide, end);
  else if (entrance === 'flip') popupFlipIn(panel, duration, end);
  else if (entrance === 'bounce') popupBounceIn(panel, duration * ENTRANCE_LENGTH.bounce, end);
  else if (entrance === 'swing') popupSwingIn(panel, duration, end);
  else if (entrance === 'elastic') popupElasticIn(panel, duration * ENTRANCE_LENGTH.elastic, end);
  else if (entrance === 'unfold') popupUnfoldIn(panel, duration, end);
  else if (entrance === 'whirl') popupSpinIn(panel, duration * ENTRANCE_LENGTH.whirl, end);
  else popupIn(panel, duration, end);
}

function exit(panel: PuaTarget, kind: CtaExit, duration: number, end: PopupOptions): void {
  if (kind === 'slide') popupSlideDown(panel, duration * EXIT_LENGTH.slide, end);
  else if (kind === 'zoom') popupZoomOut(panel, duration, end);
  else if (kind === 'flip') popupFlipOut(panel, duration, end);
  else if (kind === 'swing') popupSwingOut(panel, duration, end);
  else if (kind === 'fall') popupFallOut(panel, duration * EXIT_LENGTH.fall, end);
  else popupOut(panel, duration, end);
}

export interface SpinInOptions extends PuaOptions {
  turns?: number;
}

export interface PopupFallOptions extends PuaOptions {
  angle?: number;
}

export interface OverlayPulseOptions {
  duration?: number;
  strength?: number;
  delay?: number;
}

function fadeInPopup(popup: PuaTarget, duration: number, delay: number | undefined): void {
  const alpha = takeRestAlpha(popup);
  popup.visible = true;
  if (!find(popup, 'alpha')) popup.alpha = 0;

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha },
    duration,
    easing: easings.quadOut,
    delay,
    base: { alpha }
  });
}

function fadeOutPopup(popup: PuaTarget, duration: number, delay: number | undefined): void {
  const alpha = takeRestAlpha(popup);

  run({
    target: popup,
    channel: 'alpha',
    object: popup,
    to: { alpha: 0 },
    duration,
    easing: easings.cubicIn,
    delay,
    base: { alpha },
    onComplete: () => keepRestAlpha(popup, alpha)
  });
}

export function popupSlideIn(popup: PuaTarget, direction: SlideDirection, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(popup);
  popup.visible = true;
  popup.position.set(rest.x, rest.y);

  const offset = offscreenOffset(popup, direction);
  popup.position.set(rest.x + offset.x, rest.y + offset.y);

  run({
    target: popup,
    channel: 'position',
    object: popup.position,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'backOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupSlideOut(popup: PuaTarget, direction: SlideDirection, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(popup);
  const offset = offscreenOffset(popup, direction);

  run({
    target: popup,
    channel: 'position',
    object: popup.position,
    to: { x: popup.x + offset.x, y: popup.y + offset.y },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestPosition(popup, rest);
      popup.visible = false;
      o.onComplete?.();
    }
  });
}

export function popupElasticIn(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  fadeInPopup(popup, duration * 0.2, o.delay);
  popup.scale.set(0);

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'elasticOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupUnfoldIn(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  fadeInPopup(popup, duration * 0.4, o.delay);
  popup.scale.set(rest.x, 0);

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing: resolveEasing(o.easing, 'backOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupSpinIn(popup: PuaTarget, duration: number, end?: PuaEnd<SpinInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  const rotation = takeRestRotation(popup);
  const turns = (o.turns ?? 1) * Math.PI * 2;
  const easing = resolveEasing(o.easing, 'cubicOut');
  fadeInPopup(popup, duration * 0.5, o.delay);
  popup.rotation = rotation - turns;
  popup.scale.set(0);

  run({
    target: popup,
    channel: 'rotation',
    object: popup,
    to: { rotation },
    duration,
    easing,
    delay: o.delay,
    base: { rotation }
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: rest,
    duration,
    easing,
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function popupZoomOut(popup: PuaTarget, duration: number, end?: PuaEnd<PopupOptions>): void {
  const o = resolveEnd(end);
  const to = o.scale ?? 1.4;
  const rest = takeRestScale(popup);
  fadeOutPopup(popup, duration, o.delay);

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: { x: rest.x * to, y: rest.y * to },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestScale(popup, rest);
      popup.visible = false;
      o.onComplete?.();
    }
  });
}

export function popupFlipOut(popup: PuaTarget, duration: number, end?: PuaEnd): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  fadeOutPopup(popup, duration, o.delay);

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: { x: 0, y: rest.y },
    duration,
    easing: resolveEasing(o.easing, 'backIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestScale(popup, rest);
      popup.visible = false;
      o.onComplete?.();
    }
  });
}

export function popupSwingOut(popup: PuaTarget, duration: number, end?: PuaEnd<SwingInOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(popup);
  const rotation = takeRestRotation(popup);
  const angle = (o.angle ?? 12) * DEG_TO_RAD;
  const easing = resolveEasing(o.easing, 'backIn');
  const to = o.scale ?? 0.8;
  fadeOutPopup(popup, duration, o.delay);

  run({
    target: popup,
    channel: 'rotation',
    object: popup,
    to: { rotation: rotation + angle },
    duration,
    easing,
    delay: o.delay,
    base: { rotation }
  });

  run({
    target: popup,
    channel: 'scale',
    object: popup.scale,
    to: { x: rest.x * to, y: rest.y * to },
    duration,
    easing,
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestScale(popup, rest);
      popup.rotation = rotation;
      popup.visible = false;
      o.onComplete?.();
    }
  });
}

export function popupFallOut(popup: PuaTarget, duration: number, end?: PuaEnd<PopupFallOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(popup);
  const rotation = takeRestRotation(popup);
  const angle = (o.angle ?? 10) * DEG_TO_RAD;
  const offset = offscreenOffset(popup, 'bottom');

  run({
    target: popup,
    channel: 'rotation',
    object: popup,
    to: { rotation: rotation + angle },
    duration: duration * 0.5,
    easing: easings.quadOut,
    delay: o.delay,
    base: { rotation }
  });

  run({
    target: popup,
    channel: 'position',
    object: popup.position,
    to: { x: popup.x + offset.x, y: popup.y + offset.y },
    duration,
    easing: resolveEasing(o.easing, 'cubicIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestPosition(popup, rest);
      popup.rotation = rotation;
      popup.visible = false;
      o.onComplete?.();
    }
  });
}

export function overlayPulse(overlay: PuaTarget, options: OverlayPulseOptions = {}): void {
  const alpha = takeRestAlpha(overlay, OVERLAY_ALPHA);
  const strength = options.strength ?? 0.35;
  overlay.visible = true;

  run({
    target: overlay,
    channel: 'alpha',
    duration: options.duration ?? 1600,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      overlay.alpha = alpha * (1 - strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2)));
    }
  });
}
