import { cardSelector } from '../cards/selection/cardSelector';
import { PassiveType } from '../enums';
import type { CardDef, GameState, Sticker } from '../types';
import { discardCards } from './discardCards';

/** REQUIRES_IN_PLAY: a card in play is discarded as soon as no card matches its selector. */
export const discardCardsMissingRequirement = (
  gameState: GameState,
  cardDefs: Record<number, CardDef>,
  stickerDefs: Record<number, Sticker>,
): GameState => {
  const missing = Object.entries(gameState.boardEffects)
    .filter(
      ([sourceId, passives]) =>
        gameState.board.includes(Number(sourceId)) &&
        passives.some(
          p =>
            p.type === PassiveType.REQUIRES_IN_PLAY &&
            cardSelector(p.cards ?? {}, Number(sourceId), gameState, cardDefs, stickerDefs)
              .length === 0,
        ),
    )
    .map(([sourceId]) => Number(sourceId));
  return missing.length > 0 ? discardCards(gameState, missing, cardDefs, stickerDefs) : gameState;
};
