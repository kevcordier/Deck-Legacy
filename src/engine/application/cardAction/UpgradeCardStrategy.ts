import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getActiveState, getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { discardCards } from '@engine/application/gameStateHelper';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class UpgradeCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined) return gameState;

    const instance = gameState.instances[instanceId];
    const currentState = instance ? getActiveState(instance, this.cardDefs) : undefined;
    const targetStateId = payload.stateId ?? currentState?.upgrade?.[0]?.upgradeTo;

    if (targetStateId === undefined) return gameState;

    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const instanceBeforeStateChange = gs.instances[instanceId];
    getInstancesTriggerEffects(
      [instanceBeforeStateChange],
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_UPGRADE,
      gs,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      gs.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
    });
    gs.instances[instanceId].stateId = targetStateId;
    // if new state is permanent add it to permanents pile
    if (getActiveState(gs.instances[instanceId], this.cardDefs)?.permanent) {
      return {
        ...gs,
        permanents: [...new Set([...gs.permanents, instanceId])],
        board: gs.board.filter(id => id !== instanceId),
      };
    }

    return {
      ...gs,
      ...discardCards(gs, [instanceId], this.cardDefs, this.stickerDefs),
      permanents: gs.permanents.filter(id => id !== instanceId),
    };
  }
}
