const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const sourceDir = path.join(root, 'src', 'pua');
const outFile = path.join(root, 'src', 'site', 'generated', 'puaSources.ts');

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else if (entry.name.endsWith('.ts')) files.push(full);
  }
  return files;
}

const files = walk(sourceDir)
  .map((file) => path.relative(sourceDir, file).split(path.sep).join('/'))
  .filter((file) => file !== 'index.ts')
  .sort();

const lines = ['export const puaSources: Record<string, string> = {'];
files.forEach((file, i) => {
  const content = fs.readFileSync(path.join(sourceDir, file), 'utf8').replace(/\r\n/g, '\n');
  lines.push(`  ${JSON.stringify(file)}: ${JSON.stringify(content)}${i < files.length - 1 ? ',' : ''}`);
});
lines.push('};', '');

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join('\n'));
console.log(`pua-sources: ${files.length} files -> ${path.relative(root, outFile)}`);
