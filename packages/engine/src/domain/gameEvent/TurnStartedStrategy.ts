import { getInstancesTriggerEffects } from '../cards/getInstancesTriggerEffects';
import { Phase, Trigger } from '../enums';
import { environment } from '../environment/environment';
import { drawCards } from '../state/drawCards';
import type {
  CardDef,
  GameEvent,
  GameState,
  Sticker,
  TriggerEntry,
  TurnStartedEvent,
} from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

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
        acc[environment.newId()] = { effectDef, sourceInstanceId };
        return acc;
      },
      {} as Record<string, TriggerEntry>,
    );

    // Losses (Too Much Mead) and "once per turn" uses of a turn end with it.
    const {
      resourcesToLose: _lost,
      turnUsedActions: _used,
      ...withoutLoss
    } = { ...gameState, ...afterDraw };
    return {
      ...withoutLoss,
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
