import logo from '@assets/icon-192x192.png';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { useIsDesktop } from '@hooks/useIsDesktop';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeaderProps = {
  readonly onOpenRules: () => void;
  readonly onOpenOptions: () => void;
  /** Page actions shown before the rules and options buttons. */
  readonly children?: ReactNode;
};

/** Page header shared by the home and game pages: logo, title, rules and options. */
export function Header({ onOpenRules, onOpenOptions, children }: HeaderProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  // The header owns the top inset so the status bar area has its opaque color (pages skip `top`).
  return (
    <SafeAreaView edges={['top']} className="bg-background z-10">
      <TutorialTarget
        id="header"
        className="border-b-border flex-row items-center justify-between gap-2 border-b px-3 py-3 lg:px-6"
      >
        <View className="shrink flex-row items-center gap-2">
          <Image
            source={logo}
            style={{ width: 32, height: 32 }}
            accessibilityLabel="Deck Legacy Logo"
          />
          {isDesktop && <Title level={2}>{t('game.title')}</Title>}
        </View>

        <View className="flex-row items-center gap-2">
          {children}
          <TutorialTarget id="rules-button">
            <Button onPress={onOpenRules} color="danger" size="xs" title={t('rules.open')}>
              ?
            </Button>
          </TutorialTarget>
          <Button onPress={onOpenOptions} color="danger" size="xs" title={t('header.options')}>
            ⚙︎
          </Button>
        </View>
      </TutorialTarget>
    </SafeAreaView>
  );
}
