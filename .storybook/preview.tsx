import i18n from '../src/helpers/i18n';
import '../src/styles/game.css';
import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Preview } from '@storybook/react-vite';
import { Suspense, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import type { DecoratorFunction } from 'storybook/internal/types';

const useI18nLocale = (locale: string) => {
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);
};

const I18nextWrapper = ({ children, locale }: { children: React.ReactNode; locale: string }) => {
  useI18nLocale(locale);

  return (
    <Suspense fallback={<div>loading translations...</div>}>
      <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
    </Suspense>
  );
};

const withI18next: DecoratorFunction = (Story, context) => {
  const { locale } = context.globals;

  return (
    <I18nextWrapper locale={locale}>
      <Story />
    </I18nextWrapper>
  );
};

export const globalTypes = {
  locale: {
    name: 'Locale',
    description: 'Internationalization locale',
    toolbar: {
      icon: 'globe',
      items: [
        { value: 'en', title: 'English' },
        { value: 'fr', title: 'Français' },
      ],
      showName: true,
    },
  },
};

const preview: Preview = {
  decorators: [
    withI18next,
    withThemeByDataAttribute({
      themes: {
        light: 'light',
        dark: 'dark',
      },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
};

export default preview;
