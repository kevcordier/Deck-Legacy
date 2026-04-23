import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedAction } from '@engine/domain/types';

export class DiscoverCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const ids = payload.instanceIds ?? [];
    const triggerEffects = getInstancesTriggerEffects(
      ids.map(cardId => gs.instances[cardId]),
      this.cardDefs,
      Trigger.ON_DISCOVER,
      gs,
    );
    if (triggerEffects.length > 0) {
      triggerEffects.forEach(effect => {
        gs.triggerPile[crypto.randomUUID()] = effect;
      });
    }
    return ids.reduce((cloned, instanceId) => {
      const cardDef = this.cardDefs[gs.instances[instanceId].cardId];

      if (!cardDef.parchmentCard) {
        cloned.lastAddedIds.push(instanceId);
      }
      if (cardDef.permanent) {
        cloned.permanents.push(instanceId);
        return { ...cloned, permanents: cloned.permanents };
      }
      return { ...cloned, ...discardCards(cloned, [instanceId]) };
    }, gs);
  }
}
