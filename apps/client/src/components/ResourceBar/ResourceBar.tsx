import { StickerStockModal } from '@components/StickerStockModal/StickerStockModal';
import ScoreTooltip from '@components/Tooltips/ScoreTooltip';
import { TutorialTarget } from '@components/Tutorial/TutorialTarget';
import { Button } from '@components/ui/Button/Button';
import { Divider } from '@components/ui/Divider/Divider';
import { GloryIcon } from '@components/ui/Icon/icon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Stat } from '@components/ui/Stat/Stat';
import { Text } from '@components/ui/Text/Text';
import { Tooltip } from '@components/ui/Tooltip/Tooltip';
import { useGame } from '@hooks/useGame';
import { useGameUI } from '@hooks/useGameInterface';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

export function ResourceBar() {
  const { t } = useTranslation();
  const { gameState, score } = useGame();
  const { setStickerStockOpen } = useGameUI();
  const isDesktop = useIsDesktop();

  const { resources, round, turn, drawPile, discardPile } = gameState;
  const entries = Object.entries(resources).filter(([, v]) => v > 0);

  return (
    <TutorialTarget id="resource-bar" className="bg-background border-b-border z-10 border-b">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="grow flex-row items-stretch justify-between gap-3 px-3 py-1 lg:gap-6 lg:px-6 lg:py-2"
      >
        <View className="shrink-0 flex-row items-stretch gap-2 lg:gap-4">
          <Stat label={t('resourceBar.round')} value={round || '—'} />
          <Divider orientation="vertical" />
          <Stat label={t('resourceBar.turn')} value={turn || '—'} />
          <Divider orientation="vertical" />
        </View>

        <View className="grow flex-row flex-wrap items-center gap-2 lg:gap-4">
          {entries.length === 0 ? (
            <Text className="text-ink/50 font-body-italic text-sm">
              {t('resourceBar.noResources')}
            </Text>
          ) : (
            entries.map(([k, v]) => (
              <View
                key={k}
                className="border-border flex-row items-center gap-1 rounded border px-2 py-1"
              >
                <Text className="font-display">{v}</Text>
                <ResourcePill resource={k} className="size-5" />
              </View>
            ))
          )}
        </View>

        <View className="shrink-0 flex-row items-stretch gap-2 lg:gap-4">
          {isDesktop && (
            <View className="shrink-0 flex-row items-stretch gap-2 lg:gap-4">
              <Divider orientation="vertical" />
              <Stat label={t('resourceBar.deck')} value={drawPile.length} />
              <Divider orientation="vertical" />
              <Stat label={t('resourceBar.discard')} value={discardPile.length} />
            </View>
          )}

          <View className="shrink-0 flex-row items-stretch gap-2">
            <Divider orientation="vertical" />
            <Tooltip
              content={<ScoreTooltip />}
              position="bottom"
              className="items-center gap-1"
              contentClassName="min-w-52"
              accessibilityLabel={t('resourceBar.gloryTooltipTitle')}
            >
              <View className="relative size-9 items-center justify-center">
                <GloryIcon color={IconColors.gold} className="absolute inset-0 size-9" />
                <Text className="font-display text-primary text-xs font-bold">{score}</Text>
              </View>
              {isDesktop && (
                <Text className="text-primary text-xs uppercase">{t('resourceBar.glory')}</Text>
              )}
            </Tooltip>
            <Divider orientation="vertical" />
            <TutorialTarget id="sticker-stock-button" className="justify-center">
              <Button
                onPress={() => setStickerStockOpen(true)}
                variant="outlined"
                size="xs"
                title={t('stickerStock.open')}
              >
                🏷
              </Button>
            </TutorialTarget>
          </View>
        </View>
      </ScrollView>
      <StickerStockModal />
    </TutorialTarget>
  );
}
