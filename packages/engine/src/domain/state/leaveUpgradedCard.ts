import { cardSelector } from '../cards/selection/cardSelector';
import { PassiveType } from '../enums';
import type { CardDef, GameState, Sticker } from '../types';
import { discardCards } from './discardCards';

/**
 * An upgraded card that is not permanent is discarded, or put on top of the deck when an
 * UPGRADED_ON_TOP_OF_DECK passive in play selects it (Architect).
 */
export function leaveUpgradedCard(
  gameState: GameState,
  instanceId: number,
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState {
  const onTop = Object.entries(gameState.boardEffects).some(([sourceId, passives]) =>
    passives.some(
      passive =>
        passive.type === PassiveType.UPGRADED_ON_TOP_OF_DECK &&
        cardSelector(
          passive.cards ?? {},
          Number(sourceId),
          gameState,
          cardDefs,
          stickerDefs,
        ).includes(instanceId),
    ),
  );
  const discarded = discardCards(gameState, [instanceId], cardDefs, stickerDefs);
  if (!onTop) return discarded;
  return {
    ...discarded,
    discardPile: discarded.discardPile.filter(id => id !== instanceId),
    drawPile: [instanceId, ...discarded.drawPile],
  };
}
