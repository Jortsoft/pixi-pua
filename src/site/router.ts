export type Route = { name: 'home' } | { name: 'docs' } | { name: 'animation'; id: string };

export function parseRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');
  const match = path.match(/^animations\/([\w-]+)$/);
  if (match) return { name: 'animation', id: match[1] };
  if (path === 'docs') return { name: 'docs' };
  return { name: 'home' };
}

export function routeHref(route: Route): string {
  if (route.name === 'animation') return `#/animations/${route.id}`;
  if (route.name === 'docs') return '#/docs';
  return '#/';
}

export class Router {
  private readonly listeners: ((route: Route) => void)[] = [];

  constructor() {
    window.addEventListener('hashchange', this.handleChange);
  }

  public get current(): Route {
    return parseRoute(window.location.hash);
  }

  public onChange(listener: (route: Route) => void): void {
    this.listeners.push(listener);
  }

  public navigate(route: Route): void {
    window.location.hash = routeHref(route);
  }

  public destroy(): void {
    window.removeEventListener('hashchange', this.handleChange);
  }

  private handleChange = (): void => {
    const route = this.current;
    this.listeners.forEach((listener) => listener(route));
  };
}
