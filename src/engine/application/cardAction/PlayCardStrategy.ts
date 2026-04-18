import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { type ActionType, Trigger } from '@engine/domain/enums';
import type { CardDef, GameState } from '@engine/domain/types';

export class PlayCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  applyEffect(
    gameState: GameState,
    payload: {
      id: string;
      type: ActionType;
      sourceInstanceId: number;
      instanceId: number;
    },
  ): GameState {
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;

    const triggerEffects = getInstancesTriggerEffects(
      [gs.instances[payload.instanceId]],
      this.cardDefs,
      Trigger.ON_PLAY,
    );
    if (triggerEffects.length > 0) {
      triggerEffects.forEach(effect => {
        gs.triggerPile[crypto.randomUUID()] = effect;
      });
    }
    gs.discoveryPile = gs.discoveryPile.filter(c => c !== payload.instanceId);
    gs.drawPile = gs.drawPile.filter(c => c !== payload.instanceId);
    gs.destroyedPile = gs.destroyedPile.filter(c => c !== payload.instanceId);
    gs.discardPile = gs.discardPile.filter(c => c !== payload.instanceId);
    gs.board = [...gs.board, payload.instanceId];
    return gs;
  }
}
