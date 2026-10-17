import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  platform: 'node',
  target: 'node20',
  clean: true,
  sourcemap: true,
  // The shared package is TypeScript source, so it is bundled into the server file.
  noExternal: ['@sleek/shared'],
});
