import { Container, Graphics, Text } from 'pixi.js';
import {
  bounce,
  buttonIdle,
  buttonPress,
  chromatic,
  coinFlip,
  countTo,
  ctaCelebrate,
  ctaHide,
  ctaShow,
  dissolveIn,
  dissolveOut,
  fadeIn,
  fadeOut,
  float,
  glitch,
  glitchLoop,
  glowPulse,
  hologram,
  irisOut,
  jelly,
  orbit,
  pixelateIn,
  pixelateOut,
  pop,
  pulse,
  punchUp,
  shake,
  shine,
  shockwave,
  slicesOut,
  slideIn,
  stop,
  tada,
  textRainbow,
  textSwap,
  tilesOut,
  trackIn,
  tutorialIn,
  tutorialOut,
  tutorialTap,
  typewriter,
  wipeOut,
  wobble,
  zoomIn,
  zoomOut
} from 'pua';
import {
  ambient,
  at,
  box,
  burst,
  COLOR,
  disc,
  dotGrid,
  every,
  FONT,
  gameButton,
  gameCard,
  gem,
  glow,
  group,
  H,
  hand,
  headline,
  label,
  logoMark,
  looping,
  moveTo,
  pointer,
  release,
  Scene,
  scene,
  sound,
  tween,
  typing,
  W
} from './kit';

type Exit = 'wipe' | 'slices' | 'tiles' | 'dissolve' | 'iris' | 'zoom';

function hidden<T extends Container>(target: T): T {
  target.visible = false;
  return target;
}

function enter(root: Container, target: Scene, t: number): void {
  at(t, () => root.addChild(target));
}

function leave(root: Container, target: Scene, t: number, kind: Exit): void {
  sound(t, 'whooshOut');
  at(t, () => {
    const onComplete = (): void => {
      release(target);
      root.removeChild(target);
    };
    if (kind === 'wipe') wipeOut(target, 'left', 440, { onComplete });
    else if (kind === 'slices') slicesOut(target, 440, { count: 8, onComplete });
    else if (kind === 'tiles') tilesOut(target, 460, { count: 6, onComplete });
    else if (kind === 'dissolve') dissolveOut(target, 460, { edgeColor: COLOR.volt, scale: 6, onComplete });
    else if (kind === 'iris') irisOut(target, 440, { onComplete });
    else zoomOut(target, { duration: 380, to: 1.05, onComplete });
  });
}

function reveal(row: Container, t: number): void {
  sound(t, 'whoosh');
  row.children.forEach((word, index) =>
    at(t + index * 0.08, () => slideIn(word as Container, 'bottom', { distance: 56, duration: 480, easing: 'backOut' }))
  );
}

function click(owner: Container, cursor: Container, t: number, action: () => void): void {
  sound(t, 'tap');
  at(t, () => {
    const ring = new Graphics();
    ring.lineStyle(5, COLOR.volt);
    ring.drawCircle(0, 0, 20);
    ring.position.copyFrom(cursor.position);
    owner.addChildAt(ring, owner.getChildIndex(cursor));
    zoomOut(ring, { to: 3.2, duration: 440, onComplete: () => ring.destroy() });
    punchUp(cursor, { strength: -0.2, duration: 240 });
    action();
  });
}

function backdrop(root: Container): void {
  const base = new Graphics();
  base.beginFill(COLOR.night);
  base.drawRect(0, 0, W, H);
  base.endFill();

  const violet = glow(COLOR.iris, 900, 0.36);
  violet.position.set(W * 0.5, -120);
  const lime = glow(COLOR.volt, 620, 0.14);
  lime.position.set(W - 80, 40);
  const low = glow(COLOR.iris, 700, 0.14);
  low.position.set(140, H + 160);

  const grid = dotGrid(W, H, 48, COLOR.line, 0.55);
  grid.position.set(W / 2, H / 2);

  root.addChild(base, violet, lime, low, grid);
  ambient(root);
  at(0, () => {
    orbit(violet, { radius: 90, duration: 9000 });
    orbit(lime, { radius: 70, duration: 7000, clockwise: false });
    orbit(low, { radius: 60, duration: 8000 });
  });
}

function watermark(root: Container): void {
  const mark = logoMark(44);
  const name = label('pixi-pua', 34, 0, {
    font: FONT.mono,
    size: 24,
    weight: '700',
    color: COLOR.muted,
    anchor: [0, 0.5]
  });
  const badge = hidden(group(92, H - 62, mark, name));
  root.addChild(badge);
  at(4.4, () => fadeIn(badge, { duration: 500 }));
  at(35.5, () => fadeOut(badge, { duration: 400 }));
}

function intro(root: Container): void {
  const s = scene();
  const logo = hidden(logoMark(220));
  logo.position.set(590, 470);
  const word = hidden(label('pixi-pua', 742, 462, { font: FONT.head, size: 164, weight: '800', anchor: [0, 0.5] }));
  const tag = hidden(label('170 ready-made UI animations for PixiJS', W / 2, 668, { size: 48, color: COLOR.muted }));

  const coin = group(
    0,
    0,
    disc(46, COLOR.sun, COLOR.dark, 6),
    label('$', 0, -2, { font: FONT.game, size: 54, weight: '400', color: COLOR.dark })
  );
  const props = [
    { item: gameButton('PLAY', 190, 68), x: 330, y: 230 },
    { item: coin, x: 1570, y: 250 },
    { item: gem(0.62), x: 300, y: 840 },
    { item: gameCard(140, 98), x: 1610, y: 820 },
    { item: gameButton('TAP', 150, 56, COLOR.rose), x: 960, y: 900 }
  ];
  props.forEach((prop) => {
    hidden(prop.item).position.set(prop.x, prop.y);
    looping(s, prop.item);
  });
  const confetti = group(0, 0);
  s.addChild(...props.map((prop) => prop.item), confetti, logo, word, tag);

  enter(root, s, 0);
  sound(0.2, 'whoosh');
  sound(0.32, 'pop', 0.9);
  at(0.25, () => {
    pop(logo, { duration: 650, overshoot: 0.3 });
    burst(confetti, 590, 470, 30, 820);
  });
  sound(0.85, 'whoosh');
  at(0.85, () => trackIn(word, 750, { spacing: 60 }));
  sound(1.78, 'ding', 1047);
  at(1.75, () => slideIn(tag, 'bottom', { distance: 40, duration: 520 }));
  props.forEach((prop, index) => {
    const t = 1.5 + index * 0.13;
    sound(t, 'pop', 1 + index * 0.12, 0.6);
    at(t, () =>
      pop(prop.item, {
        duration: 480,
        overshoot: 0.3,
        onComplete: () => float(prop.item, { height: 16, duration: 1500 + index * 180 })
      })
    );
  });
  sound(2.5, 'sparkle');
  at(2.5, () => shine(logo, { duration: 900, strength: 1 }));
  leave(root, s, 3.56, 'wipe');
}

function oneLine(root: Container): void {
  const s = scene();
  const title = headline([['One line', COLOR.volt], 'per animation.'], 120, 172, 88);
  const sub = hidden(
    label('No timelines. No setup. Just call it.', 124, 262, { size: 40, color: COLOR.muted, anchor: [0, 0.5] })
  );

  const card = box(920, 500, 28, COLOR.deep, { stroke: COLOR.line, strokeWidth: 2 });
  const chrome = group(
    -410,
    -206,
    disc(9, 0xff7a8a),
    group(30, 0, disc(9, COLOR.sun)),
    group(60, 0, disc(9, COLOR.mint)),
    label('game.ts', 110, 0, { font: FONT.mono, size: 24, color: COLOR.muted, anchor: [0, 0.5] })
  );
  const highlight = hidden(box(860, 58, 14, COLOR.volt, { alpha: 0.16 }));

  const lines = [
    { text: "import { pop, shake, shine } from 'pixi-pua';", y: -118, color: 0xb9bfe6, size: 30 },
    { text: 'pop(button);', y: -40, color: COLOR.volt, size: 30 },
    { text: 'shake(button);', y: 24, color: COLOR.volt, size: 30 },
    { text: 'shine(button, { interval: 1100 });', y: 88, color: COLOR.volt, size: 30 },
    { text: "button.on('pointerdown', () => buttonPress(button));", y: 166, color: COLOR.sky, size: 26 }
  ].map((line) =>
    hidden(
      label(line.text, -410, line.y, {
        font: FONT.mono,
        size: line.size,
        weight: '500',
        color: line.color,
        anchor: [0, 0.5]
      })
    )
  );
  const code = hidden(group(580, 660, card, chrome, highlight, ...lines));

  const stageBack = box(680, 500, 28, COLOR.panel, { stroke: COLOR.line, strokeWidth: 2 });
  const stageDots = dotGrid(640, 460, 40, COLOR.line, 0.8);
  const stageTag = label('preview', -300, -206, { font: FONT.mono, size: 24, color: COLOR.muted, anchor: [0, 0.5] });
  const button = hidden(gameButton('PLAY', 320, 112));
  const stage = hidden(group(1440, 660, stageBack, stageDots, stageTag, button));

  const cursor = hidden(pointer());
  cursor.position.set(1820, 1010);
  s.addChild(title, sub, code, stage, cursor);
  looping(s, button);

  const run = (index: number): void => {
    highlight.y = lines[index].y;
    fadeIn(highlight, { duration: 120 });
  };
  const type = (index: number, t: number, duration: number): void => {
    typing(t, duration);
    at(t, () => typewriter(lines[index], duration * 1000, { cursor: '|' }));
  };

  enter(root, s, 4);
  reveal(title, 4.1);
  at(4.45, () => slideIn(code, 'bottom', { distance: 70, duration: 520 }));
  at(4.6, () => slideIn(stage, 'bottom', { distance: 70, duration: 520 }));
  at(4.95, () => fadeIn(sub, { duration: 450 }));

  type(0, 5.0, 1.0);
  type(1, 6.2, 0.38);
  sound(6.72, 'pop', 1.1);
  at(6.7, () => {
    run(1);
    pop(button, { duration: 520, overshoot: 0.28 });
  });

  type(2, 7.2, 0.42);
  sound(7.76, 'rattle');
  at(7.74, () => {
    run(2);
    shake(button, { amplitude: 28, shakes: 8, duration: 520 });
  });

  type(3, 8.25, 0.7);
  sound(9.08, 'sparkle');
  at(9.06, () => {
    run(3);
    shine(button, { interval: 1100, duration: 650, strength: 1.1 });
  });

  type(4, 9.2, 0.75);
  at(9.35, () => {
    fadeIn(cursor, { duration: 200 });
    moveTo(cursor, 1470, 690, 560);
  });
  at(9.98, () => run(4));
  [10.02, 10.34].forEach((t) =>
    click(s, cursor, t, () => {
      buttonPress(button, { depth: 0.82, duration: 240 });
      shockwave(button, { duration: 520, amplitude: 30 });
    })
  );
  leave(root, s, 10.56, 'slices');
}

function tile(x: number, y: number, name: string, count: number, tone: number, demo: Container): Container {
  const back = box(340, 360, 26, COLOR.panel, { stroke: COLOR.line, strokeWidth: 2 });
  const area = box(300, 210, 18, COLOR.deep);
  area.y = -55;
  const dot = disc(9, tone);
  dot.position.set(-140, 112);
  const title = label(name, -120, 112, { size: 30, weight: '700', anchor: [0, 0.5] });
  const total = label(String(count), 140, 112, {
    font: FONT.mono,
    size: 26,
    weight: '700',
    color: COLOR.muted,
    anchor: [1, 0.5]
  });
  demo.y += -55;
  return hidden(group(x, y, back, area, demo, dot, title, total));
}

function showcase(root: Container): void {
  const s = scene();
  const counter = hidden(
    label('0', 108, 400, { font: FONT.head, size: 270, weight: '800', color: COLOR.volt, anchor: [0, 0.5] })
  );
  const word = hidden(label('animations', 118, 592, { font: FONT.head, size: 78, weight: '700', anchor: [0, 0.5] }));
  const sub = hidden(label('6 categories. One import.', 122, 684, { size: 40, color: COLOR.muted, anchor: [0, 0.5] }));
  const tune = hidden(
    label('Every one is tunable:\nspeed, size, easing.', 122, 830, {
      size: 40,
      color: COLOR.ink,
      anchor: [0, 0.5],
      lineHeight: 56
    })
  );

  const card = gameCard(120, 84);

  const popupPanel = hidden(group(0, 0));
  const popupBack = box(190, 150, 20, COLOR.white, { stroke: COLOR.dark, strokeWidth: 4 });
  const popupTitle = label('YOU WIN!', 0, -34, { font: FONT.game, size: 30, weight: '400', color: COLOR.dark });
  const popupButton = gameButton('PLAY', 120, 46);
  popupButton.y = 30;
  popupPanel.addChild(popupBack, popupTitle, popupButton);

  const idleButton = gameButton('PLAY', 170, 64);

  const tapButton = gameButton('TAP', 150, 56);
  const tapHand = hand(1.1);
  tapHand.position.set(34, 22);
  const tutorial = group(0, -6, tapButton, tapHand);

  const levelUp = label('LEVEL UP!', 0, 0, {
    font: FONT.game,
    size: 50,
    weight: '400',
    color: COLOR.volt,
    stroke: COLOR.dark,
    strokeWidth: 6
  });

  const shaderCard = gameCard(120, 84);

  const tiles = [
    tile(880, 330, 'Presets', 47, COLOR.volt, group(0, 0, card)),
    tile(1250, 330, 'CTA Popup', 23, COLOR.rose, group(0, 0, popupPanel)),
    tile(1620, 330, 'Button', 15, COLOR.sky, group(0, 0, idleButton)),
    tile(880, 730, 'Tutorial', 16, COLOR.mint, tutorial),
    tile(1250, 730, 'Text', 19, COLOR.sun, group(0, 0, levelUp)),
    tile(1620, 730, 'Shaders', 50, 0x9a8eff, group(0, 0, shaderCard))
  ];
  const confetti = group(0, 0);

  s.addChild(counter, word, sub, tune, ...tiles, confetti);
  [card, popupPanel, popupTitle, popupButton, idleButton, tapHand, levelUp, shaderCard].forEach((target) =>
    looping(s, target)
  );

  enter(root, s, 11);
  sound(11.05, 'impact');
  at(11.1, () => pop(counter, { duration: 420, overshoot: 0.2 }));
  at(11.3, () => countTo(counter, 170, 1250, { from: 0 }));
  for (let k = 0; k < 1.2; k += 0.075) sound(11.32 + k, 'tick', 0.9 + k * 0.5);
  sound(12.58, 'ding', 1319);
  at(12.56, () => {
    punchUp(counter, { strength: 0.12 });
    burst(confetti, 330, 330, 22, 700);
  });
  at(11.5, () => slideIn(word, 'left', { distance: 70, duration: 480 }));
  at(11.95, () => fadeIn(sub, { duration: 450 }));

  tiles.forEach((item, index) => {
    const t = 11.9 + index * 0.12;
    sound(t + 0.03, 'pop', 0.85 + index * 0.09);
    at(t, () => pop(item, { duration: 460, overshoot: 0.18 }));
  });

  const presets = [
    () => jelly(card, { strength: 0.3 }),
    () => bounce(card, { height: 34 }),
    () => tada(card, { strength: 0.16, angle: 7 }),
    () => coinFlip(card, { height: 26 }),
    () => wobble(card, { angle: 14 }),
    () => punchUp(card, { strength: 0.3 })
  ];
  every(12.75, 16.5, 0.95, (index) => presets[index % presets.length]());

  const parts = { panel: popupPanel, title: popupTitle, button: popupButton };
  every(12.75, 16.4, 1.9, () => ctaShow(parts, { duration: 280, stagger: 80, entrance: 'bounce' }));
  every(14.2, 16.2, 1.9, () => ctaHide(parts, { duration: 180, stagger: 40 }));

  at(12.75, () => buttonIdle(idleButton, { strength: 0.08, tilt: 3 }));
  every(13.6, 16.4, 1.5, () =>
    buttonPress(idleButton, { depth: 0.84, onComplete: () => buttonIdle(idleButton, { strength: 0.08, tilt: 3 }) })
  );

  at(12.75, () => tutorialTap(tapHand, { interval: 850, duration: 280 }));
  every(12.88, 16.4, 0.85, () => punchUp(tapButton, { strength: 0.08, duration: 240 }));

  at(12.75, () => textRainbow(levelUp, { duration: 2600 }));
  every(13.1, 16.2, 2.0, () => typewriter(levelUp, 620));

  at(12.75, () => hologram(shaderCard, { duration: 2200, strength: 0.75 }));
  every(13.9, 16.2, 1.9, () =>
    glitch(shaderCard, {
      duration: 520,
      strength: 1.3,
      onComplete: () => hologram(shaderCard, { duration: 2200, strength: 0.75 })
    })
  );

  sound(15.1, 'ding', 880);
  at(15.1, () => slideIn(tune, 'left', { distance: 60, duration: 500 }));
  leave(root, s, 16.56, 'tiles');
}

function shaderTile(x: number, y: number, name: string, demo: Container): Container {
  const back = box(250, 270, 24, COLOR.panel, { stroke: COLOR.line, strokeWidth: 2 });
  const well = box(214, 170, 16, COLOR.deep);
  well.y = -34;
  demo.y += -34;
  const caption = label(name, 0, 96, { font: FONT.mono, size: 22, weight: '500', color: COLOR.ink });
  return hidden(group(x, y, back, well, demo, caption));
}

function shaders(root: Container): void {
  const s = scene();
  const first = headline([['Shaders', COLOR.volt]], 100, 250, 104);
  const second = headline(['included.'], 100, 362, 104);
  const sub = hidden(
    label('50 GPU effects. Same one-line API.', 104, 470, { size: 38, color: COLOR.muted, anchor: [0, 0.5] })
  );

  const chipCode = label('shine(button, { interval: 1000 });', -300, 0, {
    font: FONT.mono,
    size: 26,
    weight: '500',
    color: COLOR.volt,
    anchor: [0, 0.5]
  });
  const chip = hidden(group(425, 610, box(650, 88, 22, COLOR.deep, { stroke: COLOR.line, strokeWidth: 2 }), chipCode));
  const foot = hidden(
    label('Runs on WebGL in PixiJS v7 and v8', 104, 706, { size: 30, color: COLOR.muted, anchor: [0, 0.5] })
  );

  const button = gameButton('PLAY', 150, 56);
  const coin = group(
    0,
    0,
    disc(40, COLOR.sun, COLOR.dark, 5),
    label('$', 0, -2, { font: FONT.game, size: 46, weight: '400', color: COLOR.dark })
  );
  const glitched = gameCard(120, 84);
  const holo = gameCard(120, 84);
  const crystal = gem(0.6);
  const ripple = gameButton('TAP', 150, 56, COLOR.rose);
  const pixels = gameCard(120, 84);
  const win = label('WIN!', 0, 0, {
    font: FONT.game,
    size: 60,
    weight: '400',
    color: COLOR.volt,
    stroke: COLOR.dark,
    strokeWidth: 6
  });

  const entries = [
    { name: 'shine()', demo: button, call: 'shine(button, { interval: 1000 });' },
    { name: 'glowPulse()', demo: coin, call: 'glowPulse(coin, { color: 0xffd447 });' },
    { name: 'glitchLoop()', demo: glitched, call: 'glitchLoop(card, { speed: 30 });' },
    { name: 'hologram()', demo: holo, call: 'hologram(card);' },
    { name: 'dissolveOut()', demo: crystal, call: 'dissolveOut(gem, 650);' },
    { name: 'shockwave()', demo: ripple, call: 'shockwave(button);' },
    { name: 'pixelateIn()', demo: pixels, call: 'pixelateIn(card, 550);' },
    { name: 'chromatic()', demo: win, call: 'chromatic(text, { strength: 7 });' }
  ];
  const tiles = entries.map((entry, index) =>
    shaderTile(905 + (index % 4) * 270, 390 + Math.floor(index / 4) * 300, entry.name, group(0, 0, entry.demo))
  );

  const frame = new Graphics();
  frame.lineStyle(5, COLOR.volt);
  frame.drawRoundedRect(-131, -141, 262, 282, 28);
  hidden(frame).position.set(tiles[0].x, tiles[0].y);

  s.addChild(first, second, sub, chip, foot, ...tiles, frame);
  entries.forEach((entry) => looping(s, entry.demo));

  enter(root, s, 17);
  sound(17.05, 'impact');
  reveal(first, 17.1);
  reveal(second, 17.22);
  at(17.6, () => fadeIn(sub, { duration: 450 }));
  tiles.forEach((item, index) => {
    const t = 17.4 + index * 0.09;
    sound(t + 0.03, 'pop', 0.8 + index * 0.08, 0.8);
    at(t, () => pop(item, { duration: 440, overshoot: 0.2 }));
  });

  at(18.15, () => {
    shine(button, { interval: 1000, duration: 600, strength: 1.2 });
    glowPulse(coin, { color: COLOR.sun, radius: 18, duration: 1000, strength: 1.3 });
    glitchLoop(glitched, { interval: 1000, duration: 420, strength: 1.5, speed: 30 });
    hologram(holo, { duration: 1900, strength: 0.85 });
    chromatic(win, { strength: 7, duration: 850 });
  });
  every(18.2, 23.3, 1.7, () => dissolveOut(crystal, 650, { edgeColor: COLOR.volt }));
  every(19.0, 23.4, 1.7, () => dissolveIn(crystal, 650, { edgeColor: COLOR.volt }));
  every(18.15, 23.4, 1.05, () => shockwave(ripple, { duration: 700, amplitude: 28 }));
  every(18.35, 23.3, 1.7, () => pixelateOut(pixels, 520, { size: 20 }));
  every(19.1, 23.4, 1.7, () => pixelateIn(pixels, 520, { size: 20 }));

  typing(18.0, 0.5);
  at(18.0, () => {
    slideIn(chip, 'left', { distance: 60, duration: 420 });
    typewriter(chipCode, 500, { cursor: '|' });
    fadeIn(frame, { duration: 200 });
  });
  at(18.25, () => slideIn(foot, 'left', { distance: 40, duration: 420 }));
  entries.forEach((entry, index) => {
    if (index === 0) return;
    const t = 18.0 + index * 0.7;
    sound(t, 'tick', 0.7 + index * 0.12, 2.2);
    sound(t + 0.02, 'pop', 1.3 + index * 0.06, 0.45);
    at(t, () => {
      moveTo(frame, tiles[index].x, tiles[index].y, 220);
      punchUp(tiles[index], { strength: 0.07, duration: 300 });
      textSwap(chipCode, entry.call, { duration: 240 });
    });
  });
  leave(root, s, 23.56, 'dissolve');
}

function slider(y: number, name: string): { row: Container; knob: Container; value: Text } {
  const title = label(name, -410, y - 44, { font: FONT.mono, size: 28, color: COLOR.muted, anchor: [0, 0.5] });
  const value = label('', 410, y - 44, {
    font: FONT.mono,
    size: 32,
    weight: '700',
    color: COLOR.volt,
    anchor: [1, 0.5]
  });
  const track = box(820, 12, 6, COLOR.line);
  track.y = y;
  const knob = disc(22, COLOR.volt, COLOR.dark, 4);
  knob.y = y;
  return { row: group(0, 0, title, value, track, knob), knob, value };
}

function tuning(root: Container): void {
  const s = scene();
  const title = headline(['Tune it', ['live.', COLOR.volt]], 120, 172, 88);
  const sub = hidden(
    label('Every option is a parameter. Copy the code when it feels right.', 124, 262, {
      size: 40,
      color: COLOR.muted,
      anchor: [0, 0.5]
    })
  );

  const button = gameButton('PLAY', 340, 120);
  const stage = hidden(
    group(
      480,
      600,
      box(700, 460, 28, COLOR.panel, { stroke: COLOR.line, strokeWidth: 2 }),
      dotGrid(660, 420, 40, COLOR.line, 0.8),
      label('preview', -310, -186, { font: FONT.mono, size: 24, color: COLOR.muted, anchor: [0, 0.5] }),
      button
    )
  );

  const strength = slider(-40, 'strength');
  const speed = slider(120, 'duration (ms)');
  const panel = hidden(
    group(
      1340,
      600,
      box(900, 460, 28, COLOR.panel, { stroke: COLOR.line, strokeWidth: 2 }),
      label('Dev panel', -410, -176, { size: 30, weight: '700', anchor: [0, 0.5] }),
      strength.row,
      speed.row
    )
  );

  const code = label('', -850, 0, { font: FONT.mono, size: 34, weight: '500', color: COLOR.volt, anchor: [0, 0.5] });
  const copyLabel = label('Copy', 0, -1, { size: 28, weight: '700', color: COLOR.dark });
  const copy = group(760, 0, box(190, 60, 16, COLOR.volt), copyLabel);
  const bar = hidden(group(960, 930, box(1760, 96, 24, COLOR.deep, { stroke: COLOR.line, strokeWidth: 2 }), code, copy));

  const cursor = hidden(pointer());
  cursor.position.set(1840, 1060);
  s.addChild(title, sub, stage, panel, bar, cursor);
  [button, copy, copyLabel, bar].forEach((target) => looping(s, target));

  const state = { strength: 0.15, duration: 650 };
  const strengthX = (): number => -410 + (state.strength / 0.8) * 820;
  const durationX = (): number => -410 + ((state.duration - 200) / 1000) * 820;
  const apply = (): void => {
    strength.knob.x = strengthX();
    speed.knob.x = durationX();
    strength.value.text = state.strength.toFixed(2);
    speed.value.text = String(Math.round(state.duration));
    code.text = `jelly(button, { strength: ${state.strength.toFixed(2)}, duration: ${Math.round(state.duration)} });`;
  };
  apply();

  const drag = (t: number, length: number, knob: Container, y: number, change: (p: number) => void): void => {
    sound(t, 'tap', undefined, 0.7);
    at(t, () => cursor.scale.set(0.86));
    for (let k = 0.08; k < length; k += 0.09) sound(t + k, 'tick', 0.7 + k * 0.6, 1.4);
    at(t + 0.04, () =>
      tween(length * 1000, (p) => {
        change(p);
        apply();
        cursor.position.set(1340 + knob.x, 600 + y);
      })
    );
    at(t + length + 0.08, () => cursor.scale.set(1));
  };

  enter(root, s, 24);
  reveal(title, 24.1);
  at(24.4, () => slideIn(stage, 'bottom', { distance: 70, duration: 520 }));
  at(24.52, () => slideIn(panel, 'bottom', { distance: 70, duration: 520 }));
  at(24.64, () => slideIn(bar, 'bottom', { distance: 60, duration: 520 }));
  at(24.85, () => fadeIn(sub, { duration: 450 }));
  every(24.95, 29.5, 0.72, () => jelly(button, { strength: state.strength, duration: state.duration }));

  at(25.0, () => {
    fadeIn(cursor, { duration: 200 });
    moveTo(cursor, 1340 + strengthX(), 600 - 40, 480);
  });
  drag(25.55, 1.05, strength.knob, -40, (p) => {
    state.strength = 0.15 + 0.5 * p;
  });
  at(26.8, () => moveTo(cursor, 1340 + durationX(), 600 + 120, 400));
  drag(27.25, 0.85, speed.knob, 120, (p) => {
    state.duration = 650 - 350 * p;
  });
  at(28.3, () => moveTo(cursor, 960 + 780, 930 + 8, 420));
  sound(28.84, 'sparkle');
  click(s, cursor, 28.8, () => {
    buttonPress(copy, { depth: 0.86, duration: 240 });
    textSwap(copyLabel, 'Copied!', { duration: 260 });
    glowPulse(bar, { color: COLOR.volt, radius: 20, strength: 0.8, duration: 900 });
  });
  at(29.02, () => moveTo(cursor, 1810, 1020, 320));
  leave(root, s, 29.56, 'iris');
}

function bullet(y: number, text: string): Container {
  const dot = hidden(disc(13, COLOR.volt));
  const copy = label(text, 44, 0, { size: 40, anchor: [0, 0.5] });
  const line = hidden(group(0, 0, copy));
  return group(136, y, dot, line);
}

function playable(root: Container): void {
  const s = scene();
  const title = headline(['Made for', ['playable ads', COLOR.volt]], 120, 196, 84);
  const points = [
    'Tutorial hands, CTAs and endcards built in',
    'About 3 KB per animation you import',
    'PixiJS v7 + v8, TypeScript, zero dependencies'
  ].map((text, index) => bullet(390 + index * 130, text));

  const chipCode = label('tutorialTap(hand);', -410, 0, {
    font: FONT.mono,
    size: 32,
    weight: '500',
    color: COLOR.volt,
    anchor: [0, 0.5]
  });
  const chip = hidden(group(576, 850, box(880, 88, 22, COLOR.deep, { stroke: COLOR.line, strokeWidth: 2 }), chipCode));

  const shell = box(430, 860, 64, 0x04050c, { stroke: 0x3b4170, strokeWidth: 5 });
  const screen = box(390, 800, 42, COLOR.panelAlt);
  const notch = box(120, 22, 11, 0x04050c);
  notch.y = -376;

  const coin = disc(22, COLOR.sun, COLOR.dark, 4);
  coin.position.set(-130, -310);
  const coins = label('0', -96, -310, { font: FONT.game, size: 46, weight: '400', color: COLOR.white, anchor: [0, 0.5] });
  const prompt = label('TAP THE GEM!', 0, -190, { font: FONT.game, size: 42, weight: '400', color: COLOR.ink });
  const jewel = gem(1);
  jewel.position.set(0, 40);
  const finger = hidden(hand(1.6));
  finger.position.set(36, 96);

  const overlay = hidden(box(390, 800, 42, 0x05060d));
  overlay.alpha = 0.72;
  const endPanel = hidden(group(0, 10));
  const endBack = box(320, 310, 32, COLOR.white, { stroke: COLOR.dark, strokeWidth: 5 });
  const endTitle = label('LEVEL\nCOMPLETE!', 0, -62, {
    font: FONT.game,
    size: 46,
    weight: '400',
    color: COLOR.dark,
    align: 'center',
    lineHeight: 50
  });
  const endButton = gameButton('PLAY NOW', 250, 86);
  endButton.y = 84;
  endPanel.addChild(endBack, endTitle, endButton);
  const sparks = group(0, 0);
  const confetti = group(0, 0);

  const phone = hidden(
    group(1450, 560, shell, screen, notch, coin, coins, prompt, jewel, sparks, finger, overlay, endPanel, confetti)
  );
  s.addChild(title, ...points, chip, phone);
  [finger, prompt, jewel, coin, coins, overlay, endPanel, endTitle, endButton].forEach((target) => looping(s, target));

  enter(root, s, 30);
  reveal(title, 30.1);
  sound(30.3, 'whoosh');
  at(30.3, () => slideIn(phone, 'bottom', { distance: 260, duration: 680, easing: 'backOut' }));
  at(30.9, () => pulse(prompt, { strength: 0.06, duration: 800 }));
  at(30.8, () => tutorialIn(finger, () => tutorialTap(finger, { interval: 760, duration: 260 })));
  typing(30.85, 0.5);
  at(30.85, () => {
    slideIn(chip, 'bottom', { distance: 50, duration: 420 });
    typewriter(chipCode, 500, { cursor: '|' });
  });

  let total = 0;
  [31.28, 32.04].forEach((t, index) => {
    sound(t, 'tap');
    sound(t + 0.06, 'ding', 1175 + index * 196);
    at(t, () => {
      const from = total;
      total += 50;
      punchUp(jewel, { strength: 0.16, duration: 300 });
      punchUp(coin, { strength: 0.35, duration: 300 });
      countTo(coins, total, 260, { from });
      burst(sparks, 0, 40, 8, 420);
    });
  });

  points.forEach((point, index) => {
    const t = 31.15 + index * 0.75;
    const [dot, line] = point.children as Container[];
    sound(t, 'pop', 1.25, 0.8);
    at(t, () => {
      pop(dot, { duration: 380, overshoot: 0.4 });
      slideIn(line, 'left', { distance: 50, duration: 460 });
    });
  });

  at(32.7, () => {
    stop(finger);
    stop(prompt);
    tutorialOut(finger);
  });
  const parts = { overlay, panel: endPanel, title: endTitle, button: endButton };
  sound(32.9, 'whoosh');
  sound(33.25, 'pop', 0.8);
  sound(33.55, 'chime');
  typing(32.9, 0.7);
  at(32.9, () => {
    ctaShow(parts, { entrance: 'bounce', duration: 320, stagger: 110 });
    chipCode.text = 'ctaShow({ overlay, panel, title, button });';
    typewriter(chipCode, 700, { cursor: '|' });
  });
  sound(34.35, 'sparkle');
  at(34.3, () => {
    ctaCelebrate({ panel: endPanel, title: endTitle, button: endButton }, { strength: 1.2 });
    burst(confetti, 0, -40, 34, 760);
  });
  at(35.0, () => pulse(endButton, { strength: 0.08, duration: 700 }));
  at(35.0, () => shine(endButton, { interval: 1000, duration: 600, strength: 1.1 }));
  leave(root, s, 35.56, 'zoom');
}

function outro(root: Container): void {
  const s = scene();
  const logo = hidden(logoMark(130));
  logo.position.set(712, 250);
  const word = hidden(label('pixi-pua', 806, 244, { font: FONT.head, size: 116, weight: '800', anchor: [0, 0.5] }));

  const pillBack = box(1180, 170, 85, COLOR.deep, { stroke: COLOR.volt, strokeWidth: 4 });
  const command = hidden(
    label('$ npm install pixi-pua', -412, 2, {
      font: FONT.mono,
      size: 64,
      weight: '700',
      color: COLOR.volt,
      anchor: [0, 0.5]
    })
  );
  const pill = hidden(group(W / 2, 520, pillBack, command));

  const link = hidden(label('github.com/Jortsoft/pixi-pua', W / 2, 716, { font: FONT.mono, size: 40, weight: '500' }));
  const license = hidden(label('Free and open source  ·  MIT license', W / 2, 796, { size: 36, color: COLOR.muted }));
  const author = hidden(label('Created by Jortsoft', W / 2, 968, { size: 30, weight: '700', color: COLOR.muted }));
  const confetti = group(0, 0);

  s.addChild(confetti, logo, word, pill, link, license, author);
  looping(s, pill);
  looping(s, logo);

  enter(root, s, 36);
  sound(36.05, 'impact');
  sound(36.16, 'pop', 0.9);
  at(36.12, () => pop(logo, { duration: 520, overshoot: 0.3 }));
  sound(36.3, 'whoosh');
  at(36.3, () => trackIn(word, 560, { spacing: 50 }));
  at(36.6, () => zoomIn(pill, { from: 0.85, duration: 380, easing: 'backOut' }));
  typing(36.85, 0.85);
  at(36.85, () => typewriter(command, 850, { cursor: '|' }));
  sound(37.8, 'impact');
  sound(37.86, 'sparkle');
  at(37.8, () => {
    punchUp(pill, { strength: 0.07, duration: 420 });
    glowPulse(pill, { color: COLOR.volt, radius: 26, strength: 0.9, duration: 1400 });
    burst(confetti, W / 2 - 420, 520, 26, 980);
    burst(confetti, W / 2 + 420, 520, 26, 980);
  });
  sound(38.17, 'ding', 1047);
  at(38.15, () => slideIn(link, 'bottom', { distance: 36, duration: 440 }));
  at(38.5, () => fadeIn(license, { duration: 420 }));
  at(38.85, () => fadeIn(author, { duration: 420 }));
  sound(39.0, 'chime', undefined, 0.8);
  at(39.0, () => shine(logo, { interval: 1600, duration: 800, strength: 1 }));
}

export function buildTimeline(root: Container): void {
  backdrop(root);
  const scenes = new Container();
  root.addChild(scenes);
  intro(scenes);
  oneLine(scenes);
  sound(10.25, 'riser', 0.7);
  showcase(scenes);
  sound(16.25, 'riser', 0.7);
  shaders(scenes);
  tuning(scenes);
  playable(scenes);
  sound(35.2, 'riser', 0.75);
  outro(scenes);
  watermark(root);
}
