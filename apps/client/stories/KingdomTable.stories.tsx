import { KingdomTable } from '@components/KingdomTable/KingdomTable';
import type { KingdomMeta } from '@services/persistence';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const EXPANSIONS = ['The Water Mill', 'Prosperity', 'Border Dispute'];

/** A kingdom that played `expansions` of the campaign after the base game. */
function kingdom(index: number, expansions: number): KingdomMeta {
  const base = 30 + index * 4;
  const segments = [
    { segment: 'base', score: base },
    ...EXPANSIONS.slice(0, expansions).map((segment, i) => ({
      segment,
      score: base + (i + 1) * 12,
    })),
  ];
  return {
    id: `kingdom-${index}`,
    name: ['Avalon', 'Camelot', 'Lyonesse', 'Tintagel', 'Carbonek'][index % 5],
    createdAt: index,
    summary: { score: segments.at(-1)?.score ?? 0, segments, finished: false },
  };
}

const meta: Meta<typeof KingdomTable> = {
  title: 'Components/KingdomTable',
  component: KingdomTable,
  decorators: [
    Story => (
      <View className="bg-background p-4">
        <Story />
      </View>
    ),
  ],
  argTypes: {
    onOpen: { action: 'open' },
    onDelete: { action: 'delete' },
  },
};

export default meta;
type Story = StoryObj<typeof KingdomTable>;

export const Empty: Story = { args: { kingdoms: [] } };

export const OneKingdom: Story = { args: { kingdoms: [kingdom(0, 0)] } };

export const TenKingdoms: Story = {
  args: { kingdoms: Array.from({ length: 10 }, (_, i) => kingdom(i, i % 4)) },
};
