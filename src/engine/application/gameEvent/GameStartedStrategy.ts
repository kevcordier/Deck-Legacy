import type { GameEventStrategy } from './GameEventStrategy';
import { createInstance } from '@engine/application/factory';
import { Phase } from '@engine/domain/enums';
import type { CardDef, GameEvent, GameStartedEvent, GameState } from '@engine/domain/types';

export class GameStartedStrategy implements GameEventStrategy {
  constructor(private readonly defs: Record<number, CardDef>) {}
  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as GameStartedEvent;
    const allInstances = e.deck.map(entry =>
      createInstance(entry.id, entry.cardId, this.defs[entry.cardId].states[0].id, this.defs),
    );
    return {
      ...gameState,
      instances: Object.fromEntries(
        [...e.initialDeck, ...e.discoveryPile].map(inst => [inst, allInstances[inst - 1]]),
      ),
      drawPile: e.initialDeck,
      discardPile: [],
      board: [],
      permanents: [],
      destroyedPile: [],
      triggerPile: {},
      boardEffects: {},
      resources: {},
      stickerStock: e.stickerStock,
      discoveryPile: e.discoveryPile,
      parameterOverrides: {},
      campaignScores: {},
      activeExpansion: undefined,
      purgedCards: [],
      purgedGlory: [],
      purgeState: undefined,
      round: 0,
      turn: 0,
      isLastRound: false,
      phase: Phase.PRE_GAME,
    };
  }
}
