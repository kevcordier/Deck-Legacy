import { type ReactNode, createContext } from 'react';
import type { View } from 'react-native';

export type TutorialPlacement = 'center' | 'auto' | 'top' | 'bottom' | 'left' | 'right';

export type TutorialStep = {
  /** Id of a `TutorialTarget`; `null` for a centered step without target. */
  target: string | null;
  content: ReactNode;
  placement?: TutorialPlacement;
  /** Buttons displayed in the tooltip (defaults to skip + next). */
  buttons?: ('skip' | 'primary')[];
};

export interface TutorialContextProps {
  stepIndex: number;
  run: boolean;
  steps: TutorialStep[];
  nextStep: () => void;
  prevStep: () => void;
  skip: () => void;
  registerTarget: (id: string, ref: React.RefObject<View | null>) => void;
  unregisterTarget: (id: string, ref: React.RefObject<View | null>) => void;
  getTarget: (id: string) => React.RefObject<View | null> | undefined;
  /** Depth of the topmost open modal (0 when no modal is open). */
  topModalDepth: number;
  registerModal: (depth: number) => () => void;
}

export const TutorialContext = createContext<TutorialContextProps | undefined>(undefined);

/** Nesting depth of the current modal (0 = app root). */
export const ModalDepthContext = createContext(0);
