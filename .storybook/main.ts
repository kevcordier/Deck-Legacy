import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-themes', '@storybook/addon-docs'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  previewBody: body => `
    ${body}
    ${
      process.env.ANALYTICS_ID ? '<script src="https://cdn.example.com/analytics.js"></script>' : ''
    }
  `,
};

export default config;
