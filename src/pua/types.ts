import type { Container } from 'pixi.js';

export type PuaTarget = Container;
export type PuaCallback = () => void;
export type SlideDirection = 'left' | 'right' | 'top' | 'bottom';
export type Channel =
  | 'scale'
  | 'rotation'
  | 'position'
  | 'alpha'
  | 'skew'
  | 'filter'
  | 'text'
  | 'spacing'
  | 'color'
  | 'stroke';
export type EasingFn = (t: number) => number;
export type EasingName =
  | 'linear'
  | 'quadIn'
  | 'quadOut'
  | 'quadInOut'
  | 'cubicIn'
  | 'cubicOut'
  | 'cubicInOut'
  | 'sineInOut'
  | 'backIn'
  | 'backOut'
  | 'backInOut'
  | 'elasticOut'
  | 'bounceOut';
export type PuaEasing = EasingName | EasingFn;

export interface PuaOptions {
  easing?: PuaEasing;
  delay?: number;
  onComplete?: PuaCallback;
}

export type PuaEnd<O extends PuaOptions = PuaOptions> = PuaCallback | O;
