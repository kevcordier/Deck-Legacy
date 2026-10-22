import { ActionEffectType, type ResourceType } from '../enums';
import type { GameState, RemovedResourceScope, ResolvedActionEffect, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

const DEFAULT_SCOPES: RemovedResourceScope[] = ['production', 'actionCost', 'upgradeCost'];

function extractResourceKeys(payload: ResolvedActionEffect): ResourceType[] {
  return Object.entries(payload.resources ?? {})
    .filter(([, value]) => (value ?? 0) > 0)
    .map(([key]) => key as ResourceType);
}

export class RemoveResourceOnCardStrategy implements CardActionStrategy {
  constructor(private readonly stickerDefs: Record<number, Sticker> = {}) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    if (payload.type !== ActionEffectType.REMOVE_RESOURCE_ON_CARD) return gameState;
    if (!payload.instanceIds?.length) return gameState;

    const removedKeys = extractResourceKeys(payload);
    if (removedKeys.length === 0) return gameState;

    const scopes = payload.resourceScopes?.length ? payload.resourceScopes : DEFAULT_SCOPES;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;

    payload.instanceIds.forEach(targetId => {
      const target = gs.instances[targetId];
      if (!target) return;
      const targetStateId = payload.stateId ?? target.stateId;

      target.removedResourcesByState ??= {};
      target.removedResourcesByState[targetStateId] ??= {};

      const byScope = target.removedResourcesByState[targetStateId];
      scopes.forEach(scope => {
        const current = byScope[scope] ?? [];
        // value (e.g. from valuePerElement) crosses out the resources several times
        byScope[scope] = [
          ...current,
          ...Array.from({ length: payload.value ?? 1 }, () => removedKeys).flat(),
        ];
      });
    });

    if (payload.stickerHere) this.addStickers(gs, payload.sourceInstanceId, removedKeys);
    return {
      ...gs,
      instances: gs.instances,
    };
  }

  /** `stickerHere` (Lord Edric): the source gets the sticker of each resource crossed out. */
  private addStickers(gs: GameState, sourceId: number, removedKeys: ResourceType[]): void {
    const source = gs.instances[sourceId];
    if (!source) return;
    for (const key of removedKeys) {
      const sticker = Object.values(this.stickerDefs).find(s => s.production === key);
      if (!sticker || (gs.stickerStock[sticker.id] ?? 0) <= 0) continue;
      gs.stickerStock[sticker.id] -= 1;
      source.stickers[source.stateId] = [...(source.stickers[source.stateId] ?? []), sticker.id];
    }
  }
}
