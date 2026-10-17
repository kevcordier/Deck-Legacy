import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vitest resolves imports like server-side code: use workspace sources, not dist/.
  ssr: { resolve: { conditions: ['source'], externalConditions: ['source'] } },
  // SWC keeps decorator metadata, which NestJS dependency injection relies on.
  plugins: [swc.vite({ module: { type: 'es6' } })],
  resolve: {
    conditions: ['source'],
  },
  test: {
    environment: 'node',
    // Transform workspace packages from their TypeScript sources instead of loading dist/.
    server: { deps: { inline: [/@deck-legacy\//] } },
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/generated/**', 'src/data/**', 'src/main.ts'],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 60,
        statements: 80,
      },
    },
  },
});
