import { defaultValues, ParamDef, ParamValues } from '../catalog';
import { h } from '../dom';

type NumberParam = Extract<ParamDef, { type: 'number' }>;
type SelectParam = Extract<ParamDef, { type: 'select' }>;
type ToggleParam = Extract<ParamDef, { type: 'toggle' }>;
type ColorParam = Extract<ParamDef, { type: 'color' }>;
type TextParam = Extract<ParamDef, { type: 'text' }>;

export class DevPanel {
  public readonly el: HTMLElement;
  private params: ParamDef[] = [];
  private values: ParamValues = {};

  constructor(private readonly onChange: (values: ParamValues, commit: boolean) => void) {
    this.el = h('div', { class: 'dev-panel' });
  }

  public get current(): ParamValues {
    return { ...this.values };
  }

  public setParams(params: ParamDef[]): ParamValues {
    this.params = params;
    this.values = defaultValues(params);
    this.render();
    return this.current;
  }

  public reset(): void {
    this.values = defaultValues(this.params);
    this.render();
    this.onChange(this.current, true);
  }

  private render(): void {
    if (this.params.length === 0) {
      this.el.replaceChildren(
        h('p', { class: 'dev-empty', text: 'This animation has no parameters — just pass the target.' })
      );
      return;
    }

    this.el.replaceChildren(
      h(
        'div',
        { class: 'dev-fields' },
        this.params.map((param) => {
          if (param.type === 'number') return this.numberField(param);
          if (param.type === 'select') return this.selectField(param);
          if (param.type === 'color') return this.colorField(param);
          if (param.type === 'text') return this.textField(param);
          return this.toggleField(param);
        })
      )
    );
  }

  private numberField(param: NumberParam): HTMLElement {
    const value = Number(this.values[param.key]);
    const digits = decimals(param.step);
    const readout = h('output', { text: value.toFixed(digits) });
    const range = h('input', { type: 'range', min: param.min, max: param.max, step: param.step, value });
    const number = h('input', { type: 'number', min: param.min, max: param.max, step: param.step, value });

    const apply = (next: number, source: HTMLInputElement, commit: boolean): void => {
      if (!Number.isFinite(next)) return;
      this.values[param.key] = next;
      readout.textContent = next.toFixed(digits);
      if (source !== range) range.value = String(next);
      if (source !== number) number.value = String(next);
      this.onChange(this.current, commit);
    };

    range.addEventListener('input', () => apply(Number(range.value), range, false));
    range.addEventListener('change', () => apply(Number(range.value), range, true));
    number.addEventListener('change', () => apply(Number(number.value), number, true));

    return h(
      'div',
      { class: 'dev-field' },
      h('div', { class: 'dev-field-head' }, h('span', { text: param.label }), readout),
      h('div', { class: 'dev-field-row' }, range, number)
    );
  }

  private selectField(param: SelectParam): HTMLElement {
    const select = h(
      'select',
      null,
      param.options.map((option) =>
        h('option', { value: option, text: option, selected: option === this.values[param.key] })
      )
    );
    select.addEventListener('change', () => {
      this.values[param.key] = select.value;
      this.onChange(this.current, true);
    });

    return h('div', { class: 'dev-field' }, h('div', { class: 'dev-field-head' }, h('span', { text: param.label })), select);
  }

  private toggleField(param: ToggleParam): HTMLElement {
    const input = h('input', { type: 'checkbox', checked: Boolean(this.values[param.key]) });
    input.addEventListener('change', () => {
      this.values[param.key] = input.checked;
      this.onChange(this.current, true);
    });

    return h('div', { class: 'dev-field' }, h('label', { class: 'dev-toggle' }, input, h('span', { text: param.label })));
  }

  private textField(param: TextParam): HTMLElement {
    const input = h('input', { type: 'text', value: String(this.values[param.key]), spellcheck: false });
    input.addEventListener('input', () => {
      this.values[param.key] = input.value;
      this.onChange(this.current, false);
    });
    input.addEventListener('change', () => this.onChange(this.current, true));

    return h('div', { class: 'dev-field' }, h('div', { class: 'dev-field-head' }, h('span', { text: param.label })), input);
  }

  private colorField(param: ColorParam): HTMLElement {
    const value = Number(this.values[param.key]);
    const readout = h('output', { text: hexString(value) });
    const input = h('input', { type: 'color', value: hexString(value) });

    const apply = (commit: boolean): void => {
      const next = parseInt(input.value.slice(1), 16);
      if (!Number.isFinite(next)) return;
      this.values[param.key] = next;
      readout.textContent = hexString(next);
      this.onChange(this.current, commit);
    };

    input.addEventListener('input', () => apply(false));
    input.addEventListener('change', () => apply(true));

    return h(
      'div',
      { class: 'dev-field' },
      h('div', { class: 'dev-field-head' }, h('span', { text: param.label }), readout),
      h('div', { class: 'dev-field-row' }, input)
    );
  }
}

function decimals(step: number): number {
  const text = String(step);
  const dot = text.indexOf('.');
  return dot < 0 ? 0 : text.length - dot - 1;
}

function hexString(value: number): string {
  return `#${value.toString(16).padStart(6, '0')}`;
}
