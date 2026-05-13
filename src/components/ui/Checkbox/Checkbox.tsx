import type { InputHTMLAttributes } from 'react';

type CheckboxProps = {
  readonly label?: string;
  readonly ref?: React.Ref<HTMLInputElement>;
} & InputHTMLAttributes<HTMLInputElement>;

export function Checkbox({ label, className = '', ref, ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        ref={ref}
        type="checkbox"
        className={`w-4 h-4 cursor-pointer accent-primary ${className}`}
        {...props}
      />
      {label && <span className="text-sm">{label}</span>}
    </label>
  );
}

Checkbox.displayName = 'Checkbox';
