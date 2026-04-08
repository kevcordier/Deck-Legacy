import React from 'react';

export function Title({
  children,
  level = 1 | 2 | 3,
  className = '',
}: {
  children: React.ReactNode;
  level?: number;
  className?: string;
}) {
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
