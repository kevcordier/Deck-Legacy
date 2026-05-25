import { type ChoiceSectionProps } from './shared';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { getPickNumbers } from '@engine/application/effectResolver';
import { useTranslation } from 'react-i18next';

export function ChooseStateSection(props: Readonly<ChoiceSectionProps>) {
  const { choice, instances, defs, resolvePlayerChoice } = props;
  const { t } = useTranslation();
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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 p-2">
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
          <div
            key={stateId}
            className="flex flex-col items-stretch gap-2 p-2 @container min-w-60 max-w-80"
          >
            {hasCost && (
              <div className="inline-flex m-auto">
                {!!upgrade?.cost.resources?.length && (
                  <ResourceChoice
                    options={upgrade.cost.resources}
                    disabled
                    onSelect={() => undefined}
                    className="w-full!"
                    pillClassName="size-5"
                  />
                )}
                {!!discardLabel && <p>{discardLabel}</p>}
                {!!destroyLabel && <p>{destroyLabel}</p>}
              </div>
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
              className={`relative`}
            />
            <Button
              onClick={() =>
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
          </div>
        );
      })}
    </div>
  );
}
