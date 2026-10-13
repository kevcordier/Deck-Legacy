import {
  type TextDefaults,
  extractTextDefaults,
  mergeTextDefaults,
  withTextDefaults,
} from '@helpers/textClasses';
import { type ReactNode, createContext, use, useMemo } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

const ROOT_DEFAULTS: TextDefaults = {
  color: 'text-ink',
  family: 'font-body',
  size: 'text-base',
};

const TextDefaultsContext = createContext<TextDefaults>(ROOT_DEFAULTS);
const InsideTextContext = createContext(false);

/** Default text color / font / size inherited by every `Text` rendered below. */
export function useTextDefaults(): TextDefaults {
  return use(TextDefaultsContext);
}

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

export type TextProps = RNTextProps & {
  readonly className?: string;
};

export function Text({ className, children, ...rest }: TextProps) {
  const defaults = use(TextDefaultsContext);
  const insideText = use(InsideTextContext);
  // Nested texts inherit their parent's style natively; only root texts get the defaults.
  const classes = insideText ? className : withTextDefaults(className, defaults);

  return (
    <RNText className={classes} {...rest}>
      <InsideTextContext value>{children}</InsideTextContext>
    </RNText>
  );
}
