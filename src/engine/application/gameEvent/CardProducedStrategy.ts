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
    getInstancesTriggerEffects(
      [instance],
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_PRODUCE,
      withResources,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      withResources.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
    });

    return {
      ...withResources,
      ...discardCards(withResources, [e.cardInstanceId], this.cardDefs, this.stickerDefs),
    };
  }
}
