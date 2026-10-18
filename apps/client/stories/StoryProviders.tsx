import { GameProvider } from '@contexts/GameProvider';
import { GameUIProvider } from '@contexts/GameUIProvider';
import { TutorialProvider } from '@contexts/TutorialProvider';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { GameState } from '@deck-legacy/engine/domain/types';
import type { ReactNode } from 'react';

type StoryProvidersProps = {
  readonly children: ReactNode;
  readonly initialState?: GameState;
};

/** Game, UI and tutorial contexts required by feature components. */
export function StoryProviders({ children, initialState = EMPTY_STATE }: StoryProvidersProps) {
  return (
    <GameUIProvider>
      <GameProvider initialState={initialState}>
        <TutorialProvider>{children}</TutorialProvider>
      </GameProvider>
    </GameUIProvider>
  );
}
