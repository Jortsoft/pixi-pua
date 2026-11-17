// Shared fragment helpers: unitCoord() maps the filter frame to 0..1, sampleClamped() keeps lookups inside it.
const HELPERS = `
vec2 unitCoord() {
  return vTextureCoord * inputSize.xy / outputFrame.zw;
}

vec4 sampleClamped(vec2 coord) {
  return texture2D(uSampler, clamp(coord, inputClamp.xy, inputClamp.zw));
}
`;

// PixiJS v7 header. The filter vertex shader declares these uniforms as highp; the fragment copies must match or linking fails.
export const PREAMBLE: string =
  `varying vec2 vTextureCoord;
uniform sampler2D uSampler;
uniform highp vec4 inputSize;
uniform highp vec4 inputClamp;
uniform highp vec4 outputFrame;
` + HELPERS;

// PixiJS v8 header: same shader bodies, with the v7 uniform names mapped onto the v8 ones.
export const PREAMBLE_V8: string =
  `varying vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform highp vec4 uInputSize;
uniform highp vec4 uInputClamp;
uniform highp vec4 uOutputFrame;
#define uSampler uTexture
#define inputSize uInputSize
#define inputClamp uInputClamp
#define outputFrame uOutputFrame
` + HELPERS;

export const VERTEX_V8: string = `attribute vec2 aPosition;
varying vec2 vTextureCoord;
uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

void main() {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  gl_Position = vec4(position, 0.0, 1.0);
  vTextureCoord = aPosition * (uOutputFrame.zw * uInputSize.zw);
}
`;

export const SHINE: string = `
uniform float uProgress;
uniform float uWidth;
uniform float uAngle;
uniform float uStrength;
uniform vec3 uColor;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord() - 0.5;
  float d = uv.x * cos(uAngle) + uv.y * sin(uAngle);
  float band = 1.0 - smoothstep(0.0, uWidth, abs(d - uProgress));
  gl_FragColor = color + vec4(uColor * band * band * uStrength * color.a, 0.0);
}
`;

export const GLOW: string = `
uniform float uRadius;
uniform float uStrength;
uniform vec3 uColor;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  float sum = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = 0.785398 * float(i);
    vec2 dir = vec2(cos(a), sin(a)) * inputSize.zw;
    sum += sampleClamped(vTextureCoord + dir * uRadius).a;
    sum += sampleClamped(vTextureCoord + dir * uRadius * 0.5).a;
  }
  float glow = (sum / 16.0) * uStrength;
  gl_FragColor = color + vec4(uColor, 1.0) * glow * (1.0 - color.a);
}
`;

export const DISSOLVE: string = `
uniform float uProgress;
uniform float uScale;
uniform float uEdge;
uniform vec3 uEdgeColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x);
  float b = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x);
  return mix(a, b, f.y);
}

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  float n = noise(uv * uScale) * 0.65 + noise(uv * uScale * 2.7 + 11.3) * 0.35;
  float t = uProgress * (1.0 + 3.0 * uEdge) - 3.0 * uEdge;
  float visible = smoothstep(t, t + uEdge, n);
  float burn = visible * (1.0 - smoothstep(t + uEdge, t + 3.0 * uEdge, n));
  gl_FragColor = color * visible + vec4(uEdgeColor * burn * color.a, 0.0);
}
`;

export const WAVE: string = `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

void main() {
  vec2 uv = unitCoord();
  float offset = sin(uv.x * uFrequency * 6.28318 + uTime) * uAmplitude;
  gl_FragColor = sampleClamped(vTextureCoord + vec2(0.0, offset * inputSize.w));
}
`;

export const PIXELATE: string = `
uniform float uSize;

void main() {
  vec2 px = vTextureCoord * inputSize.xy;
  vec2 snapped = (floor(px / uSize) + 0.5) * uSize;
  gl_FragColor = sampleClamped(snapped * inputSize.zw);
}
`;

export const SHOCKWAVE: string = `
uniform float uProgress;
uniform float uAmplitude;
uniform float uWidth;

void main() {
  vec2 uv = unitCoord();
  vec2 delta = (uv - 0.5) * outputFrame.zw;
  float maxRadius = length(outputFrame.zw) * 0.5;
  float dist = length(delta);
  float radius = uProgress * maxRadius;
  float width = max(uWidth * maxRadius, 1.0);
  float ring = 1.0 - smoothstep(0.0, width, abs(dist - radius));
  float strength = ring * (1.0 - uProgress);
  vec2 dir = dist > 0.0 ? delta / dist : vec2(0.0);
  vec2 offset = -dir * strength * uAmplitude * inputSize.zw;
  vec4 color = sampleClamped(vTextureCoord + offset);
  gl_FragColor = color + vec4(vec3(0.35) * strength * color.a, 0.0);
}
`;

export const GLITCH: string = `
uniform float uStrength;
uniform float uSeed;
uniform float uSlices;
uniform float uSplit;
uniform float uShift;

float hash(float n) {
  return fract(sin(n * 12.9898 + uSeed * 78.233) * 43758.5453);
}

void main() {
  vec2 uv = unitCoord();
  float slice = floor(uv.y * uSlices);
  float r = hash(slice);
  float shift = step(0.6, r) * (r - 0.8) * uShift * uStrength;
  vec2 offset = vec2(shift * outputFrame.z, 0.0) * inputSize.zw;
  vec2 split = vec2(uSplit * uStrength, 0.0) * inputSize.zw;
  vec4 base = sampleClamped(vTextureCoord + offset);
  float red = sampleClamped(vTextureCoord + offset + split).r;
  float blue = sampleClamped(vTextureCoord + offset - split).b;
  gl_FragColor = vec4(min(red, base.a), base.g, min(blue, base.a), base.a);
}
`;

export const HUE: string = `
uniform float uHue;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  const vec3 k = vec3(0.57735);
  float c = cos(uHue);
  float s = sin(uHue);
  vec3 rgb = color.rgb * c + cross(k, color.rgb) * s + k * dot(k, color.rgb) * (1.0 - c);
  gl_FragColor = vec4(clamp(rgb, 0.0, color.a), color.a);
}
`;

export const FLASH: string = `
uniform float uAmount;
uniform vec3 uColor;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(mix(color.rgb, uColor * color.a, uAmount), color.a);
}
`;

export const OUTLINE: string = `
uniform float uThickness;
uniform float uStrength;
uniform vec3 uColor;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  float edge = 0.0;
  for (int i = 0; i < 8; i++) {
    float a = 0.785398 * float(i);
    vec2 dir = vec2(cos(a), sin(a)) * inputSize.zw * uThickness;
    edge = max(edge, sampleClamped(vTextureCoord + dir).a);
  }
  float rim = clamp(edge - color.a, 0.0, 1.0) * uStrength;
  gl_FragColor = color + vec4(uColor, 1.0) * rim;
}
`;

export const GRAYSCALE: string = `
uniform float uAmount;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  gl_FragColor = vec4(mix(color.rgb, vec3(gray), uAmount), color.a);
}
`;

export const SCANLINES: string = `
uniform float uTime;
uniform float uCount;
uniform float uStrength;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  float line = 0.5 + 0.5 * sin((uv.y * uCount + uTime) * 6.28318);
  float band = smoothstep(0.08, 0.0, abs(fract(uv.y - uTime * 0.5) - 0.5)) * 0.25;
  float shade = 1.0 - uStrength * line + band * uStrength;
  gl_FragColor = vec4(clamp(color.rgb * shade, vec3(0.0), vec3(color.a)), color.a);
}
`;

export const RIPPLE: string = `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;

void main() {
  vec2 uv = unitCoord();
  vec2 delta = (uv - 0.5) * outputFrame.zw;
  float dist = length(delta);
  float radius = 0.5 * length(outputFrame.zw);
  float wave = sin((dist / radius) * uFrequency * 6.28318 - uTime * 6.28318);
  vec2 dir = dist > 0.0 ? delta / dist : vec2(0.0);
  vec2 offset = dir * wave * uAmplitude * inputSize.zw;
  gl_FragColor = sampleClamped(vTextureCoord + offset);
}
`;

export const WIPE: string = `
uniform float uProgress;
uniform vec2 uDirection;
uniform float uEdge;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  float along = dot(uv - 0.5, uDirection) + 0.5;
  float reveal = uProgress * (1.0 + uEdge);
  float visible = smoothstep(along, along + uEdge, reveal);
  gl_FragColor = color * visible;
}
`;

export const IRIS: string = `
uniform float uProgress;
uniform float uEdge;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  vec2 delta = (uv - 0.5) * outputFrame.zw;
  float r = length(delta) / (0.5 * length(outputFrame.zw));
  float reveal = uProgress * (1.0 + uEdge);
  float visible = 1.0 - smoothstep(reveal - uEdge, reveal, r);
  gl_FragColor = color * visible;
}
`;

export const CHROMATIC: string = `
uniform float uAmount;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 split = vec2(uAmount, 0.0) * inputSize.zw;
  vec4 left = sampleClamped(vTextureCoord - split);
  vec4 right = sampleClamped(vTextureCoord + split);
  float a = max(color.a, max(left.a, right.a));
  gl_FragColor = vec4(min(right.r, a), min(color.g, a), min(left.b, a), a);
}
`;

export const TWIST: string = `
uniform float uAngle;
uniform float uRadius;

void main() {
  vec2 uv = unitCoord();
  vec2 delta = (uv - 0.5) * outputFrame.zw;
  float maxRadius = 0.5 * length(outputFrame.zw) * uRadius;
  float dist = length(delta);
  float t = dist < maxRadius ? 1.0 - dist / maxRadius : 0.0;
  float a = uAngle * t * t;
  float c = cos(a);
  float s = sin(a);
  vec2 rotated = vec2(delta.x * c - delta.y * s, delta.x * s + delta.y * c);
  gl_FragColor = sampleClamped(vTextureCoord + (rotated - delta) * inputSize.zw);
}
`;

export const SHIMMER: string = `
uniform float uTime;
uniform float uAmplitude;
uniform float uScale;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x);
  float b = mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x);
  return mix(a, b, f.y);
}

void main() {
  vec2 uv = unitCoord();
  float n1 = noise(uv * uScale + vec2(0.0, uTime));
  float n2 = noise(uv * uScale + vec2(uTime, 0.0) + 7.7);
  vec2 offset = (vec2(n1, n2) - 0.5) * 2.0 * uAmplitude * inputSize.zw;
  gl_FragColor = sampleClamped(vTextureCoord + offset);
}
`;

export const BULGE: string = `
uniform float uStrength;
uniform float uRadius;

void main() {
  vec2 uv = unitCoord();
  vec2 delta = uv - 0.5;
  float r = length(delta) * 2.0;
  float k = 1.0;
  if (r < uRadius && r > 0.0) {
    float n = r / uRadius;
    k = pow(n, 1.0 + uStrength) / n;
  }
  vec2 warped = 0.5 + delta * k;
  gl_FragColor = sampleClamped(vTextureCoord + (warped - uv) * outputFrame.zw * inputSize.zw);
}
`;

export const INVERT: string = `
uniform float uAmount;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec3 inverted = vec3(color.a) - color.rgb;
  gl_FragColor = vec4(mix(color.rgb, inverted, uAmount), color.a);
}
`;

export const TINT: string = `
uniform float uAmount;
uniform vec3 uColor;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  gl_FragColor = vec4(mix(color.rgb, color.rgb * uColor, uAmount), color.a);
}
`;

export const ZOOM_BLUR: string = `
uniform float uStrength;

void main() {
  vec2 uv = unitCoord();
  vec2 toCenter = (0.5 - uv) * outputFrame.zw * inputSize.zw;
  vec4 sum = vec4(0.0);
  for (int i = 0; i < 12; i++) {
    float t = float(i) / 11.0;
    sum += sampleClamped(vTextureCoord + toCenter * t * uStrength);
  }
  gl_FragColor = sum / 12.0;
}
`;

export const BLINDS: string = `
uniform float uProgress;
uniform float uCount;
uniform float uEdge;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  float strip = fract(uv.y * uCount);
  float reveal = uProgress * (1.0 + uEdge);
  float visible = smoothstep(strip, strip + uEdge, reveal);
  gl_FragColor = color * visible;
}
`;

export const GLITTER: string = `
uniform float uTime;
uniform float uDensity;
uniform float uStrength;
uniform vec3 uColor;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord() * vec2(outputFrame.z / outputFrame.w, 1.0);
  vec2 cell = floor(uv * uDensity);
  vec2 local = fract(uv * uDensity) - 0.5;
  float h = hash(cell);
  float phase = fract(uTime + h * 3.0);
  float twinkle = sin(phase * 3.14159);
  vec2 center = (vec2(hash(cell + 1.3), hash(cell + 2.7)) - 0.5) * 0.5;
  float spot = 1.0 - smoothstep(0.0, 0.2, length(local - center));
  float sparkle = step(0.55, h) * twinkle * spot;
  gl_FragColor = color + vec4(uColor, 1.0) * sparkle * uStrength * color.a;
}
`;

export const SEPIA: string = `
uniform float uAmount;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec3 tone = vec3(
    dot(color.rgb, vec3(0.393, 0.769, 0.189)),
    dot(color.rgb, vec3(0.349, 0.686, 0.168)),
    dot(color.rgb, vec3(0.272, 0.534, 0.131))
  );
  gl_FragColor = vec4(mix(color.rgb, min(tone, vec3(color.a)), uAmount), color.a);
}
`;

export const BRIGHTNESS: string = `
uniform float uAmount;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec3 lit = uAmount >= 0.0 ? mix(color.rgb, vec3(color.a), uAmount) : color.rgb * (1.0 + uAmount);
  gl_FragColor = vec4(lit, color.a);
}
`;

export const STATIC_NOISE: string = `
uniform float uSeed;
uniform float uStrength;
uniform float uSize;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 cell = floor(vTextureCoord * inputSize.xy / uSize);
  float n = hash(cell + vec2(uSeed * 113.0, uSeed * 71.0));
  gl_FragColor = vec4(mix(color.rgb, vec3(n) * color.a, uStrength), color.a);
}
`;

export const HOLOGRAM: string = `
uniform float uTime;
uniform float uStrength;
uniform float uScale;
uniform vec2 uDirection;

vec3 spectrum(float h) {
  return clamp(abs(fract(h + vec3(0.0, 0.6667, 0.3333)) * 6.0 - 3.0) - 1.0, 0.0, 1.0);
}

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  vec3 tint = spectrum(dot(uv, uDirection) * uScale + uTime) * color.a;
  vec3 mixed = mix(color.rgb, tint, uStrength * 0.5) + tint * uStrength * 0.2;
  gl_FragColor = vec4(min(mixed, vec3(color.a)), color.a);
}
`;

export const CLOCK_WIPE: string = `
uniform float uProgress;
uniform float uEdge;
uniform float uSide;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 d = unitCoord() - 0.5;
  float angle = fract(atan(d.x * uSide, -d.y) / 6.28318 + 1.0);
  float reveal = uProgress * (1.0 + uEdge);
  float visible = smoothstep(angle, angle + uEdge, reveal);
  gl_FragColor = color * visible;
}
`;

export const COOLDOWN: string = `
uniform float uProgress;
uniform float uDim;
uniform float uSide;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 d = unitCoord() - 0.5;
  float angle = fract(atan(d.x * uSide, -d.y) / 6.28318 + 1.0);
  float ready = step(angle, uProgress);
  gl_FragColor = vec4(color.rgb * mix(1.0 - uDim, 1.0, ready), color.a);
}
`;

export const TILES: string = `
uniform float uProgress;
uniform float uCount;
uniform float uEdge;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 uv = unitCoord();
  vec2 grid = vec2(max(1.0, floor(uCount * outputFrame.z / outputFrame.w + 0.5)), uCount);
  vec2 cell = floor(uv * grid);
  float order = (cell.x / grid.x + cell.y / grid.y) * 0.5;
  vec2 local = abs(fract(uv * grid) - 0.5) * 2.0;
  float t = clamp((uProgress * (1.0 + uEdge) - order) / uEdge, 0.0, 1.0);
  float visible = step(max(local.x, local.y), t) * step(0.001, t);
  gl_FragColor = color * visible;
}
`;

export const SLICES: string = `
uniform float uProgress;
uniform float uCount;

void main() {
  vec2 uv = unitCoord();
  float side = mod(floor(uv.y * uCount), 2.0) * 2.0 - 1.0;
  float shift = side * (1.0 - uProgress);
  float x = uv.x + shift;
  vec4 color = sampleClamped(vTextureCoord + vec2(shift * outputFrame.z * inputSize.z, 0.0));
  gl_FragColor = color * step(0.0, x) * step(x, 1.0);
}
`;

export const MELT: string = `
uniform float uProgress;
uniform float uColumns;

float hash(float n) {
  return fract(sin(n * 127.1) * 43758.5453);
}

void main() {
  vec2 uv = unitCoord();
  float column = floor(uv.x * uColumns);
  float drop = uProgress * uProgress * (0.8 + hash(column)) * 1.3;
  vec4 color = sampleClamped(vTextureCoord - vec2(0.0, drop * outputFrame.w * inputSize.w));
  gl_FragColor = color * step(0.0, uv.y - drop);
}
`;

export const RING: string = `
uniform float uProgress;
uniform float uWidth;
uniform float uStrength;
uniform vec3 uColor;

void main() {
  vec4 color = texture2D(uSampler, vTextureCoord);
  vec2 delta = (unitCoord() - 0.5) * outputFrame.zw;
  float r = length(delta) / (0.5 * length(outputFrame.zw));
  float ring = 1.0 - smoothstep(0.0, uWidth, abs(r - uProgress));
  gl_FragColor = color + vec4(uColor, 1.0) * ring * (1.0 - uProgress) * uStrength * color.a;
}
`;
