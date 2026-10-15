import { Picker } from '@react-native-picker/picker';

type SelectInputProps<T extends string | number> = {
  readonly options: { label: string; value: T }[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly disabled?: boolean;
};

/** The platform's native select: `<select>` on the web, the system picker on iOS and Android. */
export function SelectInput<T extends string | number>({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
}: SelectInputProps<T>) {
  const selected = options.some(option => option.value === value);
  return (
    <Picker
      selectedValue={selected ? value : ''}
      enabled={!disabled}
      mode="dropdown"
      // The web gives back strings: map the index to the typed value.
      onValueChange={(_, index) => {
        const option = options[selected || !placeholder ? index : index - 1];
        if (option) onChange(option.value);
      }}
      className={`border-ink text-ink-card font-body min-h-8 rounded border bg-white px-2 py-1 text-sm ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {!selected && placeholder !== undefined && <Picker.Item label={placeholder} value="" />}
      {options.map(option => (
        <Picker.Item key={String(option.value)} label={option.label} value={option.value} />
      ))}
    </Picker>
  );
}
