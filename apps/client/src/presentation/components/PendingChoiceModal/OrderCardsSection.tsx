import type { ChoiceSectionProps } from './ChoiceSectionProps';
import { type CardOrder, moveOrderedCard } from './moveOrderedCard';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Text } from '@components/ui/Text/Text';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useState } from 'react';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Draggable, DropProvider, Droppable } from 'react-native-reanimated-dnd';

type Dragged = { id: number };

/**
 * Re-arrange the next undiscovered cards (Performance): drag them into their slots, or onto the
 * destroy slot on the right (one card at most).
 */
export function OrderCardsSection({
  choice,
  instances,
  t,
  resolvePlayerChoice,
}: Readonly<ChoiceSectionProps>) {
  const isDesktop = useIsDesktop();
  const cardIds = choice.choices.filter((id): id is number => typeof id === 'number');
  const [state, setState] = useState<CardOrder>({ order: cardIds, destroyed: null });
  const cardWidth = isDesktop ? 'w-40' : 'w-24';

  const move = (cardId: number, target: number | 'destroy') =>
    setState(current => moveOrderedCard(current, cardId, target));

  const renderCard = (id: number) => {
    const instance = instances[id];
    if (!instance) return null;
    return (
      <Draggable<Dragged> key={id} data={{ id }} draggableId={`card-${id}`}>
        <View className={cardWidth}>
          <GameCard instance={instance} />
        </View>
      </Draggable>
    );
  };

  const confirm = () =>
    resolvePlayerChoice(
      {
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        instanceIds: state.order,
        destroyedIds: state.destroyed === null ? [] : [state.destroyed],
      },
      choice.type,
    );

  return (
    <GestureHandlerRootView>
      <DropProvider>
        <View className="gap-3">
          <Text className="text-sm">{t('pendingChoice.order.hint')}</Text>
          <View className="flex-row gap-3">
            <View className="flex-1 flex-row flex-wrap gap-2">
              {state.order.map((id, index) => (
                <Droppable<Dragged>
                  key={`slot-${index.toString()}`}
                  droppableId={`slot-${index.toString()}`}
                  onDrop={data => move(data.id, index)}
                  activeStyle={{ opacity: 0.6 }}
                >
                  <View className="gap-1">
                    <Text className="text-ink/70 text-center text-xs">
                      {index === 0 ? t('pendingChoice.order.first') : `${index + 1}`}
                    </Text>
                    {renderCard(id)}
                  </View>
                </Droppable>
              ))}
            </View>
            <Droppable<Dragged>
              droppableId="destroy"
              onDrop={data => move(data.id, 'destroy')}
              activeStyle={{ opacity: 0.6 }}
            >
              <View
                className={`${cardWidth} border-danger min-h-36 items-center justify-center gap-1 rounded-2xl border-2 border-dashed p-1`}
              >
                <Text className="text-danger font-body-bold text-xs">
                  {t('pendingChoice.order.destroy')}
                </Text>
                {state.destroyed === null ? (
                  <Text className="text-center text-xs">{t('pendingChoice.order.dropHere')}</Text>
                ) : (
                  renderCard(state.destroyed)
                )}
              </View>
            </Droppable>
          </View>
          <Button onPress={confirm}>{t('pendingChoice.order.confirm')}</Button>
        </View>
      </DropProvider>
    </GestureHandlerRootView>
  );
}
