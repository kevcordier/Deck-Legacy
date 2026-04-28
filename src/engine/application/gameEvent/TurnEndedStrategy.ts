import type { GameEventStrategy } from './GameEventStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, Sticker } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class TurnEndedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}
  apply(gameState: GameState): GameState {
    getInstancesTriggerEffects(
      gameState.board.map(cardId => gameState.instances[cardId]),
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_TURN,
      gameState,
    ).forEach(effectDef => {
      gameState.triggerPile[crypto.randomUUID()] = effectDef;
    });

    return { ...gameState, phase: Phase.POSTTURN };
  }
}
