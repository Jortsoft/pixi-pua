import { puaSources } from '../generated/puaSources';
import { maskLiterals, references } from './references';
import { Block, splitBlocks, stripLeadingComments } from './scanner';

export interface Component {
  name: string;
  exports: string[];
}

interface Module {
  path: string;
  blocks: Block[];
}

const MODULE_ORDER = [
  'types.ts',
  'core/easing.ts',
  'core/engine.ts',
  'core/rest.ts',
  'core/options.ts',
  'core/geometry.ts',
  'core/shaders.ts',
  'core/compat.ts',
  'core/filters.ts',
  'animations/presets.ts',
  'animations/popup.ts',
  'animations/button.ts',
  'animations/tutorial.ts',
  'animations/text.ts',
  'animations/shader.ts'
];

const TYPE_DECLARATION = /^(?:export\s+)?(?:declare\s+)?(?:interface|type)\s/;
const EXPORT_PREFIX = /^((?:\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/\s*|\s)*)export\s+/;

let modules: Module[] | undefined;

function loadModules(): Module[] {
  if (modules) return modules;
  const paths = [...MODULE_ORDER, ...Object.keys(puaSources).filter((path) => !MODULE_ORDER.includes(path))];
  modules = paths
    .filter((path) => puaSources[path] !== undefined)
    .map((path) => ({ path, blocks: splitBlocks(puaSources[path]) }));
  return modules;
}

export function buildStandalone(component: Component, version: string): string {
  const mods = loadModules();
  const declared = new Map<string, Block>();
  for (const mod of mods) {
    for (const block of mod.blocks) {
      if (block.kind === 'code' && block.name && !declared.has(block.name)) declared.set(block.name, block);
    }
  }

  const publicNames = new Set([...component.exports, 'stop']);
  const keep = new Set<Block>();
  const queue = [...publicNames].map((name) => declared.get(name)).filter((block): block is Block => Boolean(block));

  while (queue.length > 0) {
    const block = queue.pop() as Block;
    if (keep.has(block)) continue;
    keep.add(block);
    for (const name of references(block.text)) {
      const dependency = declared.get(name);
      if (dependency && !keep.has(dependency)) queue.push(dependency);
    }
  }

  const sections: string[] = [];
  const usedModules: Module[] = [];
  for (const mod of mods) {
    const kept = mod.blocks.filter((block) => keep.has(block));
    if (kept.length === 0) continue;
    usedModules.push(mod);
    sections.push(kept.map((block) => renderBlock(block, publicNames)).join('\n\n'));
  }
  const body = sections.join('\n\n');
  const code = maskLiterals(body);

  const header = `// ${component.name}.ts — PUA v${version} standalone component. Copy this file into your playable; it only needs pixi.js.`;
  return [header, externalImports(usedModules, code), body].filter(Boolean).join('\n\n') + '\n';
}

function renderBlock(block: Block, publicNames: Set<string>): string {
  const body = stripLeadingComments(block.text);
  if ((block.name && publicNames.has(block.name)) || TYPE_DECLARATION.test(body)) return block.text;
  return block.text.replace(EXPORT_PREFIX, '$1');
}

function externalImports(mods: Module[], body: string): string {
  const byPath = new Map<string, { values: Set<string>; types: Set<string> }>();

  for (const mod of mods) {
    for (const block of mod.blocks) {
      if (block.kind !== 'import' || !block.external || !block.path) continue;
      const entry = byPath.get(block.path) ?? { values: new Set<string>(), types: new Set<string>() };
      byPath.set(block.path, entry);
      for (const name of block.specifiers ?? []) {
        if (!new RegExp(`\\b${name}\\b`).test(body)) continue;
        (block.typeOnly ? entry.types : entry.values).add(name);
      }
    }
  }

  const lines: string[] = [];
  for (const [path, entry] of byPath) {
    for (const name of entry.values) entry.types.delete(name);
    if (entry.values.size > 0) lines.push(`import { ${[...entry.values].sort().join(', ')} } from '${path}';`);
    if (entry.types.size > 0) lines.push(`import type { ${[...entry.types].sort().join(', ')} } from '${path}';`);
  }
  return lines.join('\n');
}
