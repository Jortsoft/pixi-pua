import { isRegexStart, skipRegex, skipString } from './scanner';

const LOCAL_DECLARATION = /\b(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/g;
const FREE_IDENTIFIER = /(^|[^.\w$])([A-Za-z_$][\w$]*)/g;

// Identifiers a statement may resolve against other top-level declarations: literals, comments,
// property accesses and names the statement declares itself are excluded.
export function references(text: string): Set<string> {
  const code = maskLiterals(text);
  const locals = new Set<string>();
  for (const match of code.matchAll(LOCAL_DECLARATION)) locals.add(match[1]);

  const refs = new Set<string>();
  for (const match of code.matchAll(FREE_IDENTIFIER)) {
    if (!locals.has(match[2])) refs.add(match[2]);
  }
  return refs;
}

export function maskLiterals(text: string): string {
  let out = '';
  let i = 0;

  while (i < text.length) {
    const ch = text[i];
    let end = -1;

    if (ch === '/' && text[i + 1] === '/') {
      const newline = text.indexOf('\n', i);
      end = newline < 0 ? text.length : newline;
    } else if (ch === '/' && text[i + 1] === '*') {
      const close = text.indexOf('*/', i + 2);
      end = close < 0 ? text.length : close + 2;
    } else if (ch === "'" || ch === '"') {
      end = skipString(text, i, ch);
    } else if (ch === '`') {
      end = skipTemplate(text, i);
    } else if (ch === '/' && isRegexStart(text, i)) {
      end = skipRegex(text, i);
    }

    if (end < 0) {
      out += ch;
      i++;
    } else {
      out += ' '.repeat(end - i);
      i = end;
    }
  }

  return out;
}

function skipTemplate(text: string, i: number): number {
  let j = i + 1;
  while (j < text.length) {
    if (text[j] === '\\') j += 2;
    else if (text[j] === '`') return j + 1;
    else j++;
  }
  return j;
}
