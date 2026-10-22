import { getActiveState } from '../cards/selection/getActiveState';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class AddGloryStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.value === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const instance = gs.instances[instanceId];
    const cs = getActiveState(instance, this.cardDefs);
    const emptyValues =
      (cs?.glory?.emptyValues ?? 0) +
      (instance.stickers[instance.stateId]?.reduce(
        (sum, stickerId) => sum + (this.stickerDefs[stickerId]?.additionalGlory ?? 0),
        0,
      ) ?? 0);

    if (emptyValues && emptyValues <= instance.glories.length) return gameState;

    instance.glories.push(payload.value);
    if (payload.names) instance.writtenNames = [...(instance.writtenNames ?? []), ...payload.names];
    return { ...gs };
  }
}
