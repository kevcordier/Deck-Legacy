import { Phase } from '../enums';
import type { GameEvent, GameState } from '../types';
import type { GameEventStrategy } from './GameEventStrategy';

/** A parchment discovered by an effect is resolved: the game goes back to its phase. */
export class ParchmentResolvedStrategy implements GameEventStrategy {
  apply(gameState: GameState, _event: GameEvent): GameState {
    const { onGoingParchment: _done, parchmentResumePhase, ...rest } = gameState;
    return { ...rest, phase: parchmentResumePhase ?? Phase.PLAYING };
  }
}
