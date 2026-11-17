import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const outputDir = fileURLToPath(new URL('./out', import.meta.url));
const output = fileURLToPath(new URL('./out/raw.mp4', import.meta.url));

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  resolve: {
    alias: {
      pua: fileURLToPath(new URL('../src/pua', import.meta.url))
    }
  },
  server: {
    port: 3210,
    strictPort: true,
    fs: { allow: ['..'] }
  },
  plugins: [
    {
      name: 'promo-save',
      configureServer(server) {
        server.middlewares.use('/__save', (request, response) => {
          const chunks: Buffer[] = [];
          request.on('data', (chunk: Buffer) => chunks.push(chunk));
          request.on('end', () => {
            mkdir(outputDir, { recursive: true })
              .then(() => writeFile(output, Buffer.concat(chunks)))
              .then(() => response.end('saved'))
              .catch((error: Error) => {
                response.statusCode = 500;
                response.end(error.message);
              });
          });
        });
      }
    }
  ]
});
