import type { ChoiceSectionProps } from './ChoiceSectionProps';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { Text } from '@components/ui/Text/Text';
import { getPickNumbers } from '@deck-legacy/engine/domain/effects/getPickNumbers';
import { fixResources } from '@deck-legacy/engine/domain/resources/fixResources';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export function ChooseStateSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, resolvePlayerChoice } = props;
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const targetId = choice.targetInstanceId ?? choice.sourceInstanceId;
  const targetInst = instances[targetId];
  const cardDef = targetInst ? defs[targetInst.cardId] : undefined;
  const currentState = cardDef?.states.find(candidate => candidate.id === targetInst?.stateId);

  const cardText = ({ name, tags }: { name?: string; tags?: string[] }) => {
    if (name) return t(`names.${name}`, { ns: 'cards' });
    if (tags && tags.length > 0) return t(`tags.${tags[0]}`, { ns: 'cards' });
    return t('card.cost.cards');
  };

  return (
    // Same fixed card width as ChooseCardSection.
    <View className="flex-row flex-wrap justify-center gap-2 p-2 lg:gap-4">
      {choice.choices.map(stateId => {
        if (typeof stateId !== 'number') return null;
        const state = cardDef?.states.find(candidate => candidate.id === stateId);
        const upgrade = currentState?.upgrade?.find(candidate => candidate.upgradeTo === stateId);
        const discardLabel = upgrade?.cost.discard
          ?.map(discardCost => {
            return t('card.cost.discard', {
              count: getPickNumbers(discardCost).pickMin,
              type: cardText({ name: discardCost.name, tags: discardCost.tags }),
            });
          })
          .join(', ');
        const destroyLabel = upgrade?.cost.destroy
          ? t('card.cost.destroy', {
              count: getPickNumbers(upgrade.cost.destroy).pickMin,
              type: cardText({
                name: upgrade.cost.destroy.name,
                tags: upgrade.cost.destroy.tags,
              }),
            })
          : '';
        const hasCost =
          (upgrade?.cost.resources?.length ?? 0) > 0 ||
          (discardLabel?.length ?? 0) > 0 ||
          destroyLabel.length > 0;
        if (!cardDef || !state) return null;
        return (
          <View
            key={stateId}
            className={`${isDesktop ? 'w-72' : 'w-[48%]'} max-w-full items-stretch gap-2 p-2`}
          >
            {hasCost && (
              <View className="flex-row flex-wrap items-center justify-center gap-1">
                {!!upgrade?.cost.resources?.length && (
                  <ResourceChoice
                    options={upgrade.cost.resources.map(r => fixResources(r))}
                    disabled
                    onSelect={() => undefined}
                    pillClassName="size-5"
                  />
                )}
                {!!discardLabel && <Text>{discardLabel}</Text>}
                {!!destroyLabel && <Text>{destroyLabel}</Text>}
              </View>
            )}
            <GameCard
              instance={{
                id: targetId,
                cardId: cardDef.id,
                stateId: state.id,
                stickers: {},
                trackProgress: [],
                cumulated: 0,
                usedActionIds: [],
                glories: [],
              }}
              hideStatePreview
            />
            <Button
              onPress={() =>
                resolvePlayerChoice(
                  {
                    id: choice.id,
                    type: choice.kind,
                    sourceInstanceId: choice.sourceInstanceId,
                    stateId,
                  },
                  choice.type,
                )
              }
            >
              {t('pendingChoice.select')}
            </Button>
          </View>
        );
      })}
    </View>
  );
}
