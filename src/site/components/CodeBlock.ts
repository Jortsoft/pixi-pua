import { AnimationEntry, CodeArg, componentFor, optionsArg, ParamValues, setupLines } from '../catalog';
import { h } from '../dom';

const TOKEN =
  /(\/\/.*$)|('[^'\n]*'|"[^"\n]*"|`[^`]*`)|(\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?\b)|(\b(?:import|from|const|let|new|export|return|function|true|false|type|interface|if|else|for|while|typeof|undefined|null)\b)|([A-Za-z_$][\w$]*)(?=\()/gm;

export interface CodeBlockOptions {
  actions?: HTMLElement[];
  tall?: boolean;
}

export function formatArg(arg: CodeArg): string {
  if (typeof arg === 'number' || typeof arg === 'boolean') return String(arg);
  if (typeof arg === 'string') return `'${arg}'`;
  if ('ident' in arg) return arg.ident;
  if ('hex' in arg) return `0x${arg.hex.toString(16).padStart(6, '0')}`;

  const fields = Object.entries(arg.obj).map(([key, value]) => `${key}: ${formatArg(value)}`);
  return `{ ${fields.join(', ')} }`;
}

export function callCode(method: string, args: (CodeArg | undefined)[]): string {
  const list = args.filter((arg): arg is CodeArg => arg !== undefined).map(formatArg);
  return `${method}(${list.join(', ')});`;
}

export function usageCode(entry: AnimationEntry, values: ParamValues): string {
  const component = componentFor(entry);
  const names = entry.continuous ? [entry.id, 'stop'] : [entry.id];
  const lines = [`import { ${names.join(', ')} } from './${component.name}';`, ''];

  const setup = setupLines(entry, values);
  const scale = Number(values.targetScale ?? 1);
  if (scale !== 1) setup.unshift(`${scaleIdent(entry)}.scale.set(${Number(scale.toFixed(2))});`);
  if (setup.length > 0) lines.push(...setup, '');

  lines.push(callCode(entry.id, entry.args(values, optionsArg(entry.params, values))));
  if (entry.continuous) lines.push('', '// stop it later', `stop(${entry.ident});`);
  return lines.join('\n');
}

function scaleIdent(entry: AnimationEntry): string {
  return entry.ident === 'parts' ? 'panel' : entry.ident;
}

export function highlight(code: string): DocumentFragment {
  const fragment = document.createDocumentFragment();
  let last = 0;
  let match: RegExpExecArray | null;

  TOKEN.lastIndex = 0;
  while ((match = TOKEN.exec(code))) {
    if (match.index > last) fragment.append(code.slice(last, match.index));
    const cls = match[1] ? 'tok-cm' : match[2] ? 'tok-str' : match[3] ? 'tok-num' : match[4] ? 'tok-kw' : 'tok-fn';
    fragment.append(h('span', { class: cls, text: match[0] }));
    last = match.index + match[0].length;
  }
  if (last < code.length) fragment.append(code.slice(last));

  return fragment;
}

export class CodeBlock {
  public readonly el: HTMLElement;
  private readonly titleEl: HTMLElement;
  private readonly codeEl: HTMLElement;
  private readonly copyButton: HTMLButtonElement;
  private text = '';
  private resetTimer = 0;

  constructor(title = 'Usage', options: CodeBlockOptions = {}) {
    this.titleEl = h('span', { class: 'card-title', text: title });
    this.codeEl = h('code');
    this.copyButton = h('button', { class: 'btn btn-sm', type: 'button', text: 'Copy', onclick: () => this.copy() });

    this.el = h(
      'div',
      { class: options.tall ? 'code-block tall' : 'code-block' },
      h(
        'div',
        { class: 'card-header' },
        this.titleEl,
        h('div', { class: 'toolbar' }, options.actions ?? [], this.copyButton)
      ),
      h('pre', null, this.codeEl)
    );
  }

  public setTitle(title: string): void {
    this.titleEl.textContent = title;
  }

  public setCode(text: string): void {
    this.text = text;
    this.codeEl.replaceChildren(highlight(text));
  }

  private async copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.text);
      this.flash('Copied!');
    } catch {
      this.flash('Copy failed');
    }
  }

  private flash(label: string): void {
    this.copyButton.textContent = label;
    window.clearTimeout(this.resetTimer);
    this.resetTimer = window.setTimeout(() => {
      this.copyButton.textContent = 'Copy';
    }, 1400);
  }
}
