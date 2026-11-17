# PUA — Pixi UI Animations

A lightweight animation utility library for [PixiJS](https://pixijs.com/) UI elements.

PUA is designed to make common UI animations simple and readable.  
No animation objects, timelines, or complex configuration are required for basic use.

```ts
import { pua } from 'pua';
```

Then simply pass your PixiJS object to the animation you want:

```ts
pua.pop(button);
pua.fadeIn(panel, 250);
pua.rotate360(loadingIcon, 2);
```

---

## Features

- Simple API
- Built specifically for PixiJS UI animations
- Works with any compatible PixiJS display object
- Built-in animations and presets
- No need to manually create animation instances
- Optional callbacks
- Lightweight and dependency-friendly
- TypeScript-first API

---

# Installation

```bash
npm install pua
```

Then:

```ts
import { pua } from 'pua';
```

---

# Basic Usage

PUA animations accept a PixiJS display object as their target.

For example:

```ts
pua.pop(button);
```

```ts
pua.fadeIn(panel, 250);
```

```ts
pua.scaleTo(icon, 1.2, 200);
```

The target can be any compatible PixiJS object, such as:

- `Sprite`
- `Text`
- `Container`
- `Graphics`
- `AnimatedSprite`

Example:

```ts
pua.pop(mySprite);
pua.shake(myText);
pua.fadeIn(myContainer);
```

---

# API

## Rotation

### `rotate()`

Rotates an object to a specific angle.

```ts
pua.rotate(target, angle, duration);
```

### Parameters

| Parameter | Type | Description |
|---|---|---|
| `target` | `DisplayObject` | Target PixiJS object |
| `angle` | `number` | Target rotation in degrees |
| `duration` | `number` | Animation duration in milliseconds |

### Example

```ts
pua.rotate(sprite, 90, 300);
```

---

## `rotateBy()`

Rotates an object relative to its current rotation.

```ts
pua.rotateBy(target, angle, duration);
```

Example:

```ts
pua.rotateBy(sprite, 45, 200);
```

If the current rotation is `30°`, the final rotation will be `75°`.

---

## `rotate360()`

Continuously rotates an object.

```ts
pua.rotate360(target, speed);
```

`speed` represents **rotations per second**.

### Examples

```ts
pua.rotate360(loadingIcon, 1);
```

One full rotation per second:

```ts
pua.rotate360(loadingIcon, 1);
```

Two rotations per second:

```ts
pua.rotate360(loadingIcon, 2);
```

This is useful for:

- Loading indicators
- Spinning coins
- Rotating icons
- Decorative UI elements

---

# Scale

## `scaleTo()`

Scales an object to a specific value.

```ts
pua.scaleTo(target, scale, duration);
```

Example:

```ts
pua.scaleTo(button, 1.2, 200);
```

---

## `scaleIn()`

Makes an object appear by scaling it from a smaller size to its normal size.

```ts
pua.scaleIn(target, duration);
```

Example:

```ts
pua.scaleIn(button, 300);
```

Typical result:

```text
0 → 1
```

---

## `scaleOut()`

Makes an object disappear by scaling it down.

```ts
pua.scaleOut(target, duration);
```

Example:

```ts
pua.scaleOut(button, 300);
```

Typical result:

```text
1 → 0
```

---

## `scalePulse()`

Creates a small scale pulse.

```ts
pua.scalePulse(target, scale, duration);
```

Example:

```ts
pua.scalePulse(coinIcon, 1.2, 150);
```

Typical result:

```text
1 → 1.2 → 1
```

Useful for:

- Buttons
- Coins
- Rewards
- Notifications
- Selected UI elements

---

# Position

## `moveTo()`

Moves an object to a specific position.

```ts
pua.moveTo(target, x, y, duration);
```

Example:

```ts
pua.moveTo(panel, 100, 200, 400);
```

---

## `moveBy()`

Moves an object relative to its current position.

```ts
pua.moveBy(target, x, y, duration);
```

Example:

```ts
pua.moveBy(rewardText, 0, -50, 300);
```

This moves the object 50 pixels upward from its current position.

---

# Alpha

## `fadeIn()`

Fades an object in.

```ts
pua.fadeIn(target, duration);
```

Example:

```ts
pua.fadeIn(panel, 200);
```

Typical result:

```text
alpha: 0 → 1
```

---

## `fadeOut()`

Fades an object out.

```ts
pua.fadeOut(target, duration);
```

Example:

```ts
pua.fadeOut(panel, 200);
```

Typical result:

```text
alpha: 1 → 0
```

---

## `fadeTo()`

Animates an object to a specific alpha value.

```ts
pua.fadeTo(target, alpha, duration);
```

Example:

```ts
pua.fadeTo(sprite, 0.5, 300);
```

---

# UI Presets

PUA also provides ready-to-use UI animation presets.

These animations are designed for common game UI interactions.

---

## `pop()`

Creates a quick pop-in effect.

```ts
pua.pop(target);
```

Example:

```ts
pua.pop(playButton);
```

Typical animation:

```text
scale 0
   ↓
scale 1.15
   ↓
scale 1
```

Useful for:

- Buttons
- Rewards
- Dialogs
- Notifications

---

## `bounce()`

Creates a bounce effect.

```ts
pua.bounce(target);
```

Example:

```ts
pua.bounce(button);
```

---

## `pulse()`

Creates a continuous or repeated attention pulse.

```ts
pua.pulse(target);
```

Example:

```ts
pua.pulse(notificationIcon);
```

Useful for drawing attention to UI elements.

---

## `shake()`

Creates a quick shake effect.

```ts
pua.shake(target);
```

Example:

```ts
pua.shake(errorText);
```

Common use cases:

```ts
pua.shake(passwordInput);
```

```ts
pua.shake(errorMessage);
```

```ts
pua.shake(wrongAnswer);
```

---

## `jelly()`

Creates a playful jelly-like deformation.

```ts
pua.jelly(target);
```

Example:

```ts
pua.jelly(button);
```

---

## `wobble()`

Creates a small rotational wobble.

```ts
pua.wobble(target);
```

Example:

```ts
pua.wobble(icon);
```

---

# Slide Animations

## `slideIn()`

Slides an object into the screen.

```ts
pua.slideIn(target, direction, duration);
```

Supported directions:

```ts
'left'
'right'
'top'
'bottom'
```

Examples:

```ts
pua.slideIn(panel, 'left', 300);
```

```ts
pua.slideIn(panel, 'bottom', 300);
```

---

## `slideOut()`

Slides an object out of the screen.

```ts
pua.slideOut(target, direction, duration);
```

Examples:

```ts
pua.slideOut(panel, 'right', 300);
```

```ts
pua.slideOut(panel, 'bottom', 300);
```

---

# Completion Callback

Animations can optionally accept a callback that runs when the animation finishes.

Example:

```ts
pua.fadeIn(panel, 300, () => {
  console.log('Animation finished');
});
```

Another example:

```ts
pua.scaleTo(button, 1.2, 200, () => {
  console.log('Button scaled');
});
```

This keeps simple animations simple while still allowing additional logic when needed.

---

# Complete Example

```ts
import { pua } from 'pua';

// Show game panel
pua.fadeIn(gamePanel, 250);

// Animate play button
pua.pop(playButton);

// Highlight reward
pua.scalePulse(coinIcon, 1.2, 150);

// Move reward text upward
pua.moveBy(rewardText, 0, -50, 300);

// Rotate loading icon
pua.rotate360(loadingIcon, 1);

// Show settings panel
pua.slideIn(settingsPanel, 'right', 300);

// Shake error message
pua.shake(errorMessage);
```

---

# API Design

PUA intentionally uses a simple function-based API:

```ts
pua.method(target, ...parameters);
```

Instead of:

```ts
const animation = new Animation(...);

animation
  .to(...)
  .duration(...)
  .ease(...)
  .play();
```

PUA focuses on the common case:

```ts
pua.pop(button);
```

```ts
pua.fadeIn(panel, 200);
```

```ts
pua.rotate360(icon, 2);
```

This makes animations easy to discover, read, and use directly inside game code.

---

# Naming Convention

PUA follows a predictable naming convention.

| Method | Purpose |
|---|---|
| `rotate()` | Rotate to a specific angle |
| `rotateBy()` | Rotate relative to current rotation |
| `rotate360()` | Continuous 360° rotation |
| `scaleTo()` | Scale to a specific value |
| `scaleIn()` | Scale-based appearance |
| `scaleOut()` | Scale-based disappearance |
| `scalePulse()` | Scale pulse effect |
| `moveTo()` | Move to a specific position |
| `moveBy()` | Move relative to current position |
| `fadeIn()` | Fade into view |
| `fadeOut()` | Fade out of view |
| `fadeTo()` | Fade to a specific alpha |
| `pop()` | UI pop effect |
| `bounce()` | Bounce effect |
| `pulse()` | Pulse effect |
| `shake()` | Shake effect |
| `jelly()` | Jelly deformation |
| `wobble()` | Rotational wobble |
| `slideIn()` | Slide into view |
| `slideOut()` | Slide out of view |

---

# Philosophy

PUA is intentionally small.

It is not intended to replace a full animation framework such as GSAP.

The goal is to provide a collection of common UI animations that can be called directly:

```ts
pua.pop(button);
pua.shake(errorText);
pua.fadeIn(panel, 200);
pua.scalePulse(coin, 1.2, 150);
```

No timeline setup.

No animation instance management.

No complex configuration.

Just:

```text
Target + Animation
```

---

# License

MIT
