import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedAction } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const ids = payload.instanceIds ?? [];

    return ids.reduce((gs, instanceId) => {
      const cloned = JSON.parse(JSON.stringify(gs)) as GameState;
      const cardDef = this.cardDefs[gs.instances[instanceId].cardId];
      const triggerEffects = getInstancesTriggerEffects(
        [gs.instances[instanceId]],
        this.cardDefs,
        Trigger.ON_DISCOVER,
      );
      if (triggerEffects.length > 0) {
        triggerEffects.forEach(effect => {
          cloned.triggerPile[crypto.randomUUID()] = effect;
        });
      }
      if (!cardDef.parchmentCard) {
        cloned.lastAddedIds.push(instanceId);
      }
      if (cardDef.permanent) {
        cloned.permanents.push(instanceId);
        return { ...cloned, permanents: cloned.permanents };
      }
      return { ...cloned, ...discardCards(cloned, [instanceId]) };
    }, gameState);
  }
}
