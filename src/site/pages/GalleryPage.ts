import { assetSlots } from '../assets/AssetStore';
import { animationCatalog, AnimationEntry, animationGroups, gameTags } from '../catalog';
import { AssetPanel } from '../components/AssetPanel';
import { h } from '../dom';
import { GalleryStage } from '../pixi/GalleryStage';
import type { DemoKind } from '../pixi/scenes';
import { routeHref } from '../router';
import { Page } from './Page';

type Facet = 'behavior' | 'games' | 'target';
type SortMode = 'type' | 'name';

interface Tag {
  facet: Facet;
  value: string;
  key: string;
}

interface GalleryCard {
  entry: AnimationEntry;
  el: HTMLElement;
  stageEl: HTMLElement;
}

interface Section {
  group: string;
  grid: HTMLElement;
  cards: GalleryCard[];
  toggle: HTMLButtonElement;
  more: HTMLButtonElement;
}

const FACETS: Facet[] = ['behavior', 'games', 'target'];
const FACET_LABELS: Record<Facet, string> = { behavior: 'Behavior', games: 'Games', target: 'Target' };
const BEHAVIORS = ['Loop', 'One-shot', 'Entrance', 'Exit'];
const TARGETS: Record<DemoKind, string> = {
  card: 'Any object',
  popup: 'Popup',
  button: 'Button',
  tutorial: 'Hand',
  text: 'Text'
};
const ENTRANCE = /In$|Drop$|SlideUp$|^ctaShow$|^pop$|^stamp$|^swirl$|^typewriter$/;
const EXIT = /Out$|Down$|^ctaHide$|^backspace$/;

export const GROUP_TONES: Record<string, string> = {
  Presets: 'volt',
  'CTA Popup': 'rose',
  Button: 'sky',
  Tutorial: 'mint',
  Text: 'sun',
  Shaders: 'iris'
};
const TAG_TONES: Record<string, string> = {
  Loop: 'sky',
  'One-shot': 'gray',
  Entrance: 'mint',
  Exit: 'coral',
  'Any object': 'gray',
  Popup: 'rose',
  Button: 'sky',
  Hand: 'mint',
  Text: 'sun'
};

const SEARCH_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></svg>';
const FILTER_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-7 0v6"/></svg>';

const state = {
  query: '',
  type: '',
  tags: new Set<string>(),
  filtersOpen: false,
  assetsOpen: false,
  open: new Set<string>(),
  sort: 'type' as SortMode,
  scroll: 0
};

export function behaviorOf(entry: AnimationEntry): string[] {
  const list = [entry.continuous ? 'Loop' : 'One-shot'];
  if (ENTRANCE.test(entry.id)) list.push('Entrance');
  if (EXIT.test(entry.id)) list.push('Exit');
  return list;
}

function facetValues(entry: AnimationEntry, facet: Facet): string[] {
  if (facet === 'behavior') return behaviorOf(entry);
  if (facet === 'games') return entry.games ?? gameTags;
  return [TARGETS[entry.demo]];
}

function toneOf(facet: Facet, value: string): string {
  return TAG_TONES[value] ?? (facet === 'games' ? 'volt' : 'gray');
}

export class GalleryPage implements Page {
  public readonly el: HTMLElement;
  public onTypeChange?: (type: string) => void;

  private readonly cards: GalleryCard[] = [];
  private readonly tags: Tag[] = [];
  private readonly search: HTMLInputElement;
  private readonly clearButton: HTMLButtonElement;
  private readonly filtersToggle: HTMLButtonElement;
  private readonly filtersPanel: HTMLElement;
  private readonly assetsToggle: HTMLButtonElement;
  private readonly assetsCard: HTMLElement;
  private readonly count: HTMLElement;
  private readonly active: HTMLElement;
  private readonly results: HTMLElement;
  private readonly grids: HTMLElement;
  private readonly empty: HTMLElement;
  private readonly assetPanel = new AssetPanel(assetSlots.map((slot) => slot.key));
  private readonly observer: ResizeObserver;
  private sections: Section[] = [];
  private stage?: GalleryStage;
  private mounted = false;
  private columns = 1;
  private resizeFrame = 0;

  constructor() {
    for (const entry of animationCatalog) this.cards.push(this.createCard(entry));

    for (const facet of FACETS) {
      const values = facet === 'behavior' ? BEHAVIORS : facet === 'games' ? gameTags : Object.values(TARGETS);
      for (const value of values) {
        if (animationCatalog.some((entry) => facetValues(entry, facet).includes(value))) {
          this.tags.push({ facet, value, key: `${facet}:${value}` });
        }
      }
    }

    this.search = h('input', {
      type: 'search',
      placeholder: 'Search names, tags or games…',
      autocomplete: 'off',
      'aria-label': 'Search all components',
      value: state.query
    });
    this.search.addEventListener('input', () => {
      state.query = this.search.value;
      this.render();
    });
    this.search.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        state.query = '';
        this.search.value = '';
        this.render();
      }
    });
    this.clearButton = h('button', {
      class: 'catalog-clear',
      type: 'button',
      'aria-label': 'Clear search',
      text: '×',
      onclick: () => {
        state.query = '';
        this.search.value = '';
        this.render();
        this.search.focus();
      }
    });

    this.filtersPanel = h('div', { class: 'catalog-filters', id: 'catalog-filters' });
    this.filtersToggle = h('button', {
      class: 'btn catalog-tags-toggle',
      type: 'button',
      'aria-controls': 'catalog-filters',
      onclick: () => {
        state.filtersOpen = !state.filtersOpen;
        this.renderPanels();
      }
    });

    this.assetsCard = h(
      'div',
      { class: 'card catalog-assets' },
      h('div', { class: 'card-header' }, h('span', { class: 'card-title', text: 'Custom assets' })),
      this.assetPanel.el
    );
    this.assetsToggle = h('button', {
      class: 'btn btn-sm',
      type: 'button',
      text: 'Custom assets',
      onclick: () => {
        state.assetsOpen = !state.assetsOpen;
        this.renderPanels();
      }
    });

    const sortSelect = h(
      'select',
      { class: 'catalog-select', 'aria-label': 'Sort' },
      h('option', { value: 'type', text: 'Sort: by type', selected: state.sort === 'type' }),
      h('option', { value: 'name', text: 'Sort: A → Z', selected: state.sort === 'name' })
    );
    sortSelect.addEventListener('change', () => {
      state.sort = sortSelect.value as SortMode;
      this.render();
    });

    this.count = h('span', { class: 'catalog-count', role: 'status', 'aria-live': 'polite' });
    this.active = h('div', { class: 'catalog-active', 'aria-label': 'Active filters' });
    this.grids = h('div', { class: 'catalog-grids' });
    this.results = h('div', { class: 'catalog-results', 'aria-label': 'Matching components' }, this.grids);
    this.empty = h(
      'div',
      { class: 'catalog-empty', hidden: true },
      h('h2', { text: 'No matching components' }),
      h('p', { text: 'Try another name, game or fewer tags.' }),
      h('button', { class: 'btn', type: 'button', text: 'Clear filters', onclick: () => this.reset() })
    );

    this.el = h(
      'div',
      { class: 'page catalog' },
      h(
        'div',
        null,
        h('div', { class: 'eyebrow', text: 'Gallery' }),
        h('h1', { class: 'page-title', text: 'Pixi UI Animations' }),
        h('p', {
          class: 'lead',
          text: 'Ready-to-use UI components for PixiJS playables. Search by name, tag or game, open a card to tune it, then copy or download the component.'
        })
      ),
      h(
        'div',
        { class: 'catalog-toolbar' },
        h(
          'label',
          { class: 'catalog-search' },
          h('span', { class: 'catalog-icon', innerHTML: SEARCH_ICON }),
          this.search,
          this.clearButton
        ),
        this.filtersToggle
      ),
      this.filtersPanel,
      h(
        'div',
        { class: 'catalog-bar' },
        h(
          'div',
          { class: 'catalog-bar-info' },
          this.count,
          h('span', { class: 'catalog-hint', text: 'Live previews · click a card to tune' })
        ),
        h('div', { class: 'toolbar' }, this.assetsToggle, sortSelect)
      ),
      this.assetsCard,
      this.active,
      this.results,
      this.empty
    );

    this.observer = new ResizeObserver(() => this.onResize());
    this.render();
  }

  public mount(container: HTMLElement): void {
    container.append(this.el);
    this.mounted = true;

    const stage = new GalleryStage(this.results);
    this.cards.forEach((card) => stage.addTile(card.entry, card.stageEl));
    this.stage = stage;
    this.observer.observe(this.results);

    window.requestAnimationFrame(() => {
      if (this.stage !== stage) return;
      this.columns = this.columnCount();
      this.updateRows();
      window.scrollTo({ top: state.scroll });
      stage.refresh();
    });
  }

  public unmount(): void {
    state.scroll = window.scrollY;
    this.mounted = false;
    this.observer.disconnect();
    window.cancelAnimationFrame(this.resizeFrame);
    this.resizeFrame = 0;
    this.stage?.destroy();
    this.stage = undefined;
    this.el.remove();
  }

  public get type(): string {
    return state.type;
  }

  public setType(type: string): void {
    this.selectType(type);
  }

  private createCard(entry: AnimationEntry): GalleryCard {
    const stageEl = h('div', { class: 'gallery-card-stage' });
    const chips = h('div', { class: 'gallery-card-tags' });
    const el = h(
      'article',
      { class: 'card gallery-card', dataset: { tone: GROUP_TONES[entry.group] ?? 'gray' } },
      h(
        'a',
        {
          class: 'gallery-card-link',
          href: routeHref({ name: 'animation', id: entry.id }),
          'aria-label': `Open ${entry.id}`,
          title: entry.description
        },
        h(
          'div',
          { class: 'gallery-card-art' },
          stageEl,
          entry.continuous ? h('span', { class: 'gallery-card-badge', text: 'loop' }) : null,
          h('span', { class: 'gallery-card-open', 'aria-hidden': 'true', text: '↗' })
        ),
        h(
          'div',
          { class: 'gallery-card-body' },
          h('h2', { class: 'gallery-card-name', text: `${entry.id}()` }),
          h('p', { class: 'gallery-card-summary', text: entry.summary })
        )
      ),
      chips
    );
    const card = { entry, el, stageEl };
    this.renderChips(card, chips, false);
    return card;
  }

  private renderChips(card: GalleryCard, chips: HTMLElement, expanded: boolean): void {
    const { entry } = card;
    const typeChip = this.chip(entry.group, GROUP_TONES[entry.group] ?? 'gray', state.type === entry.group, () =>
      this.selectType(state.type === entry.group ? '' : entry.group)
    );
    const rest: HTMLElement[] = [];
    for (const facet of FACETS) {
      if (facet === 'games' && !entry.games) continue;
      for (const value of facetValues(entry, facet)) {
        const key = `${facet}:${value}`;
        rest.push(this.chip(value, toneOf(facet, value), state.tags.has(key), () => this.toggleTag(key)));
      }
    }
    const visible = expanded ? rest : rest.slice(0, 1);
    const hidden = rest.length - visible.length;
    const nodes: HTMLElement[] = [typeChip, ...visible];
    if (hidden > 0 || expanded) {
      nodes.push(
        h('button', {
          class: 'gallery-card-more',
          type: 'button',
          text: expanded ? 'Less' : `+${hidden}`,
          'aria-expanded': String(expanded),
          'aria-label': expanded ? `Show fewer tags for ${entry.id}` : `Show all tags for ${entry.id}`,
          onclick: () => this.renderChips(card, chips, !expanded)
        })
      );
    }
    chips.replaceChildren(...nodes);
  }

  private chip(value: string, tone: string, pressed: boolean, onClick: () => void): HTMLButtonElement {
    return h('button', {
      class: 'tag-chip',
      type: 'button',
      text: value,
      dataset: { tone },
      'aria-pressed': String(pressed),
      'aria-label': `Filter by ${value}`,
      onclick: onClick
    });
  }

  private selectType(type: string): void {
    state.type = type;
    const scope = animationCatalog.filter((entry) => !type || entry.group === type);
    for (const tag of this.tags) {
      if (state.tags.has(tag.key) && !scope.some((entry) => facetValues(entry, tag.facet).includes(tag.value))) {
        state.tags.delete(tag.key);
      }
    }
    this.onTypeChange?.(type);
    this.render();
  }

  private toggleTag(key: string): void {
    if (state.tags.has(key)) state.tags.delete(key);
    else state.tags.add(key);
    this.render();
  }

  private reset(): void {
    state.query = '';
    state.type = '';
    state.tags.clear();
    this.search.value = '';
    this.onTypeChange?.('');
    this.render();
    this.search.focus();
  }

  private matches(entry: AnimationEntry, words: string[]): boolean {
    if (state.type && entry.group !== state.type) return false;
    const text = [
      entry.id,
      entry.summary,
      entry.description,
      entry.group,
      ...FACETS.flatMap((facet) => facetValues(entry, facet))
    ]
      .join(' ')
      .toLowerCase();
    if (!words.every((word) => text.includes(word))) return false;

    for (const facet of FACETS) {
      const chosen = this.tags.filter((tag) => tag.facet === facet && state.tags.has(tag.key));
      if (chosen.length === 0) continue;
      const own = facetValues(entry, facet);
      if (!chosen.some((tag) => own.includes(tag.value))) return false;
    }
    return true;
  }

  private render(): void {
    const words = state.query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const browsing = words.length === 0 && state.tags.size === 0;
    const matched = this.cards.filter((card) => this.matches(card.entry, words));
    const sorted = state.sort === 'name' ? [...matched].sort((a, b) => a.entry.id.localeCompare(b.entry.id)) : matched;

    this.clearButton.hidden = !state.query;
    this.renderPanels();
    this.renderActive();
    this.count.textContent = `${matched.length} of ${this.cards.length} components`;

    for (const card of this.cards) {
      const show = matched.includes(card);
      card.el.hidden = !show;
      this.renderChips(card, card.el.querySelector('.gallery-card-tags') as HTMLElement, false);
    }

    this.sections = [];
    this.grids.replaceChildren();
    const grouped = !state.type;
    this.grids.classList.toggle('catalog-grouped', grouped);

    if (grouped) {
      for (const group of animationGroups) {
        const cards = sorted.filter((card) => card.entry.group === group);
        if (cards.length === 0) continue;
        this.grids.append(this.section(group, cards, browsing));
      }
    } else {
      const grid = h(
        'div',
        { class: 'catalog-grid' },
        sorted.map((card) => card.el)
      );
      this.grids.append(grid);
    }

    this.empty.hidden = matched.length > 0;
    this.columns = this.columnCount();
    this.updateRows();
    if (this.mounted) this.stage?.refresh();
  }

  private section(group: string, cards: GalleryCard[], collapsible: boolean): HTMLElement {
    const grid = h(
      'div',
      { class: 'catalog-grid' },
      cards.map((card) => card.el)
    );
    const toggle = h('button', { class: 'btn btn-sm catalog-section-toggle', type: 'button', hidden: true });
    const more = h('button', { class: 'catalog-more', type: 'button', hidden: true });
    const section: Section = { group, grid, cards, toggle, more };
    const flip = (): void => {
      if (state.open.has(group)) state.open.delete(group);
      else state.open.add(group);
      this.updateRows();
      this.stage?.refresh();
    };
    toggle.addEventListener('click', flip);
    more.addEventListener('click', flip);
    if (collapsible) this.sections.push(section);

    return h(
      'section',
      { class: 'catalog-section', dataset: { tone: GROUP_TONES[group] ?? 'gray' } },
      h(
        'header',
        { class: 'catalog-section-header' },
        h('h2', { class: 'catalog-section-title' }, h('span', { text: group }), h('small', { text: String(cards.length) })),
        toggle
      ),
      grid
    );
  }

  private columnCount(): number {
    const grid = this.results.querySelector('.catalog-grid');
    return grid ? Math.max(1, getComputedStyle(grid).gridTemplateColumns.split(' ').length) : 1;
  }

  // Row limits change the results height, which re-triggers the observer: defer and skip unchanged widths.
  private onResize(): void {
    if (this.resizeFrame) return;
    this.resizeFrame = window.requestAnimationFrame(() => {
      this.resizeFrame = 0;
      const columns = this.columnCount();
      if (columns === this.columns) return;
      this.columns = columns;
      this.updateRows();
      this.stage?.layout();
    });
  }

  private updateRows(): void {
    for (const section of this.sections) {
      const columns = this.columns;
      const expanded = state.open.has(section.group);
      const total = section.cards.length;
      const needsMore = !expanded && total > columns;
      const limit = needsMore ? Math.max(1, columns - 1) : total;
      const remaining = total - limit;

      section.cards.forEach((card, index) => {
        card.el.hidden = !expanded && index >= limit;
      });

      section.more.hidden = !needsMore;
      if (needsMore) {
        section.more.replaceChildren(h('strong', { text: `+${remaining}` }), h('span', { text: 'Show all' }));
        section.more.title = `Show all ${total} ${section.group} components`;
        section.grid.append(section.more);
      } else section.more.remove();

      section.toggle.hidden = total <= columns;
      section.toggle.textContent = expanded ? 'Show less' : `Show all (${total})`;
      section.toggle.setAttribute('aria-expanded', String(expanded));
    }
  }

  private renderPanels(): void {
    this.filtersPanel.hidden = !state.filtersOpen;
    this.filtersToggle.setAttribute('aria-expanded', String(state.filtersOpen));
    const filterCount = state.tags.size + (state.type ? 1 : 0);
    this.filtersToggle.replaceChildren(
      h('span', { class: 'catalog-icon', innerHTML: FILTER_ICON }),
      h('span', { text: filterCount > 0 ? `Tags (${filterCount})` : 'Tags' })
    );
    this.assetsCard.hidden = !state.assetsOpen;
    this.assetsToggle.setAttribute('aria-expanded', String(state.assetsOpen));
    this.assetsToggle.classList.toggle('active', state.assetsOpen);

    const typeField = h('fieldset', null, h('legend', { text: 'Component type' }));
    typeField.append(this.chip('All types', 'gray', state.type === '', () => this.selectType('')));
    for (const group of animationGroups) {
      typeField.append(this.chip(group, GROUP_TONES[group] ?? 'gray', state.type === group, () => this.selectType(group)));
    }
    const fields = [typeField];

    const scope = animationCatalog.filter((entry) => !state.type || entry.group === state.type);
    for (const facet of FACETS) {
      const options = this.tags.filter(
        (tag) => tag.facet === facet && scope.some((entry) => facetValues(entry, facet).includes(tag.value))
      );
      if (options.length === 0) continue;
      const field = h('fieldset', null, h('legend', { text: FACET_LABELS[facet] }));
      for (const tag of options) {
        field.append(this.chip(tag.value, toneOf(facet, tag.value), state.tags.has(tag.key), () => this.toggleTag(tag.key)));
      }
      fields.push(field);
    }
    this.filtersPanel.replaceChildren(...fields);
  }

  private renderActive(): void {
    const items: HTMLElement[] = [];
    if (state.type) {
      items.push(this.removable(state.type, GROUP_TONES[state.type] ?? 'gray', () => this.selectType('')));
    }
    for (const tag of this.tags) {
      if (state.tags.has(tag.key))
        items.push(this.removable(tag.value, toneOf(tag.facet, tag.value), () => this.toggleTag(tag.key)));
    }
    if (items.length > 0 || state.query) {
      items.push(
        h('button', { class: 'catalog-clear-all', type: 'button', text: 'Clear all', onclick: () => this.reset() })
      );
    }
    this.active.replaceChildren(...items);
  }

  private removable(value: string, tone: string, onClick: () => void): HTMLButtonElement {
    return h('button', {
      class: 'tag-chip',
      type: 'button',
      text: `${value} ×`,
      dataset: { tone },
      'aria-pressed': 'true',
      'aria-label': `Remove ${value} filter`,
      onclick: onClick
    });
  }
}
