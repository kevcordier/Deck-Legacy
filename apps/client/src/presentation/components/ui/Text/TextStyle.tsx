import { TextDefaultsContext } from './TextDefaultsContext';
import { extractTextDefaults } from '@styles/text/extractTextDefaults';
import { mergeTextDefaults } from '@styles/text/mergeTextDefaults';
import { type ReactNode, use, useMemo } from 'react';

type TextStyleProps = {
  readonly children: ReactNode;
  /** Text classes (e.g. `text-primary font-display text-sm`) to apply by default below. */
  readonly className?: string;
};

/** Emulates CSS text inheritance: sets default text classes for descendants. */
export function TextStyle({ children, className = '' }: TextStyleProps) {
  const parent = use(TextDefaultsContext);
  const value = useMemo(
    () => mergeTextDefaults(parent, extractTextDefaults(className)),
    [parent, className],
  );
  return <TextDefaultsContext value={value}>{children}</TextDefaultsContext>;
}
