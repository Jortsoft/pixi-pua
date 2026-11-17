---
name: no-commenting
description: Never add your stupid comments. Apply it each time you code something
---

# no-commenting

## Instructions

Never add your stupid comments for your stupid and simple code.
You just creating a redundant lines of texts.

YOU should ONLY comment - when things are really hard to understand without additional context.

## Bad Examples

NEVER DO LIKE THIS

```ts
// Creating an effect for explosion
const effect = new ExplosionEffect();
```


Here is OK example

```ts
// Compute the Fresnel integrals at t = T (the end of the normalized spiral)
const { S: S_end, C: C_end } = fresnelApprox(T);
```

```ts
// Edge case: if T is very small or something, avoid dividing by zero
const scale = endDist > 1e-10 ? chordLength / endDist : 1.0;
```
