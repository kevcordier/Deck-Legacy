import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { getActivePassives } from '../cards/selection/getActivePassives';
import { Options, Trigger } from '../enums';
import { environment } from '../environment/environment';
import { canUseOptions } from '../state/canUseOptions';
import { removeFromDiscovery } from '../state/removeFromDiscovery';
import type { CardDef, GameState, Passive, ResolvedActionEffect, Sticker } from '../types';
import type { CardActionStrategy } from './CardActionStrategy';

export class PlayCardStrategy implements CardActionStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, payload: ResolvedActionEffect): GameState {
    const instanceIds = payload.instanceIds;
    if (!instanceIds || instanceIds.length === 0) return gameState;
    if (!canUseOptions(gameState, Options.PLAY_CARD)) return gameState;
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
        gs.triggerPile[environment.newId()] = effect;
      });
    }

    instanceIds.forEach(instanceId => {
      const passives: Passive[] = getActivePassives(gs, instanceId, this.cardDefs);
      passives.forEach(passive => {
        gs.boardEffects[instanceId] = [...(gs.boardEffects[instanceId] ?? []), passive];
      });

      removeFromDiscovery(gs, [instanceId]);
      gs.drawPile = gs.drawPile.filter(c => c !== instanceId);
      gs.destroyedPile = gs.destroyedPile.filter(c => c !== instanceId);
      gs.discardPile = gs.discardPile.filter(c => c !== instanceId);
      gs.board = [...new Set([...gs.board, instanceId])];
    });
    gs.resources = {};
    return gs;
  }
}
