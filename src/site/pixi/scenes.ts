import { Container, Graphics, Sprite, Text } from 'pixi.js';
import type { TextStyleFill } from 'pixi.js';
import { CtaParts, pua } from 'pua';
import { AssetKey, assetStore, slotFor } from '../assets/AssetStore';
import { CTA_BUTTON, CTA_TITLE, ParamValues, TEXT_DEMO } from '../catalog';
import { theme } from './theme';

export type DemoKind = 'card' | 'popup' | 'button' | 'tutorial' | 'text';

export const sceneAssets: Record<DemoKind, AssetKey[]> = {
  card: ['card'],
  popup: ['popup', 'button'],
  button: ['button'],
  tutorial: ['hand', 'button'],
  text: []
};

export interface Exportable {
  name: string;
  object: Container;
  key?: AssetKey;
}

interface Snapshot {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
  alpha: number;
  visible: boolean;
  text?: string;
  letterSpacing?: number;
  fill?: TextStyleFill;
  stroke?: string | number;
  strokeThickness?: number;
}

export abstract class DemoScene extends Container {
  public abstract readonly target: Container;
  public parts: CtaParts = {};
  private readonly snapshots = new Map<Container, Snapshot>();

  public reset(): void {
    this.snapshots.forEach((snapshot, object) => {
      pua.stop(object);
      object.filters = null;
      object.position.set(snapshot.x, snapshot.y);
      object.scale.set(snapshot.scaleX, snapshot.scaleY);
      object.rotation = snapshot.rotation;
      object.skew.set(snapshot.skewX, snapshot.skewY);
      object.alpha = snapshot.alpha;
      object.visible = snapshot.visible;
      if (object instanceof Text && snapshot.text !== undefined) {
        object.text = snapshot.text;
        object.style.letterSpacing = snapshot.letterSpacing ?? 0;
        object.style.fill = snapshot.fill ?? 0xffffff;
        object.style.stroke = snapshot.stroke ?? 0x000000;
        object.style.strokeThickness = snapshot.strokeThickness ?? 0;
      }
    });
  }

  public applyValues(_values: ParamValues): void {}

  public exportables(): Exportable[] {
    return [];
  }

  protected track(...objects: Container[]): void {
    for (const object of objects) {
      const snapshot: Snapshot = {
        x: object.x,
        y: object.y,
        scaleX: object.scale.x,
        scaleY: object.scale.y,
        rotation: object.rotation,
        skewX: object.skew.x,
        skewY: object.skew.y,
        alpha: object.alpha,
        visible: object.visible
      };
      if (object instanceof Text) {
        snapshot.text = object.text;
        snapshot.letterSpacing = object.style.letterSpacing;
        snapshot.fill = object.style.fill;
        snapshot.stroke = object.style.stroke;
        snapshot.strokeThickness = object.style.strokeThickness;
      }
      this.snapshots.set(object, snapshot);
    }
  }
}

class CardScene extends DemoScene {
  public readonly target: Container;

  constructor() {
    super();
    const card = fromAsset('card', () => drawCard());
    this.addChild(card);
    this.target = card;
    this.track(card);
  }

  public exportables(): Exportable[] {
    return [{ name: 'card', object: this.target, key: 'card' }];
  }
}

class ButtonScene extends DemoScene {
  public readonly target: Container;

  constructor() {
    super();
    const button = fromAsset('button', () => drawButton(CTA_BUTTON));
    this.addChild(button);
    this.target = button;
    this.track(button);
  }

  public exportables(): Exportable[] {
    return [{ name: 'button', object: this.target, key: 'button' }];
  }
}

class PopupScene extends DemoScene {
  public readonly target: Container;
  private readonly background: Container;
  private readonly title: Text;
  private readonly button: Container;
  private readonly buttonLabel?: Text;

  constructor() {
    super();
    const overlay = new Graphics();
    overlay.beginFill(theme.overlay);
    overlay.drawRect(-2000, -2000, 4000, 4000);
    overlay.endFill();
    overlay.alpha = 0.55;

    const panel = new Container();
    this.background = fromAsset('popup', () => drawPanel());
    this.title = new Text(CTA_TITLE, { fontFamily: theme.font, fontSize: 26, fill: theme.ink, align: 'center' });
    this.title.anchor.set(0.5);
    this.title.y = -46;
    this.button = fromAsset('button', () => drawButton(CTA_BUTTON));
    this.button.y = 44;
    this.buttonLabel = textChild(this.button);
    panel.addChild(this.background, this.title, this.button);

    this.addChild(overlay, panel);
    this.target = panel;
    this.parts = { overlay, panel, title: this.title, button: this.button };
    this.track(overlay, panel, this.title, this.button);
  }

  public applyValues(values: ParamValues): void {
    if (typeof values.title === 'string') this.title.text = values.title;
    if (this.buttonLabel && typeof values.buttonLabel === 'string') this.buttonLabel.text = values.buttonLabel;
    this.track(this.title);
  }

  public exportables(): Exportable[] {
    return [
      { name: 'popup', object: this.background, key: 'popup' },
      { name: 'button', object: this.button, key: 'button' }
    ];
  }
}

class TutorialScene extends DemoScene {
  public readonly target: Container;
  private readonly button: Container;

  constructor() {
    super();
    this.button = fromAsset('button', () => drawButton('TAP'));
    this.button.y = 10;
    const hand = fromAsset('hand', () => drawHand());
    hand.position.set(50, 28);

    this.addChild(this.button, hand);
    this.target = hand;
    this.track(this.button, hand);
  }

  public exportables(): Exportable[] {
    return [
      { name: 'hand', object: this.target, key: 'hand' },
      { name: 'button', object: this.button, key: 'button' }
    ];
  }
}

class TextScene extends DemoScene {
  public readonly target: Text;

  constructor() {
    super();
    const text = new Text(TEXT_DEMO, {
      fontFamily: theme.font,
      fontSize: 60,
      fill: theme.accent,
      stroke: theme.ink,
      strokeThickness: 6,
      letterSpacing: 2
    });
    text.anchor.set(0.5);
    this.addChild(text);
    this.target = text;
    this.track(text);
  }

  public applyValues(values: ParamValues): void {
    if (typeof values.content !== 'string') return;
    this.target.text = values.content;
    this.track(this.target);
  }

  public exportables(): Exportable[] {
    return [{ name: 'text', object: this.target }];
  }
}

export function createScene(kind: DemoKind): DemoScene {
  if (kind === 'popup') return new PopupScene();
  if (kind === 'button') return new ButtonScene();
  if (kind === 'tutorial') return new TutorialScene();
  if (kind === 'text') return new TextScene();
  return new CardScene();
}

function textChild(container: Container): Text | undefined {
  return container.children.find((child): child is Text => child instanceof Text);
}

function fromAsset(key: AssetKey, fallback: () => Container): Container {
  const texture = assetStore.texture(key);
  if (!texture) return fallback();

  const slot = slotFor(key);
  const sprite = new Sprite(texture);
  sprite.anchor.set(0.5);
  sprite.scale.set(Math.min(slot.width / texture.width, slot.height / texture.height));

  const wrap = new Container();
  wrap.addChild(sprite);
  return wrap;
}

function drawCard(width = 150, height = 100): Container {
  const container = new Container();

  const card = new Graphics();
  card.lineStyle(3, theme.ink);
  card.beginFill(theme.paper);
  card.drawRoundedRect(-width / 2, -height / 2, width, height, 18);
  card.endFill();

  const star = new Graphics();
  star.lineStyle(2.5, theme.ink);
  star.beginFill(theme.accent);
  star.drawPolygon(starPoints(0, -height * 0.14, height * 0.2, height * 0.09));
  star.endFill();

  const label = new Text('PUA', { fontFamily: theme.font, fontSize: height * 0.28, fill: theme.ink });
  label.anchor.set(0.5);
  label.y = height * 0.25;

  container.addChild(card, star, label);
  return container;
}

function drawPanel(width = 280, height = 190): Container {
  const container = new Container();

  const panel = new Graphics();
  panel.lineStyle(3, theme.ink);
  panel.beginFill(theme.paper);
  panel.drawRoundedRect(-width / 2, -height / 2, width, height, 24);
  panel.endFill();

  const inner = new Graphics();
  inner.lineStyle(2, theme.highlight, 0.3);
  inner.drawRoundedRect(-width / 2 + 10, -height / 2 + 10, width - 20, height - 20, 15);

  container.addChild(panel, inner);
  return container;
}

function drawButton(label: string, width = 150, height = 52): Container {
  const container = new Container();

  const face = new Graphics();
  face.lineStyle(3, theme.ink);
  face.beginFill(theme.accent);
  face.drawRoundedRect(-width / 2, -height / 2, width, height, 18);
  face.endFill();

  const text = new Text(label, { fontFamily: theme.font, fontSize: 24, fill: theme.ink });
  text.anchor.set(0.5);
  text.y = -1;

  container.addChild(face, text);
  return container;
}

// Pointer hand with the fingertip at the origin, so the hand position is the touch point.
function drawHand(): Container {
  const container = new Container();

  const ring = new Graphics();
  ring.lineStyle(3, theme.highlight, 0.55);
  ring.drawCircle(0, 0, 18);

  const hand = new Graphics();
  hand.lineStyle(3, theme.ink, 1);
  hand.beginFill(theme.paper);
  hand.drawRoundedRect(-7, -2, 14, 46, 7);
  hand.drawRoundedRect(-7, 26, 38, 34, 12);
  hand.endFill();
  hand.beginFill(theme.paper);
  hand.drawRoundedRect(6, 14, 12, 36, 6);
  hand.drawRoundedRect(17, 20, 12, 32, 6);
  hand.endFill();

  container.addChild(ring, hand);
  return container;
}

function starPoints(cx: number, cy: number, outer: number, inner: number): number[] {
  const points: number[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    points.push(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  return points;
}
