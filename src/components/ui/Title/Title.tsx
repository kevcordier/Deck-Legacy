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
  const sizeClass =
    level === 1 ? 'text-xl font-bold tracking-widest' : level === 2 ? 'text-3xl' : 'text-xs';

  return React.createElement(
    CustomTag,
    { className: `font-deco text-primary font-semibold ${sizeClass} ${className}` },
    children,
  );
}
