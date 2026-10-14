import { Text } from '@components/ui/Text/Text';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

type SelectInputProps<T extends string | number> = {
  readonly options: { label: string; value: T }[];
  readonly value: T;
  readonly onChange: (value: T) => void;
  readonly placeholder?: string;
  readonly className?: string;
  readonly disabled?: boolean;
};

/** Cross-platform select: a pressable field opening a list of options. */
export function SelectInput<T extends string | number>({
  options,
  value,
  onChange,
  placeholder,
  className = '',
  disabled = false,
}: SelectInputProps<T>) {
  const [open, setOpen] = useState(false);
  const selected = options.find(option => option.value === value);

  return (
    <>
      <Pressable
        accessibilityRole="combobox"
        accessibilityState={{ disabled, expanded: open }}
        disabled={disabled}
        onPress={() => setOpen(true)}
        className={`border-ink flex-row items-center justify-between gap-2 rounded border bg-white px-2 py-1 ${disabled ? 'opacity-50' : ''} ${className}`}
      >
        <Text className="text-ink-card shrink text-sm" numberOfLines={1}>
          {selected?.label ?? placeholder ?? ''}
        </Text>
        <Text className="text-ink-card text-xs">▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 p-6"
          onPress={() => setOpen(false)}
          accessibilityRole="none"
        >
          <View className="bg-background border-border max-h-[70%] w-full max-w-sm rounded-xl border py-2">
            <ScrollView>
              {options.map(option => (
                <Pressable
                  key={String(option.value)}
                  accessibilityRole="menuitem"
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`active:bg-primary/20 px-4 py-2 ${option.value === value ? 'bg-primary/10' : ''}`}
                >
                  <Text className={option.value === value ? 'text-primary' : ''}>
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
