import { Ticker } from 'pixi.js';
import type { Channel, EasingFn, PuaCallback, PuaTarget } from '../types.js';
import { easings } from './easing.js';

export interface RunConfig {
  target: PuaTarget;
  channel: Channel;
  object?: Record<string, any>;
  to?: Record<string, number>;
  duration: number;
  easing?: EasingFn;
  timing?: EasingFn;
  delay?: number;
  loop?: boolean;
  base?: Record<string, number>;
  onUpdate?: (progress: number) => void;
  onComplete?: PuaCallback;
  onStop?: PuaCallback;
}

interface Motion {
  time: number;
  delay: number;
  duration: number;
  easing: EasingFn;
  timing?: EasingFn;
  loop: boolean;
  object?: Record<string, any>;
  from: Record<string, number>;
  to: Record<string, number>;
  onUpdate?: (progress: number) => void;
  onComplete: PuaCallback;
}

export interface Active {
  motion: Motion;
  base?: Record<string, number>;
  onStop?: PuaCallback;
}

type Channels = Partial<Record<Channel, Active>>;

const motions = new Set<Motion>();
const registry = new WeakMap<PuaTarget, Channels>();
let started: Motion[] = [];
let ticking = false;

export function run(config: RunConfig): void {
  const { target, channel } = config;
  stopChannel(target, channel);

  const from: Record<string, number> = {};
  const to = config.to ?? {};
  if (config.object) {
    for (const key in to) {
      if (config.object[key] !== undefined) from[key] = Number(config.object[key]) || 0;
    }
  }

  const motion: Motion = {
    time: 0,
    delay: config.delay ?? 0,
    duration: Math.max(1, config.duration),
    easing: config.easing ?? easings.linear,
    timing: config.timing,
    loop: config.loop ?? false,
    object: config.object,
    from,
    to,
    onUpdate: config.onUpdate,
    onComplete: () => {
      release(target, channel, motion);
      config.onComplete?.();
    }
  };

  const channels = registry.get(target) ?? {};
  channels[channel] = { motion, base: config.base, onStop: config.onStop };
  registry.set(target, channels);

  motions.add(motion);
  started.push(motion);
  advance(motion, 0);
  attach();
}

export function find(target: PuaTarget, channel: Channel): Active | undefined {
  return registry.get(target)?.[channel];
}

export function stopChannel(target: PuaTarget, channel: Channel): void {
  const channels = registry.get(target);
  const active = channels?.[channel];
  if (!channels || !active) return;
  delete channels[channel];
  motions.delete(active.motion);
  active.onStop?.();
}

export function stop(target: PuaTarget): void {
  const channels = registry.get(target);
  if (!channels) return;
  registry.delete(target);
  for (const active of Object.values(channels)) {
    if (!active) continue;
    motions.delete(active.motion);
    active.onStop?.();
  }
}

function release(target: PuaTarget, channel: Channel, motion: Motion): void {
  const channels = registry.get(target);
  if (channels?.[channel]?.motion === motion) delete channels[channel];
}

// The delay runs before every cycle of a loop, and a finished cycle drops the time it overshot by.
function advance(motion: Motion, delta: number): boolean {
  motion.time += delta;
  if (motion.time < motion.delay) return true;

  const progress = Math.min(1, (motion.time - motion.delay) / motion.duration);
  if (motion.object) {
    const k = motion.easing(progress);
    for (const key in motion.from) motion.object[key] = motion.from[key] + (motion.to[key] - motion.from[key]) * k;
  }
  motion.onUpdate?.(motion.timing ? Math.max(0, Math.min(1, motion.timing(progress))) : progress);
  if (progress < 1) return true;

  motion.time = 0;
  if (motion.loop) return true;
  motion.onComplete();
  return false;
}

function attach(): void {
  if (ticking) return;
  ticking = true;
  Ticker.shared.add(tick);
}

function detach(): void {
  if (!ticking) return;
  ticking = false;
  Ticker.shared.remove(tick);
}

// Motions started from a callback during the tick are advanced in the same tick.
function tick(): void {
  if (motions.size === 0) {
    detach();
    return;
  }

  const delta = Ticker.shared.deltaMS;
  let batch = [...motions];
  while (batch.length > 0) {
    started = [];
    for (const motion of batch) {
      if (motions.has(motion) && !advance(motion, delta)) motions.delete(motion);
    }
    batch = started;
  }
}
