import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedActionEffect, Sticker } from '@engine/domain/types';

export class TrackAdvanceStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

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
    const hadCompletedTrack = track.steps.every(step => instance.trackProgress.includes(step.id));
    instance.trackProgress.push(...payload.stepIds);
    const hasCompletedTrack = track.steps.every(step => instance.trackProgress.includes(step.id));

    if (!hadCompletedTrack && hasCompletedTrack) {
      getInstancesTriggerEffects(
        [instance],
        this.cardDefs,
        this.stickerDefs,
        Trigger.ON_TRACK_END,
        gs,
      ).forEach(({ effectDef, sourceInstanceId }) => {
        gs.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
      });
    }

    return {
      ...gs,
      instances: { ...gs.instances, [instanceId]: instance },
    };
  }
}
