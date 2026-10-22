import type { ResolvedActionEffect } from './Card';
import type { ResolvedCost } from './Cost';
import type { GameParameters, GameState } from './GameState';
import type { PendingChoice } from './PendingChoice';

/** Development-only shortcuts, applied as unlimited card actions. */
export type CheatCommand =
  | { op: 'addResources'; resources: Record<string, number> }
  | { op: 'drawCard'; instanceIds: number[] }
  | { op: 'discardCard'; instanceIds: number[] }
  | { op: 'destroyCard'; instanceIds: number[] }
  | { op: 'discoverCard'; instanceIds: number[] }
  | { op: 'chooseState'; instanceId: number; stateId: number }
  | { op: 'addSticker'; instanceId: number; stickerId: number };

/** A player intent, executed by `GameSession`. */
export type GameCommand =
  | { type: 'startRound' }
  | { type: 'endRound' }
  | { type: 'startTurn' }
  | { type: 'progress' }
  | { type: 'endTurn' }
  | { type: 'chooseState'; instanceId: number; stateId: number }
  | { type: 'resolveProduction'; instanceId: number; choiceIndex: number }
  | {
      type: 'resolveAction';
      instanceId: number;
      actionId: string;
      triggerId?: string;
      /** Amount paid for an `'any'` resource cost (e.g. goods deposited on Export). */
      amount?: number;
    }
  | {
      type: 'resolveUpgrade';
      instanceId: number;
      upgradeTo: number;
      /** Which upgrade of the state, when several lead to `upgradeTo` (cost choice). */
      upgradeIndex?: number;
    }
  | { type: 'resolvePlayerChoice'; choice: ResolvedActionEffect; choiceType: string }
  | { type: 'resolvePayCost'; resolved: ResolvedCost }
  | { type: 'skipTrigger'; triggerId: string }
  | { type: 'skipChoice' }
  | { type: 'dismissParchment' }
  | { type: 'rewind' }
  | { type: 'continueCampaign' }
  | { type: 'selectExpansion'; name: string }
  | { type: 'selectPurgeCard'; instanceId: number }
  | { type: 'selectPurgePermanent'; instanceId: number }
  | { type: 'finalizePurge' }
  | { type: 'setCardName'; instanceId: number; name: string }
  | { type: 'cheat'; cheat: CheatCommand };

export type GameCommandType = GameCommand['type'];

/** Translatable rule error returned by a command (the pending action is cancelled). */
export type CommandError = {
  code: 'ACTION_CANCELLED' | 'COST_RESOLUTION' | 'ENGINE_ERROR';
  /** i18n key (or raw message for unexpected errors). */
  message: string;
};

/** Everything the UI needs to render a game, recomputed after each command. */
export type GameView = {
  id: string;
  tutorial: boolean;
  gameState: GameState;
  pendingChoices: PendingChoice[] | null;
  score: number;
  parameters: GameParameters;
  eventCount: number;
  canRewind: boolean;
  cardNames: Record<string, string>;
  purge: {
    /** Unselected cards of the current batch; only `candidates` can be picked. */
    batch: number[];
    candidates: number[];
    permanentCandidates: number[];
    selectedIds: number[];
    canSelectPermanent: boolean;
    isSelectionComplete: boolean;
  };
};

/**
 * State of a game after its first `seq` events, kept by the server so that a sync starts from it
 * instead of running the whole log again (EDR-052).
 */
export type GameCheckpoint = {
  seq: number;
  state: GameState;
};
