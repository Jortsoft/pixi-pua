import { Application, Container, DisplayObject } from 'pixi.js';
import { assetStore } from '../assets/AssetStore';
import { AnimationEntry, ParamValues } from '../catalog';
import { h } from '../dom';
import { createScene, DemoKind, DemoScene } from './scenes';

const REFERENCE_WIDTH = 560;
const REFERENCE_HEIGHT = 300;

export interface ExportedAsset {
  name: string;
  data: Uint8Array;
}

export class PreviewStage {
  public readonly el: HTMLElement;

  private readonly app: Application;
  private readonly content = new Container();
  private readonly observer: ResizeObserver;
  private readonly unsubscribe: () => void;
  private scene?: DemoScene;
  private kind?: DemoKind;
  private last?: { entry: AnimationEntry; values: ParamValues };

  constructor() {
    this.el = h('div', { class: 'preview-stage' });

    this.app = new Application({
      resizeTo: this.el,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      sharedTicker: true
    });
    this.el.append(this.app.view as HTMLCanvasElement);
    this.app.stage.addChild(this.content);

    this.observer = new ResizeObserver(() => this.layout());
    this.observer.observe(this.el);
    this.unsubscribe = assetStore.subscribe(() => this.rebuild());
  }

  public play(entry: AnimationEntry, values: ParamValues): void {
    this.last = { entry, values };
    const scene = this.prepare(entry.demo, values);
    entry.run(scene, values);
  }

  public stop(): void {
    if (this.last) this.prepare(this.last.entry.demo, this.last.values);
  }

  public async exportAssets(): Promise<ExportedAsset[]> {
    if (!this.last) return [];
    const scene = this.sceneFor(this.last.entry.demo);
    scene.reset();
    scene.applyValues(this.last.values);

    const assets: ExportedAsset[] = [];
    for (const item of scene.exportables()) {
      const file = item.key ? assetStore.file(item.key) : undefined;
      if (file) assets.push({ name: item.name + extensionOf(file.name), data: new Uint8Array(await file.arrayBuffer()) });
      else assets.push({ name: `${item.name}.png`, data: await this.renderPng(item.object) });
    }

    this.play(this.last.entry, this.last.values);
    return assets;
  }

  public destroy(): void {
    this.unsubscribe();
    this.observer.disconnect();
    this.dropScene();
    this.app.destroy(true, { children: true });
    this.el.remove();
  }

  private prepare(kind: DemoKind, values: ParamValues): DemoScene {
    const scene = this.sceneFor(kind);
    scene.reset();
    scene.applyValues(values);

    const factor = Number(values.targetScale ?? 1);
    if (factor !== 1) scene.target.scale.set(scene.target.scale.x * factor, scene.target.scale.y * factor);
    return scene;
  }

  private async renderPng(object: DisplayObject): Promise<Uint8Array> {
    const canvas = this.app.renderer.extract.canvas(object) as HTMLCanvasElement;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
    if (!blob) throw new Error('Could not render the asset');
    return new Uint8Array(await blob.arrayBuffer());
  }

  private sceneFor(kind: DemoKind): DemoScene {
    if (this.scene && this.kind === kind) return this.scene;

    this.dropScene();
    this.scene = createScene(kind);
    this.kind = kind;
    this.content.addChild(this.scene);
    return this.scene;
  }

  private dropScene(): void {
    if (!this.scene) return;
    this.scene.reset();
    this.content.removeChild(this.scene);
    this.scene.destroy({ children: true });
    this.scene = undefined;
  }

  private rebuild(): void {
    if (!this.last) return;
    this.dropScene();
    this.play(this.last.entry, this.last.values);
  }

  private layout(): void {
    this.app.resize();
    const { width, height } = this.app.screen;
    this.content.position.set(width / 2, height / 2);
    this.content.scale.set(Math.max(0.5, Math.min(1.4, Math.min(width / REFERENCE_WIDTH, height / REFERENCE_HEIGHT))));
  }
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot > 0 ? filename.slice(dot).toLowerCase() : '.png';
}
