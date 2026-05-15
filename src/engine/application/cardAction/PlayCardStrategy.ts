import type { CardActionStrategy } from '@engine/application/cardAction/CardActionStrategy';
import { getActiveState, getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { Trigger } from '@engine/domain/enums';
import type {
  CardDef,
  GameState,
  Passive,
  ResolvedActionEffect,
  Sticker,
} from '@engine/domain/types';

export class PlayCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceIds = payload.instanceIds;
    if (!instanceIds || instanceIds.length === 0) return gameState;
    const gs = JSON.parse(JSON.stringify(gameState)) as GameState;
    gs.lastDrawnCards = instanceIds;
    const triggerEffects = getInstancesTriggerEffects(
      instanceIds.map(cardId => gs.instances[cardId]),
      this.cardDefs,
      this.stickerDefs,
      Trigger.ON_PLAY,
      gs,
    );
    if (triggerEffects.length > 0) {
      triggerEffects.forEach(effect => {
        gs.triggerPile[crypto.randomUUID()] = effect;
      });
    }

    instanceIds.forEach(instanceId => {
      const passives: Passive[] =
        getActiveState(gs.instances[instanceId], this.cardDefs).passives ?? [];
      passives.forEach(passive => {
        gs.boardEffects[instanceId] = [...(gs.boardEffects[instanceId] ?? []), passive];
      });

      gs.discoveryPile = gs.discoveryPile.filter(c => c !== instanceId);
      gs.drawPile = gs.drawPile.filter(c => c !== instanceId);
      gs.destroyedPile = gs.destroyedPile.filter(c => c !== instanceId);
      gs.discardPile = gs.discardPile.filter(c => c !== instanceId);
      gs.board = [...new Set([...gs.board, instanceId])];
    });
    return gs;
  }
}
