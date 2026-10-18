import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { Trigger } from '../enums';
import { mergeResources } from '../resources/mergeResources';
import { discardCards } from '../state/discardCards';
import type { CardDef, CardProducedEvent, GameEvent, GameState, Sticker } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

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
