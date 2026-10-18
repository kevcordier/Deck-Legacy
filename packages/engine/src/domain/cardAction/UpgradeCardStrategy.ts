import { getActiveState, getInstancesTriggerEffects, isPermanent } from '../cardHelpers';
import { Trigger } from '../enums';
import { discardCards, syncInstancePassivesInBoardEffects } from '../gameStateHelper';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

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
    const syncedState = syncInstancePassivesInBoardEffects(gs, instanceId, this.cardDefs);
    // if new state is permanent add it to permanents pile
    if (isPermanent(getActiveState(syncedState.instances[instanceId], this.cardDefs))) {
      return {
        ...syncedState,
        permanents: [...new Set([...syncedState.permanents, instanceId])],
        board: syncedState.board.filter(id => id !== instanceId),
      };
    }

    return {
      ...syncedState,
      ...discardCards(syncedState, [instanceId], this.cardDefs, this.stickerDefs),
      permanents: syncedState.permanents.filter(id => id !== instanceId),
    };
  }
}
