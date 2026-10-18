import { TutorialContext, type TutorialContextProps } from '@contexts/TutorialContext';
import { use } from 'react';

export function useTutorial(): TutorialContextProps {
  const context = use(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}
