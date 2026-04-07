import { Button, type ButtonProps } from '@components/ui/Button/Button';

type ButtonGroupProps = {
  label: string;
  options: ButtonProps[];
  value: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onChange?: (value: string) => void;
};

export function ButtonGroup({ label, options, value, size, onChange }: ButtonGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs">{label}</span>
      <div
        className="rounded-base inline-flex -space-x-px shadow-xs"
        role="group"
        aria-label={label}
      >
        {options.map(option => (
          <Button
            {...option}
            key={option.value || JSON.stringify(option.children)}
            color={value === option.value ? 'primary' : 'ink'}
            size={size}
            className="not-first:not-last:rounded-none first:rounded-e-none last:rounded-s-none"
            onClick={e => (onChange ? onChange(option.value || '') : option.onClick?.(e))}
          >
            {option.children}
          </Button>
        ))}
      </div>
    </div>
  );
}
