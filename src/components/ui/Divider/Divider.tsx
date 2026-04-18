type DividerProps = {
  readonly orientation?: 'vertical' | 'horizontal';
  readonly color?: 'ink' | 'border' | 'gradient';
  readonly className?: string;
};

export function Divider({
  orientation = 'horizontal',
  color = 'ink',
  className = '',
}: DividerProps) {
  const orientationClass = orientation === 'vertical' ? 'h-auto w-px mx-2' : 'h-px w-full my-2';
  const colorClass = {
    ink: 'bg-ink',
    border: 'bg-border',
    gradient: 'bg-linear-to-r from-transparent via-primary to-transparent',
  }[color];
  return (
    <hr
      className={`${colorClass} ${orientationClass} border-none ${className}`}
      aria-orientation={orientation}
    />
  );
}
