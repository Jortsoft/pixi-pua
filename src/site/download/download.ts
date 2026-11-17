import { AnimationEntry, componentFor, ParamValues, PUA_VERSION } from '../catalog';
import { usageCode } from '../components/CodeBlock';
import { PreviewStage } from '../pixi/PreviewStage';
import { buildStandalone } from '../standalone/bundle';
import { createZip, ZipEntry } from './zip';

export async function downloadComponent(entry: AnimationEntry, values: ParamValues, stage: PreviewStage): Promise<void> {
  const component = componentFor(entry);
  const folder = component.name;
  const assets = await stage.exportAssets();

  const entries: ZipEntry[] = [
    { name: `${folder}/${folder}.ts`, data: buildStandalone(component, PUA_VERSION) },
    { name: `${folder}/usage.ts`, data: usageCode(entry, values) + '\n' },
    {
      name: `${folder}/preset.json`,
      data: JSON.stringify({ animation: entry.id, component: folder, version: PUA_VERSION, values }, null, 2) + '\n'
    },
    {
      name: `${folder}/README.md`,
      data: readme(
        entry,
        folder,
        assets.map((asset) => asset.name)
      )
    },
    ...assets.map((asset) => ({ name: `${folder}/assets/${asset.name}`, data: asset.data }))
  ];

  saveBlob(createZip(entries), `pua-${entry.id}.zip`);
}

function readme(entry: AnimationEntry, folder: string, assetNames: string[]): string {
  const assetList = assetNames.length > 0 ? assetNames.map((name) => `- assets/${name}`).join('\n') : '- (none)';
  return [
    `# ${entry.id}() — PUA v${PUA_VERSION}`,
    '',
    entry.description,
    '',
    '## Files',
    '',
    `- ${folder}.ts — standalone TypeScript component. Copy it into your playable; it needs only pixi.js.`,
    '- usage.ts — the call with the values set in the dev panel.',
    '- preset.json — those values as data.',
    '- assets/ — the images used by the preview: your uploads, or the default placeholders rendered as PNG.',
    '',
    '## Assets',
    '',
    assetList,
    '',
    '## Usage',
    '',
    `1. Copy ${folder}.ts next to your UI code (for example src/ui/${folder}.ts).`,
    '2. Paste the lines from usage.ts where the animation should start.',
    '3. Replace the placeholder display objects with your own sprites, texts or containers.',
    ''
  ].join('\n');
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
