import React from 'react';

type TitleProps = {
  readonly children: React.ReactNode;
  readonly level?: 0 | 1 | 2 | 3 | 4;
  readonly className?: string;
};

export function Title({ children, level = 1, className = '' }: TitleProps) {
  const CustomTag = `h${level}` as React.ElementType;
  const sizeClass = [
    '',
    'text-3xl font-bold tracking-widest',
    'text-xl font-bold tracking-widest',
    'text-lg font-bold font-body!',
    'text-xs',
  ][level] as string;

  return React.createElement(
    CustomTag,
    { className: `font-deco text-primary font-semibold ${sizeClass} ${className}` },
    children,
  );
}
