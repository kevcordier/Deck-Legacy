type DividerProps = {
  orientation?: 'vertical' | 'horizontal';
  className?: string;
};

export function Divider({ orientation = 'horizontal', className = '' }: DividerProps) {
  const orientationClass = orientation === 'vertical' ? 'h-auto w-px mx-2' : 'h-px w-full my-2';
  return (
    <div
      className={`bg-ink ${orientationClass} ${className}`}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
