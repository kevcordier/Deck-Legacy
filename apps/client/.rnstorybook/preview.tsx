import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import { TextStyle } from '@components/ui/Text/Text';
import { useAppFonts } from '@helpers/fonts';
import { initI18n } from '@helpers/i18n';
import type { Preview } from '@storybook/react-native';
import { useColorScheme } from 'nativewind';
import type { ReactNode } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const i18n = initI18n();

// The on-device UI has no toolbar for globalTypes: switch theme and locale from the story itself.
function StoryToolbar() {
  const { i18n: current } = useTranslation();
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <View className="mb-3 flex-row gap-3">
      <ButtonGroup
        label="Theme"
        value={colorScheme ?? 'light'}
        onChange={value => setColorScheme(value as 'light' | 'dark')}
        size="sm"
        font="body"
        options={[
          { children: 'Light', value: 'light' },
          { children: 'Dark', value: 'dark' },
        ]}
      />
      <ButtonGroup
        label="Locale"
        value={current.language}
        onChange={value => void current.changeLanguage(value)}
        size="sm"
        font="body"
        options={[
          { children: 'EN', value: 'en' },
          { children: 'FR', value: 'fr' },
        ]}
      />
    </View>
  );
}

function StoryShell({ children }: { readonly children: ReactNode }) {
  const fontsLoaded = useAppFonts();

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <I18nextProvider i18n={i18n}>
        <View className="bg-background flex-1 p-3">
          <StoryToolbar />
          <TextStyle className="text-ink font-body">{children}</TextStyle>
        </View>
      </I18nextProvider>
    </SafeAreaProvider>
  );
}

const preview: Preview = {
  decorators: [
    Story => (
      <StoryShell>
        <Story />
      </StoryShell>
    ),
  ],
};

export default preview;
