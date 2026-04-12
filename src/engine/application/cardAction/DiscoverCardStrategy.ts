import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import { Trigger, type ActionType } from '@engine/domain/enums';
import type { CardDef, GameState } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(private cardDefs: Record<number, CardDef>) {}

  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionType;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;

    const cardDef = this.cardDefs[gameState.instances[payload.instanceId].cardId];
    const triggerEffects = getInstancesTriggerEffects(
      [gameState.instances[payload.instanceId]],
      this.cardDefs,
      Trigger.ON_DISCOVER,
    );
    if (triggerEffects.length > 0) {
      triggerEffects.forEach(effect => {
        gs.triggerPile[crypto.randomUUID()] = effect;
      });
    }
    if (!cardDef.parchmentCard) {
      gs.lastAddedIds.push(payload.instanceId);
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
