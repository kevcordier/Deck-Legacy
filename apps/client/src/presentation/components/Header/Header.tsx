import logo from '@assets/icon-192x192.png';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { Title } from '@components/ui/Title/Title';
import { ModalDepthContext } from '@contexts/ModalDepthContext';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { type ReactNode, use } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type HeaderProps = {
  readonly onOpenRules: () => void;
  readonly onOpenOptions: () => void;
  /** Content centered in the header (e.g. the kingdom name). */
  readonly center?: ReactNode;
  /** Page actions shown before the rules and options buttons. */
  readonly children?: ReactNode;
};

/** Page header shared by the home and game pages: logo, title, rules and options. */
export function Header({ onOpenRules, onOpenOptions, center, children }: HeaderProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  // Copies shown above a modal are not tutorial targets: they would replace the page's one.
  const inModal = use(ModalDepthContext) > 0;

  // The header owns the top inset so the status bar area has its opaque color (pages skip `top`).
  return (
    <SafeAreaView edges={['top']} className="bg-background z-10">
      <TutorialTarget
        id={inModal ? undefined : 'header'}
        className="border-b-border flex-row items-center justify-between gap-2 border-b px-3 py-3 lg:px-6"
      >
        {/* Desktop: both sides grow equally so the center content stays centered. Phone: the
            center content follows the logo and shrinks (ellipsis) before the buttons. */}
        <View className="min-w-0 flex-1 flex-row items-center gap-2">
          <Image
            source={logo}
            style={{ width: 32, height: 32 }}
            accessibilityLabel="Deck Legacy Logo"
          />
          {isDesktop ? <Title level={2}>{t('game.title')}</Title> : center}
        </View>

        {isDesktop && center}

        <View
          className={
            isDesktop
              ? 'flex-1 flex-row items-center justify-end gap-2'
              : 'shrink-0 flex-row items-center gap-2'
          }
        >
          {children}
          <TutorialTarget id={inModal ? undefined : 'rules-button'}>
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
