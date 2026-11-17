export interface Page {
  readonly el: HTMLElement;
  mount(container: HTMLElement): void;
  unmount(): void;
}
