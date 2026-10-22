import { cardSelector } from '../cards/selection/cardSelector';
import { PassiveType } from '../enums';
import type { CardDef, GameState, Sticker } from '../types';
import { discardCards } from './discardCards';

/**
 * An upgraded card that is not permanent is discarded, or put on top of the deck when an
 * UPGRADED_ON_TOP_OF_DECK passive in play selects it (Architect), at its bottom for
 * UPGRADED_TO_BOTTOM_OF_DECK (Crane).
 */
export function leaveUpgradedCard(
  gameState: GameState,
  instanceId: number,
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState {
  const applies = (type: PassiveType) =>
    Object.entries(gameState.boardEffects).some(([sourceId, passives]) =>
      passives.some(
        passive =>
          passive.type === type &&
          cardSelector(
            passive.cards ?? {},
            Number(sourceId),
            gameState,
            cardDefs,
            stickerDefs,
          ).includes(instanceId),
      ),
    );
  const onTop = applies(PassiveType.UPGRADED_ON_TOP_OF_DECK);
  const atBottom = !onTop && applies(PassiveType.UPGRADED_TO_BOTTOM_OF_DECK);
  const discarded = discardCards(gameState, [instanceId], cardDefs, stickerDefs);
  if (!onTop && !atBottom) return discarded;
  const drawPile = discarded.drawPile.filter(id => id !== instanceId);
  return {
    ...discarded,
    discardPile: discarded.discardPile.filter(id => id !== instanceId),
    drawPile: onTop ? [instanceId, ...drawPile] : [...drawPile, instanceId],
  };
}
