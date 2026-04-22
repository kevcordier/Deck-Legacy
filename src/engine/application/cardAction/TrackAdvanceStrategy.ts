import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import type { CardDef, GameState, ResolvedAction } from '@engine/domain/types';

export class TrackAdvanceStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined || payload.stepId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    const instance = gs.instances[instanceId];
    const cardDef = this.cardDefs[instance.cardId];
    const state = cardDef?.states.find(s => s.id === instance.stateId);
    const track = state?.track;
    if (!track) return gs;
    const step = track.steps.find(s => s.id === payload.stepId);
    if (!step) return gs;
    instance.trackProgress.push(payload.stepId);
    return {
      ...gs,
      instances: { ...gs.instances, [instanceId]: instance },
    };
  }
}
