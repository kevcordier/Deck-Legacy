import type { GameEventStrategy } from './GameEventStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards, mergeResources } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type {
  CardDef,
  CardProducedEvent,
  GameEvent,
  GameState,
  Sticker,
} from '@engine/domain/types';

export class CardProducedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as CardProducedEvent;
    const withResources = {
      ...gameState,
      resources: mergeResources(gameState.resources, e.productions),
    };
    const instance = withResources.instances[e.cardInstanceId];
    const stateWithTriggers = instance
      ? (() => {
          const triggers = getInstancesTriggerEffects(
            [instance],
            this.cardDefs,
            this.stickerDefs,
            Trigger.ON_PRODUCE,
            withResources,
          );
          if (triggers.length === 0) return withResources;
          const gs = JSON.parse(JSON.stringify(withResources)) as GameState;
          triggers.forEach(({ effectDef, sourceInstanceId }) => {
            gs.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
          });
          return gs;
        })()
      : withResources;

    return {
      ...stateWithTriggers,
      ...discardCards(stateWithTriggers, [e.cardInstanceId], this.cardDefs, this.stickerDefs),
    };
  }
}
