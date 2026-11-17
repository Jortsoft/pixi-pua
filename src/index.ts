import './index.css';

import { initColorScheme } from './site/colorScheme';
import { Site } from './site/Site';

initColorScheme();

const root = document.getElementById('app') as HTMLElement;

Promise.all([document.fonts.load('400 24px "Lilita One"'), document.fonts.load('800 24px "Bricolage Grotesque"')])
  .catch(() => undefined)
  .then(() => new Site(root));
