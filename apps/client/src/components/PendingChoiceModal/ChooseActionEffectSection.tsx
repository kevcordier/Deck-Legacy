import type { ChoiceSectionProps } from './shared';
import { Button } from '@components/ui/Button/Button';
import { Text } from '@components/ui/Text/Text';
import { ActionEffectType } from '@deck-legacy/engine/domain/enums';
import type { ActionEffect } from '@deck-legacy/engine/domain/types';
import { tCardActionLabel } from '@helpers/cardI18n';
import { View } from 'react-native';

export function ChooseActionEffectSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, t, resolvePlayerChoice } = props;
  const sourceInstance = instances[choice.sourceInstanceId];
  const sourceDef = sourceInstance ? defs[sourceInstance.cardId] : undefined;
  const sourceState = sourceDef?.states.find(s => s.id === sourceInstance?.stateId);
  const fallbackAction = sourceState?.actions?.find(a =>
    a.actionEffects.some(ae => ae.type === ActionEffectType.CHOOSE_EFFECT),
  );

  return (
    <View className="gap-4">
      {choice.choices.map((actionEffect, index) => {
        // Find the action that contains this effect
        const effectId = (actionEffect as ActionEffect).id;
        let actionLabelId = `${choice.actionId}-${effectId}`;
        if (fallbackAction) actionLabelId = `${fallbackAction.id}-${effectId}`;

        return (
          <View
            key={`${(actionEffect as ActionEffect).id}-${index.toString()}`}
            className="bg-card border-border flex-row items-center justify-between gap-5 rounded border p-4"
          >
            <View className="flex-1">
              <Text className="font-display text-base-primary mb-1 text-sm">
                {tCardActionLabel(t, actionLabelId, sourceInstance?.cumulated)}
              </Text>
            </View>
            <Button
              size="sm"
              color="base-primary"
              onPress={() =>
                resolvePlayerChoice(
                  {
                    id: choice.id,
                    type: choice.kind,
                    sourceInstanceId: choice.sourceInstanceId,
                    newActionEffects: [actionEffect as ActionEffect],
                  },
                  choice.type,
                )
              }
            >
              {t('triggerPile.resolve')}
            </Button>
          </View>
        );
      })}
    </View>
  );
}
