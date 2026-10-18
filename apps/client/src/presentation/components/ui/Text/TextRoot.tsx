import { InsideTextContext } from './InsideTextContext';
import { TextDefaultsContext } from './TextDefaultsContext';
import { ROOT_DEFAULTS } from './textConstants';
import type { ReactNode } from 'react';

/**
 * Restarts text inheritance from the app defaults, for content rendered away from its React
 * parent (e.g. a tooltip panel opened from inside a `Text`).
 */
export function TextRoot({ children }: { readonly children: ReactNode }) {
  return (
    <TextDefaultsContext value={ROOT_DEFAULTS}>
      <InsideTextContext value={false}>{children}</InsideTextContext>
    </TextDefaultsContext>
  );
}
