import { ActionEffectType, TargetScope } from '../enums';
import type { ActionEffect, CardAction, CardDef, GameState, ResolvedActionEffect } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';
import { getDefeatAction } from './getDefeatAction';

// Effect ids start at 1: 0 cannot collide with the enemy's own effects.
const DESTROY_SELF: ActionEffect = {
  id: 0,
  type: ActionEffectType.DESTROY_CARD,
  cards: { scope: [TargetScope.SELF] },
};

export class DefeatCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    for (const instanceId of payload.instanceIds ?? []) {
      const action = getDefeatAction(gs, instanceId, this.cardDefs);
      if (!action) continue;
      // Defeated for free, but an enemy whose defeat destroys it is still destroyed. That cost
      // becomes the first effect: a cost is paid from cards in play, the enemy may be discarded.
      const destroysItself = action.cost?.destroy?.scope?.includes(TargetScope.SELF) ?? false;
      const { cost: _cost, ...rest } = action;
      const effectDef: CardAction = destroysItself
        ? { ...rest, actionEffects: [DESTROY_SELF, ...rest.actionEffects] }
        : rest;
      gs.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId: instanceId };
    }
    return gs;
  }
}
