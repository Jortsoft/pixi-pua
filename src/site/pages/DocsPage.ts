import { easingNames } from 'pua';
import { animationCatalog, animationGroups, PUA_VERSION } from '../catalog';
import { CodeBlock } from '../components/CodeBlock';
import { Child, h } from '../dom';
import { routeHref } from '../router';
import { Page } from './Page';

interface DocsSection {
  id: string;
  title: string;
  el: HTMLElement;
}

const PACKAGE = 'pixi-pua';

function rich(text: string): Child[] {
  return text.split('`').map((part, index) => (index % 2 === 1 ? h('code', { text: part }) : emphasis(part)));
}

function emphasis(text: string): Child[] {
  return text.split('**').map((part, index) => (index % 2 === 1 ? h('strong', { text: part }) : part));
}

function para(text: string): HTMLElement {
  return h('p', null, rich(text));
}

function list(items: string[]): HTMLElement {
  return h(
    'ul',
    null,
    items.map((item) => h('li', null, rich(item)))
  );
}

function steps(items: string[]): HTMLElement {
  return h(
    'ol',
    null,
    items.map((item) => h('li', null, rich(item)))
  );
}

function note(text: string): HTMLElement {
  return h('div', { class: 'docs-note' }, rich(text));
}

function code(title: string, source: string): HTMLElement {
  const block = new CodeBlock(title);
  block.setCode(source.trim());
  return block.el;
}

function table(head: string[], rows: string[][]): HTMLElement {
  return h(
    'div',
    { class: 'docs-table-wrap' },
    h(
      'table',
      { class: 'docs-table' },
      h(
        'thead',
        null,
        h(
          'tr',
          null,
          head.map((cell) => h('th', { text: cell }))
        )
      ),
      h(
        'tbody',
        null,
        rows.map((row) =>
          h(
            'tr',
            null,
            row.map((cell) => h('td', null, rich(cell)))
          )
        )
      )
    )
  );
}

function sub(title: string): HTMLElement {
  return h('h3', { text: title });
}

const QUICK_START_V8 = `
import { Application, Graphics } from 'pixi.js';
import { pop, pulse } from '${PACKAGE}';

const app = new Application();
await app.init({ width: 640, height: 960, preference: 'webgl' });
document.body.appendChild(app.canvas);

const button = new Graphics().roundRect(-80, -30, 160, 60, 16).fill(0xc8f547);
button.position.set(320, 480);
app.stage.addChild(button);

pop(button, () => pulse(button));
`;

const QUICK_START_V7 = `
import { Application, Graphics } from 'pixi.js';
import { pop, pulse } from '${PACKAGE}';

const app = new Application({ width: 640, height: 960 });
document.body.appendChild(app.view as HTMLCanvasElement);

const button = new Graphics();
button.beginFill(0xc8f547);
button.drawRoundedRect(-80, -30, 160, 60, 16);
button.endFill();
button.position.set(320, 480);
app.stage.addChild(button);

pop(button, () => pulse(button));
`;

const IMPORTS = `
// Recommended: import by name, the bundler drops everything you do not use
import { pop, shake, stop } from '${PACKAGE}';

pop(button);

// Convenience object: every animation in one place, but nothing is dropped
import { pua } from '${PACKAGE}';

pua.pop(button);
`;

const CALLING = `
pop(button);                                    // defaults
pop(button, () => console.log('done'));         // callback when it finishes
pop(button, { duration: 500, overshoot: 0.2 }); // options
pop(button, { delay: 150, onComplete: next });  // delay and callback together

popupIn(panel, 350, { easing: 'backOut' });     // required values come before the options
slideIn(card, 'left', { distance: 200 });
countTo(scoreText, 1000, 1200, { prefix: '$' });
`;

const EASING = `
import { easingNames, pop } from '${PACKAGE}';

pop(button, { easing: 'elasticOut' });           // by name
pop(button, { easing: (t) => t * t * (3 - 2 * t) }); // any (t) => number function

console.log(easingNames);                        // every built-in name
`;

const LOOPS = `
import { pulse, stop } from '${PACKAGE}';

pulse(button);          // runs until stopped

stop(button);           // stops every pixi-pua animation on this object
button.scale.set(1);    // transforms stay where the loop left them, so reset if needed
`;

const CHANNELS = `
// Different channels run together on one object
float(icon);        // position
sway(icon);         // rotation
glowPulse(icon);    // filter

// Same channel: the new animation replaces the running one
pulse(button);                                             // scale, looping
button.on('pointerdown', () => buttonPress(button, () => pulse(button)));
`;

const IN_OUT = `
import { pop, popOut } from '${PACKAGE}';

popOut(card, () => {
  // card.visible is now false
});

pop(card); // shows it again at its original size
`;

const SEQUENCE = `
// One after another
dropIn(logo, () => tada(logo, () => pulse(playButton)));

// Staggered
cards.forEach((card, index) => pop(card, { delay: index * 80 }));
`;

const CTA = `
import { ctaShow, ctaHide, ctaCelebrate } from '${PACKAGE}';

const parts = { overlay, panel, title, button }; // every part is optional

ctaShow(parts, { entrance: 'slide', stagger: 100, onComplete: () => console.log('shown') });

ctaCelebrate(parts);

ctaHide(parts, { exit: 'fall' }); // also ends the button pulse started by ctaShow
`;

const BUTTON = `
import { buttonDown, buttonUp, buttonIdle } from '${PACKAGE}';

button.eventMode = 'static';
button.cursor = 'pointer';

buttonIdle(button);

button.on('pointerdown', () => buttonDown(button));
button.on('pointerup', () => buttonUp(button, () => buttonIdle(button)));
button.on('pointerupoutside', () => buttonUp(button, () => buttonIdle(button)));
`;

const TUTORIAL = `
import { tutorialIn, tutorialTap, tutorialDrag, tutorialOut, stop } from '${PACKAGE}';

hand.position.set(target.x, target.y);

tutorialIn(hand, () => tutorialTap(hand));

// Drag from the hand position to another point (parent coordinates)
tutorialDrag(hand, slot.x, slot.y);

// When the player makes the move
stop(hand);
tutorialOut(hand);
`;

const TEXT = `
import { typewriter, countTo, textSwap, textTimer } from '${PACKAGE}';

typewriter(title, 900, { cursor: '|' });
countTo(score, 1500, 1200, { from: 0, separator: ',', prefix: '$' });
textSwap(status, 'YOU WIN!');
textTimer(clock, 30, () => console.log('time is up'));
`;

const SHADERS = `
import { shine, glowPulse, hitFlash, grayscale, dissolveOut, stop } from '${PACKAGE}';

shine(playButton, { interval: 2500 }); // repeat every 2.5 s
glowPulse(reward, { color: 0xffd447 });
hitFlash(enemy);

grayscale(lockedItem, 1, 300);         // stays gray
grayscale(lockedItem, 0, 300);         // back to color, filter removed

dissolveOut(card, 700);
stop(reward);                          // removes the glow filter
`;

const TYPES = `
import { pop, ctaShow } from '${PACKAGE}';
import type { PopOptions, CtaParts, PuaTarget, EasingName } from '${PACKAGE}';

const options: PopOptions = { duration: 400, overshoot: 0.2 };
const easing: EasingName = 'backOut';

function reveal(target: PuaTarget): void {
  pop(target, { ...options, easing });
}

const parts: CtaParts = { panel, button };
ctaShow(parts);
`;

const CLEANUP = `
import { stop } from '${PACKAGE}';

stop(button);
button.destroy();
`;

const DEVELOP = `
npm install
npm run dev         # this site, with live reload
npm run build       # production build of the site into dist/
npm run build:lib   # compile the npm package into lib/
npm run typecheck   # type-check the library and the site
`;

export class DocsPage implements Page {
  public readonly el: HTMLElement;
  private readonly sections: DocsSection[] = [];

  constructor() {
    const total = animationCatalog.length;
    const counts = animationGroups.map((group) => ({
      group,
      count: animationCatalog.filter((entry) => entry.group === group).length
    }));

    this.add(
      'overview',
      'Overview',
      para(
        `\`${PACKAGE}\` is a library of ${total} ready-made UI animations for PixiJS. Every animation is one function call on a display object: no timelines, no animation instances to manage. It works with PixiJS v7 and v8, ships with TypeScript types, and has no dependency other than PixiJS itself.`
      ),
      table(
        ['Category', 'Count', 'What it is for'],
        [
          [
            'Presets',
            String(counts[0].count),
            'General-purpose motion for any object: pop, bounce, shake, slide, fade, spin…'
          ],
          ['CTA Popup', String(counts[1].count), 'Endcard and popup entrances, exits and full show / hide sequences'],
          ['Button', String(counts[2].count), 'Tap feedback, idle attention loops, button entrances and exits'],
          ['Tutorial', String(counts[3].count), 'Hand gestures: tap, swipe, drag, hold, circle, path…'],
          ['Text', String(counts[4].count), 'Typewriter, counters, timers, color and spacing effects for `PIXI.Text`'],
          ['Shaders', String(counts[5].count), 'Filter effects: shine, glow, glitch, dissolve, wipes and more']
        ]
      )
    );

    this.add(
      'requirements',
      'Requirements',
      list([
        'PixiJS `7.x` or `8.x`, already installed in your project.',
        'A bundler that understands ES modules: Vite, webpack, Rollup, esbuild and similar. The package is ESM only.',
        'TypeScript is optional. Type declarations are included, so plain JavaScript projects still get editor hints.',
        'Shader effects need the WebGL renderer. Everything else works on any renderer.'
      ])
    );

    this.add(
      'install',
      'Installation',
      code('npm', `npm install ${PACKAGE}`),
      code('yarn / pnpm', `yarn add ${PACKAGE}\npnpm add ${PACKAGE}`),
      para(
        '`pixi.js` is a peer dependency (`^7.0.0 || ^8.0.0`). The library uses the copy your project already has, so PixiJS is never bundled twice.'
      )
    );

    this.add(
      'quick-start',
      'Quick start',
      para(
        'Create an object, add it to the stage and call an animation on it. The import is the same for both PixiJS versions.'
      ),
      code('PixiJS v8', QUICK_START_V8),
      code('PixiJS v7', QUICK_START_V7),
      note(
        'Scale and rotation animations work around the object origin. Draw graphics around `(0, 0)` or set `anchor.set(0.5)` on sprites and texts, otherwise the object scales from its top-left corner.'
      )
    );

    this.add(
      'importing',
      'Importing',
      code('Two ways to import', IMPORTS),
      para(
        'Named imports keep playables small: one animation adds about 3 KB (1.5 KB gzipped). The `pua` object pulls in the whole library, about 80 KB (17 KB gzipped).'
      )
    );

    this.add(
      'calling',
      'Calling conventions',
      list([
        'The first argument is always the display object: `Sprite`, `Container`, `Text`, `Graphics` and so on.',
        'Values an animation cannot work without come next: a duration, a direction, a color, a position. The exact signature is shown on every component page.',
        'The last argument is optional and is either a callback that runs when the animation finishes, or an options object.'
      ]),
      code('Examples', CALLING),
      sub('Options every one-shot animation accepts'),
      table(
        ['Option', 'Type', 'Meaning'],
        [
          ['`duration`', 'number', 'Length in milliseconds. Some animations take it as a required argument instead.'],
          [
            '`easing`',
            'name or function',
            'Easing curve. Animations that draw their own motion (`shake`, `jelly`, `glitch`…) use it to bend their timing instead.'
          ],
          ['`delay`', 'number', 'Milliseconds to wait before starting.'],
          ['`onComplete`', 'function', 'Called once when the animation finishes.']
        ]
      ),
      para(
        'Every animation also has its own options for size, strength, speed, count or direction, such as `overshoot`, `height`, `strength` or `speed`. Open a component in the gallery to see them all, tune them with sliders and copy the generated call. To change a running animation, call it again with new values: it replaces the previous one.'
      )
    );

    this.add(
      'easing',
      'Easing',
      para(`Built-in easing names: ${easingNames.map((name) => '`' + name + '`').join(', ')}.`),
      code('Using easings', EASING)
    );

    this.add(
      'loops',
      'Looping animations and stop()',
      para(
        'Animations marked `loop` in the gallery repeat until you stop them. They take an options object only, because they never finish on their own.'
      ),
      code('Start and stop', LOOPS),
      list([
        '`stop(target)` stops every animation the library is running on that object.',
        'Filters added by shader effects are removed, and text effects put the original text and color back.',
        'Position, scale, rotation and alpha stay at the value they had at that moment. Set them back yourself if you need the exact original.',
        'For looping animations a `delay` is applied before every cycle, which is a simple way to add a pause between repeats.'
      ])
    );

    this.add(
      'channels',
      'Running several animations on one object',
      para(
        'Each animation drives one or more channels of an object: `scale`, `rotation`, `position`, `alpha`, `skew`, `filter`, and for texts `text`, `spacing`, `color`, `stroke`. One channel runs one animation at a time.'
      ),
      code('Combining and replacing', CHANNELS),
      para(
        'When an animation replaces another on the same channel, it starts from the resting value of the object, not from the value it had mid-animation. A tap on a pulsing button therefore never leaves the button stuck at the wrong size.'
      )
    );

    this.add(
      'in-out',
      'Entrances and exits',
      list([
        'Entrances set `visible = true` and apply their starting state immediately, so a delayed entrance stays hidden until it begins.',
        'Exits hide the object when they finish: most set `visible = false`, a few leave it at alpha `0`.',
        'An exit remembers the scale, alpha and position the object had. The next entrance on that object restores them, so In / Out pairs can be repeated forever.'
      ]),
      code('Hide and show again', IN_OUT)
    );

    this.add(
      'sequencing',
      'Sequencing',
      para('Chain with callbacks, stagger with `delay`.'),
      code('Chains and staggers', SEQUENCE)
    );

    this.add(
      'guides',
      'Category guides',
      sub('Presets'),
      para(
        'Work on any display object and need no setup. Use them for icons, rewards, panels, counters and anything else on screen.'
      ),
      sub('CTA Popup'),
      para(
        '`ctaShow` and `ctaHide` animate a whole endcard in one call. Pass the parts you have: a full-screen `overlay`, the `panel`, a `title` and a `button`.'
      ),
      code('Endcard sequence', CTA),
      table(
        ['Option', 'Values'],
        [
          ['`entrance`', '`pop`, `drop`, `slide`, `flip`, `bounce`, `swing`, `elastic`, `unfold`, `whirl`'],
          ['`exit`', '`shrink`, `slide`, `zoom`, `flip`, `swing`, `fall`'],
          ['`stagger`', 'Milliseconds between the parts'],
          ['`pulseButton`', 'Keep the button pulsing after the entrance (default `true`)']
        ]
      ),
      para(
        'The single popup functions (`popupIn`, `popupDrop`, `popupSlideIn`…) take the duration as their second argument. Entrances and exits that travel off screen measure against the browser window, so they expect the canvas to fill it.'
      ),
      sub('Button'),
      para('Idle loops attract attention, press animations give feedback. Wire them to pointer events:'),
      code('Interactive button', BUTTON),
      sub('Tutorial'),
      para(
        'The target is your hand sprite. Place its fingertip at the origin, position the hand over the element to interact with, then start a gesture. Coordinates passed to `tutorialDrag`, `tutorialArc`, `tutorialPath` and `tutorialTapSequence` are in the coordinate space of the hand parent.'
      ),
      code('Tutorial hand', TUTORIAL),
      sub('Text'),
      para(
        'Text animations take a `PIXI.Text`. They change its content, fill, stroke or letter spacing, and restore the original when stopped.'
      ),
      code('Text effects', TEXT),
      sub('Shaders'),
      para(
        'Shader effects attach a filter to the object. They keep any filters you added yourself, but one object runs one library filter at a time: starting a new shader effect replaces the previous one.'
      ),
      code('Filter effects', SHADERS),
      list([
        '`grayscale`, `sepia`, `brightness` and `tintTo` keep their filter until you call them again with `0`.',
        'A filter renders the object to a texture first. Use shader effects on a few key objects, not on hundreds at once.',
        "On PixiJS v8 create the application with `preference: 'webgl'`."
      ])
    );

    this.add(
      'versions',
      'PixiJS v7 and v8',
      para(
        'The same import works on both versions; the library detects the installed PixiJS at runtime. What differs is your own setup code:'
      ),
      table(
        ['', 'PixiJS v7', 'PixiJS v8'],
        [
          ['Create the app', '`new Application({ … })`', '`new Application()` then `await app.init({ … })`'],
          ['Canvas element', '`app.view`', '`app.canvas`'],
          ['Create a text', "`new Text('Hi', style)`", "`new Text({ text: 'Hi', style })`"],
          ['Shader effects', 'Work out of the box', "Need `preference: 'webgl'`"]
        ]
      ),
      para(
        'Animations are driven by `Ticker.shared`. It starts by itself; if your code stops the shared ticker, the animations pause with it.'
      )
    );

    this.add(
      'typescript',
      'TypeScript',
      para(
        'Types are bundled with the package. Every animation exports an options type named after it (`PopOptions`, `ShakeOptions`, `CtaOptions`…), next to the shared types `PuaTarget`, `PuaOptions`, `PuaEasing`, `EasingName`, `SlideDirection`, `CtaParts` and `Point`.'
      ),
      code('Typed usage', TYPES)
    );

    this.add(
      'cleanup',
      'Cleaning up',
      para('Stop looping animations before destroying an object, so nothing keeps updating it.'),
      code('Before destroy', CLEANUP)
    );

    this.add(
      'single-file',
      'Using one component without npm',
      para(
        'If you prefer not to add a dependency, every component is also available as a single self-contained TypeScript file:'
      ),
      steps([
        'Open the component in the gallery and tune it in the dev panel.',
        'Copy the **Component source** block, or press **Download .zip** to get the file together with a usage snippet and the preview assets.',
        "Save the file next to your UI code and import from it: `import { pop } from './pop'`."
      ]),
      para('The file needs only `pixi.js` and works on v7 and v8, exactly like the package.')
    );

    this.add(
      'site',
      'Using this site',
      list([
        '**Gallery** shows every component with a live preview. Search by name, filter by tags, behavior, game genre or target.',
        '**Component page** has a live preview, a dev panel with every option, and a usage snippet that updates as you change values.',
        '**Custom assets** lets you upload your own card, popup, button or hand image to preview animations on real art.',
        'The sidebar lists all animations by category; categories can be collapsed.'
      ])
    );

    this.add(
      'troubleshooting',
      'Troubleshooting',
      table(
        ['Problem', 'Cause and fix'],
        [
          [
            'Nothing moves',
            'The object is not on the stage, or `Ticker.shared` was stopped. Add the object to the stage and keep the shared ticker running.'
          ],
          [
            'The object scales from a corner',
            'Its origin is the top-left corner. Set `anchor.set(0.5)` or draw the shape around `(0, 0)`.'
          ],
          [
            'A loop stops when another animation plays',
            'Both use the same channel. Restart the loop in the `onComplete` of the second animation.'
          ],
          [
            'The object stays slightly off after `stop()`',
            'Transforms are left where the animation was. Reset the scale, position or rotation after stopping.'
          ],
          ['Shader effect does nothing on v8', "The renderer is WebGPU. Create the app with `preference: 'webgl'`."],
          [
            'A popup slides too far or not far enough',
            'Off-screen distances are measured against the browser window. They assume a full-window canvas.'
          ],
          ['`require()` cannot load the package', 'The package is ESM only. Use `import`, or let your bundler handle it.']
        ]
      )
    );

    this.add(
      'api',
      'API reference',
      para(`All ${total} functions. Click a name to open its live preview, options and usage snippet.`),
      this.reference()
    );

    this.add(
      'develop',
      'Working on the library',
      para('The repository holds the library source in `src/pua` and this site in `src/site`.'),
      code('Commands', DEVELOP),
      steps([
        'Implement the animation in `src/pua/animations/`.',
        'Add it to the `pua` object in `src/pua/index.ts`.',
        'Add a catalog entry in `src/site/catalog.ts` so it appears in the gallery.',
        'Run `npm run sources` to refresh the source shown on the site.'
      ])
    );

    this.add('license', 'License', para('MIT. Free to use in personal and commercial projects.'));

    this.el = h(
      'div',
      { class: 'page docs' },
      h(
        'div',
        null,
        h('div', { class: 'eyebrow', text: `Documentation · v${PUA_VERSION}` }),
        h('h1', { class: 'page-title', text: 'Documentation' }),
        h('p', {
          class: 'lead',
          text: 'Everything you need to install the library, call the animations and ship them in a playable.'
        })
      ),
      this.contents(),
      this.sections.map((section) => section.el)
    );
  }

  public mount(container: HTMLElement): void {
    container.append(this.el);
  }

  public unmount(): void {
    this.el.remove();
  }

  private add(id: string, title: string, ...children: Child[]): void {
    const el = h('section', { class: 'docs-section', id: `docs-${id}` }, h('h2', { text: title }), children);
    this.sections.push({ id, title, el });
  }

  private contents(): HTMLElement {
    return h(
      'nav',
      { class: 'card docs-toc', 'aria-label': 'On this page' },
      h('div', { class: 'card-header' }, h('span', { class: 'card-title', text: 'On this page' })),
      h(
        'ol',
        null,
        this.sections.map((section) =>
          h(
            'li',
            null,
            h('button', {
              type: 'button',
              text: section.title,
              onclick: () => section.el.scrollIntoView({ behavior: 'smooth', block: 'start' })
            })
          )
        )
      )
    );
  }

  private reference(): HTMLElement {
    return h(
      'div',
      { class: 'docs-reference' },
      animationGroups.map((group) => {
        const entries = animationCatalog.filter((entry) => entry.group === group);
        return h(
          'details',
          { class: 'card docs-group' },
          h('summary', null, h('span', { text: group }), h('small', { text: String(entries.length) })),
          h(
            'div',
            { class: 'docs-table-wrap' },
            h(
              'table',
              { class: 'docs-table' },
              h(
                'tbody',
                null,
                entries.map((entry) =>
                  h(
                    'tr',
                    null,
                    h(
                      'td',
                      null,
                      h('a', { href: routeHref({ name: 'animation', id: entry.id }) }, h('code', { text: entry.signature }))
                    ),
                    h('td', { text: entry.summary }),
                    h('td', null, entry.continuous ? h('span', { class: 'badge', text: 'loop' }) : null)
                  )
                )
              )
            )
          )
        );
      })
    );
  }
}
