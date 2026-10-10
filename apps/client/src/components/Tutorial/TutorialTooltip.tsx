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
};

export function TutorialTooltip({ step, isLastStep, onNext, onSkip }: TutorialTooltipProps) {
  const { t } = useTranslation();
  const buttons = step.buttons ?? ['skip', 'primary'];
  const showSkip = !isLastStep && buttons.includes('skip');
  const showPrimary = buttons.includes('primary');

  return (
    <FadeInScale className="border-primary/70 bg-card overflow-hidden rounded-2xl border-2 shadow-lg">
      <ScrollView className="max-h-[36rem]" contentContainerClassName="p-4 sm:p-6">
        <View className="bg-primary/10 border-primary/30 self-start rounded-full border px-2.5 py-1">
          <Text className="font-display text-primary text-xs uppercase tracking-widest">
            {t('tutorial.tooltip.badge')}
          </Text>
        </View>

        <TextStyle className="text-base-ink text-base">
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
              <Button variant="text" color="base-ink" size="sm" font="body" onPress={onSkip}>
                {t('tutorial.tooltip.skip')}
              </Button>
            )}
          </View>
          {showPrimary && (
            <Button variant="contained" color="base-primary" size="sm" onPress={onNext}>
              {isLastStep ? t('tutorial.tooltip.finish') : t('tutorial.tooltip.next')}
            </Button>
          )}
        </View>
      </ScrollView>
    </FadeInScale>
  );
}
