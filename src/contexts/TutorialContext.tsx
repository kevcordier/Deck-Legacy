import { createContext } from 'react';

export interface TutorialContextProps {
  stepIndex: number;
  run: boolean;
  nextStep: () => void;
  prevStep: () => void;
}

export const TutorialContext = createContext<TutorialContextProps | undefined>(undefined);
