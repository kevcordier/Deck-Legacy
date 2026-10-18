import path from 'node:path';
import { defineConfig } from 'vitest/config';

const root = path.dirname(new URL(import.meta.url).pathname);

export default defineConfig({
  // Expo's development flag, read at module level by some application code.
  define: { __DEV__: false },
  // Vitest resolves imports like server-side code: use workspace sources, not dist/.
  ssr: { resolve: { conditions: ['source'], externalConditions: ['source'] } },
  resolve: {
    conditions: ['source'],
    alias: {
      '@domain': path.resolve(root, 'src/domain'),
      '@application': path.resolve(root, 'src/application'),
      '@infrastructure': path.resolve(root, 'src/infrastructure'),
      '@composition': path.resolve(root, 'src/composition'),
      '@presentation': path.resolve(root, 'src/presentation'),
      '@components': path.resolve(root, 'src/presentation/components'),
      '@contexts': path.resolve(root, 'src/presentation/contexts'),
      '@hooks': path.resolve(root, 'src/presentation/hooks'),
      '@pages': path.resolve(root, 'src/presentation/pages'),
      '@styles': path.resolve(root, 'src/presentation/styles'),
      '@i18n': path.resolve(root, 'src/presentation/i18n'),
      '@data': path.resolve(root, 'src/data'),
      '@services': path.resolve(root, 'src/services'),
    },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
});
