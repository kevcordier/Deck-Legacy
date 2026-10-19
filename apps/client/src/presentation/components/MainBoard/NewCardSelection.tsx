import { CardViewerModal } from '@components/CardViewerModal/CardViewerModal';
import { GameCard } from '@components/GameCard/GameCard';
import { MiniGameCard } from '@components/MiniGameCard/MiniGameCard';
import { Button } from '@components/ui/Button/Button';
import type { CardInstance } from '@deck-legacy/engine/domain/types';
import { useGame } from '@hooks/useGame';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { tCardName } from '@i18n/card/tCardName';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

/** Cards just discovered, with the state buttons of those whose state the player chooses. */
export function NewCardSelection({
  cardIds,
  chooseState,
}: {
  readonly cardIds: number[];
  readonly chooseState: (id: number, stateId: number) => void;
}) {
  const { gameState, defs } = useGame();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const [viewerCardId, setViewerCardId] = useState<number | null>(null);
  // Fixed width on desktop: the modal is auto-sized, so a percentage would resolve against its own
  // content and shrink the card. Two mini cards on phones, where a tap opens the card in large.
  const itemClass = isDesktop ? 'w-64' : 'w-[48%] max-w-56';
  const card = (inst: CardInstance) =>
    isDesktop ? (
      <GameCard instance={inst} />
    ) : (
      <MiniGameCard instance={inst} onPress={() => setViewerCardId(inst.id)} />
    );

  return (
    <View className="w-full flex-row flex-wrap items-end justify-center gap-2 lg:gap-4">
      {cardIds.map((id: number) => {
        const inst = gameState.instances[id];
        if (!inst) return null;
        const chooseStateIds = defs[inst.cardId].chooseState ?? [];

        if (chooseStateIds.length > 0) {
          return (
            <View key={id} className={`min-w-0 gap-1 ${itemClass}`}>
              <View className="mb-2 w-full gap-2">
                {chooseStateIds.map(stateId => {
                  const stateDef = defs[inst.cardId].states.find(s => s.id === stateId);
                  const isCurrent = inst.stateId === stateId;
                  return (
                    <Button
                      key={`${id}-${stateId}`}
                      color={isCurrent ? 'base-primary' : 'danger'}
                      size="sm"
                      onPress={() => chooseState(inst.id, stateId)}
                    >
                      {stateDef?.name
                        ? tCardName(t, stateDef.name)
                        : `${t('roundpreview.switchState')} ${stateId}`}
                    </Button>
                  );
                })}
              </View>
              {card(inst)}
            </View>
          );
        }

        return (
          <View key={id} className={itemClass}>
            {card(inst)}
          </View>
        );
      })}
      {viewerCardId !== null && (
        <CardViewerModal
          cardIds={cardIds}
          initialId={viewerCardId}
          onClose={() => setViewerCardId(null)}
        />
      )}
    </View>
  );
}
