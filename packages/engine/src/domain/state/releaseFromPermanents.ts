import { PassiveType } from '../enums';
import type { GameState } from '../types';

/**
 * A card that leaves (discarded, destroyed) is no longer blocked by a permanent (Quarantine), so
 * the permanent can block another one (EDR-059). Mutates the given copy of the state.
 */
export function releaseFromPermanents(gameState: GameState, cardIds: number[]): void {
  for (const permanentId of gameState.permanents) {
    const effects = gameState.boardEffects[permanentId];
    if (!effects) continue;
    gameState.boardEffects[permanentId] = effects.map(effect =>
      effect.type === PassiveType.BLOCK && effect.cards?.ids
        ? {
            ...effect,
            cards: { ...effect.cards, ids: effect.cards.ids.filter(id => !cardIds.includes(id)) },
          }
        : effect,
    );
  }
}
