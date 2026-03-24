import type { Preview } from '@storybook/react';
import '../src/styles/game.css';
import '../src/i18n/i18n';

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'dark',
      values: [
        { name: 'dark', value: '#1a1a2e' },
        { name: 'light', value: '#f5f5f5' },
      ],
    },
  },
};

export default preview;
