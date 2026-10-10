import { Text } from '@components/ui/Text/Text';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

// Mirrors tailwind.config.js / src/styles/global.css.
const COLORS: { name: string; light: string; dark?: string }[] = [
  { name: 'Background', light: '#fff2e0', dark: '#3b342a' },
  { name: 'Ink', light: '#664a26', dark: '#fff2e0' },
  { name: 'Border', light: '#bda887', dark: '#65553c' },
  { name: 'Primary', light: '#c79233', dark: '#ffd07c' },
  { name: 'Card', light: '#f0e4be' },
  { name: 'Danger', light: '#c2554f' },
  { name: 'Success', light: '#00b286' },
  { name: 'Tag enemy', light: '#c10007' },
  { name: 'Tag building', light: '#62748e' },
  { name: 'Tag person', light: '#f0b100' },
  { name: 'Tag seafaring', light: '#00a6f4' },
  { name: 'Tag land', light: '#00c950' },
  { name: 'Tag livestock', light: '#ff6900' },
  { name: 'Tag tag', light: '#ffa2a2' },
];

const meta: Meta = {
  title: 'Tokens',
};

export default meta;
type Story = StoryObj<typeof meta>;

function Swatch({ color, label }: { readonly color: string; readonly label: string }) {
  return (
    <View className="items-center gap-1">
      <View
        className="border-border size-12 rounded-md border"
        style={{ backgroundColor: color }}
      />
      <Text className="text-xs">{label}</Text>
    </View>
  );
}

export const Colors: Story = {
  render: () => (
    <View className="gap-4">
      {COLORS.map(({ name, light, dark }) => (
        <View key={name} className="flex-row items-center gap-4">
          <Text className="w-32">{name}</Text>
          <Swatch color={light} label={dark ? `light ${light}` : light} />
          {dark && <Swatch color={dark} label={`dark ${dark}`} />}
        </View>
      ))}
    </View>
  ),
};

const SAMPLE = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

export const Typography: Story = {
  render: () => (
    <View className="gap-4">
      <Text className="font-deco text-3xl">font-deco — Cinzel Decorative</Text>
      <Text className="font-display text-xl">font-display — Cinzel</Text>
      <Text className="font-body text-lg">font-body — EB Garamond. {SAMPLE}</Text>
      <Text className="font-body-italic">font-body-italic — {SAMPLE}</Text>
      <Text className="font-body-bold">font-body-bold — {SAMPLE}</Text>
      {(['text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl', 'text-3xl'] as const).map(
        size => (
          <Text key={size} className={size}>
            {size}
          </Text>
        ),
      )}
    </View>
  ),
};
