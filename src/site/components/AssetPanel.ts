import { AssetKey, assetStore, slotFor } from '../assets/AssetStore';
import { h } from '../dom';

export class AssetPanel {
  public readonly el: HTMLElement;
  private keys: AssetKey[] = [];
  private readonly errors = new Set<AssetKey>();
  private readonly unsubscribe: () => void;

  constructor(keys: AssetKey[] = []) {
    this.el = h('div', { class: 'asset-list' });
    this.unsubscribe = assetStore.subscribe(() => this.render());
    this.setKeys(keys);
  }

  public setKeys(keys: AssetKey[]): void {
    this.keys = keys;
    this.render();
  }

  public destroy(): void {
    this.unsubscribe();
  }

  private render(): void {
    this.el.replaceChildren(...this.keys.map((key) => this.row(key)));
  }

  private row(key: AssetKey): HTMLElement {
    const slot = slotFor(key);
    const name = assetStore.name(key);

    const meta = this.errors.has(key)
      ? h('span', { class: 'asset-meta error', text: 'Could not load that file. Use a PNG, JPG, WebP or SVG image.' })
      : name
      ? h('span', { class: 'asset-meta custom', text: name })
      : h('span', { class: 'asset-meta', text: `${slot.hint} · fits ${slot.width}×${slot.height} px` });

    return h(
      'div',
      { class: 'asset-row' },
      h('div', { class: 'asset-info' }, h('span', { class: 'asset-label', text: slot.label }), meta),
      h(
        'div',
        { class: 'toolbar' },
        name
          ? h('button', { class: 'btn btn-sm', type: 'button', text: 'Reset', onclick: () => assetStore.reset(key) })
          : null,
        h('button', {
          class: 'btn btn-sm',
          type: 'button',
          text: name ? 'Replace…' : 'Upload…',
          onclick: () => this.pick(key)
        })
      )
    );
  }

  private pick(key: AssetKey): void {
    const input = h('input', { type: 'file', accept: 'image/*' });
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;

      this.errors.delete(key);
      try {
        await assetStore.load(key, file);
      } catch {
        this.errors.add(key);
        this.render();
      }
    });
    input.click();
  }
}
