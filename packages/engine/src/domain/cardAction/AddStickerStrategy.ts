import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { Trigger } from '../enums';
import { environment } from '../environment/environment';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class AddStickerStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef> = {},
    private readonly stickerDefs: Record<number, Sticker> = {},
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const { instanceIds, stickerIds } = payload;
    if (!instanceIds?.length || stickerIds === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    instanceIds.forEach(targetId => {
      const targetStateId = payload.stateId ?? gs.instances[targetId].stateId;
      stickerIds.forEach(stickerId => {
        gs.stickerStock[stickerId]--;
        if (!gs.instances[targetId].stickers[targetStateId]) {
          gs.instances[targetId].stickers[targetStateId] = [];
        }
        gs.instances[targetId].stickers[targetStateId].push(stickerId);
      });
    });
    if (stickerIds.length > 0) this.queueStickerTriggers(gs, instanceIds, stickerIds);

    return {
      ...gs,
      stickerStock: gs.stickerStock,
      instances: gs.instances,
    };
  }

  /** ON_STICKER_ADDED triggers of the cards that got the stickers (Irrigation, Mine Shaft). */
  private queueStickerTriggers(gs: GameState, instanceIds: number[], stickerIds: number[]): void {
    gs.lastAddedStickers = Object.fromEntries(instanceIds.map(id => [id, stickerIds]));
    getInstancesTriggerEffects(
      instanceIds.map(id => gs.instances[id]).filter(instance => this.cardDefs[instance.cardId]),
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_STICKER_ADDED,
      gs,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      gs.triggerPile[environment.newId()] = { effectDef, sourceInstanceId };
    });
  }
}
