import { ArrayBufferTarget, Muxer } from 'mp4-muxer';
import type { Application } from 'pixi.js';
import { SAMPLE_RATE } from './audio';
import { advance, DURATION, FPS, H, W } from './kit';

export type Report = (state: string, progress: number, message?: string) => void;

const VIDEO_CODECS = ['avc1.64002a', 'avc1.640028', 'avc1.4d002a', 'avc1.42002a'];
const VIDEO_BITRATE = 10_000_000;
const AUDIO_CHUNK = 4800;

const pause = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export async function exportVideo(app: Application, audio: AudioBuffer, report: Report): Promise<Blob> {
  let codec = '';
  for (const candidate of VIDEO_CODECS) {
    const support = await VideoEncoder.isConfigSupported({
      codec: candidate,
      width: W,
      height: H,
      bitrate: VIDEO_BITRATE,
      framerate: FPS
    });
    if (support.supported) {
      codec = candidate;
      break;
    }
  }
  if (!codec) throw new Error('No H.264 encoder is available in this browser');

  const audioConfig: AudioEncoderConfig = {
    codec: 'mp4a.40.2',
    sampleRate: SAMPLE_RATE,
    numberOfChannels: 2,
    bitrate: 192_000
  };
  const aac = (await AudioEncoder.isConfigSupported(audioConfig)).supported === true;
  if (!aac) audioConfig.codec = 'opus';

  const muxer = new Muxer({
    target: new ArrayBufferTarget(),
    video: { codec: 'avc', width: W, height: H, frameRate: FPS },
    audio: { codec: aac ? 'aac' : 'opus', sampleRate: SAMPLE_RATE, numberOfChannels: 2 },
    fastStart: 'in-memory',
    firstTimestampBehavior: 'offset'
  });

  let failure: Error | undefined;
  const fail = (error: Error): void => {
    failure = error;
  };

  const videoEncoder = new VideoEncoder({ output: (chunk, meta) => muxer.addVideoChunk(chunk, meta), error: fail });
  videoEncoder.configure({ codec, width: W, height: H, bitrate: VIDEO_BITRATE, framerate: FPS, latencyMode: 'quality' });

  const canvas = app.view as HTMLCanvasElement;
  const frames = DURATION * FPS;
  const frameDuration = 1e6 / FPS;
  advance(0);

  for (let i = 0; i < frames; i++) {
    if (failure) throw failure;
    if (i > 0) advance(1 / FPS);
    app.render();

    const frame = new VideoFrame(canvas, { timestamp: Math.round(i * frameDuration), duration: Math.round(frameDuration) });
    videoEncoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
    frame.close();

    while (videoEncoder.encodeQueueSize > 6) await pause(4);
    if (i % 30 === 0) {
      report('video', i / frames, `${codec}, frame ${i} of ${frames}`);
      await pause(0);
    }
  }
  await videoEncoder.flush();
  videoEncoder.close();
  if (failure) throw failure;

  report('audio', 1, aac ? 'aac' : 'opus');
  const audioEncoder = new AudioEncoder({ output: (chunk, meta) => muxer.addAudioChunk(chunk, meta), error: fail });
  audioEncoder.configure(audioConfig);

  const left = audio.getChannelData(0);
  const right = audio.getChannelData(1);
  for (let offset = 0; offset < audio.length; offset += AUDIO_CHUNK) {
    const count = Math.min(AUDIO_CHUNK, audio.length - offset);
    const planes = new Float32Array(count * 2);
    planes.set(left.subarray(offset, offset + count), 0);
    planes.set(right.subarray(offset, offset + count), count);
    const data = new AudioData({
      format: 'f32-planar',
      sampleRate: SAMPLE_RATE,
      numberOfFrames: count,
      numberOfChannels: 2,
      timestamp: Math.round((offset / SAMPLE_RATE) * 1e6),
      data: planes
    });
    audioEncoder.encode(data);
    data.close();
  }
  await audioEncoder.flush();
  audioEncoder.close();
  if (failure) throw failure;

  muxer.finalize();
  return new Blob([muxer.target.buffer], { type: 'video/mp4' });
}
