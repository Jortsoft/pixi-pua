import { AnimationEntry, animationGroups } from '../catalog';
import { h } from '../dom';
import { GROUP_TONES } from '../pages/GalleryPage';
import { Route, routeHref } from '../router';

interface SidebarItem {
  el: HTMLAnchorElement;
  entry: AnimationEntry;
}

interface SidebarGroup {
  name: string;
  el: HTMLElement;
  toggle: HTMLButtonElement;
  list: HTMLElement;
  items: SidebarItem[];
}

const CHEVRON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
const REVEAL_MARGIN = 48;

export class Sidebar {
  public readonly el: HTMLElement;
  private readonly groups: SidebarGroup[] = [];
  private readonly libraries = new Map<string, HTMLAnchorElement>();
  private readonly collapsed = new Set<string>();
  private readonly empty: HTMLElement;
  private readonly docsLink: HTMLAnchorElement;
  private route: Route = { name: 'home' };
  private galleryType = '';
  private query = '';

  constructor(entries: AnimationEntry[], onNavigate: () => void, onLibrary: (group: string) => void) {
    const libraryNav = h('nav', { class: 'sidebar-libraries', 'aria-label': 'Libraries' });
    const addLibrary = (group: string, label: string, note: string, tone: string): void => {
      const link = h(
        'a',
        {
          class: 'sidebar-library',
          href: routeHref({ name: 'home' }),
          dataset: { tone },
          onclick: (event: Event) => {
            event.preventDefault();
            onLibrary(group);
            onNavigate();
          }
        },
        h('span', { class: 'sidebar-library-mark' }),
        h('span', { class: 'sidebar-library-name' }, h('span', { text: label }), h('small', { text: note })),
        h('span', { class: 'sidebar-library-arrow', 'aria-hidden': 'true', text: '↗' })
      );
      libraryNav.append(link);
      this.libraries.set(group, link);
    };
    addLibrary('', 'All components', `${entries.length} components`, 'volt');
    for (const group of animationGroups) {
      const count = entries.filter((entry) => entry.group === group).length;
      addLibrary(group, group, `${count} component${count === 1 ? '' : 's'}`, GROUP_TONES[group] ?? 'gray');
    }

    const search = h('input', {
      class: 'sidebar-search',
      type: 'search',
      placeholder: 'Filter animations…',
      oninput: () => this.filter(search.value)
    });

    const nav = h('nav', { class: 'sidebar-nav', 'aria-label': 'Animations' });
    animationGroups.forEach((name, index) => {
      const items: SidebarItem[] = [];
      const list = h('ul', { id: `sidebar-group-${index}` });

      for (const entry of entries.filter((e) => e.group === name)) {
        const link = h(
          'a',
          { href: routeHref({ name: 'animation', id: entry.id }), onclick: onNavigate },
          h('span', { text: entry.id }),
          entry.continuous ? h('span', { class: 'badge', text: 'loop' }) : null
        );
        list.append(h('li', null, link));
        items.push({ el: link, entry });
      }

      const toggle = h(
        'button',
        {
          class: 'sidebar-group-toggle',
          type: 'button',
          dataset: { tone: GROUP_TONES[name] ?? 'gray' },
          'aria-controls': list.id,
          onclick: () => this.toggleGroup(group)
        },
        h('span', { class: 'sidebar-group-mark' }),
        h('span', { class: 'sidebar-group-name', text: name }),
        h('span', { class: 'sidebar-group-count', text: String(items.length) }),
        h('span', { class: 'sidebar-group-chevron', innerHTML: CHEVRON })
      );

      const groupEl = h('div', { class: 'sidebar-group' }, h('h4', null, toggle), list);
      const group: SidebarGroup = { name, el: groupEl, toggle, list, items };
      nav.append(groupEl);
      this.groups.push(group);
      this.renderGroup(group);
    });

    this.empty = h('div', { class: 'sidebar-empty', text: 'No animations match.', hidden: true });
    this.docsLink = h('a', {
      class: 'sidebar-docs',
      href: routeHref({ name: 'docs' }),
      text: 'Documentation',
      onclick: onNavigate
    });

    this.el = h(
      'aside',
      { class: 'site-sidebar' },
      this.docsLink,
      h('div', { class: 'sidebar-label', text: 'Your libraries' }),
      libraryNav,
      h('div', { class: 'sidebar-label', text: 'All animations' }),
      search,
      nav,
      this.empty
    );
    this.renderLibraries();
  }

  public setActive(route: Route): void {
    this.route = route;
    this.docsLink.classList.toggle('active', route.name === 'docs');
    for (const group of this.groups) {
      for (const item of group.items) {
        const active = route.name === 'animation' && route.id === item.entry.id;
        item.el.classList.toggle('active', active);
        if (!active) {
          item.el.removeAttribute('aria-current');
          continue;
        }
        item.el.setAttribute('aria-current', 'page');
        if (this.collapsed.delete(group.name)) this.renderGroup(group);
        this.reveal(item.el);
      }
    }
    this.renderLibraries();
  }

  public setGalleryType(type: string): void {
    this.galleryType = type;
    this.renderLibraries();
  }

  private toggleGroup(group: SidebarGroup): void {
    if (this.collapsed.has(group.name)) this.collapsed.delete(group.name);
    else this.collapsed.add(group.name);
    this.renderGroup(group);
  }

  private renderGroup(group: SidebarGroup): void {
    const open = this.query !== '' || !this.collapsed.has(group.name);
    group.list.hidden = !open;
    group.toggle.setAttribute('aria-expanded', String(open));
  }

  private reveal(item: HTMLElement): void {
    window.requestAnimationFrame(() => {
      if (item.offsetParent === null) return;
      const box = this.el.getBoundingClientRect();
      const rect = item.getBoundingClientRect();
      if (rect.top >= box.top + REVEAL_MARGIN && rect.bottom <= box.bottom - REVEAL_MARGIN) return;
      const top = this.el.scrollTop + rect.top - box.top - (box.height - rect.height) / 2;
      this.el.scrollTo({ top, behavior: 'smooth' });
    });
  }

  private renderLibraries(): void {
    const onHome = this.route.name === 'home';
    this.libraries.forEach((link, group) => {
      const current = onHome && group === this.galleryType;
      link.classList.toggle('active', current);
      if (current) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  private filter(query: string): void {
    this.query = query.trim().toLowerCase();
    const q = this.query;
    let visible = 0;

    for (const group of this.groups) {
      let groupVisible = 0;
      for (const item of group.items) {
        const show = !q || item.entry.id.toLowerCase().includes(q) || item.entry.summary.toLowerCase().includes(q);
        (item.el.parentElement as HTMLElement).hidden = !show;
        if (show) groupVisible++;
      }
      group.el.hidden = groupVisible === 0;
      this.renderGroup(group);
      visible += groupVisible;
    }

    this.empty.hidden = visible > 0;
  }
}
