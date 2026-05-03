import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class DiscardCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const instanceIds = payload.instanceIds ?? [];

    gs.lastDiscardedCards = instanceIds;
    getInstancesTriggerEffects(
      instanceIds.map(id => gs.instances[id]).filter(Boolean),
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_DISCARD,
      gs,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      gs.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
    });

    return { ...gs, ...discardCards(gs, instanceIds) };
  }
}
