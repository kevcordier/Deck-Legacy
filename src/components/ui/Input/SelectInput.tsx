type SelectInputProps<T extends string | number> = {
  readonly options: { label: string; value: T }[];
  readonly placeholder?: string;
  readonly className?: string;
} & React.SelectHTMLAttributes<HTMLSelectElement>;

export function SelectInput<T extends string | number>({
  placeholder,
  options,
  className,
  ...rest
}: SelectInputProps<T>) {
  return (
    <select className={`border rounded px-2 py-1 w-full ${className}`} {...rest}>
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
