import { Text } from '@components/ui/Text/Text';
import { Pressable, View } from 'react-native';

type CheckboxProps = {
  readonly label?: string;
  readonly checked: boolean;
  readonly onChange: (checked: boolean) => void;
  readonly disabled?: boolean;
};

export function Checkbox({ label, checked, onChange, disabled = false }: CheckboxProps) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      className={`flex-row items-center gap-2 ${disabled ? 'opacity-50' : ''}`}
    >
      <View
        className={`size-4 items-center justify-center rounded-sm border ${checked ? 'border-primary bg-primary' : 'border-ink'}`}
      >
        {checked && <Text className="text-xs leading-none text-white">✓</Text>}
      </View>
      {label && <Text className="text-sm">{label}</Text>}
    </Pressable>
  );
}
