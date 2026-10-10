import { TextStyle } from '@components/ui/Text/Text';
import { useAppFonts } from '@helpers/fonts';
import { initI18n } from '@helpers/i18n';
import type { Preview } from '@storybook/react-native';
import { useColorScheme } from 'nativewind';
import { type ReactNode, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const i18n = initI18n();

function StoryShell({
  locale,
  theme,
  children,
}: {
  readonly locale: string;
  readonly theme: 'light' | 'dark';
  readonly children: ReactNode;
}) {
  const fontsLoaded = useAppFonts();
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    void i18n.changeLanguage(locale);
  }, [locale]);
  useEffect(() => {
    setColorScheme(theme);
  }, [theme, setColorScheme]);

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <View className="bg-background flex-1 p-3">
          <TextStyle className="text-ink font-body">{children}</TextStyle>
        </View>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

const preview: Preview = {
  globalTypes: {
    locale: {
      name: 'Locale',
      defaultValue: 'en',
      toolbar: { items: ['en', 'fr'] },
    },
    theme: {
      name: 'Theme',
      defaultValue: 'light',
      toolbar: { items: ['light', 'dark'] },
    },
  },
  decorators: [
    (Story, { globals }) => (
      <StoryShell
        locale={(globals.locale as string | undefined) ?? 'en'}
        theme={globals.theme === 'dark' ? 'dark' : 'light'}
      >
        <Story />
      </StoryShell>
    ),
  ],
};

export default preview;
