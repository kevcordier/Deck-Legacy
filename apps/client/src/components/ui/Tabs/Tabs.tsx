import { Text } from '@components/ui/Text/Text';
import { Pressable, View } from 'react-native';

/** Colors on the themed background, or on a `bg-card` surface (fixed colors). */
const TONES = {
  theme: {
    tabs: 'border-ink/30',
    active: 'border-primary bg-primary/15',
    activeText: 'text-primary font-body-bold',
    inactiveText: 'text-ink/70',
  },
  card: {
    tabs: 'border-base-ink/30',
    active: 'border-base-primary bg-base-primary/15',
    activeText: 'text-base-primary font-body-bold',
    inactiveText: 'text-base-ink/70',
  },
} as const;

export type Tab<T extends string> = { readonly id: T; readonly label: string };

type TabsProps<T extends string> = {
  readonly tabs: readonly Tab<T>[];
  readonly value: T;
  readonly onChange: (id: T) => void;
  readonly tone?: 'theme' | 'card';
};

/** Segmented tab bar; the caller renders the selected tab's content. */
export function Tabs<T extends string>({ tabs, value, onChange, tone = 'theme' }: TabsProps<T>) {
  const colors = TONES[tone];
  return (
    <View accessibilityRole="tablist" className={`flex-row rounded border ${colors.tabs}`}>
      {tabs.map(({ id, label }) => {
        const selected = value === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(id)}
            className={`min-h-11 flex-1 items-center justify-center rounded border px-2 ${selected ? colors.active : 'border-transparent'}`}
          >
            <Text className={selected ? colors.activeText : colors.inactiveText}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
