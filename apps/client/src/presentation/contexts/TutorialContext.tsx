import type { GameState } from '@deck-legacy/engine/domain/types';
import { type ReactNode, createContext } from 'react';
import type { HostInstance } from 'react-native';

/** `top`: inside the top of the target (e.g. a modal filling the screen); `auto` otherwise. */
export type TutorialPlacement = 'center' | 'auto' | 'top';

export type TutorialStep = {
  /** Id of a `TutorialTarget`; `null` for a centered step without target. */
  target: string | null;
  content: ReactNode;
  placement?: TutorialPlacement;
  /** Buttons displayed in the tooltip (defaults to skip + next, skip only for `done` steps). */
  buttons?: ('skip' | 'primary')[];
  /** Card instance shown in large during the step: its parts are the targets. */
  zoomCardId?: number;
  /** The highlighted element stays usable (e.g. scrolling a list) without being an action. */
  interactive?: boolean;
  /** The step moves on once this target is rendered (e.g. `viewer-card-<id>`: the card was opened). */
  waitForTarget?: string;
  /** Shows the whole starting deck during the step. */
  showStartingDeck?: boolean;
  /** Closes the upgrade reveal when the step starts (its target is on the board). */
  closeUpgradeReveal?: boolean;
  /** Action the player must do: the step moves on once it returns true, other presses are blocked. */
  done?: (state: GameState) => boolean;
};

export interface TutorialContextProps {
  stepIndex: number;
  run: boolean;
  steps: TutorialStep[];
  nextStep: () => void;
  /** Moves on from a step whose target is not rendered (it is not kept in the back history). */
  skipStep: () => void;
  prevStep: () => void;
  /** The previous step shown can be displayed again (it is not an action already done). */
  canGoBack: boolean;
  skip: () => void;
  /** Ends the tutorial, keeping the game played so far or starting a new one. */
  finish: (keepGame: boolean) => void;
  registerTarget: (id: string, ref: React.RefObject<HostInstance | null>) => void;
  unregisterTarget: (id: string, ref: React.RefObject<HostInstance | null>) => void;
  getTarget: (id: string) => React.RefObject<HostInstance | null> | undefined;
  /** Depth of the topmost open modal (0 when no modal is open). */
  topModalDepth: number;
  registerModal: (depth: number) => () => void;
  /** The board registers how to scroll by `dy` pixels, to bring an off-screen target into view. */
  registerScroller: (scrollBy: (dy: number) => void) => () => void;
  scrollBy: (dy: number) => void;
}

export const TutorialContext = createContext<TutorialContextProps | undefined>(undefined);
