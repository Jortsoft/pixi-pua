import { renderAudio, SAMPLE_RATE } from './audio';
import { exportVideo } from './exporter';
import { advance, createApp, DURATION, FONT, FPS, initClock, seal, sounds, time } from './kit';
import { buildTimeline } from './scenes';

interface Status {
  state: string;
  progress: number;
  message: string;
}

const status: Status = { state: 'loading', progress: 0, message: '' };
(window as unknown as { __promo: Status }).__promo = status;

const statusEl = document.getElementById('status') as HTMLElement;
const playButton = document.getElementById('play') as HTMLButtonElement;

function report(state: string, progress: number, message = ''): void {
  status.state = state;
  status.progress = progress;
  status.message = message;
  statusEl.textContent = `${state} ${Math.round(progress * 100)}% ${message}`;
}

async function boot(): Promise<void> {
  await Promise.all(
    [
      `800 64px "${FONT.head}"`,
      `700 64px "${FONT.head}"`,
      `500 32px "${FONT.body}"`,
      `700 32px "${FONT.body}"`,
      `500 32px "${FONT.mono}"`,
      `700 32px "${FONT.mono}"`,
      `400 32px "${FONT.game}"`
    ].map((font) => document.fonts.load(font))
  );

  initClock();
  const app = createApp();
  (document.getElementById('stage') as HTMLElement).append(app.view as HTMLCanvasElement);
  buildTimeline(app.stage);
  seal();

  const params = new URLSearchParams(window.location.search);

  if (params.has('export')) {
    playButton.hidden = true;
    report('audio', 0);
    const audio = await renderAudio(sounds);
    const blob = await exportVideo(app, audio, report);
    report('saving', 1, `${blob.size} bytes`);
    const response = await fetch('/__save', { method: 'POST', body: blob });
    if (!response.ok) throw new Error(`save failed: ${response.status}`);
    report('done', 1, `${blob.size} bytes`);
    return;
  }

  advance(0);

  if (params.has('t')) {
    playButton.hidden = true;
    const steps = Math.round(Number(params.get('t')) * FPS);
    for (let i = 0; i < steps; i++) advance(1 / FPS);
    app.render();
    report('still', 1, `t = ${time().toFixed(2)}s`);
    return;
  }

  app.render();
  report('ready', 1);
  playButton.addEventListener('click', async () => {
    playButton.hidden = true;
    report('audio', 0);
    const buffer = await renderAudio(sounds);
    const context = new AudioContext({ sampleRate: SAMPLE_RATE });
    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(context.destination);
    const startAt = context.currentTime + 0.15;
    source.start(startAt);

    const frame = (): void => {
      const t = context.currentTime - startAt;
      while (time() + 1 / FPS <= t && time() < DURATION) advance(1 / FPS);
      app.render();
      report('playing', Math.min(1, t / DURATION), `${Math.max(0, t).toFixed(1)}s`);
      if (t < DURATION) window.requestAnimationFrame(frame);
    };
    window.requestAnimationFrame(frame);
  });
}

boot().catch((error: Error) => report('error', 0, error.message));
