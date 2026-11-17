import { Application, Container, Graphics } from 'pixi.js';
import { assetStore } from '../assets/AssetStore';
import { AnimationEntry, defaultValues } from '../catalog';
import { createScene, DemoScene } from './scenes';

const REPLAY_INTERVAL = 2200;
const STAGGER = 120;
const MAX_STAGGER_TOTAL = 1200;
const REFERENCE_HEIGHT = 300;
const MAX_CANVAS_SIZE = 4096;
const STAGE_RADIUS = 12;

interface Tile {
  entry: AnimationEntry;
  stageEl: HTMLElement;
  root: Container;
  content: Container;
  mask: Graphics;
  scene: DemoScene;
}

// One transparent canvas overlays the whole DOM grid; each tile's PIXI content is positioned
// over its card's stage element and clipped to it. Tiles whose card is hidden are skipped.
export class GalleryStage {
  private readonly app: Application;
  private readonly tiles: Tile[] = [];
  private readonly observer: ResizeObserver;
  private readonly unsubscribe: () => void;
  private timers: number[] = [];

  constructor(private readonly gridEl: HTMLElement) {
    this.app = new Application({
      resizeTo: gridEl,
      backgroundAlpha: 0,
      antialias: true,
      autoDensity: true,
      resolution: 1,
      sharedTicker: true
    });

    const view = this.app.view as HTMLCanvasElement;
    view.className = 'gallery-canvas';
    gridEl.append(view);

    this.observer = new ResizeObserver(() => this.layout());
    this.observer.observe(gridEl);
    this.unsubscribe = assetStore.subscribe(() => this.rebuild());
  }

  public addTile(entry: AnimationEntry, stageEl: HTMLElement): void {
    const root = new Container();
    const mask = new Graphics();
    const content = new Container();
    const scene = createScene(entry.demo);

    content.mask = mask;
    content.addChild(scene);
    root.addChild(mask, content);
    this.app.stage.addChild(root);

    this.tiles.push({ entry, stageEl, root, content, mask, scene });
  }

  public layout(): void {
    const width = this.gridEl.clientWidth;
    const height = this.gridEl.clientHeight;
    const resolution = Math.min(window.devicePixelRatio || 1, 2, MAX_CANVAS_SIZE / Math.max(width, height, 1));
    if (Math.abs(this.app.renderer.resolution - resolution) > 0.01) this.app.renderer.resolution = resolution;
    this.app.resize();

    const base = this.gridEl.getBoundingClientRect();
    for (const tile of this.tiles) {
      const rect = tile.stageEl.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0;
      if (tile.root.visible && !visible) tile.scene.reset();
      tile.root.visible = visible;
      if (!visible) continue;

      tile.root.position.set(rect.left - base.left + rect.width / 2, rect.top - base.top + rect.height / 2);
      tile.mask.clear();
      tile.mask.beginFill(0xffffff);
      tile.mask.drawRoundedRect(-rect.width / 2, -rect.height / 2, rect.width, rect.height, STAGE_RADIUS);
      tile.mask.endFill();
      tile.content.scale.set(Math.max(0.3, Math.min(1, rect.height / REFERENCE_HEIGHT)));
    }
  }

  public start(): void {
    this.stopTimers();
    const visible = this.tiles.filter((tile) => tile.root.visible);
    const stagger = Math.min(STAGGER, MAX_STAGGER_TOTAL / Math.max(1, visible.length));
    visible.forEach((tile, i) => {
      this.timers.push(
        window.setTimeout(() => {
          this.play(tile);
          if (tile.entry.continuous) return;
          this.timers.push(window.setInterval(() => this.play(tile), tile.entry.replayInterval ?? REPLAY_INTERVAL));
        }, i * stagger)
      );
    });
  }

  public refresh(): void {
    this.layout();
    this.start();
  }

  public destroy(): void {
    this.stopTimers();
    this.unsubscribe();
    this.observer.disconnect();
    this.tiles.forEach((tile) => tile.scene.reset());
    this.app.destroy(true, { children: true });
  }

  private play(tile: Tile): void {
    if (!tile.root.visible) return;
    const values = defaultValues(tile.entry.params);
    tile.scene.reset();
    tile.scene.applyValues(values);
    tile.entry.run(tile.scene, values);
  }

  private rebuild(): void {
    for (const tile of this.tiles) {
      tile.scene.reset();
      tile.content.removeChild(tile.scene);
      tile.scene.destroy({ children: true });
      tile.scene = createScene(tile.entry.demo);
      tile.content.addChild(tile.scene);
    }
    this.refresh();
  }

  private stopTimers(): void {
    this.timers.forEach((id) => {
      window.clearTimeout(id);
      window.clearInterval(id);
    });
    this.timers = [];
  }
}
