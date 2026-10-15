import { Text, TextStyle } from '@components/ui/Text/Text';
import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

export type ButtonColor = 'primary' | 'danger' | 'ink' | 'base-primary' | 'ink-card';
export type ButtonVariant = 'text' | 'contained' | 'outlined' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export type ButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  readonly children?: ReactNode;
  readonly variant?: ButtonVariant;
  readonly color?: ButtonColor;
  readonly size?: ButtonSize;
  readonly font?: 'display' | 'body';
  readonly value?: string;
  readonly className?: string;
  /** Extra text classes applied to the label (and inherited by nested `Text`/icons). */
  readonly textClassName?: string;
  /** Web tooltip / accessibility label. */
  readonly title?: string;
  /** Stuck to this screen edge, like the side sheet it opens: square and borderless on that side. */
  readonly edge?: 'left' | 'right';
};

// Literal class strings (NativeWind only generates classes it can find in the sources).
const TEXT_COLOR: Record<ButtonColor, string> = {
  primary: 'text-primary',
  danger: 'text-danger',
  ink: 'text-ink',
  'base-primary': 'text-base-primary',
  'ink-card': 'text-ink-card',
};

const CONTAINED: Record<ButtonColor, string> = {
  primary: 'border border-primary bg-primary/20 active:bg-primary/40 shadow-sm',
  danger: 'border border-danger bg-danger/20 active:bg-danger/40 shadow-sm',
  ink: 'border border-ink bg-ink/10 active:bg-ink/20 shadow-sm',
  'base-primary':
    'border border-base-primary bg-base-primary/20 active:bg-base-primary/40 shadow-sm',
  'ink-card': 'border border-ink-card bg-ink-card/20 active:bg-ink-card/40 shadow-sm',
};

const OUTLINED: Record<ButtonColor, string> = {
  primary: 'border border-primary active:bg-primary/10',
  danger: 'border border-danger active:bg-danger/10',
  ink: 'border border-ink active:bg-ink/10',
  'base-primary': 'border border-base-primary active:bg-base-primary/10',
  'ink-card': 'border border-ink-card active:bg-ink-card/10',
};

const TEXT_VARIANT: Record<ButtonColor, string> = {
  primary: 'active:bg-primary/20',
  danger: 'active:bg-danger/20',
  ink: 'active:bg-ink/20',
  'base-primary': 'active:bg-base-primary/20',
  'ink-card': 'active:bg-ink-card/20',
};

const SIZE: Record<ButtonSize, { box: string; text: string }> = {
  xs: { box: 'px-2 py-1', text: 'text-xs' },
  sm: { box: 'px-2 py-1', text: 'text-sm' },
  md: { box: 'px-3 py-2', text: 'text-base' },
  lg: { box: 'px-4 py-2', text: 'text-lg' },
};

const EDGE: Record<'left' | 'right' | 'none', string> = {
  left: 'rounded-r border-l-0',
  right: 'rounded-l border-r-0',
  none: 'rounded',
};

function variantClasses(variant: ButtonVariant, color: ButtonColor): string {
  switch (variant) {
    case 'contained':
      return CONTAINED[color];
    case 'outlined':
      return OUTLINED[color];
    case 'text':
      return TEXT_VARIANT[color];
    case 'link':
      return '';
  }
}

export function Button({
  children,
  variant = 'contained',
  color = 'primary',
  size = 'md',
  font = 'display',
  className = '',
  textClassName = '',
  disabled,
  title,
  accessibilityLabel,
  edge,
  ...rest
}: ButtonProps) {
  const sizeClasses = SIZE[size];
  const boxClasses = variant === 'link' ? '' : sizeClasses.box;
  const fontClass = font === 'body' ? 'font-body' : 'font-display';
  const labelClasses = `${TEXT_COLOR[color]} ${fontClass} ${sizeClasses.text} ${variant === 'link' ? 'underline' : ''} ${textClassName}`;
  const isTextContent = typeof children === 'string' || typeof children === 'number';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      className={`flex-row items-center justify-center gap-1 ${EDGE[edge ?? 'none']} ${boxClasses} ${variantClasses(variant, color)} ${disabled ? 'opacity-50' : ''} ${className}`}
      {...rest}
    >
      <TextStyle className={labelClasses}>
        {isTextContent ? (
          <Text className={`font-semibold ${labelClasses}`}>{children}</Text>
        ) : (
          children
        )}
      </TextStyle>
    </Pressable>
  );
}
