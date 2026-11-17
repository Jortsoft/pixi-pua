import { easings, overshootOut, resolveEasing, timeWarp } from '../core/easing.js';
import { find, run } from '../core/engine.js';
import { DEG_TO_RAD } from '../core/geometry.js';
import { resolveEnd } from '../core/options.js';
import {
  keepRestAlpha,
  keepRestScale,
  takeRestAlpha,
  takeRestPosition,
  takeRestRotation,
  takeRestScale
} from '../core/rest.js';
import type { PuaEnd, PuaOptions, PuaTarget } from '../types.js';

export interface ButtonPressOptions extends PuaOptions {
  duration?: number;
  depth?: number;
  overshoot?: number;
}

export interface ButtonIdleOptions {
  duration?: number;
  strength?: number;
  tilt?: number;
  delay?: number;
}

export interface ButtonHopOptions {
  interval?: number;
  height?: number;
  delay?: number;
  duration?: number;
}

const PRESS_DOWN = 0.4;
const HOP_LENGTH = 600;
const releaseEase = overshootOut(0.08);

export function buttonPress(button: PuaTarget, end?: PuaEnd<ButtonPressOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(button);
  const depth = o.depth ?? 0.9;
  const release = o.overshoot === undefined ? releaseEase : overshootOut(o.overshoot);

  run({
    target: button,
    channel: 'scale',
    duration: o.duration ?? 180,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const s =
        p < PRESS_DOWN
          ? 1 - (1 - depth) * easings.quadOut(p / PRESS_DOWN)
          : depth + (1 - depth) * release((p - PRESS_DOWN) / (1 - PRESS_DOWN));
      button.scale.set(rest.x * s, rest.y * s);
    },
    onComplete: o.onComplete
  });
}

export function buttonIdle(button: PuaTarget, options: ButtonIdleOptions = {}): void {
  const restScale = takeRestScale(button);
  const restRotation = takeRestRotation(button);
  const duration = options.duration ?? 1200;
  const strength = options.strength ?? 0.06;
  const tilt = (options.tilt ?? 2) * DEG_TO_RAD;

  run({
    target: button,
    channel: 'scale',
    duration,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const s = 1 + strength * (0.5 - 0.5 * Math.cos(p * Math.PI * 2));
      button.scale.set(restScale.x * s, restScale.y * s);
    }
  });

  if (tilt === 0) return;

  run({
    target: button,
    channel: 'rotation',
    duration,
    delay: options.delay,
    loop: true,
    base: { rotation: restRotation },
    onUpdate: (p) => {
      button.rotation = restRotation + Math.sin(p * Math.PI * 2) * tilt;
    }
  });
}

export function buttonHop(button: PuaTarget, options: ButtonHopOptions = {}): void {
  const rest = takeRestPosition(button);
  const interval = options.interval ?? 1800;
  const height = options.height ?? 14;
  const active = Math.min(1, (options.duration ?? HOP_LENGTH) / interval);

  run({
    target: button,
    channel: 'position',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      const lift = u >= 1 ? 0 : u < 0.35 ? easings.quadOut(u / 0.35) : 1 - easings.bounceOut((u - 0.35) / 0.65);
      button.position.set(rest.x, rest.y - height * lift);
    }
  });
}

export interface ButtonDownOptions extends PuaOptions {
  duration?: number;
  depth?: number;
}

export interface ButtonUpOptions extends PuaOptions {
  duration?: number;
  overshoot?: number;
}

export interface ButtonWiggleOptions {
  interval?: number;
  angle?: number;
  wiggles?: number;
  delay?: number;
  duration?: number;
}

export interface ButtonSqueezeOptions {
  interval?: number;
  strength?: number;
  delay?: number;
  duration?: number;
}

const WIGGLE_LENGTH = 600;
const SQUEEZE_LENGTH = 450;

export function buttonDown(button: PuaTarget, end?: PuaEnd<ButtonDownOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(button);
  const depth = o.depth ?? 0.9;

  run({
    target: button,
    channel: 'scale',
    object: button.scale,
    to: { x: rest.x * depth, y: rest.y * depth },
    duration: o.duration ?? 120,
    easing: resolveEasing(o.easing, 'quadOut'),
    delay: o.delay,
    base: rest,
    onComplete: o.onComplete
  });
}

export function buttonUp(button: PuaTarget, end?: PuaEnd<ButtonUpOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(button);
  const from = { x: button.scale.x, y: button.scale.y };
  const release = o.overshoot === undefined ? releaseEase : overshootOut(o.overshoot);

  run({
    target: button,
    channel: 'scale',
    duration: o.duration ?? 220,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const k = release(p);
      button.scale.set(from.x + (rest.x - from.x) * k, from.y + (rest.y - from.y) * k);
    },
    onComplete: o.onComplete
  });
}

export function buttonWiggle(button: PuaTarget, options: ButtonWiggleOptions = {}): void {
  const rest = takeRestRotation(button);
  const interval = options.interval ?? 2000;
  const angle = (options.angle ?? 6) * DEG_TO_RAD;
  const wiggles = options.wiggles ?? 3;
  const active = Math.min(1, (options.duration ?? WIGGLE_LENGTH) / interval);

  run({
    target: button,
    channel: 'rotation',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { rotation: rest },
    onUpdate: (p) => {
      const u = p / active;
      button.rotation = u >= 1 ? rest : rest + Math.sin(u * Math.PI * wiggles) * (1 - u) * angle;
    }
  });
}

export function buttonSqueeze(button: PuaTarget, options: ButtonSqueezeOptions = {}): void {
  const rest = takeRestScale(button);
  const interval = options.interval ?? 2000;
  const strength = options.strength ?? 0.12;
  const active = Math.min(1, (options.duration ?? SQUEEZE_LENGTH) / interval);

  run({
    target: button,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      const k = u >= 1 ? 0 : Math.sin(u * Math.PI * 2) * (1 - u) * strength;
      button.scale.set(rest.x * (1 + k), rest.y * (1 - k));
    }
  });
}

export interface ButtonInOptions extends PuaOptions {
  duration?: number;
  lift?: number;
  scale?: number;
}

export interface ButtonOutOptions extends PuaOptions {
  duration?: number;
}

export interface ButtonPopOptions extends PuaOptions {
  duration?: number;
  strength?: number;
}

export interface ButtonShakeOptions extends PuaOptions {
  duration?: number;
  amplitude?: number;
  shakes?: number;
}

export interface ButtonPulseOptions {
  interval?: number;
  strength?: number;
  delay?: number;
  duration?: number;
}

export interface ButtonFloatOptions {
  duration?: number;
  height?: number;
  delay?: number;
}

export interface ButtonTadaOptions {
  interval?: number;
  strength?: number;
  angle?: number;
  delay?: number;
  duration?: number;
  wiggles?: number;
}

export interface ButtonBlinkOptions {
  duration?: number;
  alpha?: number;
  delay?: number;
}

const PULSE_LENGTH = 520;
const TADA_LENGTH = 700;
const enterEase = overshootOut(0.2);
const popEase = overshootOut(0.15);

export function buttonIn(button: PuaTarget, end?: PuaEnd<ButtonInOptions>): void {
  const o = resolveEnd(end);
  const restScale = takeRestScale(button);
  const restPosition = takeRestPosition(button);
  const alpha = takeRestAlpha(button);
  const lift = o.lift ?? 24;
  const duration = o.duration ?? 450;

  button.visible = true;
  if (!find(button, 'alpha')) button.alpha = 0;
  const from = o.scale ?? 0.6;
  button.scale.set(restScale.x * from, restScale.y * from);
  button.position.set(restPosition.x, restPosition.y + lift);

  run({
    target: button,
    channel: 'alpha',
    object: button,
    to: { alpha },
    duration: duration * 0.5,
    easing: easings.quadOut,
    delay: o.delay,
    base: { alpha }
  });
  run({
    target: button,
    channel: 'position',
    object: button.position,
    to: restPosition,
    duration,
    easing: resolveEasing(o.easing, 'cubicOut'),
    delay: o.delay,
    base: restPosition
  });
  run({
    target: button,
    channel: 'scale',
    object: button.scale,
    to: restScale,
    duration,
    easing: o.easing === undefined ? enterEase : resolveEasing(o.easing, 'backOut'),
    delay: o.delay,
    base: restScale,
    onComplete: o.onComplete
  });
}

export function buttonOut(button: PuaTarget, end?: PuaEnd<ButtonOutOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(button);
  const alpha = takeRestAlpha(button);
  const duration = o.duration ?? 280;

  run({
    target: button,
    channel: 'alpha',
    object: button,
    to: { alpha: 0 },
    duration,
    easing: easings.quadIn,
    delay: o.delay,
    base: { alpha },
    onComplete: () => keepRestAlpha(button, alpha)
  });
  run({
    target: button,
    channel: 'scale',
    object: button.scale,
    to: { x: 0, y: 0 },
    duration,
    easing: resolveEasing(o.easing, 'backIn'),
    delay: o.delay,
    base: rest,
    onComplete: () => {
      keepRestScale(button, rest);
      button.visible = false;
      o.onComplete?.();
    }
  });
}

export function buttonPop(button: PuaTarget, end?: PuaEnd<ButtonPopOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestScale(button);
  const strength = o.strength ?? 0.15;

  run({
    target: button,
    channel: 'scale',
    duration: o.duration ?? 300,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      const k = p < 0.3 ? easings.quadOut(p / 0.3) : 1 - popEase((p - 0.3) / 0.7);
      button.scale.set(rest.x * (1 + strength * k), rest.y * (1 + strength * k));
    },
    onComplete: o.onComplete
  });
}

export function buttonShake(button: PuaTarget, end?: PuaEnd<ButtonShakeOptions>): void {
  const o = resolveEnd(end);
  const rest = takeRestPosition(button);
  const amplitude = o.amplitude ?? 8;
  const shakes = o.shakes ?? 6;

  run({
    target: button,
    channel: 'position',
    duration: o.duration ?? 400,
    delay: o.delay,
    timing: timeWarp(o.easing),
    base: rest,
    onUpdate: (p) => {
      button.position.set(rest.x + Math.sin(p * Math.PI * shakes) * (1 - p) * amplitude, rest.y);
    },
    onComplete: o.onComplete
  });
}

export function buttonPulse(button: PuaTarget, options: ButtonPulseOptions = {}): void {
  const rest = takeRestScale(button);
  const interval = options.interval ?? 1600;
  const strength = options.strength ?? 0.1;
  const active = Math.min(1, (options.duration ?? PULSE_LENGTH) / interval);

  run({
    target: button,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      const u = p / active;
      let k = 0;
      if (u < 0.45) k = Math.sin((u / 0.45) * Math.PI);
      else if (u >= 0.5 && u < 1) k = Math.sin(((u - 0.5) / 0.5) * Math.PI) * 0.7;
      button.scale.set(rest.x * (1 + strength * k), rest.y * (1 + strength * k));
    }
  });
}

export function buttonFloat(button: PuaTarget, options: ButtonFloatOptions = {}): void {
  const rest = takeRestPosition(button);
  const height = options.height ?? 6;

  run({
    target: button,
    channel: 'position',
    duration: options.duration ?? 1800,
    delay: options.delay,
    loop: true,
    base: rest,
    onUpdate: (p) => {
      button.position.set(rest.x, rest.y - height * 0.5 * (1 - Math.cos(p * Math.PI * 2)));
    }
  });
}

export function buttonTada(button: PuaTarget, options: ButtonTadaOptions = {}): void {
  const restScale = takeRestScale(button);
  const restRotation = takeRestRotation(button);
  const interval = options.interval ?? 2400;
  const strength = options.strength ?? 0.1;
  const wiggles = options.wiggles ?? 5;
  const angle = (options.angle ?? 5) * DEG_TO_RAD;
  const active = Math.min(1, (options.duration ?? TADA_LENGTH) / interval);

  run({
    target: button,
    channel: 'scale',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: restScale,
    onUpdate: (p) => {
      const u = p / active;
      const s = u >= 1 ? 1 : 1 + strength * Math.sin(u * Math.PI);
      button.scale.set(restScale.x * s, restScale.y * s);
    }
  });
  run({
    target: button,
    channel: 'rotation',
    duration: interval,
    delay: options.delay,
    loop: true,
    base: { rotation: restRotation },
    onUpdate: (p) => {
      const u = p / active;
      button.rotation =
        u >= 1 ? restRotation : restRotation + Math.sin(u * Math.PI * wiggles) * Math.sin(u * Math.PI) * angle;
    }
  });
}

export function buttonBlink(button: PuaTarget, options: ButtonBlinkOptions = {}): void {
  const alpha = takeRestAlpha(button);
  const low = options.alpha ?? 0.4;
  button.visible = true;

  run({
    target: button,
    channel: 'alpha',
    duration: options.duration ?? 1200,
    delay: options.delay,
    loop: true,
    base: { alpha },
    onUpdate: (p) => {
      button.alpha = alpha * (1 - (1 - low) * (0.5 - 0.5 * Math.cos(p * Math.PI * 2)));
    }
  });
}
