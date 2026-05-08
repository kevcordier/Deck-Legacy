import type { GameEventStrategy } from './GameEventStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { Trigger } from '@engine/domain/enums';
import type { CardDef, GameState, Sticker } from '@engine/domain/types';
import { Phase } from '@engine/domain/types/Phase';

export class RoundEndedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState): GameState {
    const allRoundInstances = [...gameState.permanents, ...gameState.board].map(
      id => gameState.instances[id],
    );
    getInstancesTriggerEffects(
      allRoundInstances,
      this.cardDefs,
      this.stickerDefs,
      Trigger.END_OF_ROUND,
      gameState,
    ).forEach(({ effectDef, sourceInstanceId }) => {
      gameState.triggerPile[crypto.randomUUID()] = { effectDef, sourceInstanceId };
    });

    return {
      ...gameState,
      discardPile: [...gameState.board, ...gameState.discardPile],
      board: [],
      phase: Phase.ROUND_END,
    };
  }
}
