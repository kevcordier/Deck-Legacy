import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const meta: Meta<typeof ResourcePill> = {
  title: 'UI/ResourcePill',
  component: ResourcePill,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    resource: {
      control: 'select',
      options: ['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'science', 'herb', 'glory'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResourcePill>;

export const Gold: Story = {
  args: { resource: 'gold' },
};

export const Wood: Story = {
  args: { resource: 'wood' },
};

export const Stone: Story = {
  args: { resource: 'stone' },
};

export const Iron: Story = {
  args: { resource: 'iron' },
};

export const Weapon: Story = {
  args: { resource: 'weapon' },
};

export const Goods: Story = {
  args: { resource: 'goods' },
};

export const AllResources: Story = {
  render: () => (
    <View className="flex-row items-center gap-2">
      {['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'science', 'herb'].map(r => (
        <ResourcePill key={r} resource={r} />
      ))}
    </View>
  ),
};
