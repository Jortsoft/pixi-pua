import { Texture } from 'pixi.js';

export type AssetKey = 'card' | 'popup' | 'button' | 'hand';

export interface AssetSlot {
  key: AssetKey;
  label: string;
  hint: string;
  width: number;
  height: number;
}

export const assetSlots: AssetSlot[] = [
  {
    key: 'card',
    label: 'Target card',
    hint: 'Used by the preset and shader demos',
    width: 180,
    height: 120
  },
  { key: 'popup', label: 'Popup panel', hint: 'Background of the CTA popup', width: 280, height: 190 },
  { key: 'button', label: 'Button', hint: 'CTA / play button', width: 170, height: 64 },
  { key: 'hand', label: 'Tutorial hand', hint: 'Pointer used by the tutorial animations', width: 72, height: 90 }
];

export function slotFor(key: AssetKey): AssetSlot {
  return assetSlots.find((slot) => slot.key === key) as AssetSlot;
}

type Listener = () => void;

class AssetStore {
  private readonly textures = new Map<AssetKey, Texture>();
  private readonly names = new Map<AssetKey, string>();
  private readonly files = new Map<AssetKey, File>();
  private readonly urls = new Map<AssetKey, string>();
  private readonly listeners = new Set<Listener>();

  public texture(key: AssetKey): Texture | undefined {
    return this.textures.get(key);
  }

  public name(key: AssetKey): string | undefined {
    return this.names.get(key);
  }

  public file(key: AssetKey): File | undefined {
    return this.files.get(key);
  }

  public async load(key: AssetKey, file: File): Promise<void> {
    const url = URL.createObjectURL(file);
    let texture: Texture;

    try {
      texture = await Texture.fromURL(url);
    } catch (error) {
      URL.revokeObjectURL(url);
      throw error;
    }

    this.dispose(key);
    this.textures.set(key, texture);
    this.names.set(key, file.name);
    this.files.set(key, file);
    this.urls.set(key, url);
    this.emit();
  }

  public reset(key: AssetKey): void {
    if (!this.textures.has(key)) return;
    this.dispose(key);
    this.emit();
  }

  public resetAll(): void {
    if (this.textures.size === 0) return;
    for (const key of [...this.textures.keys()]) this.dispose(key);
    this.emit();
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private dispose(key: AssetKey): void {
    this.textures.get(key)?.destroy(true);
    const url = this.urls.get(key);
    if (url) URL.revokeObjectURL(url);
    this.textures.delete(key);
    this.names.delete(key);
    this.files.delete(key);
    this.urls.delete(key);
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }
}

export const assetStore = new AssetStore();
