import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, ResolvedAction } from '@engine/domain/types';

export class PlayCardStrategy implements CardActionStrategy {
  constructor(private readonly cardDefs: Record<number, CardDef>) {}

  applyEffect(gameState: GameState, payload: ResolvedAction): GameState {
    const instanceId = payload.instanceIds?.[0];
    if (instanceId === undefined) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;

    const triggerEffects = getInstancesTriggerEffects(
      [gs.instances[instanceId]],
      this.cardDefs,
      Trigger.ON_PLAY,
    );
    if (triggerEffects.length > 0) {
      triggerEffects.forEach(effect => {
        gs.triggerPile[crypto.randomUUID()] = effect;
      });
    }
    gs.discoveryPile = gs.discoveryPile.filter(c => c !== instanceId);
    gs.drawPile = gs.drawPile.filter(c => c !== instanceId);
    gs.destroyedPile = gs.destroyedPile.filter(c => c !== instanceId);
    gs.discardPile = gs.discardPile.filter(c => c !== instanceId);
    gs.board = [...gs.board, instanceId];
    return gs;
  }
}
