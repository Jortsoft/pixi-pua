import type { PuaTarget, SlideDirection } from '../types.js';
import type { XY } from './rest.js';

export const DEG_TO_RAD = Math.PI / 180;

export const DIRECTIONS: Record<SlideDirection, XY> = {
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 }
};

export function visualSize(target: PuaTarget): { width: number; height: number } {
  const bounds = target.getLocalBounds();
  return {
    width: bounds.width * Math.abs(target.scale.x),
    height: bounds.height * Math.abs(target.scale.y)
  };
}

const MARGIN = 24;

// Offset (in the parent space of the target) that places the object fully outside the screen.
export function offscreenOffset(target: PuaTarget, direction: SlideDirection): XY {
  const bounds = target.getBounds();
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  let gx = 0;
  let gy = 0;
  if (direction === 'left') gx = -(bounds.x + bounds.width + MARGIN);
  else if (direction === 'right') gx = screenWidth - bounds.x + MARGIN;
  else if (direction === 'top') gy = -(bounds.y + bounds.height + MARGIN);
  else gy = screenHeight - bounds.y + MARGIN;

  const parentTransform = target.parent ? target.parent.worldTransform : null;
  const scaleX = parentTransform ? Math.hypot(parentTransform.a, parentTransform.b) || 1 : 1;
  const scaleY = parentTransform ? Math.hypot(parentTransform.c, parentTransform.d) || 1 : 1;

  return { x: gx / scaleX, y: gy / scaleY };
}
