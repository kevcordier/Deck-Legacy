import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Vitest resolves imports like server-side code: use workspace sources, not dist/.
  ssr: { resolve: { conditions: ['source'], externalConditions: ['source'] } },
  resolve: {
    conditions: ['source'],
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
