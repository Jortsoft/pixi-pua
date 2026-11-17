import type { Container, Text } from 'pixi.js';
import { CtaEntrance, CtaExit, CtaParts, EasingName, easingNames, pua, SlideDirection } from 'pua';
import pkg from '../../package.json';
import type { DemoKind } from './pixi/scenes';

export const PUA_VERSION: string = pkg.version;

export type ParamValue = number | string | boolean;
export type ParamValues = Record<string, ParamValue>;

export type ParamDef =
  | { key: string; label: string; type: 'number'; value: number; min: number; max: number; step: number }
  | { key: string; label: string; type: 'select'; value: string; options: readonly string[] }
  | { key: string; label: string; type: 'toggle'; value: boolean }
  | { key: string; label: string; type: 'color'; value: number }
  | { key: string; label: string; type: 'text'; value: string };

export type CodeArg = number | string | boolean | { ident: string } | { hex: number } | { obj: Record<string, CodeArg> };
export type OptionsArg = (keys: string[]) => CodeArg | undefined;
export type SetupLines = string[] | ((values: ParamValues) => string[]);

export interface DemoActors {
  target: Container;
  parts: CtaParts;
}

export interface AnimationEntry {
  id: string;
  group: string;
  demo: DemoKind;
  ident: string;
  summary: string;
  description: string;
  signature: string;
  continuous?: boolean;
  replayInterval?: number;
  games?: string[];
  setup?: SetupLines;
  params: ParamDef[];
  args: (values: ParamValues, options: OptionsArg) => (CodeArg | undefined)[];
  run: (actors: DemoActors, values: ParamValues, onComplete?: () => void) => void;
}

export interface Component {
  name: string;
  exports: string[];
}

export const animationGroups = ['Presets', 'CTA Popup', 'Button', 'Tutorial', 'Text', 'Shaders'];
export const gameTags = [
  'Casual',
  'Puzzle',
  'Match-3',
  'Merge',
  'Runner',
  'Idle',
  'RPG',
  'Shooter',
  'Racing',
  'Word',
  'Card',
  'Strategy'
];
export const slideDirections: SlideDirection[] = ['left', 'right', 'top', 'bottom'];

export const CTA_TITLE = 'LEVEL COMPLETE!';
export const CTA_BUTTON = 'PLAY';
export const TEXT_DEMO = 'LEVEL UP!';

const COMPONENTS: Record<string, string[]> = {
  'cta-popup': [
    'popupIn',
    'popupOut',
    'popupDrop',
    'popupSlideUp',
    'popupSlideDown',
    'popupFlipIn',
    'popupBounceIn',
    'popupSwingIn',
    'overlayIn',
    'overlayOut',
    'ctaShow',
    'ctaHide',
    'ctaCelebrate',
    'popupSlideIn',
    'popupSlideOut',
    'popupElasticIn',
    'popupUnfoldIn',
    'popupSpinIn',
    'popupZoomOut',
    'popupFlipOut',
    'popupSwingOut',
    'popupFallOut',
    'overlayPulse'
  ],
  button: [
    'buttonPress',
    'buttonDown',
    'buttonUp',
    'buttonIdle',
    'buttonHop',
    'buttonWiggle',
    'buttonSqueeze',
    'buttonIn',
    'buttonOut',
    'buttonPop',
    'buttonShake',
    'buttonPulse',
    'buttonFloat',
    'buttonTada',
    'buttonBlink'
  ],
  tutorial: [
    'tutorialTap',
    'tutorialDoubleTap',
    'tutorialHold',
    'tutorialSwipe',
    'tutorialDrag',
    'tutorialPoint',
    'tutorialCircle',
    'tutorialPath',
    'tutorialTapSequence',
    'tutorialScrub',
    'tutorialFlick',
    'tutorialArc',
    'tutorialWave',
    'tutorialFigureEight',
    'tutorialIn',
    'tutorialOut'
  ],
  dissolve: ['dissolveIn', 'dissolveOut'],
  pixelate: ['pixelateIn', 'pixelateOut'],
  blur: ['blurIn', 'blurOut'],
  wipe: ['wipeIn', 'wipeOut'],
  iris: ['irisIn', 'irisOut'],
  blinds: ['blindsIn', 'blindsOut'],
  fade: ['fadeIn', 'fadeOut'],
  slide: ['slideIn', 'slideOut'],
  zoom: ['zoomIn', 'zoomOut'],
  melt: ['meltIn', 'meltOut'],
  'clock-wipe': ['clockWipeIn', 'clockWipeOut'],
  tiles: ['tilesIn', 'tilesOut'],
  slices: ['slicesIn', 'slicesOut'],
  vortex: ['vortexIn', 'vortexOut']
};

const ctaEntrances: CtaEntrance[] = ['pop', 'drop', 'slide', 'flip', 'bounce', 'swing', 'elastic', 'unfold', 'whirl'];
const ctaExits: CtaExit[] = ['shrink', 'slide', 'zoom', 'flip', 'swing', 'fall'];
const TUTORIAL_PATH = [
  { x: -90, y: -40 },
  { x: 0, y: 30 },
  { x: 90, y: -40 }
];
const TUTORIAL_TAPS = [
  { x: -80, y: 20 },
  { x: 80, y: 20 }
];
const POINTS_PATH_SETUP = ['const points = [{ x: -90, y: -40 }, { x: 0, y: 30 }, { x: 90, y: -40 }];'];
const POINTS_TAPS_SETUP = ['const points = [{ x: -80, y: 20 }, { x: 80, y: 20 }];'];

const target = { ident: 'target' };
const popup = { ident: 'popup' };
const button = { ident: 'button' };
const hand = { ident: 'hand' };
const parts = { ident: 'parts' };
const overlay = { ident: 'overlay' };
const points = { ident: 'points' };
const words = { ident: 'words' };
const text = { ident: 'text' };

const num = (key: string, label: string, value: number, min: number, max: number, step: number): ParamDef => ({
  key,
  label,
  type: 'number',
  value,
  min,
  max,
  step
});

const select = (key: string, label: string, value: string, options: readonly string[]): ParamDef => ({
  key,
  label,
  type: 'select',
  value,
  options
});

const toggle = (key: string, label: string, value: boolean): ParamDef => ({ key, label, type: 'toggle', value });
const color = (key: string, label: string, value: number): ParamDef => ({ key, label, type: 'color', value });
const textParam = (key: string, label: string, value: string): ParamDef => ({ key, label, type: 'text', value });

const duration = (value: number, key = 'duration') => num(key, `${key} (ms)`, value, 50, 3000, 50);
const interval = (value: number) => num('interval', 'interval (ms)', value, 300, 5000, 100);
const easing = (value: EasingName) => select('easing', 'easing', value, easingNames);
const direction = (value: SlideDirection) => select('direction', 'direction', value, slideDirections);

export const SCALE_PARAM = num('targetScale', 'target scale', 1, 0.25, 2.5, 0.05);
const CTA_TEXT_PARAMS = [textParam('title', 'title text', CTA_TITLE), textParam('buttonLabel', 'button text', CTA_BUTTON)];
const TEXT_PARAM = textParam('content', 'text', TEXT_DEMO);

const n = (value: ParamValue): number => Number(value);
const ease = (value: ParamValue): EasingName => value as EasingName;
const dir = (value: ParamValue): SlideDirection => value as SlideDirection;
const txt = (actors: DemoActors): Text => actors.target as Text;
const overlayOf = (actors: DemoActors): Container => actors.parts.overlay as Container;
const wordList = (value: ParamValue): string[] =>
  String(value)
    .split(',')
    .map((word) => word.trim())
    .filter(Boolean);

function quote(value: ParamValue): string {
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

const ctaSetup =
  (lines: string[]) =>
  (v: ParamValues): string[] => {
    const out: string[] = [];
    if (v.title !== CTA_TITLE) out.push(`title.text = ${quote(v.title)};`);
    if (v.buttonLabel !== CTA_BUTTON) out.push(`buttonLabel.text = ${quote(v.buttonLabel)};`);
    return [...out, ...lines];
  };

const CTA_PARTS_SETUP = ctaSetup(['const parts = { overlay, panel, title, button };']);
const POPUP_SETUP = ctaSetup([]);
const TEXT_SETUP = (v: ParamValues): string[] => (v.content !== TEXT_DEMO ? [`text.text = ${quote(v.content)};`] : []);
const WORDS_SETUP = (v: ParamValues): string[] => [`const words = [${wordList(v.words).map(quote).join(', ')}];`];

export const animationCatalog: AnimationEntry[] = [
  {
    id: 'pop',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Quick pop-in (0 → overshoot → 1)',
    description:
      'Creates a quick pop-in effect: the object scales from zero, overshoots by the given amount and settles at 1. Useful for buttons, rewards, dialogs and notifications.',
    signature: 'pop(target, options?)',
    games: ['Casual', 'Puzzle', 'Match-3', 'Merge', 'Idle'],
    params: [duration(420), num('overshoot', 'overshoot', 0.15, 0, 0.6, 0.05)],
    args: (v, options) => [target, options(['duration', 'overshoot'])],
    run: (a, v, done) => pua.pop(a.target, { duration: n(v.duration), overshoot: n(v.overshoot), onComplete: done })
  },
  {
    id: 'bounce',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Hop up and land with a bounce',
    description:
      'Creates a bounce effect: the object hops up and lands with a bouncy settle back on its original position. By default the height is 35% of the object height.',
    signature: 'bounce(target, options?)',
    games: ['Casual', 'Match-3', 'Merge', 'Runner'],
    params: [duration(650), num('height', 'height (px)', 35, 4, 200, 1), easing('linear')],
    args: (v, options) => [target, options(['duration', 'height', 'easing'])],
    run: (a, v, done) =>
      pua.bounce(a.target, { duration: n(v.duration), height: n(v.height), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'pulse',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous attention pulse',
    description: 'Creates a continuous, gentle scale pulse for drawing attention to UI elements.',
    signature: 'pulse(target, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Idle', 'RPG'],
    params: [duration(900), num('strength', 'strength', 0.1, 0.02, 0.5, 0.02)],
    args: (v, options) => [target, options(['duration', 'strength'])],
    run: (a, v) => pua.pulse(a.target, { duration: n(v.duration), strength: n(v.strength) })
  },
  {
    id: 'shake',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Quick horizontal shake',
    description:
      'Creates a quick, decaying horizontal shake. Common for error messages, wrong answers and locked items. By default the amplitude is 6% of the object width.',
    signature: 'shake(target, options?)',
    games: ['Puzzle', 'Word', 'Match-3', 'RPG'],
    params: [
      duration(450),
      num('amplitude', 'amplitude (px)', 9, 1, 60, 1),
      num('shakes', 'shakes', 6, 1, 14, 1),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'amplitude', 'shakes', 'easing'])],
    run: (a, v, done) =>
      pua.shake(a.target, {
        duration: n(v.duration),
        amplitude: n(v.amplitude),
        shakes: n(v.shakes),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'jelly',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Playful squash and stretch',
    description: 'Creates a playful jelly-like deformation that alternates between squash and stretch before settling.',
    signature: 'jelly(target, options?)',
    games: ['Casual', 'Merge', 'Match-3'],
    params: [
      duration(650),
      num('strength', 'strength', 0.25, 0.05, 0.6, 0.05),
      num('wobbles', 'wobbles', 5, 1, 12, 1),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'strength', 'wobbles', 'easing'])],
    run: (a, v, done) =>
      pua.jelly(a.target, {
        duration: n(v.duration),
        strength: n(v.strength),
        wobbles: n(v.wobbles),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'wobble',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Small rotational wobble',
    description:
      'Creates a small rotational wobble that decays back to the original rotation. The angle is given in degrees.',
    signature: 'wobble(target, options?)',
    games: ['Casual', 'Puzzle', 'Word'],
    params: [
      duration(700),
      num('angle', 'angle (deg)', 10, 1, 45, 1),
      num('wobbles', 'wobbles', 4, 1, 12, 1),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'angle', 'wobbles', 'easing'])],
    run: (a, v, done) =>
      pua.wobble(a.target, {
        duration: n(v.duration),
        angle: n(v.angle),
        wobbles: n(v.wobbles),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'flip',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Card flip around an axis',
    description:
      'Flips the object like a card: it squashes to zero width (axis x) or height (axis y) and expands back, as if turning around its axis. Swap the texture at the midpoint for a two-sided card.',
    signature: 'flip(target, options?)',
    games: ['Card', 'Puzzle', 'Merge'],
    params: [duration(500), select('axis', 'axis', 'x', ['x', 'y']), easing('linear')],
    args: (v, options) => [target, options(['duration', 'axis', 'easing'])],
    run: (a, v, done) =>
      pua.flip(a.target, { duration: n(v.duration), axis: v.axis as 'x' | 'y', onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'tada',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Celebration: grow and wiggle',
    description:
      'Attention-grabbing celebration: the object grows slightly while wiggling left and right, then settles. Great for rewards, unlocked items and completed goals.',
    signature: 'tada(target, options?)',
    games: ['Match-3', 'Merge', 'Idle', 'RPG'],
    params: [
      duration(800),
      num('strength', 'strength', 0.1, 0, 0.5, 0.02),
      num('angle', 'angle (deg)', 4, 0, 20, 1),
      num('wiggles', 'wiggles', 5, 1, 12, 1),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'strength', 'angle', 'wiggles', 'easing'])],
    run: (a, v, done) =>
      pua.tada(a.target, {
        duration: n(v.duration),
        strength: n(v.strength),
        angle: n(v.angle),
        wiggles: n(v.wiggles),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'spin',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'One-shot spin by full turns',
    description:
      'Spins the object by the given number of full turns with easing and returns to its original rotation value. Negative turns spin counter-clockwise.',
    signature: 'spin(target, options?)',
    games: ['Casual', 'Idle', 'Racing'],
    params: [duration(800), num('turns', 'turns', 1, -4, 4, 0.5), easing('cubicInOut')],
    args: (v, options) => [target, options(['duration', 'turns', 'easing'])],
    run: (a, v, done) =>
      pua.spin(a.target, { duration: n(v.duration), turns: n(v.turns), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'flash',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Blink the alpha a few times',
    description: 'Blinks the object by dipping its alpha to zero and back the given number of times.',
    signature: 'flash(target, options?)',
    games: ['Shooter', 'RPG', 'Puzzle'],
    params: [duration(600), num('flashes', 'flashes', 2, 1, 8, 1), easing('linear')],
    args: (v, options) => [target, options(['duration', 'flashes', 'easing'])],
    run: (a, v, done) =>
      pua.flash(a.target, { duration: n(v.duration), flashes: n(v.flashes), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'dropIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Drop from above and bounce',
    description:
      'Drops the object from the given height above its position and lands with a bounce. By default the height is 150% of the object height.',
    signature: 'dropIn(target, options?)',
    games: ['Puzzle', 'Match-3', 'Merge', 'Word'],
    params: [duration(600), num('height', 'height (px)', 80, 10, 300, 10), easing('bounceOut')],
    args: (v, options) => [target, options(['duration', 'height', 'easing'])],
    run: (a, v, done) =>
      pua.dropIn(a.target, { duration: n(v.duration), height: n(v.height), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'nudge',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Quick nudge toward a direction',
    description:
      'Moves the object a short distance toward the given direction and back. Useful for arrows, hints and "look here" cues.',
    signature: 'nudge(target, direction, options?)',
    games: ['Puzzle', 'Runner', 'Racing'],
    params: [direction('right'), num('distance', 'distance (px)', 12, 2, 80, 2), duration(400), easing('linear')],
    args: (v, options) => [target, String(v.direction), options(['distance', 'duration', 'easing'])],
    run: (a, v, done) =>
      pua.nudge(a.target, dir(v.direction), {
        distance: n(v.distance),
        duration: n(v.duration),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'heartbeat',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous double-beat pulse',
    description: 'Continuous heartbeat: two quick scale beats followed by a pause, repeated every cycle.',
    signature: 'heartbeat(target, options?)',
    continuous: true,
    games: ['Idle', 'RPG', 'Casual'],
    params: [duration(1000), num('strength', 'strength', 0.12, 0.02, 0.5, 0.02)],
    args: (v, options) => [target, options(['duration', 'strength'])],
    run: (a, v) => pua.heartbeat(a.target, { duration: n(v.duration), strength: n(v.strength) })
  },
  {
    id: 'float',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous gentle hover',
    description: 'Continuous floating motion: the object drifts up and down smoothly, like it is hovering.',
    signature: 'float(target, options?)',
    continuous: true,
    games: ['Idle', 'Merge', 'Casual'],
    params: [duration(2000), num('height', 'height (px)', 10, 2, 60, 1)],
    args: (v, options) => [target, options(['duration', 'height'])],
    run: (a, v) => pua.float(a.target, { duration: n(v.duration), height: n(v.height) })
  },
  {
    id: 'rubberBand',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Stretch wide, squash tall, settle',
    description:
      'Elastic rubber-band wobble: the object stretches horizontally, squashes vertically and oscillates back into shape. A classic attention grabber for icons and rewards.',
    signature: 'rubberBand(target, options?)',
    games: ['Casual', 'Merge', 'Match-3', 'Idle'],
    params: [duration(900), num('strength', 'strength', 0.25, 0.05, 0.6, 0.05), easing('linear')],
    args: (v, options) => [target, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.rubberBand(a.target, {
        duration: n(v.duration),
        strength: n(v.strength),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'stamp',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Slam down from large to normal',
    description:
      'Stamp entrance: the object starts oversized and transparent, slams down to its real size and turns opaque, like a stamp hitting paper. Great for "WIN", "COMBO" and score labels.',
    signature: 'stamp(target, options?)',
    games: ['Shooter', 'Racing', 'RPG', 'Runner'],
    params: [duration(450), num('from', 'start scale', 2.5, 1.2, 5, 0.1), easing('cubicIn')],
    args: (v, options) => [target, options(['duration', 'from', 'easing'])],
    run: (a, v, done) =>
      pua.stamp(a.target, { duration: n(v.duration), from: n(v.from), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'rollIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Roll in from the left',
    description:
      'Rolls the object into place from the left: it slides in while spinning and fading in. Negative turns roll the other way.',
    signature: 'rollIn(target, options?)',
    games: ['Casual', 'Puzzle', 'Racing'],
    params: [
      duration(700),
      num('distance', 'distance (px)', 220, 40, 600, 10),
      num('turns', 'turns', 1, -3, 3, 0.5),
      easing('cubicOut'),
      select('direction', 'from', 'left', ['left', 'right'])
    ],
    args: (v, options) => [target, options(['duration', 'distance', 'turns', 'easing', 'direction'])],
    run: (a, v, done) =>
      pua.rollIn(a.target, {
        duration: n(v.duration),
        distance: n(v.distance),
        turns: n(v.turns),
        easing: ease(v.easing),
        onComplete: done,
        direction: v.direction as 'left' | 'right'
      })
  },
  {
    id: 'flipIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Flip open from an edge',
    description:
      'Flip-in entrance: the object unfolds from zero width (axis x) or zero height (axis y) with a soft overshoot while fading in. Pairs with flip for card games.',
    signature: 'flipIn(target, options?)',
    games: ['Card', 'Puzzle', 'Merge'],
    params: [duration(600), select('axis', 'axis', 'x', ['x', 'y']), easing('backOut')],
    args: (v, options) => [target, options(['duration', 'axis', 'easing'])],
    run: (a, v, done) =>
      pua.flipIn(a.target, { duration: n(v.duration), axis: v.axis as 'x' | 'y', easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'swirl',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Spin in while growing',
    description: 'Swirl entrance: the object spins the given number of turns while scaling up from zero and fading in.',
    signature: 'swirl(target, options?)',
    games: ['Casual', 'Idle', 'Match-3'],
    params: [duration(700), num('turns', 'turns', 1, -3, 3, 0.5), easing('cubicOut')],
    args: (v, options) => [target, options(['duration', 'turns', 'easing'])],
    run: (a, v, done) =>
      pua.swirl(a.target, { duration: n(v.duration), turns: n(v.turns), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'jump',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Squash, leap and land',
    description:
      'A full character-style jump: anticipation squash, stretch in the air, landing squash and settle. The height defaults to 60% of the object height.',
    signature: 'jump(target, options?)',
    games: ['Runner', 'Casual', 'Merge', 'Puzzle'],
    params: [
      duration(700),
      num('height', 'height (px)', 60, 10, 240, 5),
      num('squash', 'squash', 0.2, 0, 0.5, 0.02),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'height', 'squash', 'easing'])],
    run: (a, v, done) =>
      pua.jump(a.target, {
        duration: n(v.duration),
        height: n(v.height),
        squash: n(v.squash),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'impact',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Landing squash with spring back',
    description:
      'Impact feedback: the object squashes flat and wide, then springs back with a small overshoot. Use on landings, hits and drops.',
    signature: 'impact(target, options?)',
    games: ['Shooter', 'Runner', 'Merge', 'Match-3'],
    params: [duration(350), num('strength', 'strength', 0.3, 0.05, 0.6, 0.05), easing('linear')],
    args: (v, options) => [target, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.impact(a.target, { duration: n(v.duration), strength: n(v.strength), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'elasticIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Appear with an elastic spring',
    description: 'Elastic entrance: the object springs up from zero and oscillates around its final size before settling.',
    signature: 'elasticIn(target, options?)',
    games: ['Casual', 'Idle', 'Merge'],
    params: [duration(900), easing('elasticOut'), num('from', 'start scale', 0, 0, 0.9, 0.05)],
    args: (v, options) => [target, options(['duration', 'easing', 'from'])],
    run: (a, v, done) =>
      pua.elasticIn(a.target, { duration: n(v.duration), easing: ease(v.easing), onComplete: done, from: n(v.from) })
  },
  {
    id: 'bounceIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Appear with a bouncy landing',
    description: 'Bounce entrance: the object grows from zero and bounces a few times at its final size while fading in.',
    signature: 'bounceIn(target, options?)',
    games: ['Casual', 'Match-3', 'Puzzle', 'Word'],
    params: [duration(800), easing('bounceOut'), num('from', 'start scale', 0, 0, 0.9, 0.05)],
    args: (v, options) => [target, options(['duration', 'easing', 'from'])],
    run: (a, v, done) =>
      pua.bounceIn(a.target, { duration: n(v.duration), easing: ease(v.easing), onComplete: done, from: n(v.from) })
  },
  {
    id: 'popOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Quick pop-out (1 → overshoot → 0)',
    description:
      'The exit twin of pop: the object grows slightly, shrinks to nothing and is hidden. A following pop brings it back to its normal size.',
    signature: 'popOut(target, options?)',
    games: ['Casual', 'Puzzle', 'Match-3', 'Merge', 'Idle'],
    params: [duration(350), num('overshoot', 'overshoot', 0.15, 0, 0.6, 0.05), easing('linear')],
    args: (v, options) => [target, options(['duration', 'overshoot', 'easing'])],
    run: (a, v, done) =>
      pua.popOut(a.target, { duration: n(v.duration), overshoot: n(v.overshoot), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'lightSpeedIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Dash in from the right with skew',
    description:
      'Light-speed entrance: the object dashes in from the right, leaning with a skew that straightens out as it stops.',
    signature: 'lightSpeedIn(target, options?)',
    games: ['Racing', 'Runner', 'Shooter'],
    params: [
      duration(600),
      num('distance', 'distance (px)', 220, 40, 600, 10),
      num('skew', 'skew (deg)', 30, 0, 60, 5),
      easing('cubicOut'),
      select('direction', 'from', 'right', ['left', 'right'])
    ],
    args: (v, options) => [target, options(['duration', 'distance', 'skew', 'easing', 'direction'])],
    run: (a, v, done) =>
      pua.lightSpeedIn(a.target, {
        duration: n(v.duration),
        distance: n(v.distance),
        skew: n(v.skew),
        easing: ease(v.easing),
        onComplete: done,
        direction: v.direction as 'left' | 'right'
      })
  },
  {
    id: 'vibrate',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Fast rotational buzz',
    description: 'A fast, decaying rotational buzz, like a phone vibrating. Smaller and quicker than shake.',
    signature: 'vibrate(target, options?)',
    games: ['Puzzle', 'Word', 'Idle'],
    params: [
      duration(400),
      num('angle', 'angle (deg)', 3, 0.5, 15, 0.5),
      num('shakes', 'shakes', 12, 2, 30, 1),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'angle', 'shakes', 'easing'])],
    run: (a, v, done) =>
      pua.vibrate(a.target, {
        duration: n(v.duration),
        angle: n(v.angle),
        shakes: n(v.shakes),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'flicker',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Neon flicker, then steady',
    description: 'Flickers the alpha in an irregular pattern before settling fully visible, like a neon sign switching on.',
    signature: 'flicker(target, options?)',
    games: ['Shooter', 'RPG', 'Strategy'],
    params: [duration(800), num('intensity', 'intensity', 1, 0.1, 1, 0.05), easing('linear')],
    args: (v, options) => [target, options(['duration', 'intensity', 'easing'])],
    run: (a, v, done) =>
      pua.flicker(a.target, { duration: n(v.duration), onComplete: done, intensity: n(v.intensity), easing: ease(v.easing) })
  },
  {
    id: 'blink',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Hard on/off blinking',
    description:
      'Continuous hard blinking: the object switches between visible and invisible every interval. The classic "tap to start" cue.',
    signature: 'blink(target, options?)',
    continuous: true,
    params: [interval(500), num('alpha', 'off alpha', 0, 0, 0.9, 0.05)],
    args: (v, options) => [target, options(['interval', 'alpha'])],
    run: (a, v) => pua.blink(a.target, { interval: n(v.interval), alpha: n(v.alpha) })
  },
  {
    id: 'breathe',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Slow breathing scale and alpha',
    description: 'Continuous slow breathing: the object gently grows while brightening and shrinks while dimming.',
    signature: 'breathe(target, options?)',
    continuous: true,
    games: ['Idle', 'Casual', 'RPG'],
    params: [duration(2400), num('strength', 'strength', 0.05, 0, 0.3, 0.01), num('alpha', 'min alpha', 0.7, 0.1, 1, 0.05)],
    args: (v, options) => [target, options(['duration', 'strength', 'alpha'])],
    run: (a, v) => pua.breathe(a.target, { duration: n(v.duration), strength: n(v.strength), alpha: n(v.alpha) })
  },
  {
    id: 'sway',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous gentle rocking',
    description: 'Continuous rotational sway, like a sign hanging in the wind.',
    signature: 'sway(target, options?)',
    continuous: true,
    games: ['Casual', 'Idle', 'Word'],
    params: [duration(2000), num('angle', 'angle (deg)', 6, 1, 30, 1)],
    args: (v, options) => [target, options(['duration', 'angle'])],
    run: (a, v) => pua.sway(a.target, { duration: n(v.duration), angle: n(v.angle) })
  },
  {
    id: 'jitter',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Nervous random shiver',
    description: 'Continuous random jitter around the original position. Use sparingly for danger, cold or nervous states.',
    signature: 'jitter(target, options?)',
    continuous: true,
    games: ['Shooter', 'RPG', 'Puzzle'],
    params: [
      num('amplitude', 'amplitude (px)', 2, 0.5, 10, 0.5),
      num('interval', 'interval (ms, 0 = every frame)', 0, 0, 500, 10)
    ],
    args: (v, options) => [target, options(['amplitude', 'interval'])],
    run: (a, v) => pua.jitter(a.target, { amplitude: n(v.amplitude), interval: n(v.interval) })
  },
  {
    id: 'fadeIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Fade into view',
    description:
      'Shows the object by fading its alpha from zero to its normal value. The simplest entrance for any UI element.',
    signature: 'fadeIn(target, options?)',
    games: ['Casual', 'Puzzle', 'RPG', 'Strategy', 'Card'],
    params: [duration(300), easing('quadOut')],
    args: (v, options) => [target, options(['duration', 'easing'])],
    run: (a, v, done) => pua.fadeIn(a.target, { duration: n(v.duration), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'fadeOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Fade out and hide',
    description: 'Fades the object out and sets it invisible. A following fadeIn restores its normal alpha.',
    signature: 'fadeOut(target, options?)',
    games: ['Casual', 'Puzzle', 'RPG', 'Strategy', 'Card'],
    params: [duration(300), easing('quadIn')],
    args: (v, options) => [target, options(['duration', 'easing'])],
    run: (a, v, done) => pua.fadeOut(a.target, { duration: n(v.duration), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'slideIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Slide in from a side with a fade',
    description:
      'Entrance from the given side: the object starts the given distance away, slides onto its position and fades in. By default the distance is 120% of the object size.',
    signature: 'slideIn(target, direction, options?)',
    games: ['Casual', 'Runner', 'Card', 'Strategy', 'Word'],
    params: [direction('left'), num('distance', 'distance (px)', 180, 20, 400, 10), duration(450), easing('cubicOut')],
    args: (v, options) => [target, String(v.direction), options(['distance', 'duration', 'easing'])],
    run: (a, v, done) =>
      pua.slideIn(a.target, dir(v.direction), {
        distance: n(v.distance),
        duration: n(v.duration),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'slideOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Slide away to a side and hide',
    description:
      'Exit toward the given side: the object slides the given distance away while fading out and is hidden. A following slideIn brings it back.',
    signature: 'slideOut(target, direction, options?)',
    games: ['Casual', 'Runner', 'Card', 'Strategy', 'Word'],
    params: [direction('right'), num('distance', 'distance (px)', 180, 20, 400, 10), duration(400), easing('cubicIn')],
    args: (v, options) => [target, String(v.direction), options(['distance', 'duration', 'easing'])],
    run: (a, v, done) =>
      pua.slideOut(a.target, dir(v.direction), {
        distance: n(v.distance),
        duration: n(v.duration),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'zoomIn',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Grow into place with a fade',
    description: 'Smooth entrance without overshoot: the object grows from the given start scale while fading in.',
    signature: 'zoomIn(target, options?)',
    games: ['Puzzle', 'Card', 'RPG', 'Strategy'],
    params: [duration(400), num('from', 'start scale', 0.3, 0, 0.9, 0.05), easing('cubicOut')],
    args: (v, options) => [target, options(['duration', 'from', 'easing'])],
    run: (a, v, done) =>
      pua.zoomIn(a.target, { duration: n(v.duration), from: n(v.from), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'zoomOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Grow past the screen and vanish',
    description:
      'Exit toward the player: the object grows to the given end scale while fading out and is hidden. A following zoomIn restores its size.',
    signature: 'zoomOut(target, options?)',
    games: ['Puzzle', 'Card', 'RPG', 'Shooter'],
    params: [duration(350), num('to', 'end scale', 1.8, 1.1, 3, 0.1), easing('cubicIn')],
    args: (v, options) => [target, options(['duration', 'to', 'easing'])],
    run: (a, v, done) =>
      pua.zoomOut(a.target, { duration: n(v.duration), to: n(v.to), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'flipOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Fold shut and disappear',
    description: 'The exit twin of flipIn: the object folds shut along the given axis while fading out and is hidden.',
    signature: 'flipOut(target, options?)',
    games: ['Card', 'Puzzle', 'Match-3'],
    params: [duration(400), select('axis', 'axis', 'x', ['x', 'y']), easing('backIn')],
    args: (v, options) => [target, options(['duration', 'axis', 'easing'])],
    run: (a, v, done) =>
      pua.flipOut(a.target, {
        duration: n(v.duration),
        axis: v.axis as 'x' | 'y',
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'rollOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Roll away to the right',
    description: 'The exit twin of rollIn: the object rolls off to the right while spinning and fading out, then is hidden.',
    signature: 'rollOut(target, options?)',
    games: ['Casual', 'Runner', 'Racing'],
    params: [
      duration(600),
      num('distance', 'distance (px)', 225, 40, 500, 5),
      num('turns', 'turns', 1, 0.25, 3, 0.25),
      easing('cubicIn'),
      select('direction', 'toward', 'right', ['left', 'right'])
    ],
    args: (v, options) => [target, options(['duration', 'distance', 'turns', 'easing', 'direction'])],
    run: (a, v, done) =>
      pua.rollOut(a.target, {
        duration: n(v.duration),
        distance: n(v.distance),
        turns: n(v.turns),
        easing: ease(v.easing),
        onComplete: done,
        direction: v.direction as 'left' | 'right'
      })
  },
  {
    id: 'springOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Wind up, puff and shrink away',
    description:
      'Bouncy exit: the object dips slightly, puffs up past its size and shrinks to nothing. A following pop brings it back.',
    signature: 'springOut(target, options?)',
    games: ['Casual', 'Merge', 'Match-3', 'Idle'],
    params: [duration(500), num('strength', 'strength', 1, 0, 3, 0.1), easing('linear')],
    args: (v, options) => [target, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.springOut(a.target, { duration: n(v.duration), onComplete: done, strength: n(v.strength), easing: ease(v.easing) })
  },
  {
    id: 'fallOut',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Tip over and fall away',
    description:
      'The object tilts, drops down the given distance while fading out and is hidden. For dismissed cards and lost items.',
    signature: 'fallOut(target, options?)',
    games: ['Card', 'Puzzle', 'Runner', 'RPG'],
    params: [
      duration(600),
      num('distance', 'distance (px)', 150, 40, 400, 10),
      num('angle', 'angle (deg)', 20, -60, 60, 5),
      easing('quadIn')
    ],
    args: (v, options) => [target, options(['duration', 'distance', 'angle', 'easing'])],
    run: (a, v, done) =>
      pua.fallOut(a.target, {
        duration: n(v.duration),
        distance: n(v.distance),
        angle: n(v.angle),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'punchUp',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Quick scale punch and settle',
    description:
      'One-shot scale punch: the object jumps up in size and settles back with a small overshoot. Fire it on counters, collected items and anything that just changed.',
    signature: 'punchUp(target, options?)',
    games: ['Idle', 'Merge', 'Match-3', 'Shooter', 'Casual'],
    params: [duration(320), num('strength', 'strength', 0.25, 0.05, 1, 0.05), easing('linear')],
    args: (v, options) => [target, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.punchUp(a.target, { duration: n(v.duration), strength: n(v.strength), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'coinFlip',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Toss up and flip like a coin',
    description:
      'The object hops up while flipping around its vertical axis the given number of times, then lands. For coins, cards and rewards.',
    signature: 'coinFlip(target, options?)',
    games: ['Idle', 'Card', 'Casual', 'Merge'],
    params: [
      duration(800),
      num('flips', 'flips', 2, 1, 6, 1),
      num('height', 'height (px)', 50, 0, 200, 5),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'flips', 'height', 'easing'])],
    run: (a, v, done) =>
      pua.coinFlip(a.target, {
        duration: n(v.duration),
        flips: n(v.flips),
        height: n(v.height),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'nod',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Quick vertical nod',
    description: 'A decaying vertical shake, the "yes" twin of shake. Good for confirmations and accepted moves.',
    signature: 'nod(target, options?)',
    games: ['Puzzle', 'Word', 'Card', 'RPG'],
    params: [
      duration(450),
      num('amplitude', 'amplitude (px)', 8, 1, 40, 1),
      num('nods', 'nods', 2, 1, 6, 1),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'amplitude', 'nods', 'easing'])],
    run: (a, v, done) =>
      pua.nod(a.target, {
        duration: n(v.duration),
        amplitude: n(v.amplitude),
        nods: n(v.nods),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'spinLoop',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous rotation',
    description:
      'Rotates the object continuously, one full turn per duration. For loading spinners, rays and reward backdrops.',
    signature: 'spinLoop(target, options?)',
    continuous: true,
    games: ['Idle', 'Casual', 'Merge', 'RPG'],
    params: [duration(1200), toggle('clockwise', 'clockwise', true)],
    args: (v, options) => [target, options(['duration', 'clockwise'])],
    run: (a, v) => pua.spinLoop(a.target, { duration: n(v.duration), clockwise: Boolean(v.clockwise) })
  },
  {
    id: 'orbit',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous small circular drift',
    description: 'Moves the object around a small circle that passes through its position. A livelier idle than float.',
    signature: 'orbit(target, options?)',
    continuous: true,
    games: ['Casual', 'Idle', 'RPG'],
    params: [duration(1800), num('radius', 'radius (px)', 8, 2, 60, 1), toggle('clockwise', 'clockwise', true)],
    args: (v, options) => [target, options(['duration', 'radius', 'clockwise'])],
    run: (a, v) => pua.orbit(a.target, { duration: n(v.duration), radius: n(v.radius), clockwise: Boolean(v.clockwise) })
  },
  {
    id: 'ping',
    group: 'Presets',
    demo: 'card',
    ident: 'target',
    summary: 'Radar ping: grow and fade, repeating',
    description:
      'Continuously grows the object to the given scale while fading it out, then restarts. Put it on a ring or a copy of an icon to mark a point of interest.',
    signature: 'ping(target, options?)',
    continuous: true,
    games: ['Strategy', 'RPG', 'Puzzle', 'Shooter'],
    params: [duration(1200), num('scale', 'end scale', 1.6, 1.1, 3, 0.1)],
    args: (v, options) => [target, options(['duration', 'scale'])],
    run: (a, v) => pua.ping(a.target, { duration: n(v.duration), scale: n(v.scale) })
  },
  {
    id: 'popupIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup appears with scale and fade',
    description:
      'Shows a popup panel: it fades in while scaling up from the given start scale to its normal size with a soft overshoot. Works on any container that holds the popup content.',
    signature: 'popupIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(350), num('scale', 'start scale', 0.6, 0.1, 1, 0.05), easing('backOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['scale', 'easing'])],
    run: (a, v, done) =>
      pua.popupIn(a.target, n(v.duration), { scale: n(v.scale), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup disappears with scale and fade',
    description:
      'Hides a popup panel: it fades out while shrinking to the given end scale. A following popupIn restores its normal size and alpha.',
    signature: 'popupOut(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(300), num('scale', 'end scale', 0.6, 0.1, 1, 0.05), easing('backIn'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['scale', 'easing'])],
    run: (a, v, done) =>
      pua.popupOut(a.target, n(v.duration), { scale: n(v.scale), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupDrop',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup drops in from the top',
    description: 'Drops a popup panel from above the screen onto its position and lands with a bounce.',
    signature: 'popupDrop(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(700), easing('bounceOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupDrop(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'ctaShow',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'parts',
    summary: 'Full CTA popup entrance sequence',
    description:
      'Plays the complete CTA entrance: the overlay fades in, the panel pops in, the title rises into place and the button pops and then keeps pulsing. Every part is optional; parts are staggered by the given delay.',
    signature: 'ctaShow({ overlay?, panel?, title?, button? }, options?)',
    replayInterval: 3600,
    setup: CTA_PARTS_SETUP,
    params: [
      duration(350),
      num('stagger', 'stagger (ms)', 120, 0, 600, 20),
      select('entrance', 'panel entrance', 'pop', ctaEntrances),
      toggle('pulseButton', 'pulse button after entrance', true),
      num('titleOffset', 'title rise (px)', 16, 0, 80, 2),
      ...CTA_TEXT_PARAMS
    ],
    args: (v, options) => [parts, options(['duration', 'stagger', 'entrance', 'pulseButton', 'titleOffset'])],
    run: (a, v, done) =>
      pua.ctaShow(a.parts, {
        duration: n(v.duration),
        stagger: n(v.stagger),
        entrance: v.entrance as CtaEntrance,
        pulseButton: Boolean(v.pulseButton),
        onComplete: done,
        titleOffset: n(v.titleOffset)
      })
  },
  {
    id: 'ctaHide',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'parts',
    summary: 'Full CTA popup exit sequence',
    description:
      'Plays the complete CTA exit in reverse order: the button scales out, the title fades, the panel shrinks away and the overlay fades out. Each part is hidden once its animation finishes.',
    signature: 'ctaHide({ overlay?, panel?, title?, button? }, options?)',
    replayInterval: 2800,
    setup: CTA_PARTS_SETUP,
    params: [
      duration(250),
      num('stagger', 'stagger (ms)', 80, 0, 600, 20),
      select('exit', 'panel exit', 'shrink', ctaExits),
      ...CTA_TEXT_PARAMS
    ],
    args: (v, options) => [parts, options(['duration', 'stagger', 'exit'])],
    run: (a, v, done) =>
      pua.ctaHide(a.parts, { duration: n(v.duration), stagger: n(v.stagger), exit: v.exit as CtaExit, onComplete: done })
  },
  {
    id: 'popupSlideUp',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup slides up from the bottom',
    description: 'Slides the popup up from below the screen onto its position with a soft overshoot, like a bottom sheet.',
    signature: 'popupSlideUp(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(500), easing('backOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupSlideUp(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupSlideDown',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup slides down and away',
    description: 'Slides the popup down below the screen and hides it. A following popupSlideUp brings it back.',
    signature: 'popupSlideDown(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(400), easing('cubicIn'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupSlideDown(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupFlipIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup unfolds horizontally',
    description: 'Flip-style entrance: the popup unfolds from zero width with a soft overshoot while fading in.',
    signature: 'popupFlipIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(450), easing('backOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupFlipIn(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupBounceIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup bounces into place',
    description: 'Bouncy entrance: the popup grows from zero and bounces at its final size while fading in.',
    signature: 'popupBounceIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(700), easing('bounceOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupBounceIn(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupSwingIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup swings in with a tilt',
    description:
      'Swing entrance: the popup comes in slightly rotated and smaller, straightening and growing into place with an overshoot.',
    signature: 'popupSwingIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [
      duration(450),
      num('angle', 'angle (deg)', 12, 0, 45, 1),
      easing('backOut'),
      num('scale', 'start scale', 0.8, 0.1, 1, 0.05),
      ...CTA_TEXT_PARAMS
    ],
    args: (v, options) => [popup, v.duration, options(['angle', 'easing', 'scale'])],
    run: (a, v, done) =>
      pua.popupSwingIn(a.target, n(v.duration), {
        angle: n(v.angle),
        easing: ease(v.easing),
        onComplete: done,
        scale: n(v.scale)
      })
  },
  {
    id: 'overlayIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'overlay',
    summary: 'Dim the screen behind a popup',
    description:
      'Fades a full-screen overlay in to the given alpha. Use it under popups and endcards; overlayOut removes it again.',
    signature: 'overlayIn(overlay, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(300), num('alpha', 'alpha', 0.6, 0.1, 1, 0.05), easing('quadOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [overlay, v.duration, options(['alpha', 'easing'])],
    run: (a, v, done) =>
      pua.overlayIn(overlayOf(a), n(v.duration), { alpha: n(v.alpha), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'overlayOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'overlay',
    summary: 'Remove the screen dim',
    description: 'Fades the overlay out and hides it. A following overlayIn restores its alpha.',
    signature: 'overlayOut(overlay, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(250), easing('quadOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [overlay, v.duration, options(['easing'])],
    run: (a, v, done) => pua.overlayOut(overlayOf(a), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'ctaCelebrate',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'parts',
    summary: 'Win moment: panel, title and button react together',
    description:
      'Celebration burst for an endcard that is already visible: the panel jiggles, the title does a tada and the button bounces, all on the same beat.',
    signature: 'ctaCelebrate({ panel?, title?, button? }, options?)',
    replayInterval: 2600,
    setup: CTA_PARTS_SETUP,
    params: [duration(900), num('strength', 'strength', 1, 0.2, 3, 0.1), easing('linear'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [parts, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.ctaCelebrate(a.parts, {
        duration: n(v.duration),
        onComplete: done,
        strength: n(v.strength),
        easing: ease(v.easing)
      })
  },
  {
    id: 'popupSlideIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup slides in from any side',
    description: 'Slides the popup in from outside the given screen edge onto its position with a soft overshoot.',
    signature: 'popupSlideIn(popup, direction, duration, options?)',
    setup: POPUP_SETUP,
    params: [direction('left'), duration(500), easing('backOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, String(v.direction), v.duration, options(['easing'])],
    run: (a, v, done) =>
      pua.popupSlideIn(a.target, dir(v.direction), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupSlideOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup slides away to any side',
    description: 'Slides the popup out past the given screen edge and hides it. A following popupSlideIn brings it back.',
    signature: 'popupSlideOut(popup, direction, duration, options?)',
    setup: POPUP_SETUP,
    params: [direction('right'), duration(400), easing('cubicIn'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, String(v.direction), v.duration, options(['easing'])],
    run: (a, v, done) =>
      pua.popupSlideOut(a.target, dir(v.direction), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupElasticIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup springs in elastically',
    description: 'Elastic entrance: the popup springs up from zero and oscillates around its size before settling.',
    signature: 'popupElasticIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(900), easing('elasticOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupElasticIn(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupUnfoldIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup unfolds vertically',
    description: 'The vertical twin of popupFlipIn: the popup opens from a horizontal line to its full height.',
    signature: 'popupUnfoldIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(450), easing('backOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupUnfoldIn(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupSpinIn',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup whirls in while growing',
    description: 'Reward-style entrance: the popup spins the given number of turns while growing from zero and fading in.',
    signature: 'popupSpinIn(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(600), num('turns', 'turns', 1, 0.25, 3, 0.25), easing('cubicOut'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['turns', 'easing'])],
    run: (a, v, done) =>
      pua.popupSpinIn(a.target, n(v.duration), { turns: n(v.turns), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupZoomOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup grows and fades away',
    description: 'Dismisses the popup toward the player: it grows to the given end scale while fading out, then is hidden.',
    signature: 'popupZoomOut(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(300), num('scale', 'end scale', 1.4, 1.05, 3, 0.05), easing('cubicIn'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['scale', 'easing'])],
    run: (a, v, done) =>
      pua.popupZoomOut(a.target, n(v.duration), { scale: n(v.scale), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupFlipOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup folds shut horizontally',
    description: 'The exit twin of popupFlipIn: the popup folds to a vertical line while fading out, then is hidden.',
    signature: 'popupFlipOut(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(350), easing('backIn'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['easing'])],
    run: (a, v, done) => pua.popupFlipOut(a.target, n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'popupSwingOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup swings away with a tilt',
    description: 'The exit twin of popupSwingIn: the popup tilts, shrinks slightly and fades out, then is hidden.',
    signature: 'popupSwingOut(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [
      duration(350),
      num('angle', 'angle (deg)', 12, 0, 45, 1),
      easing('backIn'),
      num('scale', 'end scale', 0.8, 0.1, 1, 0.05),
      ...CTA_TEXT_PARAMS
    ],
    args: (v, options) => [popup, v.duration, options(['angle', 'easing', 'scale'])],
    run: (a, v, done) =>
      pua.popupSwingOut(a.target, n(v.duration), {
        angle: n(v.angle),
        easing: ease(v.easing),
        onComplete: done,
        scale: n(v.scale)
      })
  },
  {
    id: 'popupFallOut',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'popup',
    summary: 'Popup tips over and falls off screen',
    description:
      'The popup tilts and drops below the screen, then is hidden. A playful way to dismiss a failed or skipped offer.',
    signature: 'popupFallOut(popup, duration, options?)',
    setup: POPUP_SETUP,
    params: [duration(600), num('angle', 'angle (deg)', 10, -30, 30, 1), easing('cubicIn'), ...CTA_TEXT_PARAMS],
    args: (v, options) => [popup, v.duration, options(['angle', 'easing'])],
    run: (a, v, done) =>
      pua.popupFallOut(a.target, n(v.duration), { angle: n(v.angle), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'overlayPulse',
    group: 'CTA Popup',
    demo: 'popup',
    ident: 'overlay',
    summary: 'Screen dim breathes behind the popup',
    description: 'Continuously lightens and darkens a visible overlay, adding life to an endcard that waits for a tap.',
    signature: 'overlayPulse(overlay, options?)',
    continuous: true,
    setup: POPUP_SETUP,
    params: [duration(1600), num('strength', 'strength', 0.35, 0.05, 1, 0.05), ...CTA_TEXT_PARAMS],
    args: (v, options) => [overlay, options(['duration', 'strength'])],
    run: (a, v) => pua.overlayPulse(overlayOf(a), { duration: n(v.duration), strength: n(v.strength) })
  },
  {
    id: 'buttonPress',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Tap feedback: press down and release',
    description:
      'Gives tap feedback: the button quickly presses down to the given depth and springs back with a tiny overshoot. Call it from the pointer handler.',
    signature: 'buttonPress(button, options?)',
    params: [
      duration(180),
      num('depth', 'press depth (scale)', 0.9, 0.5, 1, 0.05),
      num('overshoot', 'overshoot', 0.08, 0, 0.5, 0.01),
      easing('linear')
    ],
    args: (v, options) => [button, options(['duration', 'depth', 'overshoot', 'easing'])],
    run: (a, v, done) =>
      pua.buttonPress(a.target, {
        duration: n(v.duration),
        depth: n(v.depth),
        onComplete: done,
        overshoot: n(v.overshoot),
        easing: ease(v.easing)
      })
  },
  {
    id: 'buttonIdle',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Idle attention loop: breathe and tilt',
    description:
      'Continuous idle animation for a call-to-action button: a gentle breathing scale combined with a small rotational tilt.',
    signature: 'buttonIdle(button, options?)',
    continuous: true,
    params: [duration(1200), num('strength', 'strength', 0.06, 0, 0.3, 0.01), num('tilt', 'tilt (deg)', 2, 0, 10, 0.5)],
    args: (v, options) => [button, options(['duration', 'strength', 'tilt'])],
    run: (a, v) => pua.buttonIdle(a.target, { duration: n(v.duration), strength: n(v.strength), tilt: n(v.tilt) })
  },
  {
    id: 'buttonHop',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Periodic small hop',
    description: 'Continuous attention animation: the button hops up and lands with a bounce once per interval.',
    signature: 'buttonHop(button, options?)',
    continuous: true,
    params: [interval(1800), num('height', 'height (px)', 14, 0, 60, 2), duration(600)],
    args: (v, options) => [button, options(['interval', 'height', 'duration'])],
    run: (a, v) => pua.buttonHop(a.target, { interval: n(v.interval), height: n(v.height), duration: n(v.duration) })
  },
  {
    id: 'buttonDown',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Press and hold down',
    description:
      'Pointer-down half of the tap feedback: the button scales down to the press depth and stays there until buttonUp is called.',
    signature: 'buttonDown(button, options?)',
    setup: ['// on pointerdown'],
    params: [duration(120), num('depth', 'press depth (scale)', 0.9, 0.5, 1, 0.05), easing('quadOut')],
    args: (v, options) => [button, options(['duration', 'depth', 'easing'])],
    run: (a, v, done) =>
      pua.buttonDown(a.target, { duration: n(v.duration), depth: n(v.depth), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'buttonUp',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Release and spring back',
    description:
      'Pointer-up half of the tap feedback: the button springs back from its pressed scale to normal with a tiny overshoot. Call buttonDown first.',
    signature: 'buttonUp(button, options?)',
    setup: ['// on pointerup, after buttonDown(button)'],
    params: [duration(220), num('overshoot', 'overshoot', 0.08, 0, 0.5, 0.01), easing('linear')],
    args: (v, options) => [button, options(['duration', 'overshoot', 'easing'])],
    run: (a, v, done) => {
      a.target.scale.set(a.target.scale.x * 0.9, a.target.scale.y * 0.9);
      pua.buttonUp(a.target, {
        duration: n(v.duration),
        overshoot: n(v.overshoot),
        easing: ease(v.easing),
        onComplete: done
      });
    }
  },
  {
    id: 'buttonWiggle',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Periodic rotational wiggle',
    description: 'Continuous attention animation: the button wiggles left and right once per interval, then rests.',
    signature: 'buttonWiggle(button, options?)',
    continuous: true,
    params: [interval(2000), num('angle', 'angle (deg)', 6, 1, 20, 1), num('wiggles', 'wiggles', 3, 1, 8, 1), duration(600)],
    args: (v, options) => [button, options(['interval', 'angle', 'wiggles', 'duration'])],
    run: (a, v) =>
      pua.buttonWiggle(a.target, {
        interval: n(v.interval),
        angle: n(v.angle),
        wiggles: n(v.wiggles),
        duration: n(v.duration)
      })
  },
  {
    id: 'buttonSqueeze',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Periodic squash and stretch',
    description: 'Continuous attention animation: the button squashes and stretches once per interval, then rests.',
    signature: 'buttonSqueeze(button, options?)',
    continuous: true,
    params: [interval(2000), num('strength', 'strength', 0.12, 0.02, 0.4, 0.02), duration(450)],
    args: (v, options) => [button, options(['interval', 'strength', 'duration'])],
    run: (a, v) => pua.buttonSqueeze(a.target, { interval: n(v.interval), strength: n(v.strength), duration: n(v.duration) })
  },
  {
    id: 'buttonIn',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Button rises in with a pop',
    description:
      'Entrance for a button: it rises the given distance into place while fading in and growing with a small overshoot.',
    signature: 'buttonIn(button, options?)',
    params: [duration(450), num('lift', 'rise (px)', 24, 0, 120, 2), num('scale', 'start scale', 0.6, 0, 1, 0.05)],
    args: (v, options) => [button, options(['duration', 'lift', 'scale'])],
    run: (a, v, done) =>
      pua.buttonIn(a.target, { duration: n(v.duration), lift: n(v.lift), onComplete: done, scale: n(v.scale) })
  },
  {
    id: 'buttonOut',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Button shrinks away and hides',
    description:
      'Exit for a button: it winds up slightly, shrinks to nothing while fading out and is hidden. A following buttonIn brings it back.',
    signature: 'buttonOut(button, options?)',
    params: [duration(280), easing('backIn')],
    args: (v, options) => [button, options(['duration', 'easing'])],
    run: (a, v, done) => pua.buttonOut(a.target, { duration: n(v.duration), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'buttonPop',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Success feedback: puff up and settle',
    description:
      'Positive tap feedback: the button puffs up and settles back with a small overshoot. Use it when the action succeeded.',
    signature: 'buttonPop(button, options?)',
    params: [duration(300), num('strength', 'strength', 0.15, 0.05, 0.6, 0.05), easing('linear')],
    args: (v, options) => [button, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.buttonPop(a.target, { duration: n(v.duration), strength: n(v.strength), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'buttonShake',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Denied feedback: horizontal shake',
    description: 'Negative tap feedback: a quick decaying horizontal shake for locked, disabled or unaffordable actions.',
    signature: 'buttonShake(button, options?)',
    params: [
      duration(400),
      num('amplitude', 'amplitude (px)', 8, 1, 40, 1),
      num('shakes', 'shakes', 6, 1, 14, 1),
      easing('linear')
    ],
    args: (v, options) => [button, options(['duration', 'amplitude', 'shakes', 'easing'])],
    run: (a, v, done) =>
      pua.buttonShake(a.target, {
        duration: n(v.duration),
        amplitude: n(v.amplitude),
        shakes: n(v.shakes),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'buttonPulse',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Periodic double beat',
    description: 'Continuous attention animation: the button beats twice like a heart, then rests until the next interval.',
    signature: 'buttonPulse(button, options?)',
    continuous: true,
    params: [
      interval(1600),
      num('strength', 'strength', 0.1, 0.02, 0.4, 0.02),
      num('duration', 'duration (ms)', 520, 100, 2000, 20)
    ],
    args: (v, options) => [button, options(['interval', 'strength', 'duration'])],
    run: (a, v) => pua.buttonPulse(a.target, { interval: n(v.interval), strength: n(v.strength), duration: n(v.duration) })
  },
  {
    id: 'buttonFloat',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Gentle continuous hover',
    description:
      'Continuous idle: the button drifts up and down by the given height. Calm enough to run next to other motion.',
    signature: 'buttonFloat(button, options?)',
    continuous: true,
    params: [duration(1800), num('height', 'height (px)', 6, 1, 40, 1)],
    args: (v, options) => [button, options(['duration', 'height'])],
    run: (a, v) => pua.buttonFloat(a.target, { duration: n(v.duration), height: n(v.height) })
  },
  {
    id: 'buttonTada',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Periodic grow and wiggle',
    description: 'Continuous attention animation: once per interval the button grows slightly while wiggling, then rests.',
    signature: 'buttonTada(button, options?)',
    continuous: true,
    params: [
      interval(2400),
      num('strength', 'strength', 0.1, 0.02, 0.4, 0.02),
      num('angle', 'angle (deg)', 5, 0, 20, 1),
      duration(700),
      num('wiggles', 'wiggles', 5, 1, 12, 1)
    ],
    args: (v, options) => [button, options(['interval', 'strength', 'angle', 'duration', 'wiggles'])],
    run: (a, v) =>
      pua.buttonTada(a.target, {
        interval: n(v.interval),
        strength: n(v.strength),
        angle: n(v.angle),
        duration: n(v.duration),
        wiggles: n(v.wiggles)
      })
  },
  {
    id: 'buttonBlink',
    group: 'Button',
    demo: 'button',
    ident: 'button',
    summary: 'Soft alpha blink',
    description:
      'Continuously fades the button down to the given alpha and back. The soft version of a "tap to continue" blink.',
    signature: 'buttonBlink(button, options?)',
    continuous: true,
    params: [duration(1200), num('alpha', 'lowest alpha', 0.4, 0, 0.9, 0.05)],
    args: (v, options) => [button, options(['duration', 'alpha'])],
    run: (a, v) => pua.buttonBlink(a.target, { duration: n(v.duration), alpha: n(v.alpha) })
  },
  {
    id: 'tutorialTap',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand taps in place',
    description:
      'Continuous tutorial gesture: the hand presses down and releases once per interval. Place the hand over the element the player should tap.',
    signature: 'tutorialTap(hand, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Idle', 'Card'],
    params: [interval(1100), duration(300), num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)],
    args: (v, options) => [hand, options(['interval', 'duration', 'depth'])],
    run: (a, v) => pua.tutorialTap(a.target, { interval: n(v.interval), duration: n(v.duration), depth: n(v.depth) })
  },
  {
    id: 'tutorialSwipe',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand swipes in a direction',
    description:
      'Continuous tutorial gesture: the hand fades in, swipes the given distance in the given direction, fades out and repeats from its starting position.',
    signature: 'tutorialSwipe(hand, direction, distance, options?)',
    continuous: true,
    games: ['Runner', 'Puzzle', 'Match-3', 'Racing'],
    params: [direction('left'), num('distance', 'distance (px)', 120, 20, 300, 10), interval(1400), duration(700)],
    args: (v, options) => [hand, String(v.direction), v.distance, options(['interval', 'duration'])],
    run: (a, v) =>
      pua.tutorialSwipe(a.target, dir(v.direction), n(v.distance), { interval: n(v.interval), duration: n(v.duration) })
  },
  {
    id: 'tutorialDrag',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand drags to a position',
    description:
      'Continuous tutorial gesture: the hand presses, drags to the given position in its parent container, releases, fades out and repeats from its starting position.',
    signature: 'tutorialDrag(hand, x, y, options?)',
    continuous: true,
    games: ['Merge', 'Match-3', 'Puzzle', 'Strategy', 'Word'],
    params: [
      num('x', 'x', -90, -250, 250, 10),
      num('y', 'y', -50, -120, 120, 10),
      interval(1800),
      duration(1000),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)
    ],
    args: (v, options) => [hand, v.x, v.y, options(['interval', 'duration', 'depth'])],
    run: (a, v) =>
      pua.tutorialDrag(a.target, n(v.x), n(v.y), { interval: n(v.interval), duration: n(v.duration), depth: n(v.depth) })
  },
  {
    id: 'tutorialPoint',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand nudges toward a direction',
    description:
      'Continuous tutorial gesture: the hand gently nudges back and forth toward the given direction to point at something.',
    signature: 'tutorialPoint(hand, options?)',
    continuous: true,
    games: ['Puzzle', 'Strategy', 'RPG'],
    params: [direction('bottom'), num('distance', 'distance (px)', 14, 2, 60, 2), duration(900)],
    args: (v, options) => [hand, options(['direction', 'distance', 'duration'])],
    run: (a, v) =>
      pua.tutorialPoint(a.target, { direction: dir(v.direction), distance: n(v.distance), duration: n(v.duration) })
  },
  {
    id: 'tutorialDoubleTap',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand double-taps in place',
    description: 'Continuous tutorial gesture: two quick presses per interval.',
    signature: 'tutorialDoubleTap(hand, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Card'],
    params: [
      interval(1400),
      duration(160),
      num('gap', 'gap (ms)', 120, 40, 400, 10),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)
    ],
    args: (v, options) => [hand, options(['interval', 'duration', 'gap', 'depth'])],
    run: (a, v) =>
      pua.tutorialDoubleTap(a.target, {
        interval: n(v.interval),
        duration: n(v.duration),
        gap: n(v.gap),
        depth: n(v.depth)
      })
  },
  {
    id: 'tutorialHold',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand presses and holds',
    description:
      'Continuous tutorial gesture: the hand presses, holds for the given time and releases. For charge, hold-to-fill and long-press mechanics.',
    signature: 'tutorialHold(hand, options?)',
    continuous: true,
    games: ['Idle', 'Shooter', 'Strategy', 'RPG'],
    params: [
      interval(2000),
      num('hold', 'hold (ms)', 800, 100, 3000, 50),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05),
      num('press', 'press (ms)', 150, 50, 600, 10)
    ],
    args: (v, options) => [hand, options(['interval', 'hold', 'depth', 'press'])],
    run: (a, v) =>
      pua.tutorialHold(a.target, { interval: n(v.interval), hold: n(v.hold), depth: n(v.depth), press: n(v.press) })
  },
  {
    id: 'tutorialCircle',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand circles around a point',
    description:
      'Continuous tutorial gesture: the hand moves in a circle below its position, for rotate, stir and scrub mechanics.',
    signature: 'tutorialCircle(hand, options?)',
    continuous: true,
    games: ['Puzzle', 'Casual', 'Idle'],
    params: [duration(1600), num('radius', 'radius (px)', 50, 10, 150, 5), toggle('clockwise', 'clockwise', true)],
    args: (v, options) => [hand, options(['duration', 'radius', 'clockwise'])],
    run: (a, v) =>
      pua.tutorialCircle(a.target, { duration: n(v.duration), radius: n(v.radius), clockwise: Boolean(v.clockwise) })
  },
  {
    id: 'tutorialPath',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand drags along a path',
    description:
      'Continuous tutorial gesture: the hand presses, drags through the given points in order, releases and fades out. For connect-the-dots, match lines and draw mechanics.',
    signature: 'tutorialPath(hand, points, options?)',
    continuous: true,
    games: ['Match-3', 'Puzzle', 'Word', 'Strategy'],
    setup: POINTS_PATH_SETUP,
    params: [interval(2600), duration(1800), num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)],
    args: (v, options) => [hand, points, options(['interval', 'duration', 'depth'])],
    run: (a, v) =>
      pua.tutorialPath(a.target, TUTORIAL_PATH, { interval: n(v.interval), duration: n(v.duration), depth: n(v.depth) })
  },
  {
    id: 'tutorialTapSequence',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand taps several points in order',
    description:
      'Continuous tutorial gesture: the hand taps at its position, moves to each point and taps there, then fades out and starts over.',
    signature: 'tutorialTapSequence(hand, points, options?)',
    continuous: true,
    games: ['Puzzle', 'Strategy', 'Card', 'Word'],
    setup: POINTS_TAPS_SETUP,
    params: [
      interval(2400),
      num('tapDuration', 'tap (ms)', 300, 100, 800, 20),
      num('moveDuration', 'move (ms)', 350, 100, 1000, 25),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)
    ],
    args: (v, options) => [hand, points, options(['interval', 'tapDuration', 'moveDuration', 'depth'])],
    run: (a, v) =>
      pua.tutorialTapSequence(a.target, TUTORIAL_TAPS, {
        interval: n(v.interval),
        tapDuration: n(v.tapDuration),
        moveDuration: n(v.moveDuration),
        depth: n(v.depth)
      })
  },
  {
    id: 'tutorialScrub',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand rubs back and forth',
    description:
      'Continuous tutorial gesture: the hand stays pressed and moves the given distance back and forth. For scratch, clean, rub and slider mechanics.',
    signature: 'tutorialScrub(hand, direction, distance, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Idle'],
    params: [
      direction('right'),
      num('distance', 'distance (px)', 80, 10, 300, 10),
      duration(900),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)
    ],
    args: (v, options) => [hand, String(v.direction), v.distance, options(['duration', 'depth'])],
    run: (a, v) =>
      pua.tutorialScrub(a.target, dir(v.direction), n(v.distance), { duration: n(v.duration), depth: n(v.depth) })
  },
  {
    id: 'tutorialFlick',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand presses and flicks',
    description:
      'Continuous tutorial gesture: the hand presses, flicks quickly in the given direction and fades out. For throw, launch and slingshot mechanics.',
    signature: 'tutorialFlick(hand, direction, distance, options?)',
    continuous: true,
    games: ['Shooter', 'Casual', 'Runner', 'Racing'],
    params: [
      direction('top'),
      num('distance', 'distance (px)', 110, 20, 300, 10),
      interval(1500),
      duration(550),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)
    ],
    args: (v, options) => [hand, String(v.direction), v.distance, options(['interval', 'duration', 'depth'])],
    run: (a, v) =>
      pua.tutorialFlick(a.target, dir(v.direction), n(v.distance), {
        interval: n(v.interval),
        duration: n(v.duration),
        depth: n(v.depth)
      })
  },
  {
    id: 'tutorialArc',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand drags along an arc',
    description:
      'Continuous tutorial gesture: the hand presses, drags to the given position along an arc of the given height, releases and fades out. For aim, toss and jump mechanics.',
    signature: 'tutorialArc(hand, x, y, options?)',
    continuous: true,
    games: ['Shooter', 'Casual', 'Puzzle', 'Strategy'],
    params: [
      num('x', 'x', -90, -250, 250, 10),
      num('y', 'y', 30, -120, 120, 10),
      interval(1800),
      duration(1000),
      num('height', 'arc height (px)', 60, 0, 200, 5),
      num('depth', 'press depth (scale)', 0.85, 0.5, 1, 0.05)
    ],
    args: (v, options) => [hand, v.x, v.y, options(['interval', 'duration', 'height', 'depth'])],
    run: (a, v) =>
      pua.tutorialArc(a.target, n(v.x), n(v.y), {
        interval: n(v.interval),
        duration: n(v.duration),
        height: n(v.height),
        depth: n(v.depth)
      })
  },
  {
    id: 'tutorialWave',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand waves for attention',
    description:
      'Continuous tutorial gesture: once per interval the hand waves side to side, then rests. A friendly "over here" cue.',
    signature: 'tutorialWave(hand, options?)',
    continuous: true,
    games: ['Casual', 'Idle', 'RPG'],
    params: [interval(1800), num('angle', 'angle (deg)', 14, 2, 45, 1), num('waves', 'waves', 2, 1, 5, 1), duration(900)],
    args: (v, options) => [hand, options(['interval', 'angle', 'waves', 'duration'])],
    run: (a, v) =>
      pua.tutorialWave(a.target, { interval: n(v.interval), angle: n(v.angle), waves: n(v.waves), duration: n(v.duration) })
  },
  {
    id: 'tutorialFigureEight',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand traces a figure eight',
    description:
      'Continuous tutorial gesture: the hand traces a figure eight around its position. For draw, stir and free-move mechanics.',
    signature: 'tutorialFigureEight(hand, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Idle'],
    params: [duration(2200), num('width', 'width (px)', 120, 20, 300, 10), num('height', 'height (px)', 50, 10, 200, 5)],
    args: (v, options) => [hand, options(['duration', 'width', 'height'])],
    run: (a, v) => pua.tutorialFigureEight(a.target, { duration: n(v.duration), width: n(v.width), height: n(v.height) })
  },
  {
    id: 'tutorialIn',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand slides into view',
    description:
      'Shows the tutorial hand: it fades in while sliding onto its position from the given side. Play it before a looping gesture.',
    signature: 'tutorialIn(hand, options?)',
    params: [duration(350), direction('bottom'), num('distance', 'distance (px)', 40, 0, 200, 5), easing('cubicOut')],
    args: (v, options) => [hand, options(['duration', 'direction', 'distance', 'easing'])],
    run: (a, v, done) =>
      pua.tutorialIn(a.target, {
        duration: n(v.duration),
        direction: dir(v.direction),
        distance: n(v.distance),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'tutorialOut',
    group: 'Tutorial',
    demo: 'tutorial',
    ident: 'hand',
    summary: 'Hand slides away and hides',
    description:
      'Hides the tutorial hand: it fades out while sliding toward the given side. Play it once the player has made the move.',
    signature: 'tutorialOut(hand, options?)',
    params: [duration(300), direction('bottom'), num('distance', 'distance (px)', 40, 0, 200, 5), easing('cubicIn')],
    args: (v, options) => [hand, options(['duration', 'direction', 'distance', 'easing'])],
    run: (a, v, done) =>
      pua.tutorialOut(a.target, {
        duration: n(v.duration),
        direction: dir(v.direction),
        distance: n(v.distance),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'typewriter',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Reveal text character by character',
    description:
      'Reveals a PIXI.Text character by character (or word by word) over the given duration. The full string is kept, so stopping the animation shows the complete text.',
    signature: 'typewriter(text, duration, options?)',
    games: ['RPG', 'Word', 'Strategy'],
    setup: TEXT_SETUP,
    params: [
      TEXT_PARAM,
      duration(900),
      select('by', 'reveal by', 'char', ['char', 'word']),
      select('cursor', 'cursor', 'none', ['none', '|', '_']),
      num('cursorBlink', 'cursor blink (ms)', 250, 50, 1000, 50)
    ],
    args: (v, options) => [text, v.duration, options(['by', 'cursor', 'cursorBlink'])],
    run: (a, v, done) =>
      pua.typewriter(txt(a), n(v.duration), {
        by: v.by as 'char' | 'word',
        cursor: v.cursor === 'none' ? undefined : String(v.cursor),
        onComplete: done,
        cursorBlink: n(v.cursorBlink)
      })
  },
  {
    id: 'scramble',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Decode from random characters',
    description:
      'Starts with random characters and resolves them into the real text from left to right, like a decoding terminal. Spaces are preserved.',
    signature: 'scramble(text, duration, options?)',
    games: ['Shooter', 'Puzzle', 'Word'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, duration(900), easing('quadOut')],
    args: (v, options) => [text, v.duration, options(['easing'])],
    run: (a, v, done) => pua.scramble(txt(a), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'countTo',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Count a number up or down',
    description:
      'Animates a number in a PIXI.Text from the current value (or from) to the target value. Supports decimals, a thousands separator and prefix/suffix strings for scores, coins and timers.',
    signature: 'countTo(text, to, duration, options?)',
    games: ['Idle', 'Merge', 'RPG', 'Racing', 'Shooter'],
    params: [
      num('to', 'to', 1000, -10000, 10000, 10),
      duration(1200),
      num('from', 'from', 0, -10000, 10000, 10),
      num('decimals', 'decimals', 0, 0, 3, 1),
      easing('quadOut')
    ],
    args: (v, options) => [text, v.to, v.duration, options(['from', 'decimals', 'easing'])],
    run: (a, v, done) =>
      pua.countTo(txt(a), n(v.to), n(v.duration), {
        from: n(v.from),
        decimals: n(v.decimals),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'trackIn',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Letters slide together while fading in',
    description:
      'Cinematic title entrance: the letters start spread apart by the extra spacing and slide together while the text fades in.',
    signature: 'trackIn(text, duration, options?)',
    games: ['Casual', 'Runner', 'Racing', 'RPG'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, duration(600), num('spacing', 'extra spacing (px)', 24, 2, 80, 2), easing('cubicOut')],
    args: (v, options) => [text, v.duration, options(['spacing', 'easing'])],
    run: (a, v, done) =>
      pua.trackIn(txt(a), n(v.duration), { spacing: n(v.spacing), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'trackOut',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Letters spread apart while fading out',
    description:
      'Cinematic title exit: the letters spread apart by the extra spacing while the text fades out. The original spacing is restored at the end.',
    signature: 'trackOut(text, duration, options?)',
    games: ['Casual', 'Runner', 'Racing', 'RPG'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, duration(500), num('spacing', 'extra spacing (px)', 24, 2, 80, 2), easing('cubicIn')],
    args: (v, options) => [text, v.duration, options(['spacing', 'easing'])],
    run: (a, v, done) =>
      pua.trackOut(txt(a), n(v.duration), { spacing: n(v.spacing), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'textColor',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Tween the text fill color',
    description:
      'Smoothly changes the fill color of a PIXI.Text to the given color. Useful for highlights, warnings and state changes.',
    signature: 'textColor(text, color, duration, options?)',
    games: ['Word', 'Puzzle', 'Match-3', 'RPG'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, color('color', 'color', 0x7c5cff), duration(500), easing('quadOut')],
    args: (v, options) => [text, { hex: n(v.color) }, v.duration, options(['easing'])],
    run: (a, v, done) => pua.textColor(txt(a), n(v.color), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'backspace',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Delete text character by character',
    description:
      'The exit twin of typewriter: removes the text from the end, character by character (or word by word), until it is empty.',
    signature: 'backspace(text, duration, options?)',
    games: ['RPG', 'Word', 'Strategy'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, duration(700), select('by', 'delete by', 'char', ['char', 'word'])],
    args: (v, options) => [text, v.duration, options(['by'])],
    run: (a, v, done) => pua.backspace(txt(a), n(v.duration), { by: v.by as 'char' | 'word', onComplete: done })
  },
  {
    id: 'textCycle',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Cycle through words with a fade',
    description:
      'Continuously cycles the text through a list of words, fading out and in between them. For rotating hints like "TAP!", "SWIPE!", "WIN!".',
    signature: 'textCycle(text, words, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Runner'],
    setup: WORDS_SETUP,
    params: [textParam('words', 'words (comma separated)', 'TAP!,PLAY!,WIN!'), interval(1500), duration(300)],
    args: (v, options) => [text, words, options(['interval', 'duration'])],
    run: (a, v) => pua.textCycle(txt(a), wordList(v.words), { interval: n(v.interval), duration: n(v.duration) })
  },
  {
    id: 'countdown',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: '3, 2, 1, GO! with a punch',
    description:
      'Counts down from the given number once per interval, punching the scale on every step, and ends on the final word.',
    signature: 'countdown(text, options?)',
    replayInterval: 4400,
    games: ['Racing', 'Runner', 'Shooter', 'Casual'],
    params: [
      num('from', 'from', 3, 1, 10, 1),
      interval(800),
      textParam('end', 'final word', 'GO!'),
      num('punch', 'punch', 0.3, 0, 1, 0.05)
    ],
    args: (v, options) => [text, options(['from', 'interval', 'end', 'punch'])],
    run: (a, v, done) =>
      pua.countdown(txt(a), {
        from: n(v.from),
        interval: n(v.interval),
        end: String(v.end),
        punch: n(v.punch),
        onComplete: done
      })
  },
  {
    id: 'textColorPulse',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Pulse between two fill colors',
    description: 'Continuously fades the fill color to the given color and back.',
    signature: 'textColorPulse(text, color, options?)',
    continuous: true,
    games: ['Word', 'Puzzle', 'Match-3', 'Idle'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, color('color', 'color', 0x7c5cff), duration(1000)],
    args: (v, options) => [text, { hex: n(v.color) }, options(['duration'])],
    run: (a, v) => pua.textColorPulse(txt(a), n(v.color), { duration: n(v.duration) })
  },
  {
    id: 'textStrokePulse',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Pulse the outline thickness',
    description: 'Continuously thickens and thins the text stroke, optionally recoloring it. A cheap glow for titles.',
    signature: 'textStrokePulse(text, options?)',
    continuous: true,
    games: ['RPG', 'Shooter', 'Casual'],
    setup: TEXT_SETUP,
    params: [
      TEXT_PARAM,
      duration(1000),
      num('thickness', 'thickness (px)', 10, 1, 30, 1),
      color('color', 'stroke color', 0x15172e)
    ],
    args: (v, options) => [text, options(['duration', 'thickness', 'color'])],
    run: (a, v) => pua.textStrokePulse(txt(a), { duration: n(v.duration), thickness: n(v.thickness), color: n(v.color) })
  },
  {
    id: 'textSwap',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Change the text with a pop',
    description:
      'Replaces the text content mid-animation: the text shrinks away, switches to the new value and pops back. For labels, scores and status changes.',
    signature: 'textSwap(text, value, options?)',
    games: ['Word', 'Puzzle', 'Casual', 'Idle'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, textParam('value', 'new text', 'YOU WIN!'), duration(320), easing('linear')],
    args: (v, options) => [text, String(v.value), options(['duration', 'easing'])],
    run: (a, v, done) =>
      pua.textSwap(txt(a), String(v.value), { duration: n(v.duration), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'textTimer',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Countdown clock in m:ss',
    description:
      'Runs a real-time countdown from the given number of seconds to zero, formatted as m:ss or plain seconds. For limited offers and round timers.',
    signature: 'textTimer(text, seconds, options?)',
    replayInterval: 6000,
    games: ['Racing', 'Puzzle', 'Runner', 'Strategy', 'Shooter'],
    params: [num('seconds', 'seconds', 5, 1, 120, 1), select('format', 'format', 'mm:ss', ['mm:ss', 'ss'])],
    args: (v, options) => [text, v.seconds, options(['format'])],
    run: (a, v, done) => pua.textTimer(txt(a), n(v.seconds), { format: v.format as 'mm:ss' | 'ss', onComplete: done })
  },
  {
    id: 'ellipsis',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Animated trailing dots',
    description:
      'Continuously appends one, two, three dots to the text, the classic "LOADING..." indicator. Works best on left-anchored text.',
    signature: 'ellipsis(text, options?)',
    continuous: true,
    games: ['Casual', 'Idle', 'RPG', 'Strategy'],
    setup: TEXT_SETUP,
    params: [
      textParam('content', 'text', 'LOADING'),
      num('interval', 'interval (ms)', 350, 100, 2000, 50),
      num('count', 'dots', 3, 1, 6, 1)
    ],
    args: (v, options) => [text, options(['interval', 'count'])],
    run: (a, v) => pua.ellipsis(txt(a), { interval: n(v.interval), count: n(v.count) })
  },
  {
    id: 'typeCycle',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Type, hold, delete, next word',
    description:
      'Continuously types each word of a list, holds it, deletes it and moves on to the next one. For rotating taglines and hints.',
    signature: 'typeCycle(text, words, options?)',
    continuous: true,
    games: ['Word', 'Casual', 'RPG', 'Strategy'],
    setup: WORDS_SETUP,
    params: [
      textParam('words', 'words (comma separated)', 'TAP!,PLAY!,WIN!'),
      num('speed', 'speed (ms per letter)', 70, 20, 300, 10),
      num('hold', 'hold (ms)', 900, 100, 3000, 100),
      select('cursor', 'cursor', 'none', ['none', '|', '_'])
    ],
    args: (v, options) => [text, words, options(['speed', 'hold', 'cursor'])],
    run: (a, v) =>
      pua.typeCycle(txt(a), wordList(v.words), {
        speed: n(v.speed),
        hold: n(v.hold),
        cursor: v.cursor === 'none' ? undefined : String(v.cursor)
      })
  },
  {
    id: 'textRainbow',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Cycle the fill through the rainbow',
    description:
      'Continuously shifts the fill color around the hue wheel. For jackpots, combos and anything that should feel special.',
    signature: 'textRainbow(text, options?)',
    continuous: true,
    games: ['Casual', 'Match-3', 'Merge', 'Idle'],
    setup: TEXT_SETUP,
    params: [
      TEXT_PARAM,
      duration(2400),
      num('saturation', 'saturation', 0.9, 0, 1, 0.05),
      num('lightness', 'lightness', 0.6, 0.1, 0.9, 0.05)
    ],
    args: (v, options) => [text, options(['duration', 'saturation', 'lightness'])],
    run: (a, v) =>
      pua.textRainbow(txt(a), { duration: n(v.duration), saturation: n(v.saturation), lightness: n(v.lightness) })
  },
  {
    id: 'textFlash',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Flash the fill to a color and back',
    description:
      'One-shot highlight: the fill flashes to the given color the given number of times and returns to its own color.',
    signature: 'textFlash(text, color, options?)',
    games: ['Word', 'Shooter', 'Racing', 'Idle'],
    setup: TEXT_SETUP,
    params: [
      TEXT_PARAM,
      color('color', 'color', 0xffffff),
      duration(500),
      num('flashes', 'flashes', 2, 1, 8, 1),
      easing('linear')
    ],
    args: (v, options) => [text, { hex: n(v.color) }, options(['duration', 'flashes', 'easing'])],
    run: (a, v, done) =>
      pua.textFlash(txt(a), n(v.color), {
        duration: n(v.duration),
        flashes: n(v.flashes),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'slotCount',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Slot-machine digits lock in',
    description:
      'Spins every digit randomly and locks them in from left to right until the target number shows. For prizes, jackpots and big reveals.',
    signature: 'slotCount(text, to, duration, options?)',
    games: ['Casual', 'Idle', 'Card', 'Merge'],
    params: [num('to', 'to', 777, 0, 999999, 1), duration(1200), num('digits', 'min digits', 0, 0, 8, 1), easing('quadOut')],
    args: (v, options) => [text, v.to, v.duration, options(['digits', 'easing'])],
    run: (a, v, done) =>
      pua.slotCount(txt(a), n(v.to), n(v.duration), { digits: n(v.digits), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'trackPulse',
    group: 'Text',
    demo: 'text',
    ident: 'text',
    summary: 'Letter spacing breathes',
    description: 'Continuously widens and narrows the letter spacing. A calm idle for titles and taglines.',
    signature: 'trackPulse(text, options?)',
    continuous: true,
    games: ['RPG', 'Strategy', 'Word'],
    setup: TEXT_SETUP,
    params: [TEXT_PARAM, duration(1600), num('spacing', 'extra spacing (px)', 8, 1, 40, 1)],
    args: (v, options) => [text, options(['duration', 'spacing'])],
    run: (a, v) => pua.trackPulse(txt(a), { duration: n(v.duration), spacing: n(v.spacing) })
  },
  {
    id: 'shine',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Light sweep across the surface',
    description:
      'Sweeps a soft band of light across the object, the classic call-to-action shine. Runs once by default; pass interval (ms) to repeat it continuously.',
    signature: 'shine(button, options?)',
    params: [
      duration(900),
      num('width', 'band width', 0.25, 0.05, 0.8, 0.05),
      num('angle', 'angle (deg)', 25, -90, 90, 5),
      color('color', 'color', 0xffffff),
      num('strength', 'strength', 0.8, 0.1, 2, 0.1)
    ],
    args: (v, options) => [button, options(['duration', 'width', 'angle', 'color', 'strength'])],
    run: (a, v, done) =>
      pua.shine(a.target, {
        duration: n(v.duration),
        width: n(v.width),
        angle: n(v.angle),
        color: n(v.color),
        strength: n(v.strength),
        onComplete: done
      })
  },
  {
    id: 'glowPulse',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Pulsing outer glow',
    description:
      'Continuous soft glow around the object edges that pulses in and out. Great for highlighting the active CTA.',
    signature: 'glowPulse(button, options?)',
    continuous: true,
    params: [
      duration(1200),
      color('color', 'color', 0x7c5cff),
      num('radius', 'radius (px)', 12, 2, 40, 1),
      num('strength', 'strength', 1, 0.1, 2, 0.1)
    ],
    args: (v, options) => [button, options(['duration', 'color', 'radius', 'strength'])],
    run: (a, v) =>
      pua.glowPulse(a.target, { duration: n(v.duration), color: n(v.color), radius: n(v.radius), strength: n(v.strength) })
  },
  {
    id: 'hitFlash',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Flash to a solid color and back',
    description:
      'Tints the whole object to a solid color and back, the classic damage or hit flash. Combine with shake for impact.',
    signature: 'hitFlash(target, options?)',
    games: ['Shooter', 'RPG', 'Runner'],
    params: [duration(220), color('color', 'color', 0xffffff), num('flashes', 'flashes', 1, 1, 6, 1), easing('linear')],
    args: (v, options) => [target, options(['duration', 'color', 'flashes', 'easing'])],
    run: (a, v, done) =>
      pua.hitFlash(a.target, {
        duration: n(v.duration),
        color: n(v.color),
        flashes: n(v.flashes),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'glitch',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Digital glitch: slices and RGB split',
    description:
      'Short digital glitch: horizontal slices jump sideways and the color channels split, peaking mid-way and settling back.',
    signature: 'glitch(target, options?)',
    games: ['Shooter', 'RPG', 'Strategy'],
    params: [
      duration(500),
      num('strength', 'strength', 1, 0.1, 2, 0.1),
      num('slices', 'slices', 12, 2, 40, 1),
      num('speed', 'speed (changes per second)', 20, 1, 60, 1),
      num('split', 'RGB split (px)', 4, 0, 30, 1),
      num('shift', 'slice shift', 0.25, 0, 1, 0.05),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'strength', 'slices', 'speed', 'split', 'shift', 'easing'])],
    run: (a, v, done) =>
      pua.glitch(a.target, {
        duration: n(v.duration),
        strength: n(v.strength),
        slices: n(v.slices),
        onComplete: done,
        speed: n(v.speed),
        split: n(v.split),
        shift: n(v.shift),
        easing: ease(v.easing)
      })
  },
  {
    id: 'shockwave',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Radial ripple from the center',
    description: 'A ripple ring expands from the center of the object, distorting and brightening the pixels it passes.',
    signature: 'shockwave(target, options?)',
    games: ['Shooter', 'Match-3', 'Puzzle', 'Merge'],
    params: [
      duration(700),
      num('amplitude', 'amplitude (px)', 20, 2, 60, 2),
      num('width', 'ring width', 0.25, 0.05, 0.8, 0.05),
      easing('quadOut')
    ],
    args: (v, options) => [target, options(['duration', 'amplitude', 'width', 'easing'])],
    run: (a, v, done) =>
      pua.shockwave(a.target, {
        duration: n(v.duration),
        amplitude: n(v.amplitude),
        width: n(v.width),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'wave',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous flag-like wave',
    description: 'Continuously displaces the pixels in a travelling sine wave, like a flag or a banner in the wind.',
    signature: 'wave(target, options?)',
    continuous: true,
    games: ['Casual', 'Runner', 'Racing'],
    params: [duration(1500), num('amplitude', 'amplitude (px)', 6, 1, 30, 1), num('frequency', 'waves', 2, 0.5, 6, 0.5)],
    args: (v, options) => [target, options(['duration', 'amplitude', 'frequency'])],
    run: (a, v) => pua.wave(a.target, { duration: n(v.duration), amplitude: n(v.amplitude), frequency: n(v.frequency) })
  },
  {
    id: 'hueCycle',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Continuous hue rotation',
    description: 'Continuously rotates the hue of the object through the whole color wheel. One cycle per duration.',
    signature: 'hueCycle(button, options?)',
    continuous: true,
    games: ['Casual', 'Idle', 'Match-3'],
    params: [duration(2000)],
    args: (v, options) => [button, options(['duration'])],
    run: (a, v) => pua.hueCycle(a.target, { duration: n(v.duration) })
  },
  {
    id: 'dissolveIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Materialize from noise',
    description: 'Makes the object appear by growing noise-shaped patches with a colored burning edge until it is complete.',
    signature: 'dissolveIn(target, duration, options?)',
    games: ['RPG', 'Shooter', 'Strategy', 'Card'],
    params: [
      duration(700),
      num('scale', 'noise scale', 8, 1, 30, 1),
      num('edge', 'edge width', 0.08, 0.01, 0.3, 0.01),
      color('edgeColor', 'edge color', 0x7c5cff)
    ],
    args: (v, options) => [target, v.duration, options(['scale', 'edge', 'edgeColor'])],
    run: (a, v, done) =>
      pua.dissolveIn(a.target, n(v.duration), {
        scale: n(v.scale),
        edge: n(v.edge),
        edgeColor: n(v.edgeColor),
        onComplete: done
      })
  },
  {
    id: 'dissolveOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Burn away into noise',
    description:
      'Makes the object disappear by eating it away in noise-shaped patches with a colored burning edge. The object is hidden when done; dissolveIn brings it back.',
    signature: 'dissolveOut(target, duration, options?)',
    games: ['RPG', 'Shooter', 'Strategy', 'Card'],
    params: [
      duration(700),
      num('scale', 'noise scale', 8, 1, 30, 1),
      num('edge', 'edge width', 0.08, 0.01, 0.3, 0.01),
      color('edgeColor', 'edge color', 0x7c5cff)
    ],
    args: (v, options) => [target, v.duration, options(['scale', 'edge', 'edgeColor'])],
    run: (a, v, done) =>
      pua.dissolveOut(a.target, n(v.duration), {
        scale: n(v.scale),
        edge: n(v.edge),
        edgeColor: n(v.edgeColor),
        onComplete: done
      })
  },
  {
    id: 'pixelateIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Resolve from big pixels',
    description: 'Makes the object appear from coarse pixel blocks that shrink to full resolution while it fades in.',
    signature: 'pixelateIn(target, duration, options?)',
    games: ['Puzzle', 'Word', 'Card', 'Merge'],
    params: [duration(600), num('size', 'pixel size', 24, 2, 80, 2)],
    args: (v, options) => [target, v.duration, options(['size'])],
    run: (a, v, done) => pua.pixelateIn(a.target, n(v.duration), { size: n(v.size), onComplete: done })
  },
  {
    id: 'pixelateOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Break up into big pixels',
    description:
      'Makes the object disappear by growing its pixels into coarse blocks while it fades out. The object is hidden when done.',
    signature: 'pixelateOut(target, duration, options?)',
    games: ['Puzzle', 'Word', 'Card', 'Merge'],
    params: [duration(600), num('size', 'pixel size', 24, 2, 80, 2)],
    args: (v, options) => [target, v.duration, options(['size'])],
    run: (a, v, done) => pua.pixelateOut(a.target, n(v.duration), { size: n(v.size), onComplete: done })
  },
  {
    id: 'blurIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Focus in from a blur',
    description: 'Makes the object appear by sharpening from a heavy blur while it fades in.',
    signature: 'blurIn(target, duration, options?)',
    games: ['Casual', 'Idle', 'RPG', 'Card'],
    params: [duration(500), num('strength', 'blur strength', 12, 1, 40, 1)],
    args: (v, options) => [target, v.duration, options(['strength'])],
    run: (a, v, done) => pua.blurIn(a.target, n(v.duration), { strength: n(v.strength), onComplete: done })
  },
  {
    id: 'blurOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Blur away',
    description: 'Makes the object disappear by blurring it out while it fades. The object is hidden when done.',
    signature: 'blurOut(target, duration, options?)',
    games: ['Casual', 'Idle', 'RPG', 'Card'],
    params: [duration(500), num('strength', 'blur strength', 12, 1, 40, 1)],
    args: (v, options) => [target, v.duration, options(['strength'])],
    run: (a, v, done) => pua.blurOut(a.target, n(v.duration), { strength: n(v.strength), onComplete: done })
  },
  {
    id: 'outlinePulse',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Pulsing colored outline',
    description:
      'Continuous crisp outline around the object edges that fades in and out. A sharper alternative to glowPulse.',
    signature: 'outlinePulse(button, options?)',
    continuous: true,
    params: [
      duration(1200),
      color('color', 'color', 0x7c5cff),
      num('thickness', 'thickness (px)', 3, 1, 10, 1),
      num('strength', 'strength', 1, 0.1, 2, 0.1)
    ],
    args: (v, options) => [button, options(['duration', 'color', 'thickness', 'strength'])],
    run: (a, v) =>
      pua.outlinePulse(a.target, {
        duration: n(v.duration),
        color: n(v.color),
        thickness: n(v.thickness),
        strength: n(v.strength)
      })
  },
  {
    id: 'grayscale',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Fade to grayscale (and stay)',
    description:
      'Tweens the object to the given grayscale amount and keeps the filter while it is above zero. Call it with 0 to restore the colors. For locked, disabled or inactive items.',
    signature: 'grayscale(target, amount, duration, options?)',
    replayInterval: 2600,
    games: ['Puzzle', 'Idle', 'Card', 'Merge'],
    params: [num('amount', 'amount', 1, 0, 1, 0.05), duration(500), easing('quadOut')],
    args: (v, options) => [target, v.amount, v.duration, options(['easing'])],
    run: (a, v, done) => pua.grayscale(a.target, n(v.amount), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'scanlines',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Moving CRT scanlines',
    description: 'Continuous retro scanlines rolling over the object with a brighter band passing through.',
    signature: 'scanlines(target, options?)',
    continuous: true,
    games: ['Shooter', 'RPG', 'Strategy'],
    params: [duration(2000), num('count', 'lines', 24, 4, 80, 2), num('strength', 'strength', 0.35, 0.05, 0.8, 0.05)],
    args: (v, options) => [target, options(['duration', 'count', 'strength'])],
    run: (a, v) => pua.scanlines(a.target, { duration: n(v.duration), count: n(v.count), strength: n(v.strength) })
  },
  {
    id: 'ripple',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Continuous water ripples',
    description: 'Continuous concentric ripples spreading from the center, like a water surface.',
    signature: 'ripple(target, options?)',
    continuous: true,
    games: ['Casual', 'Puzzle', 'Idle'],
    params: [duration(1800), num('amplitude', 'amplitude (px)', 4, 1, 20, 1), num('frequency', 'rings', 3, 1, 8, 0.5)],
    args: (v, options) => [target, options(['duration', 'amplitude', 'frequency'])],
    run: (a, v) => pua.ripple(a.target, { duration: n(v.duration), amplitude: n(v.amplitude), frequency: n(v.frequency) })
  },
  {
    id: 'wipeIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Reveal with a directional wipe',
    description:
      'Reveals the object with a soft wipe from the given edge. For progress fills, unlock reveals and panel transitions.',
    signature: 'wipeIn(target, direction, duration, options?)',
    games: ['Puzzle', 'Strategy', 'Card', 'Word'],
    params: [direction('left'), duration(600), num('edge', 'edge softness', 0.1, 0, 0.5, 0.02), easing('quadOut')],
    args: (v, options) => [target, String(v.direction), v.duration, options(['edge', 'easing'])],
    run: (a, v, done) =>
      pua.wipeIn(a.target, dir(v.direction), n(v.duration), { edge: n(v.edge), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'wipeOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Hide with a directional wipe',
    description: 'Hides the object with a soft wipe toward the given edge and sets it invisible when done.',
    signature: 'wipeOut(target, direction, duration, options?)',
    games: ['Puzzle', 'Strategy', 'Card', 'Word'],
    params: [direction('right'), duration(600), num('edge', 'edge softness', 0.1, 0, 0.5, 0.02), easing('quadIn')],
    args: (v, options) => [target, String(v.direction), v.duration, options(['edge', 'easing'])],
    run: (a, v, done) =>
      pua.wipeOut(a.target, dir(v.direction), n(v.duration), { edge: n(v.edge), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'irisIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Reveal from the center outward',
    description: 'Circular iris reveal: the object appears from a growing circle in its center.',
    signature: 'irisIn(target, duration, options?)',
    games: ['Casual', 'Puzzle', 'Card'],
    params: [duration(600), num('edge', 'edge softness', 0.15, 0, 0.5, 0.02), easing('quadOut')],
    args: (v, options) => [target, v.duration, options(['edge', 'easing'])],
    run: (a, v, done) => pua.irisIn(a.target, n(v.duration), { edge: n(v.edge), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'irisOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Close into the center',
    description: 'Circular iris exit: the object disappears into a shrinking circle and is hidden when done.',
    signature: 'irisOut(target, duration, options?)',
    games: ['Casual', 'Puzzle', 'Card'],
    params: [duration(600), num('edge', 'edge softness', 0.15, 0, 0.5, 0.02), easing('quadIn')],
    args: (v, options) => [target, v.duration, options(['edge', 'easing'])],
    run: (a, v, done) => pua.irisOut(a.target, n(v.duration), { edge: n(v.edge), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'chromatic',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Pulsing RGB split',
    description:
      'Continuous chromatic aberration: the red and blue channels drift apart and back. A softer, looping cousin of glitch.',
    signature: 'chromatic(target, options?)',
    continuous: true,
    games: ['Shooter', 'RPG', 'Racing'],
    params: [duration(1400), num('strength', 'split (px)', 4, 1, 20, 1)],
    args: (v, options) => [target, options(['duration', 'strength'])],
    run: (a, v) => pua.chromatic(a.target, { duration: n(v.duration), strength: n(v.strength) })
  },
  {
    id: 'twist',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Twist around the center and back',
    description: 'Twists the pixels around the center by the given angle and untwists back, strongest in the middle.',
    signature: 'twist(target, options?)',
    games: ['Puzzle', 'Casual', 'Merge'],
    params: [
      duration(600),
      num('angle', 'angle (deg)', 180, -360, 360, 15),
      num('radius', 'radius', 1, 0.2, 1.5, 0.05),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'angle', 'radius', 'easing'])],
    run: (a, v, done) =>
      pua.twist(a.target, {
        duration: n(v.duration),
        angle: n(v.angle),
        radius: n(v.radius),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'shimmer',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Heat-haze shimmer',
    description: 'Continuous noise-based distortion, like heat haze or something seen through water.',
    signature: 'shimmer(target, options?)',
    continuous: true,
    games: ['Racing', 'RPG', 'Shooter'],
    params: [duration(3000), num('amplitude', 'amplitude (px)', 4, 1, 20, 1), num('scale', 'noise scale', 6, 1, 20, 1)],
    args: (v, options) => [target, options(['duration', 'amplitude', 'scale'])],
    run: (a, v) => pua.shimmer(a.target, { duration: n(v.duration), amplitude: n(v.amplitude), scale: n(v.scale) })
  },
  {
    id: 'bulge',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Magnify the center and relax',
    description: 'Lens bulge: the center of the object magnifies (or pinches with a negative strength) and relaxes back.',
    signature: 'bulge(target, options?)',
    games: ['Casual', 'Puzzle', 'Match-3'],
    params: [
      duration(450),
      num('strength', 'strength', 0.6, -0.9, 2, 0.1),
      num('radius', 'radius', 1, 0.2, 1.5, 0.05),
      easing('linear')
    ],
    args: (v, options) => [target, options(['duration', 'strength', 'radius', 'easing'])],
    run: (a, v, done) =>
      pua.bulge(a.target, {
        duration: n(v.duration),
        strength: n(v.strength),
        radius: n(v.radius),
        onComplete: done,
        easing: ease(v.easing)
      })
  },
  {
    id: 'invertFlash',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Flash to negative colors',
    description: 'Inverts the colors of the object and back the given number of times. A strong hit or glitch accent.',
    signature: 'invertFlash(target, options?)',
    games: ['Shooter', 'RPG', 'Runner'],
    params: [duration(250), num('flashes', 'flashes', 1, 1, 6, 1), easing('linear')],
    args: (v, options) => [target, options(['duration', 'flashes', 'easing'])],
    run: (a, v, done) =>
      pua.invertFlash(a.target, { duration: n(v.duration), flashes: n(v.flashes), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'tintTo',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Tint toward a color (and stay)',
    description:
      'Multiplies the object colors toward the given tint and keeps it. Call it with amount 0 to restore. Works on containers and text, not only sprites.',
    signature: 'tintTo(button, color, duration, options?)',
    replayInterval: 2600,
    params: [color('color', 'color', 0x6cc9ff), duration(400), num('amount', 'amount', 1, 0, 1, 0.05), easing('quadOut')],
    args: (v, options) => [button, { hex: n(v.color) }, v.duration, options(['amount', 'easing'])],
    run: (a, v, done) =>
      pua.tintTo(a.target, n(v.color), n(v.duration), { amount: n(v.amount), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'zoomBlur',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Radial speed-blur burst',
    description: 'Radial zoom blur that peaks mid-way and clears, like a speed burst or a camera punch.',
    signature: 'zoomBlur(target, options?)',
    games: ['Racing', 'Runner', 'Shooter'],
    params: [duration(400), num('strength', 'strength', 0.3, 0.05, 1, 0.05), easing('linear')],
    args: (v, options) => [target, options(['duration', 'strength', 'easing'])],
    run: (a, v, done) =>
      pua.zoomBlur(a.target, { duration: n(v.duration), strength: n(v.strength), onComplete: done, easing: ease(v.easing) })
  },
  {
    id: 'blindsIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Reveal through horizontal blinds',
    description: 'Reveals the object through opening horizontal strips.',
    signature: 'blindsIn(target, duration, options?)',
    games: ['Puzzle', 'Card', 'Strategy'],
    params: [
      duration(600),
      num('count', 'strips', 6, 2, 20, 1),
      num('edge', 'edge softness', 0.08, 0, 0.5, 0.02),
      easing('quadOut')
    ],
    args: (v, options) => [target, v.duration, options(['count', 'edge', 'easing'])],
    run: (a, v, done) =>
      pua.blindsIn(a.target, n(v.duration), { count: n(v.count), edge: n(v.edge), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'blindsOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Hide through horizontal blinds',
    description: 'Hides the object through closing horizontal strips and sets it invisible when done.',
    signature: 'blindsOut(target, duration, options?)',
    games: ['Puzzle', 'Card', 'Strategy'],
    params: [
      duration(600),
      num('count', 'strips', 6, 2, 20, 1),
      num('edge', 'edge softness', 0.08, 0, 0.5, 0.02),
      easing('quadIn')
    ],
    args: (v, options) => [target, v.duration, options(['count', 'edge', 'easing'])],
    run: (a, v, done) =>
      pua.blindsOut(a.target, n(v.duration), {
        count: n(v.count),
        edge: n(v.edge),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'glitter',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Twinkling sparkles',
    description: 'Continuous twinkling sparkles scattered over the object surface. For rewards, gems and premium items.',
    signature: 'glitter(target, options?)',
    continuous: true,
    games: ['Match-3', 'Merge', 'Idle', 'Card'],
    params: [
      duration(2000),
      color('color', 'color', 0xffffff),
      num('density', 'density', 10, 2, 30, 1),
      num('strength', 'strength', 1, 0.1, 2, 0.1)
    ],
    args: (v, options) => [target, options(['duration', 'color', 'density', 'strength'])],
    run: (a, v) =>
      pua.glitter(a.target, {
        duration: n(v.duration),
        color: n(v.color),
        density: n(v.density),
        strength: n(v.strength)
      })
  },
  {
    id: 'sepia',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Fade to sepia (and stay)',
    description:
      'Tweens the object toward a warm sepia tone and keeps the filter while the amount is above zero. Call it with 0 to restore the colors.',
    signature: 'sepia(target, amount, duration, options?)',
    replayInterval: 2600,
    games: ['RPG', 'Card', 'Puzzle', 'Strategy'],
    params: [num('amount', 'amount', 1, 0, 1, 0.05), duration(500), easing('quadOut')],
    args: (v, options) => [target, v.amount, v.duration, options(['easing'])],
    run: (a, v, done) => pua.sepia(a.target, n(v.amount), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'brightness',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Darken or brighten (and stay)',
    description:
      'Tweens the brightness: negative amounts darken toward black, positive amounts lighten toward white. The filter stays until you call it with 0. For disabled and highlighted states.',
    signature: 'brightness(button, amount, duration, options?)',
    replayInterval: 2600,
    params: [num('amount', 'amount', -0.5, -1, 1, 0.05), duration(300), easing('quadOut')],
    args: (v, options) => [button, v.amount, v.duration, options(['easing'])],
    run: (a, v, done) => pua.brightness(a.target, n(v.amount), n(v.duration), { easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'colorPulse',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Pulse toward a solid color',
    description:
      'Continuously washes the object toward the given color and back. For low health, alerts and selected items.',
    signature: 'colorPulse(target, color, options?)',
    continuous: true,
    games: ['RPG', 'Shooter', 'Strategy', 'Runner'],
    params: [color('color', 'color', 0xff5c7a), duration(1000), num('strength', 'strength', 0.6, 0.1, 1, 0.05)],
    args: (v, options) => [target, { hex: n(v.color) }, options(['duration', 'strength'])],
    run: (a, v) => pua.colorPulse(a.target, n(v.color), { duration: n(v.duration), strength: n(v.strength) })
  },
  {
    id: 'staticNoise',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'TV static over the surface',
    description:
      'Continuous flickering grain over the object, like an untuned screen. For locked content, signal loss and retro UIs.',
    signature: 'staticNoise(target, options?)',
    continuous: true,
    games: ['Shooter', 'Puzzle', 'Strategy', 'RPG'],
    params: [
      num('strength', 'strength', 0.35, 0.05, 1, 0.05),
      num('size', 'grain size (px)', 2, 1, 12, 1),
      num('interval', 'interval (ms, 0 = every frame)', 0, 0, 500, 10)
    ],
    args: (v, options) => [target, options(['strength', 'size', 'interval'])],
    run: (a, v) => pua.staticNoise(a.target, { strength: n(v.strength), size: n(v.size), interval: n(v.interval) })
  },
  {
    id: 'hologram',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Moving rainbow foil sheen',
    description:
      'Continuous diagonal rainbow bands drifting over the object, like a holographic card. For rare items, premium offers and collectibles.',
    signature: 'hologram(target, options?)',
    continuous: true,
    games: ['Card', 'Merge', 'Match-3', 'RPG'],
    params: [
      duration(2400),
      num('strength', 'strength', 0.6, 0.1, 1, 0.05),
      num('scale', 'band scale', 1.5, 0.5, 6, 0.25),
      num('angle', 'angle (deg)', 45, 0, 180, 5)
    ],
    args: (v, options) => [target, options(['duration', 'strength', 'scale', 'angle'])],
    run: (a, v) =>
      pua.hologram(a.target, { duration: n(v.duration), strength: n(v.strength), scale: n(v.scale), angle: n(v.angle) })
  },
  {
    id: 'cooldown',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Clockwise ability cooldown sweep',
    description:
      'Darkens the object and clears the shade clockwise over the given duration, the classic ability cooldown. onComplete fires when it is ready again.',
    signature: 'cooldown(button, duration, options?)',
    replayInterval: 2600,
    games: ['RPG', 'Shooter', 'Strategy', 'Idle'],
    params: [duration(1500), num('dim', 'dim', 0.6, 0.1, 1, 0.05), toggle('clockwise', 'clockwise', true)],
    args: (v, options) => [button, v.duration, options(['dim', 'clockwise'])],
    run: (a, v, done) =>
      pua.cooldown(a.target, n(v.duration), { dim: n(v.dim), onComplete: done, clockwise: Boolean(v.clockwise) })
  },
  {
    id: 'ringPulse',
    group: 'Shaders',
    demo: 'button',
    ident: 'button',
    summary: 'Light ring expanding from the center',
    description:
      'Continuously sends a soft ring of light from the center of the object to its edges. A subtle "press me" for buttons and targets.',
    signature: 'ringPulse(button, options?)',
    continuous: true,
    params: [
      duration(1200),
      color('color', 'color', 0xffffff),
      num('width', 'ring width', 0.18, 0.05, 0.6, 0.01),
      num('strength', 'strength', 0.9, 0.1, 2, 0.1)
    ],
    args: (v, options) => [button, options(['duration', 'color', 'width', 'strength'])],
    run: (a, v) =>
      pua.ringPulse(a.target, {
        duration: n(v.duration),
        color: n(v.color),
        width: n(v.width),
        strength: n(v.strength)
      })
  },
  {
    id: 'blurPulse',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Focus drifts in and out',
    description: 'Continuously blurs the object and brings it back into focus. For dreamy backgrounds and waiting states.',
    signature: 'blurPulse(target, options?)',
    continuous: true,
    games: ['Puzzle', 'RPG', 'Idle'],
    params: [duration(1600), num('strength', 'strength', 6, 1, 20, 1)],
    args: (v, options) => [target, options(['duration', 'strength'])],
    run: (a, v) => pua.blurPulse(a.target, { duration: n(v.duration), strength: n(v.strength) })
  },
  {
    id: 'glitchLoop',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Periodic glitch bursts',
    description: 'The looping version of glitch: a short burst of slices and RGB split once per interval, clean in between.',
    signature: 'glitchLoop(target, options?)',
    continuous: true,
    games: ['Shooter', 'Racing', 'Strategy', 'RPG'],
    params: [
      interval(2200),
      duration(400),
      num('strength', 'strength', 1, 0.2, 3, 0.1),
      num('slices', 'slices', 12, 2, 40, 1),
      num('speed', 'speed (changes per second)', 20, 1, 60, 1),
      num('split', 'RGB split (px)', 4, 0, 30, 1),
      num('shift', 'slice shift', 0.25, 0, 1, 0.05)
    ],
    args: (v, options) => [target, options(['interval', 'duration', 'strength', 'slices', 'speed', 'split', 'shift'])],
    run: (a, v) =>
      pua.glitchLoop(a.target, {
        interval: n(v.interval),
        duration: n(v.duration),
        strength: n(v.strength),
        slices: n(v.slices),
        speed: n(v.speed),
        split: n(v.split),
        shift: n(v.shift)
      })
  },
  {
    id: 'meltIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Rain in column by column',
    description: 'Reveals the object as vertical strips that drop into place at different speeds.',
    signature: 'meltIn(target, duration, options?)',
    games: ['Puzzle', 'RPG', 'Shooter'],
    params: [duration(700), num('columns', 'columns', 24, 4, 80, 2), easing('quadOut')],
    args: (v, options) => [target, v.duration, options(['columns', 'easing'])],
    run: (a, v, done) =>
      pua.meltIn(a.target, n(v.duration), { columns: n(v.columns), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'meltOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Melt down column by column',
    description: 'Hides the object as vertical strips that slide down at different speeds, then sets it invisible.',
    signature: 'meltOut(target, duration, options?)',
    games: ['Puzzle', 'RPG', 'Shooter'],
    params: [duration(700), num('columns', 'columns', 24, 4, 80, 2), easing('linear')],
    args: (v, options) => [target, v.duration, options(['columns', 'easing'])],
    run: (a, v, done) =>
      pua.meltOut(a.target, n(v.duration), { columns: n(v.columns), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'clockWipeIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Reveal with a clockwise sweep',
    description: 'Reveals the object with a sweep that runs clockwise from the top, like a clock hand.',
    signature: 'clockWipeIn(target, duration, options?)',
    games: ['Puzzle', 'Strategy', 'Card', 'Idle'],
    params: [
      duration(700),
      num('edge', 'edge softness', 0.03, 0, 0.3, 0.01),
      easing('quadInOut'),
      toggle('clockwise', 'clockwise', true)
    ],
    args: (v, options) => [target, v.duration, options(['edge', 'easing', 'clockwise'])],
    run: (a, v, done) =>
      pua.clockWipeIn(a.target, n(v.duration), {
        edge: n(v.edge),
        easing: ease(v.easing),
        onComplete: done,
        clockwise: Boolean(v.clockwise)
      })
  },
  {
    id: 'clockWipeOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Hide with a counter-clockwise sweep',
    description: 'Hides the object with a sweep that runs back to the top, then sets it invisible.',
    signature: 'clockWipeOut(target, duration, options?)',
    games: ['Puzzle', 'Strategy', 'Card', 'Idle'],
    params: [
      duration(700),
      num('edge', 'edge softness', 0.03, 0, 0.3, 0.01),
      easing('quadInOut'),
      toggle('clockwise', 'clockwise', true)
    ],
    args: (v, options) => [target, v.duration, options(['edge', 'easing', 'clockwise'])],
    run: (a, v, done) =>
      pua.clockWipeOut(a.target, n(v.duration), {
        edge: n(v.edge),
        easing: ease(v.easing),
        onComplete: done,
        clockwise: Boolean(v.clockwise)
      })
  },
  {
    id: 'tilesIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Reveal as a wave of growing tiles',
    description: 'Reveals the object as a grid of tiles that grow open in a diagonal wave.',
    signature: 'tilesIn(target, duration, options?)',
    games: ['Puzzle', 'Match-3', 'Word', 'Strategy'],
    params: [
      duration(700),
      num('count', 'rows', 5, 2, 16, 1),
      num('spread', 'wave spread', 0.5, 0.05, 1, 0.05),
      easing('quadOut')
    ],
    args: (v, options) => [target, v.duration, options(['count', 'spread', 'easing'])],
    run: (a, v, done) =>
      pua.tilesIn(a.target, n(v.duration), {
        count: n(v.count),
        spread: n(v.spread),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'tilesOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Hide as a wave of shrinking tiles',
    description: 'Hides the object as a grid of tiles that shrink shut in a diagonal wave, then sets it invisible.',
    signature: 'tilesOut(target, duration, options?)',
    games: ['Puzzle', 'Match-3', 'Word', 'Strategy'],
    params: [
      duration(700),
      num('count', 'rows', 5, 2, 16, 1),
      num('spread', 'wave spread', 0.5, 0.05, 1, 0.05),
      easing('quadIn')
    ],
    args: (v, options) => [target, v.duration, options(['count', 'spread', 'easing'])],
    run: (a, v, done) =>
      pua.tilesOut(a.target, n(v.duration), {
        count: n(v.count),
        spread: n(v.spread),
        easing: ease(v.easing),
        onComplete: done
      })
  },
  {
    id: 'slicesIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Assemble from sliding slices',
    description: 'Reveals the object as horizontal slices that slide in from alternating sides.',
    signature: 'slicesIn(target, duration, options?)',
    games: ['Runner', 'Racing', 'Shooter', 'Card'],
    params: [duration(600), num('count', 'slices', 6, 2, 24, 1), easing('cubicOut')],
    args: (v, options) => [target, v.duration, options(['count', 'easing'])],
    run: (a, v, done) =>
      pua.slicesIn(a.target, n(v.duration), { count: n(v.count), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'slicesOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Break apart into sliding slices',
    description: 'Hides the object as horizontal slices that slide away to alternating sides, then sets it invisible.',
    signature: 'slicesOut(target, duration, options?)',
    games: ['Runner', 'Racing', 'Shooter', 'Card'],
    params: [duration(600), num('count', 'slices', 6, 2, 24, 1), easing('cubicIn')],
    args: (v, options) => [target, v.duration, options(['count', 'easing'])],
    run: (a, v, done) =>
      pua.slicesOut(a.target, n(v.duration), { count: n(v.count), easing: ease(v.easing), onComplete: done })
  },
  {
    id: 'vortexIn',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Untwist into view',
    description: 'Reveals the object from a tight swirl that untwists while fading in.',
    signature: 'vortexIn(target, duration, options?)',
    games: ['RPG', 'Puzzle', 'Merge', 'Casual'],
    params: [
      duration(700),
      num('angle', 'angle (deg)', 360, 45, 1080, 45),
      easing('cubicOut'),
      num('radius', 'radius', 1, 0.2, 2, 0.1)
    ],
    args: (v, options) => [target, v.duration, options(['angle', 'easing', 'radius'])],
    run: (a, v, done) =>
      pua.vortexIn(a.target, n(v.duration), {
        angle: n(v.angle),
        easing: ease(v.easing),
        onComplete: done,
        radius: n(v.radius)
      })
  },
  {
    id: 'vortexOut',
    group: 'Shaders',
    demo: 'card',
    ident: 'target',
    summary: 'Twist away into a swirl',
    description: 'Hides the object by twisting it into a swirl while fading out, then sets it invisible.',
    signature: 'vortexOut(target, duration, options?)',
    games: ['RPG', 'Puzzle', 'Merge', 'Casual'],
    params: [
      duration(700),
      num('angle', 'angle (deg)', 360, 45, 1080, 45),
      easing('cubicIn'),
      num('radius', 'radius', 1, 0.2, 2, 0.1)
    ],
    args: (v, options) => [target, v.duration, options(['angle', 'easing', 'radius'])],
    run: (a, v, done) =>
      pua.vortexOut(a.target, n(v.duration), {
        angle: n(v.angle),
        easing: ease(v.easing),
        onComplete: done,
        radius: n(v.radius)
      })
  }
];

export function findEntry(id: string): AnimationEntry | undefined {
  return animationCatalog.find((entry) => entry.id === id);
}

export function componentFor(entry: AnimationEntry): Component {
  for (const [name, exports] of Object.entries(COMPONENTS)) {
    if (exports.includes(entry.id)) return { name, exports };
  }
  return { name: entry.id, exports: [entry.id] };
}

export function setupLines(entry: AnimationEntry, values: ParamValues): string[] {
  if (!entry.setup) return [];
  return typeof entry.setup === 'function' ? entry.setup(values) : entry.setup;
}

export function defaultValues(params: ParamDef[]): ParamValues {
  const values: ParamValues = {};
  for (const param of params) values[param.key] = param.value;
  return values;
}

// Options object containing only the values that differ from the defaults, so the snippet stays minimal.
export function optionsArg(params: ParamDef[], values: ParamValues): OptionsArg {
  return (keys) => {
    const obj: Record<string, CodeArg> = {};
    for (const key of keys) {
      const param = params.find((p) => p.key === key);
      if (!param || values[key] === param.value) continue;
      obj[key] = param.type === 'color' ? { hex: Number(values[key]) } : values[key];
    }
    return Object.keys(obj).length > 0 ? { obj } : undefined;
  };
}
