export interface Block {
  kind: 'import' | 'code';
  text: string;
  name?: string;
  path?: string;
  external?: boolean;
  typeOnly?: boolean;
  specifiers?: string[];
}

const BRACE_STATEMENT =
  /^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\*?|class|interface|enum|namespace)\b/;
const DECLARATION =
  /^(?:export\s+)?(?:default\s+)?(?:declare\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\*?|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/;
const IMPORT = /^import\s+(type\s+)?([\s\S]*?)\s+from\s+['"]([^'"]+)['"]\s*;?$/;
const REGEX_KEYWORDS = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'throw', 'void', 'delete', 'await']);

// Splits a TypeScript module into top-level statements, treating strings, template literals,
// regex literals and comments as opaque so braces inside them never affect nesting.
export function splitBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  const n = source.length;
  const templateStack: number[] = [];
  let inTemplate = false;
  let depth = 0;
  let start = 0;
  let i = 0;

  const flush = (end: number): void => {
    const block = parseBlock(source.slice(start, end));
    start = end;
    if (block) blocks.push(block);
  };

  while (i < n) {
    const ch = source[i];

    if (inTemplate) {
      if (ch === '\\') i += 2;
      else if (ch === '`') {
        inTemplate = false;
        i++;
      } else if (ch === '$' && source[i + 1] === '{') {
        templateStack.push(depth);
        depth++;
        inTemplate = false;
        i += 2;
      } else i++;
      continue;
    }

    if (ch === '/' && source[i + 1] === '/') {
      const end = source.indexOf('\n', i);
      i = end < 0 ? n : end;
    } else if (ch === '/' && source[i + 1] === '*') {
      const end = source.indexOf('*/', i + 2);
      i = end < 0 ? n : end + 2;
    } else if (ch === "'" || ch === '"') {
      i = skipString(source, i, ch);
    } else if (ch === '`') {
      inTemplate = true;
      i++;
    } else if (ch === '/') {
      i = isRegexStart(source, i) ? skipRegex(source, i) : i + 1;
    } else if (ch === '{' || ch === '(' || ch === '[') {
      depth++;
      i++;
    } else if (ch === '}' || ch === ')' || ch === ']') {
      depth--;
      i++;
      if (ch === '}' && templateStack.length > 0 && templateStack[templateStack.length - 1] === depth) {
        templateStack.pop();
        inTemplate = true;
      } else if (
        ch === '}' &&
        depth === 0 &&
        startsNewStatement(source, i) &&
        BRACE_STATEMENT.test(stripLeadingComments(source.slice(start, i)))
      ) {
        flush(i);
      }
    } else if (ch === ';' && depth === 0) {
      i++;
      flush(i);
    } else i++;
  }

  flush(n);
  return blocks;
}

export function stripLeadingComments(text: string): string {
  let rest = text.trimStart();
  for (;;) {
    if (rest.startsWith('//')) {
      const end = rest.indexOf('\n');
      rest = end < 0 ? '' : rest.slice(end + 1).trimStart();
    } else if (rest.startsWith('/*')) {
      const end = rest.indexOf('*/');
      rest = end < 0 ? '' : rest.slice(end + 2).trimStart();
    } else return rest;
  }
}

export function identifiers(text: string): string[] {
  return text.match(/[A-Za-z_$][\w$]*/g) ?? [];
}

function parseBlock(raw: string): Block | undefined {
  const text = raw.trim();
  const body = stripLeadingComments(text);
  if (!body) return undefined;

  const imported = body.match(IMPORT);
  if (imported) {
    return {
      kind: 'import',
      text,
      path: imported[3],
      external: !imported[3].startsWith('.'),
      typeOnly: Boolean(imported[1]),
      specifiers: parseSpecifiers(imported[2])
    };
  }

  return { kind: 'code', text, name: body.match(DECLARATION)?.[1] };
}

function parseSpecifiers(clause: string): string[] {
  const braced = clause.match(/\{([\s\S]*)\}/);
  const list = braced ? braced[1] : clause;
  return list
    .split(',')
    .map((item) => item.trim().replace(/^type\s+/, ''))
    .filter(Boolean)
    .map((item) => item.split(/\s+as\s+/).pop() as string);
}

// A '}' only closes a function/class/interface statement when what follows starts a new statement
// (or the file ends); otherwise it closed an object type inside a signature, e.g. '): { w: number } {'.
function startsNewStatement(source: string, i: number): boolean {
  let j = i;
  while (j < source.length && /\s/.test(source[j])) j++;
  return j >= source.length || /[A-Za-z_$/@]/.test(source[j]);
}

export function skipString(source: string, i: number, quote: string): number {
  let j = i + 1;
  while (j < source.length) {
    if (source[j] === '\\') j += 2;
    else if (source[j] === quote) return j + 1;
    else if (source[j] === '\n') return j;
    else j++;
  }
  return j;
}

export function skipRegex(source: string, i: number): number {
  let j = i + 1;
  let inClass = false;
  while (j < source.length) {
    const ch = source[j];
    if (ch === '\\') j += 2;
    else if (ch === '[') {
      inClass = true;
      j++;
    } else if (ch === ']') {
      inClass = false;
      j++;
    } else if (ch === '/' && !inClass) {
      j++;
      while (j < source.length && /[a-z]/.test(source[j])) j++;
      return j;
    } else if (ch === '\n') return j;
    else j++;
  }
  return j;
}

export function isRegexStart(source: string, i: number): boolean {
  let j = i - 1;
  while (j >= 0 && /\s/.test(source[j])) j--;
  if (j < 0) return true;
  const ch = source[j];
  if (/[\w$]/.test(ch)) {
    const word = source.slice(0, j + 1).match(/[A-Za-z_$][\w$]*$/)?.[0] ?? '';
    return REGEX_KEYWORDS.has(word);
  }
  return !(ch === ')' || ch === ']');
}
