import { HoverPressable } from '@components/ui/HoverPressable/HoverPressable';
import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import { Text } from '@components/ui/Text/Text';
import type { Resources } from '@deck-legacy/engine/domain/types';
import { View } from 'react-native';

interface ResourceChoiceProps {
  readonly options: Resources[];
  readonly disabled?: boolean;
  readonly onSelect: (index: number) => void;
  readonly className?: string;
  readonly pillClassName?: string;
}

export function ResourceChoice({
  options,
  disabled = false,
  onSelect,
  className = '',
  pillClassName,
}: ResourceChoiceProps) {
  // The same option can appear twice (a resource already chosen twice): number the copies.
  const copies = new Map<string, number>();
  return (
    <View className={`flex-row flex-wrap items-center justify-start gap-1 ${className}`}>
      {options.map((opt, i) => {
        const entries = Object.entries(opt);
        const id = JSON.stringify(opt);
        const copy = copies.get(id) ?? 0;
        copies.set(id, copy + 1);
        return (
          <HoverPressable
            key={`${id}#${copy}`}
            onPress={() => onSelect(i)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            className={`bg-card active:bg-ink-card/20 flex-row items-center gap-1 rounded-full p-2 shadow-sm ${disabled ? 'opacity-50' : ''}`}
          >
            {entries.map(([key, val]) =>
              val > 2 ? (
                <View key={key} className="flex-row items-center">
                  <ResourcePill resource={key} className={pillClassName} />
                  <Text className="font-display text-ink-card">x{val}</Text>
                </View>
              ) : (
                Array.from({ length: val }, (_, j) => (
                  <ResourcePill key={`${key}-${j}`} resource={key} className={pillClassName} />
                ))
              ),
            )}
          </HoverPressable>
        );
      })}
    </View>
  );
}
