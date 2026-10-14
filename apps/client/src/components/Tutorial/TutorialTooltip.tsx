import { Button } from '@components/ui/Button/Button';
import { FadeInScale } from '@components/ui/FadeInScale/FadeInScale';
import { Text, TextStyle } from '@components/ui/Text/Text';
import type { TutorialStep } from '@contexts/TutorialContext';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

type TutorialTooltipProps = {
  readonly step: TutorialStep;
  readonly isLastStep: boolean;
  readonly onNext: () => void;
  readonly onSkip: () => void;
  /** Shows the back button when defined. */
  readonly onBack?: () => void;
  readonly onFinish: (keepGame: boolean) => void;
};

export function TutorialTooltip({
  step,
  isLastStep,
  onNext,
  onSkip,
  onBack,
  onFinish,
}: TutorialTooltipProps) {
  const { t } = useTranslation();
  const buttons = step.buttons ?? (step.done ? ['skip'] : ['skip', 'primary']);
  const showSkip = !isLastStep && buttons.includes('skip');
  const showPrimary = buttons.includes('primary');

  return (
    <FadeInScale className="border-base-primary bg-card overflow-hidden rounded-2xl border-2 shadow-lg">
      <ScrollView className="max-h-[36rem]" contentContainerClassName="p-4 sm:p-6">
        <View className="bg-ink-card self-start rounded-full px-2.5 py-1">
          <Text className="font-display text-xs text-card uppercase tracking-widest">
            {t('tutorial.tooltip.badge')}
          </Text>
        </View>

        <TextStyle className="text-ink-card text-base">
          <View className="mt-4">
            {typeof step.content === 'string' ? (
              <Text className="leading-6">{step.content}</Text>
            ) : (
              step.content
            )}
          </View>
        </TextStyle>

        <View className="border-border/70 mt-6 flex-row flex-wrap items-center justify-between gap-3 border-t pt-4">
          <View>
            {showSkip && (
              <Button variant="text" color="ink-card" size="sm" font="body" onPress={onSkip}>
                {t('tutorial.tooltip.skip')}
              </Button>
            )}
          </View>
          <View className="min-w-0 shrink flex-row flex-wrap items-center justify-end gap-3">
            {onBack && (
              <Button variant="outlined" color="ink-card" size="sm" onPress={onBack}>
                {t('tutorial.tooltip.back')}
              </Button>
            )}
            {isLastStep && (
              <>
                <Button
                  variant="outlined"
                  color="base-primary"
                  size="sm"
                  onPress={() => onFinish(false)}
                >
                  {t('tutorial.tooltip.restart')}
                </Button>
                <Button
                  variant="contained"
                  color="base-primary"
                  size="sm"
                  onPress={() => onFinish(true)}
                >
                  {t('tutorial.tooltip.continue')}
                </Button>
              </>
            )}
            {showPrimary && (
              <Button variant="contained" color="base-primary" size="sm" onPress={onNext}>
                {t('tutorial.tooltip.next')}
              </Button>
            )}
          </View>
        </View>
      </ScrollView>
    </FadeInScale>
  );
}
