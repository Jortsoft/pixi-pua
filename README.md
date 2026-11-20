# pixi-pua — Pixi UI Animations

[![Live Demo](https://img.shields.io/badge/🚀_Live-Demo-6C5CE7?style=for-the-badge)](https://jortsoft.github.io/pixi-pua/)

Ready-to-use UI animations for [PixiJS](https://pixijs.com/): 170 one-line animations for presets, CTA popups, buttons, tutorial hands, text and shader effects. Works with **PixiJS v7 and v8**, ships with **TypeScript** types, has a small built-in tween engine and no dependency other than PixiJS.

```ts
import { pop } from 'pixi-pua';

pop(playButton, { duration: 500, overshoot: 0.2 });
```

## Install

```bash
npm install pixi-pua
```

`pixi.js` is a peer dependency (`^7.0.0 || ^8.0.0`); the package uses the copy already installed in your project.

## Usage

```ts
import { ctaShow, ctaHide, tutorialTap, shine, stop } from 'pixi-pua';

ctaShow({ overlay, panel, title, button }, { entrance: 'slide', stagger: 100 });
ctaHide({ overlay, panel, title, button }, () => console.log('hidden'));

tutorialTap(hand, { interval: 1000 });
stop(hand);

shine(button, { interval: 2500 });
```

Import the functions you use by name: bundlers drop the rest, so one animation adds about 3 KB (1.5 KB gzipped) to a playable. The `pua` object (`import { pua } from 'pixi-pua'`, then `pua.pop(button)`) is there for convenience, but it pulls in every animation (about 80 KB, 17 KB gzipped).

### API conventions

- The first argument is always the display object (`Sprite`, `Container`, `Text`, `Graphics`, …).
- The last argument is optional: either an `onComplete` callback or an options object (`{ duration, easing, delay, onComplete, …plus the animation's own options }`).
- Easing is a name (`'quadOut'`, `'backOut'`, `'bounceOut'`, …) or any `(t) => number` function.
- Looping animations (`pulse`, `buttonIdle`, `tutorialTap`, `glowPulse`, …) run until you call `stop(target)`.
- Starting a new animation on the same property channel replaces the previous one. Out / In pairs remember and restore the original state.

### PixiJS versions

The same import works on PixiJS v7 and v8; the version is detected at runtime. Two things to know on v8:

- Shader effects are written in GLSL, so they need the WebGL renderer (`preference: 'webgl'`).
- Animations run on `Ticker.shared`, as on v7.

### TypeScript

Types are included. Every animation exports its options type, for example:

```ts
import { pop, type PopOptions, type PuaTarget } from 'pixi-pua';

const options: PopOptions = { duration: 400 };
```

## Components (170)

### Presets (47)

| Method | Summary |
|---|---|
| `pop(target, options?)` | Quick pop-in (0 → overshoot → 1) |
| `bounce(target, options?)` | Hop up and land with a bounce |
| `pulse(target, options?)` | Continuous attention pulse (loop) |
| `shake(target, options?)` | Quick horizontal shake |
| `jelly(target, options?)` | Playful squash and stretch |
| `wobble(target, options?)` | Small rotational wobble |
| `flip(target, options?)` | Card flip around an axis |
| `tada(target, options?)` | Celebration: grow and wiggle |
| `spin(target, options?)` | One-shot spin by full turns |
| `flash(target, options?)` | Blink the alpha a few times |
| `dropIn(target, options?)` | Drop from above and bounce |
| `nudge(target, direction, options?)` | Quick nudge toward a direction |
| `heartbeat(target, options?)` | Continuous double-beat pulse (loop) |
| `float(target, options?)` | Continuous gentle hover (loop) |
| `rubberBand(target, options?)` | Stretch wide, squash tall, settle |
| `stamp(target, options?)` | Slam down from large to normal |
| `rollIn(target, options?)` | Roll in from the left |
| `flipIn(target, options?)` | Flip open from an edge |
| `swirl(target, options?)` | Spin in while growing |
| `jump(target, options?)` | Squash, leap and land |
| `impact(target, options?)` | Landing squash with spring back |
| `elasticIn(target, options?)` | Appear with an elastic spring |
| `bounceIn(target, options?)` | Appear with a bouncy landing |
| `popOut(target, options?)` | Quick pop-out (1 → overshoot → 0) |
| `lightSpeedIn(target, options?)` | Dash in from the right with skew |
| `vibrate(target, options?)` | Fast rotational buzz |
| `flicker(target, options?)` | Neon flicker, then steady |
| `blink(target, options?)` | Hard on/off blinking (loop) |
| `breathe(target, options?)` | Slow breathing scale and alpha (loop) |
| `sway(target, options?)` | Continuous gentle rocking (loop) |
| `jitter(target, options?)` | Nervous random shiver (loop) |
| `fadeIn(target, options?)` | Fade into view |
| `fadeOut(target, options?)` | Fade out and hide |
| `slideIn(target, direction, options?)` | Slide in from a side with a fade |
| `slideOut(target, direction, options?)` | Slide away to a side and hide |
| `zoomIn(target, options?)` | Grow into place with a fade |
| `zoomOut(target, options?)` | Grow past the screen and vanish |
| `flipOut(target, options?)` | Fold shut and disappear |
| `rollOut(target, options?)` | Roll away to the right |
| `springOut(target, options?)` | Wind up, puff and shrink away |
| `fallOut(target, options?)` | Tip over and fall away |
| `punchUp(target, options?)` | Quick scale punch and settle |
| `coinFlip(target, options?)` | Toss up and flip like a coin |
| `nod(target, options?)` | Quick vertical nod |
| `spinLoop(target, options?)` | Continuous rotation (loop) |
| `orbit(target, options?)` | Continuous small circular drift (loop) |
| `ping(target, options?)` | Radar ping: grow and fade, repeating (loop) |

### CTA Popup (23)

| Method | Summary |
|---|---|
| `popupIn(popup, duration, options?)` | Popup appears with scale and fade |
| `popupOut(popup, duration, options?)` | Popup disappears with scale and fade |
| `popupDrop(popup, duration, options?)` | Popup drops in from the top |
| `ctaShow({ overlay?, panel?, title?, button? }, options?)` | Full CTA popup entrance sequence |
| `ctaHide({ overlay?, panel?, title?, button? }, options?)` | Full CTA popup exit sequence |
| `popupSlideUp(popup, duration, options?)` | Popup slides up from the bottom |
| `popupSlideDown(popup, duration, options?)` | Popup slides down and away |
| `popupFlipIn(popup, duration, options?)` | Popup unfolds horizontally |
| `popupBounceIn(popup, duration, options?)` | Popup bounces into place |
| `popupSwingIn(popup, duration, options?)` | Popup swings in with a tilt |
| `overlayIn(overlay, duration, options?)` | Dim the screen behind a popup |
| `overlayOut(overlay, duration, options?)` | Remove the screen dim |
| `ctaCelebrate({ panel?, title?, button? }, options?)` | Win moment: panel, title and button react together |
| `popupSlideIn(popup, direction, duration, options?)` | Popup slides in from any side |
| `popupSlideOut(popup, direction, duration, options?)` | Popup slides away to any side |
| `popupElasticIn(popup, duration, options?)` | Popup springs in elastically |
| `popupUnfoldIn(popup, duration, options?)` | Popup unfolds vertically |
| `popupSpinIn(popup, duration, options?)` | Popup whirls in while growing |
| `popupZoomOut(popup, duration, options?)` | Popup grows and fades away |
| `popupFlipOut(popup, duration, options?)` | Popup folds shut horizontally |
| `popupSwingOut(popup, duration, options?)` | Popup swings away with a tilt |
| `popupFallOut(popup, duration, options?)` | Popup tips over and falls off screen |
| `overlayPulse(overlay, options?)` | Screen dim breathes behind the popup (loop) |

### Button (15)

| Method | Summary |
|---|---|
| `buttonPress(button, options?)` | Tap feedback: press down and release |
| `buttonIdle(button, options?)` | Idle attention loop: breathe and tilt (loop) |
| `buttonHop(button, options?)` | Periodic small hop (loop) |
| `buttonDown(button, options?)` | Press and hold down |
| `buttonUp(button, options?)` | Release and spring back |
| `buttonWiggle(button, options?)` | Periodic rotational wiggle (loop) |
| `buttonSqueeze(button, options?)` | Periodic squash and stretch (loop) |
| `buttonIn(button, options?)` | Button rises in with a pop |
| `buttonOut(button, options?)` | Button shrinks away and hides |
| `buttonPop(button, options?)` | Success feedback: puff up and settle |
| `buttonShake(button, options?)` | Denied feedback: horizontal shake |
| `buttonPulse(button, options?)` | Periodic double beat (loop) |
| `buttonFloat(button, options?)` | Gentle continuous hover (loop) |
| `buttonTada(button, options?)` | Periodic grow and wiggle (loop) |
| `buttonBlink(button, options?)` | Soft alpha blink (loop) |

### Tutorial (16)

| Method | Summary |
|---|---|
| `tutorialTap(hand, options?)` | Hand taps in place (loop) |
| `tutorialSwipe(hand, direction, distance, options?)` | Hand swipes in a direction (loop) |
| `tutorialDrag(hand, x, y, options?)` | Hand drags to a position (loop) |
| `tutorialPoint(hand, options?)` | Hand nudges toward a direction (loop) |
| `tutorialDoubleTap(hand, options?)` | Hand double-taps in place (loop) |
| `tutorialHold(hand, options?)` | Hand presses and holds (loop) |
| `tutorialCircle(hand, options?)` | Hand circles around a point (loop) |
| `tutorialPath(hand, points, options?)` | Hand drags along a path (loop) |
| `tutorialTapSequence(hand, points, options?)` | Hand taps several points in order (loop) |
| `tutorialScrub(hand, direction, distance, options?)` | Hand rubs back and forth (loop) |
| `tutorialFlick(hand, direction, distance, options?)` | Hand presses and flicks (loop) |
| `tutorialArc(hand, x, y, options?)` | Hand drags along an arc (loop) |
| `tutorialWave(hand, options?)` | Hand waves for attention (loop) |
| `tutorialFigureEight(hand, options?)` | Hand traces a figure eight (loop) |
| `tutorialIn(hand, options?)` | Hand slides into view |
| `tutorialOut(hand, options?)` | Hand slides away and hides |

### Text (19)

The target is a `PIXI.Text`.

| Method | Summary |
|---|---|
| `typewriter(text, duration, options?)` | Reveal text character by character |
| `scramble(text, duration, options?)` | Decode from random characters |
| `countTo(text, to, duration, options?)` | Count a number up or down |
| `trackIn(text, duration, options?)` | Letters slide together while fading in |
| `trackOut(text, duration, options?)` | Letters spread apart while fading out |
| `textColor(text, color, duration, options?)` | Tween the text fill color |
| `backspace(text, duration, options?)` | Delete text character by character |
| `textCycle(text, words, options?)` | Cycle through words with a fade (loop) |
| `countdown(text, options?)` | 3, 2, 1, GO! with a punch |
| `textColorPulse(text, color, options?)` | Pulse between two fill colors (loop) |
| `textStrokePulse(text, options?)` | Pulse the outline thickness (loop) |
| `textSwap(text, value, options?)` | Change the text with a pop |
| `textTimer(text, seconds, options?)` | Countdown clock in m:ss |
| `ellipsis(text, options?)` | Animated trailing dots (loop) |
| `typeCycle(text, words, options?)` | Type, hold, delete, next word (loop) |
| `textRainbow(text, options?)` | Cycle the fill through the rainbow (loop) |
| `textFlash(text, color, options?)` | Flash the fill to a color and back |
| `slotCount(text, to, duration, options?)` | Slot-machine digits lock in |
| `trackPulse(text, options?)` | Letter spacing breathes (loop) |

### Shaders (50)

Custom GLSL filters; they need the WebGL renderer.

| Method | Summary |
|---|---|
| `shine(button, options?)` | Light sweep across the surface |
| `glowPulse(button, options?)` | Pulsing outer glow (loop) |
| `hitFlash(target, options?)` | Flash to a solid color and back |
| `glitch(target, options?)` | Digital glitch: slices and RGB split |
| `shockwave(target, options?)` | Radial ripple from the center |
| `wave(target, options?)` | Continuous flag-like wave (loop) |
| `hueCycle(button, options?)` | Continuous hue rotation (loop) |
| `dissolveIn(target, duration, options?)` | Materialize from noise |
| `dissolveOut(target, duration, options?)` | Burn away into noise |
| `pixelateIn(target, duration, options?)` | Resolve from big pixels |
| `pixelateOut(target, duration, options?)` | Break up into big pixels |
| `blurIn(target, duration, options?)` | Focus in from a blur |
| `blurOut(target, duration, options?)` | Blur away |
| `outlinePulse(button, options?)` | Pulsing colored outline (loop) |
| `grayscale(target, amount, duration, options?)` | Fade to grayscale (and stay) |
| `scanlines(target, options?)` | Moving CRT scanlines (loop) |
| `ripple(target, options?)` | Continuous water ripples (loop) |
| `wipeIn(target, direction, duration, options?)` | Reveal with a directional wipe |
| `wipeOut(target, direction, duration, options?)` | Hide with a directional wipe |
| `irisIn(target, duration, options?)` | Reveal from the center outward |
| `irisOut(target, duration, options?)` | Close into the center |
| `chromatic(target, options?)` | Pulsing RGB split (loop) |
| `twist(target, options?)` | Twist around the center and back |
| `shimmer(target, options?)` | Heat-haze shimmer (loop) |
| `bulge(target, options?)` | Magnify the center and relax |
| `invertFlash(target, options?)` | Flash to negative colors |
| `tintTo(button, color, duration, options?)` | Tint toward a color (and stay) |
| `zoomBlur(target, options?)` | Radial speed-blur burst |
| `blindsIn(target, duration, options?)` | Reveal through horizontal blinds |
| `blindsOut(target, duration, options?)` | Hide through horizontal blinds |
| `glitter(target, options?)` | Twinkling sparkles (loop) |
| `sepia(target, amount, duration, options?)` | Fade to sepia (and stay) |
| `brightness(button, amount, duration, options?)` | Darken or brighten (and stay) |
| `colorPulse(target, color, options?)` | Pulse toward a solid color (loop) |
| `staticNoise(target, options?)` | TV static over the surface (loop) |
| `hologram(target, options?)` | Moving rainbow foil sheen (loop) |
| `cooldown(button, duration, options?)` | Clockwise ability cooldown sweep |
| `ringPulse(button, options?)` | Light ring expanding from the center (loop) |
| `blurPulse(target, options?)` | Focus drifts in and out (loop) |
| `glitchLoop(target, options?)` | Periodic glitch bursts (loop) |
| `meltIn(target, duration, options?)` | Rain in column by column |
| `meltOut(target, duration, options?)` | Melt down column by column |
| `clockWipeIn(target, duration, options?)` | Reveal with a clockwise sweep |
| `clockWipeOut(target, duration, options?)` | Hide with a counter-clockwise sweep |
| `tilesIn(target, duration, options?)` | Reveal as a wave of growing tiles |
| `tilesOut(target, duration, options?)` | Hide as a wave of shrinking tiles |
| `slicesIn(target, duration, options?)` | Assemble from sliding slices |
| `slicesOut(target, duration, options?)` | Break apart into sliding slices |
| `vortexIn(target, duration, options?)` | Untwist into view |
| `vortexOut(target, duration, options?)` | Twist away into a swirl |

## The documentation site

This repository also contains a site (`src/site`) that previews every component live, lets you tune it and shows the generated usage snippet.

- **Gallery home** — a catalog of every component with live previews, grouped by library, with search and tag filters.
- **Component page** — live preview, dev panel with every option as a slider / select / color / text input, and the **Usage** snippet that updates as you tune.
- **Component source** — a standalone `.ts` file for one component, for projects that prefer copying a single file over installing the package.
- **Download .zip** — that file, `usage.ts` with your values, `preset.json` and the preview assets.
- **Custom assets** — upload your own card, popup panel, button or tutorial hand image to preview the animations on real game art.

Run it locally:

```bash
npm install
npm run dev
```

## Repository layout

```
src/pua/                 library source (types, core engine, animations) — this is what the package publishes
src/site/                documentation site (DOM + PIXI previews)
  catalog.ts             every component: params, defaults, usage snippet, demo scene
  standalone/            builds the single-file components from the library source
  generated/puaSources.ts  library source embedded for the site (generated, do not edit)
scripts/pua-sources.cjs  regenerates src/site/generated/puaSources.ts
lib/                     compiled package output (generated by npm run build:lib)
```

## Development

```bash
npm run dev         # docs site with live reload (regenerates the embedded sources first)
npm run build       # production build of the site into dist/
npm run build:lib   # compile the npm package into lib/ (JavaScript + type declarations)
npm run typecheck   # type-check the library and the site
npm run sources     # regenerate src/site/generated/puaSources.ts after editing src/pua
```

Format with `npx prettier --write "src/**/*.ts" "src/index.css"`.

To add an animation: implement it in `src/pua/animations/`, add it to the `pua` object in `src/pua/index.ts`, add a catalog entry in `src/site/catalog.ts` (group, params, `args` for the snippet, `run` for the preview) and, if it belongs to an existing family, list it in `COMPONENTS`.

## Publishing

```bash
npm version patch   # or minor / major
npm publish         # runs npm run build:lib first
```

## License

MIT
