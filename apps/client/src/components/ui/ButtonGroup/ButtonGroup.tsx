import { Button, type ButtonProps, type ButtonSize } from '@components/ui/Button/Button';
import { Text } from '@components/ui/Text/Text';
import { View } from 'react-native';

type ButtonGroupProps = {
  readonly label: string;
  readonly options: ButtonProps[];
  readonly value: string;
  readonly size?: ButtonSize;
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
    <View className={`items-start justify-start gap-2 ${className}`}>
      <Text className="text-xs">{label}</Text>
      <View className="flex-row" accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option, index) => {
          const isFirst = index === 0;
          const isLast = index === options.length - 1;
          const roundedClass = [
            isFirst ? 'rounded-l' : '',
            isLast ? 'rounded-r' : '',
            isFirst ? '' : '-ml-px',
          ].join(' ');
          return (
            <Button
              key={option.value ?? option.title}
              {...option}
              color={value === option.value ? 'primary' : 'ink'}
              size={size}
              font={font}
              accessibilityRole="radio"
              accessibilityState={{ selected: value === option.value }}
              className={`rounded-none ${roundedClass}`}
              onPress={e => (onChange ? onChange(option.value ?? '') : option.onPress?.(e))}
            >
              {option.children}
            </Button>
          );
        })}
      </View>
    </View>
  );
}
