import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { Trigger } from '../enums';
import { environment } from '../environment/environment';
import { loseGainedResources } from '../resources/loseGainedResources';
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
    const { gained, gameState: afterLoss } = loseGainedResources(gameState, e.productions);
    const withResources = {
      ...afterLoss,
      resources: mergeResources(gameState.resources, gained),
    };
    const instance = withResources.instances[e.cardInstanceId];
    getInstancesTriggerEffects(
      [instance],
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_PRODUCE,
      withResources,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      withResources.triggerPile[environment.newId()] = { effectDef, sourceInstanceId };
    });

    return {
      ...withResources,
      ...discardCards(withResources, [e.cardInstanceId], this.cardDefs, this.stickerDefs),
    };
  }
}
