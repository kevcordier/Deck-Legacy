export type ButtonProps = {
  readonly children: React.ReactNode;
  readonly onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  readonly variant?: 'text' | 'contained' | 'outlined';
  readonly color?: 'primary' | 'danger' | 'ink' | 'base-primary' | 'base-ink';
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly font?: 'display' | 'body';
  readonly value?: string;
  readonly disabled?: boolean;
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  onClick,
  variant = 'contained',
  color = 'primary',
  size = 'md',
  font = 'display',
  className = '',
  ...rest
}: ButtonProps) {
  const colorClasses = {
    primary: '[--color-btn-color:var(--color-primary)]',
    danger: '[--color-btn-color:var(--color-danger)]',
    ink: '',
    'base-primary': '[--color-btn-color:var(--color-base-primary)]',
    'base-ink': '[--color-btn-color:var(--color-base-ink)]',
  }[color];
  const variantClasses = {
    text: `bg-transparent text-[var(--color-btn-color)] hover:not-disabled:bg-[var(--color-btn-color)]/10 active:not-disabled:bg-[var(--color-btn-color)]/20`,
    contained: `bg-[var(--color-btn-color)]/20 text-[var(--color-btn-color)] border border-[var(--color-btn-color)] shadow-sm hover:not-disabled:bg-[var(--color-btn-color)]/30 active:not-disabled:bg-[var(--color-btn-color)]/40`,
    outlined: `bg-transparent border border-[var(--color-btn-color)] text-[var(--color-btn-color)] hover:not-disabled:bg-[var(--color-btn-color)]/10 active:not-disabled:bg-[var(--color-btn-color)]/10`,
  }[variant];
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-base',
    lg: 'px-4 py-2 text-lg',
  }[size];

  return (
    <button
      className={`${colorClasses} ${variantClasses} ${sizeClasses} ${font === 'body' ? 'font-body' : 'font-display'} rounded-sm focus:not-disabled:ring-((--color-btn-color)) cursor-pointer font-semibold focus:not-disabled:ring-1 focus:not-disabled:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none ${className}`}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
}
