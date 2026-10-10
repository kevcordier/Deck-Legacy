import { Text } from '@components/ui/Text/Text';
import { withTextDefaults } from '@helpers/textClasses';
import type React from 'react';

type TitleProps = {
  readonly children: React.ReactNode;
  readonly level?: 0 | 1 | 2 | 3 | 4;
  readonly className?: string;
};

const SIZE_CLASS = [
  'font-deco',
  'font-deco text-3xl tracking-widest',
  'font-deco text-xl tracking-widest',
  'font-body-bold text-lg',
  'font-deco text-xs',
] as const;

export function Title({ children, level = 1, className = '' }: TitleProps) {
  return (
    <Text
      accessibilityRole="header"
      aria-level={level === 0 ? undefined : level}
      className={withTextDefaults(`${SIZE_CLASS[level]} ${className}`, { color: 'text-primary' })}
    >
      {children}
    </Text>
  );
}
