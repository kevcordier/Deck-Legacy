import { PassiveType } from '../enums';
import type { GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Releases the chosen cards blocked by this card: they are in play again (Haunted Souls). */
export class UnblockCardStrategy implements CardActionStrategy {
  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const ids = payload.instanceIds ?? [];
    const effects = gameState.boardEffects[payload.sourceInstanceId];
    if (ids.length === 0 || !effects) return gameState;
    return {
      ...gameState,
      boardEffects: {
        ...gameState.boardEffects,
        [payload.sourceInstanceId]: effects.map(effect =>
          effect.type === PassiveType.BLOCK && effect.cards?.ids
            ? {
                ...effect,
                cards: { ...effect.cards, ids: effect.cards.ids.filter(id => !ids.includes(id)) },
              }
            : effect,
        ),
      },
    };
  }
}
