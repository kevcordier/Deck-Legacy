import { getActivePassives } from '../cards/selection/getActivePassives';
import type { CardDef, GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

/** Places the source (an equipment) under the chosen card in play: its passives now apply. */
export class EquipStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const holder = payload.instanceIds?.[0];
    if (holder === undefined) return gameState;
    const equipped = {
      ...gameState,
      equipped: { ...gameState.equipped, [payload.sourceInstanceId]: holder },
    };
    const passives = getActivePassives(equipped, payload.sourceInstanceId, this.cardDefs);
    if (passives.length === 0) return equipped;
    return {
      ...equipped,
      boardEffects: { ...equipped.boardEffects, [payload.sourceInstanceId]: passives },
    };
  }
}
