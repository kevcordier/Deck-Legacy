type DividerProps = {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function Divider({ orientation = 'vertical', className }: DividerProps) {
  const orientationClass = orientation === 'vertical' ? 'h-auto w-px' : 'h-px w-full';
  return (
    <div
      className={`bg-ink ${orientationClass} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
