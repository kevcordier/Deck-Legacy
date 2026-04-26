import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { CardDef, GameState, ResolvedActionEffect } from '@engine/domain/types';

export class TrackAdvanceStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.stepIds === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const instance = gs.instances[instanceId];
    const cardDef = this.cardDefs[instance.cardId];
    const state = cardDef?.states.find(s => s.id === instance.stateId);
    const track = state?.track;
    if (!track) return gs;
    if (payload.stepIds.some(s => !track.steps.map(step => step.id).includes(s))) return gs;
    instance.trackProgress.push(...payload.stepIds);
    return {
      ...gs,
      instances: { ...gs.instances, [instanceId]: instance },
    };
  }
}
