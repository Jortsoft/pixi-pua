import { animationCatalog, PUA_VERSION } from '../catalog';
import { ColorScheme, currentColorScheme, toggleColorScheme } from '../colorScheme';
import { h } from '../dom';
import { Route, routeHref } from '../router';

export const PUA_MARK = `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PUA">
<rect width="64" height="64" rx="18" fill="#c8f547"/>
<path d="M14 46C27 46 27 15 47 19" fill="none" stroke="#14162b" stroke-width="6" stroke-linecap="round"/>
<circle cx="14" cy="46" r="4" fill="#14162b" opacity="0.35"/>
<circle cx="47" cy="19" r="7" fill="#14162b"/>
</svg>`;

const SCHEME_ICONS: Record<ColorScheme, string> = {
  light: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>',
  dark: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'
};

const GITHUB_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>';
const NPM_ICON =
  '<svg viewBox="0 0 24 24" fill="currentColor" fill-rule="evenodd" aria-hidden="true"><path d="M2 2h20v20H2zM6 6v12h6V9h3v9h3V6z"/></svg>';

const GITHUB_URL = 'https://github.com/Jortsoft/pixi-pua';
const NPM_URL = 'https://www.npmjs.com/package/pixi-pua';

interface NavLink {
  el: HTMLAnchorElement;
  matches: (route: Route) => boolean;
}

export class Header {
  public readonly el: HTMLElement;
  private readonly links: NavLink[] = [];
  private readonly themeToggle: HTMLButtonElement;

  constructor(onMenuToggle: () => void) {
    const nav = h('nav', { class: 'site-nav' });
    this.addLink(nav, 'Gallery', routeHref({ name: 'home' }), (route) => route.name === 'home');
    this.addLink(
      nav,
      'Components',
      routeHref({ name: 'animation', id: animationCatalog[0].id }),
      (route) => route.name === 'animation'
    );
    this.addLink(nav, 'Documentation', routeHref({ name: 'docs' }), (route) => route.name === 'docs');

    this.themeToggle = h('button', {
      class: 'theme-toggle',
      type: 'button',
      onclick: () => this.renderThemeToggle(toggleColorScheme())
    });
    this.renderThemeToggle(currentColorScheme());

    this.el = h(
      'header',
      { class: 'site-header' },
      h(
        'button',
        { class: 'menu-toggle', type: 'button', 'aria-label': 'Toggle navigation', onclick: onMenuToggle },
        h('span'),
        h('span'),
        h('span')
      ),
      h(
        'a',
        { class: 'brand', href: routeHref({ name: 'home' }) },
        h('span', { class: 'brand-mark-logo', innerHTML: PUA_MARK }),
        h('span', { class: 'brand-mark', text: 'PUA' }),
        h('span', { class: 'brand-name', text: 'Pixi UI Animations' })
      ),
      nav,
      h('div', { class: 'header-spacer' }),
      h('span', { class: 'version', text: `v${PUA_VERSION}` }),
      this.externalLink(GITHUB_URL, 'GitHub repository', GITHUB_ICON),
      this.externalLink(NPM_URL, 'npm package', NPM_ICON),
      this.themeToggle
    );
  }

  public setActive(route: Route): void {
    this.links.forEach((link) => link.el.classList.toggle('active', link.matches(route)));
  }

  private renderThemeToggle(scheme: ColorScheme): void {
    const label = scheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme';
    this.themeToggle.setAttribute('aria-label', label);
    this.themeToggle.title = label;
    this.themeToggle.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SCHEME_ICONS[scheme]}</svg>`;
  }

  private externalLink(href: string, label: string, icon: string): HTMLAnchorElement {
    return h('a', {
      class: 'header-link',
      href,
      target: '_blank',
      rel: 'noopener noreferrer',
      title: label,
      'aria-label': label,
      innerHTML: icon
    });
  }

  private addLink(nav: HTMLElement, text: string, href: string, matches: (route: Route) => boolean): void {
    const el = h('a', { href, text });
    nav.append(el);
    this.links.push({ el, matches });
  }
}
