import { InsideTextContext } from './InsideTextContext';
import { TextDefaultsContext } from './TextDefaultsContext';
import { withTextDefaults } from '@styles/text/withTextDefaults';
import { use } from 'react';
import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

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
