import { animationCatalog, AnimationEntry, componentFor, ParamValues, PUA_VERSION, SCALE_PARAM } from '../catalog';
import { AssetPanel } from '../components/AssetPanel';
import { CodeBlock, usageCode } from '../components/CodeBlock';
import { DevPanel } from '../components/DevPanel';
import { h } from '../dom';
import { downloadComponent } from '../download/download';
import { PreviewStage } from '../pixi/PreviewStage';
import { sceneAssets } from '../pixi/scenes';
import { routeHref } from '../router';
import { buildStandalone } from '../standalone/bundle';
import { Page } from './Page';

export class AnimationPage implements Page {
  public readonly el: HTMLElement;

  private readonly eyebrow = h('div', { class: 'eyebrow' });
  private readonly title = h('h1', { class: 'page-title' });
  private readonly lead = h('p', { class: 'lead' });
  private readonly signature = h('code');
  private readonly stageHost = h('div', { class: 'preview-wrap' });
  private readonly devPanel: DevPanel;
  private readonly assetPanel = new AssetPanel();
  private readonly assetCard: HTMLElement;
  private readonly code = new CodeBlock('Usage · copy & paste');
  private readonly source = new CodeBlock('Component source', { tall: true });
  private readonly downloadButton: HTMLButtonElement;
  private readonly pager = h('div', { class: 'pager' });

  private stage?: PreviewStage;
  private entry?: AnimationEntry;
  private values: ParamValues = {};

  constructor() {
    this.devPanel = new DevPanel((values, commit) => {
      this.values = values;
      this.refresh(commit);
    });

    const replayButton = h('button', { class: 'btn btn-sm', type: 'button', text: 'Replay', onclick: () => this.replay() });
    const stopButton = h('button', { class: 'btn btn-sm', type: 'button', text: 'Stop', onclick: () => this.stage?.stop() });
    const resetButton = h('button', {
      class: 'btn btn-sm',
      type: 'button',
      text: 'Reset',
      onclick: () => this.devPanel.reset()
    });
    this.downloadButton = h('button', {
      class: 'btn btn-sm btn-primary',
      type: 'button',
      text: 'Download .zip',
      title: 'Component source, usage snippet, preset values and the preview assets',
      onclick: () => this.download()
    });

    this.assetCard = h(
      'div',
      { class: 'card' },
      h('div', { class: 'card-header' }, h('span', { class: 'card-title', text: 'Assets' })),
      this.assetPanel.el
    );

    this.el = h(
      'div',
      { class: 'page' },
      h('div', null, this.eyebrow, this.title, this.lead),
      h(
        'div',
        { class: 'card' },
        h(
          'div',
          { class: 'card-header' },
          h('span', { class: 'card-title', text: 'Live preview' }),
          h('div', { class: 'toolbar' }, stopButton, replayButton, this.downloadButton)
        ),
        this.stageHost
      ),
      h(
        'div',
        { class: 'two-col' },
        h(
          'div',
          { class: 'card' },
          h('div', { class: 'card-header' }, h('span', { class: 'card-title', text: 'Dev panel' }), resetButton),
          h('div', { class: 'card-body' }, this.devPanel.el)
        ),
        this.code.el
      ),
      this.source.el,
      h(
        'div',
        { class: 'two-col' },
        this.assetCard,
        h(
          'div',
          { class: 'card' },
          h('div', { class: 'card-header' }, h('span', { class: 'card-title', text: 'Signature' })),
          h('div', { class: 'signature' }, this.signature)
        )
      ),
      this.pager
    );
  }

  public mount(container: HTMLElement): void {
    this.stage = new PreviewStage();
    this.stage.el.addEventListener('click', this.replay);
    this.stageHost.replaceChildren(this.stage.el, h('div', { class: 'preview-hint', text: 'Click the stage to replay' }));
    container.append(this.el);
    this.replay();
  }

  public unmount(): void {
    this.stage?.el.removeEventListener('click', this.replay);
    this.stage?.destroy();
    this.stage = undefined;
    this.el.remove();
  }

  public show(entry: AnimationEntry): void {
    this.entry = entry;
    this.eyebrow.replaceChildren(
      h('a', { class: 'crumb', href: routeHref({ name: 'home' }), text: 'Gallery' }),
      h('span', { class: 'crumb-sep', text: '/' }),
      h('span', { text: entry.group })
    );
    this.title.replaceChildren(h('code', { text: `${entry.id}()` }));
    this.lead.textContent = entry.description;
    this.signature.textContent = entry.signature;
    this.values = this.devPanel.setParams([SCALE_PARAM, ...entry.params]);

    const component = componentFor(entry);
    this.source.setTitle(`Component source · ${component.name}.ts`);
    this.source.setCode(buildStandalone(component, PUA_VERSION));

    const keys = sceneAssets[entry.demo];
    this.assetPanel.setKeys(keys);
    this.assetCard.hidden = keys.length === 0;

    this.renderPager(entry);
    this.refresh(true);
  }

  private refresh(replay: boolean): void {
    if (!this.entry) return;
    this.code.setCode(usageCode(this.entry, this.values));
    if (replay) this.replay();
  }

  private replay = (): void => {
    if (this.entry && this.stage) this.stage.play(this.entry, this.values);
  };

  private async download(): Promise<void> {
    if (!this.entry || !this.stage) return;
    this.downloadButton.disabled = true;
    this.downloadButton.textContent = 'Preparing…';
    try {
      await downloadComponent(this.entry, this.values, this.stage);
      this.downloadButton.textContent = 'Downloaded';
    } catch {
      this.downloadButton.textContent = 'Download failed';
    }
    window.setTimeout(() => {
      this.downloadButton.disabled = false;
      this.downloadButton.textContent = 'Download .zip';
    }, 1600);
  }

  private renderPager(entry: AnimationEntry): void {
    const index = animationCatalog.indexOf(entry);
    const previous = animationCatalog[index - 1];
    const next = animationCatalog[index + 1];

    this.pager.replaceChildren(
      previous ? this.pagerLink(previous, 'Previous', 'prev') : h('span'),
      next ? this.pagerLink(next, 'Next', 'next') : h('span')
    );
  }

  private pagerLink(entry: AnimationEntry, label: string, cls: string): HTMLElement {
    return h(
      'a',
      { class: `card ${cls}`, href: routeHref({ name: 'animation', id: entry.id }) },
      h('span', { class: 'pager-label', text: label }),
      h('span', { class: 'pager-name', text: `${entry.id}()` })
    );
  }
}
