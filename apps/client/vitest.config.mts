import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  // Vitest resolves imports like server-side code: use workspace sources, not dist/.
  ssr: { resolve: { conditions: ['source'], externalConditions: ['source'] } },
  resolve: {
    conditions: ['source'],
    alias: {
      '@components': path.resolve(root, 'src/components'),
      '@contexts': path.resolve(root, 'src/contexts'),
      '@data': path.resolve(root, 'src/data'),
      '@helpers': path.resolve(root, 'src/helpers'),
      '@hooks': path.resolve(root, 'src/hooks'),
      '@pages': path.resolve(root, 'src/pages'),
      '@services': path.resolve(root, 'src/services'),
      '@styles': path.resolve(root, 'src/styles'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
