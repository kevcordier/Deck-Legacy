import type { GameEventStrategy } from './GameEventStrategy';
import { getInstancesTriggerEffects } from '@engine/application/cardHelpers';
import { drawCards } from '@engine/application/gameStateHelper';
import { Phase, Trigger } from '@engine/domain/enums';
import type {
  CardDef,
  GameEvent,
  GameState,
  Sticker,
  TriggerEntry,
  TurnStartedEvent,
} from '@engine/domain/types';

export class TurnStartedStrategy implements GameEventStrategy {
  constructor(
    private readonly cardDefs: Record<number, CardDef>,
    private readonly stickerDefs: Record<number, Sticker>,
  ) {}

  apply(gameState: GameState, event: GameEvent): GameState {
    const e = event as TurnStartedEvent;

    gameState.lastAddedCards = [];
    const afterDraw = drawCards(gameState, e.turnCards, this.cardDefs, this.stickerDefs);
    const allTurnInstances = [...new Set([...afterDraw.permanents, ...afterDraw.board])]
      .map(id => afterDraw.instances[id])
      .filter(Boolean);
    const startTurnTriggers = getInstancesTriggerEffects(
      allTurnInstances,
      this.cardDefs,
      this.stickerDefs,
      Trigger.START_OF_TURN,
      afterDraw,
    ).reduce(
      (acc, { effectDef, sourceInstanceId }) => {
        acc[crypto.randomUUID()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    return {
      ...gameState,
      ...afterDraw,
      turn: e.turn,
      resources: {},
      triggerPile: {
        ...afterDraw.triggerPile,
        ...startTurnTriggers,
      },
      phase: Phase.PLAYING,
    };
  }
}
