import { BlurFilter, Filter, VERSION } from 'pixi.js';
import type { Text } from 'pixi.js';
import { PREAMBLE, PREAMBLE_V8, VERTEX_V8 } from './shaders.js';

// Everything that differs between PixiJS v7 and v8 lives here; the casts are deliberate,
// because the same source is compiled against either version's types.

export type Uniforms = Record<string, number | number[]>;
export type ShaderFilter = Filter & { uniforms: Record<string, any> };

export interface TextStroke {
  color: unknown;
  width: number;
  raw: unknown;
}

const PIXI_8 = parseInt(VERSION, 10) >= 8;

export function shaderFilter(fragment: string, uniforms: Uniforms, padding: number): ShaderFilter {
  const Factory = Filter as any;
  let filter: ShaderFilter;

  if (PIXI_8) {
    const group: Record<string, { value: number | Float32Array; type: string }> = {};
    for (const name in uniforms) {
      const value = uniforms[name];
      group[name] =
        typeof value === 'number'
          ? { value, type: 'f32' }
          : { value: new Float32Array(value), type: 'vec' + value.length + '<f32>' };
    }
    filter = Factory.from({
      gl: { vertex: VERTEX_V8, fragment: PREAMBLE_V8 + fragment, name: 'pua-filter' },
      resources: { puaUniforms: group }
    });
    filter.uniforms = (filter as any).resources.puaUniforms.uniforms;
  } else {
    filter = new Factory(Factory.defaultVertexSrc, PREAMBLE + fragment, uniforms);
  }

  filter.padding = padding;
  return filter;
}

export function blurFilter(strength: number): BlurFilter {
  const Factory = BlurFilter as any;
  return PIXI_8 ? new Factory({ strength }) : new Factory(strength);
}

export function setBlur(filter: BlurFilter, value: number): void {
  if (PIXI_8) (filter as any).strength = value;
  else filter.blur = value;
}

export function getStroke(text: Text): TextStroke {
  const style = text.style as any;
  const raw = style.stroke;
  if (!PIXI_8) return { color: raw, width: style.strokeThickness, raw };

  const detailed = raw !== null && typeof raw === 'object' && 'width' in raw;
  if (detailed) return { color: raw.color, width: Number(raw.width) || 0, raw };
  return { color: raw, width: raw === null || raw === undefined ? 0 : 1, raw };
}

export function setStroke(text: Text, color: unknown, width: number): void {
  const style = text.style as any;
  if (PIXI_8) {
    style.stroke = { color: color ?? 0x000000, width };
    return;
  }
  if (color !== undefined && color !== null) style.stroke = color;
  style.strokeThickness = width;
}

export function restoreStroke(text: Text, stroke: TextStroke): void {
  const style = text.style as any;
  style.stroke = stroke.raw;
  if (!PIXI_8) style.strokeThickness = stroke.width;
}
