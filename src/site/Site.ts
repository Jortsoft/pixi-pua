import { assetStore } from './assets/AssetStore';
import { animationCatalog, findEntry } from './catalog';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { h } from './dom';
import { AnimationPage } from './pages/AnimationPage';
import { DocsPage } from './pages/DocsPage';
import { GalleryPage } from './pages/GalleryPage';
import { Page } from './pages/Page';
import { Route, Router } from './router';

const SIDEBAR_OPEN_CLASS = 'sidebar-open';
const AUTHOR_URL = 'https://github.com/Jortsoft';

export class Site {
  private readonly root: HTMLElement;
  private readonly router = new Router();
  private readonly header: Header;
  private readonly sidebar: Sidebar;
  private readonly pageHost: HTMLElement;

  private readonly galleryPage = new GalleryPage();
  private readonly animationPage = new AnimationPage();
  private readonly docsPage = new DocsPage();
  private currentPage?: Page;
  private routeKey?: string;

  constructor(root: HTMLElement) {
    this.root = root;
    this.header = new Header(() => root.classList.toggle(SIDEBAR_OPEN_CLASS));
    this.sidebar = new Sidebar(
      animationCatalog,
      () => this.closeSidebar(),
      (group) => {
        this.galleryPage.setType(group);
        if (this.router.current.name !== 'home') this.router.navigate({ name: 'home' });
      }
    );
    this.galleryPage.onTypeChange = (type) => this.sidebar.setGalleryType(type);
    this.sidebar.setGalleryType(this.galleryPage.type);
    this.pageHost = h('div', { class: 'site-page' });
    const footer = h(
      'footer',
      { class: 'site-footer' },
      'Created by ',
      h('a', { href: AUTHOR_URL, target: '_blank', rel: 'noopener noreferrer', text: 'Jortsoft' })
    );

    root.append(
      this.header.el,
      this.sidebar.el,
      h('div', { class: 'sidebar-backdrop', onclick: () => this.closeSidebar() }),
      h('main', { class: 'site-main' }, this.pageHost, footer)
    );

    this.router.onChange((route) => this.render(route));
    this.render(this.router.current);
  }

  private render(route: Route): void {
    if (route.name === 'animation' && !findEntry(route.id)) {
      this.router.navigate({ name: 'animation', id: animationCatalog[0].id });
      return;
    }

    const routeKey = route.name === 'animation' ? `animation:${route.id}` : route.name;
    if (this.routeKey !== undefined && this.routeKey !== routeKey) assetStore.resetAll();
    this.routeKey = routeKey;

    const page = route.name === 'animation' ? this.animationPage : route.name === 'docs' ? this.docsPage : this.galleryPage;
    if (page !== this.currentPage) {
      this.currentPage?.unmount();
      page.mount(this.pageHost);
      this.currentPage = page;
    }

    if (route.name === 'animation') {
      const entry = findEntry(route.id) ?? animationCatalog[0];
      this.animationPage.show(entry);
      document.title = `${entry.id}() — PUA`;
    } else if (route.name === 'docs') {
      document.title = 'Documentation — PUA';
    } else {
      document.title = 'PUA — Pixi UI Animations';
    }

    this.header.setActive(route);
    this.sidebar.setActive(route);
    if (route.name !== 'home') window.scrollTo({ top: 0 });
  }

  private closeSidebar(): void {
    this.root.classList.remove(SIDEBAR_OPEN_CLASS);
  }
}
