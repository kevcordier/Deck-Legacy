import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: string;
      sourceInstanceId: number;
      instanceId: number;
      cardDefs: Record<number, CardDef>;
    },
  ): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState; // Deep clone to avoid mutating original state

    const cardDef = payload.cardDefs[gameState.instances[payload.instanceId].cardId];
    const triggerEffects = getInstancesTriggerEffects(
      [gameState.instances[payload.instanceId]],
      payload.cardDefs,
      Trigger.ON_DISCOVER,
    );
    if (triggerEffects.length > 0) {
      triggerEffects.forEach(effect => {
        gs.triggerPile[crypto.randomUUID()] = effect;
      });
    }
    if (cardDef.permanent) {
      gs.permanents.push(payload.instanceId);

      return {
        ...gs,
        permanents: gs.permanents,
      };
    }
    return { ...gs, ...discardCards(gs, [payload.instanceId]) };
  }
}
