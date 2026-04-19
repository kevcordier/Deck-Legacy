import { Button, type ButtonProps } from '@components/ui/Button/Button';

type ButtonGroupProps = {
  readonly label: string;
  readonly options: ButtonProps[];
  readonly value: string;
  readonly size?: 'xs' | 'sm' | 'md' | 'lg';
  readonly font?: 'display' | 'body';
  readonly onChange?: (value: string) => void;
  readonly className?: string;
};

export function ButtonGroup({
  label,
  options,
  value,
  size,
  font,
  onChange,
  className = '',
}: ButtonGroupProps) {
  return (
    <div className={`flex flex-col items-start justify-start gap-2 ${className}`}>
      <fieldset className="rounded-base inline-flex -space-x-px shadow-xs" aria-label={label}>
        <legend className="text-xs">{label}</legend>
        {options.map((option, index) => (
          <Button
            key={option.value || JSON.stringify(option.children)}
            {...option}
            color={value === option.value ? 'primary' : 'ink'}
            size={size}
            font={font}
            className={`rounded-none! ${index === 0 ? 'rounded-l-sm!' : ''} ${index === options.length - 1 ? 'rounded-r-sm!' : ''}`}
            onClick={e => (onChange ? onChange(option.value || '') : option.onClick?.(e))}
          >
            {option.children}
          </Button>
        ))}
      </fieldset>
    </div>
  );
}
