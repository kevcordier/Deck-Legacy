import { Divider } from '@components/ui/Divider/Divider';
import { Text } from '@components/ui/Text/Text';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const meta: Meta<typeof Divider> = {
  title: 'UI/Divider',
  component: Divider,
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    color: {
      control: 'inline-radio',
      options: ['ink', 'border', 'gradient'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: { orientation: 'horizontal', color: 'ink' },
};

export const Vertical: Story = {
  decorators: [
    Story => (
      <View className="h-20 flex-row items-stretch">
        <Text>Gauche</Text>
        <Story />
        <Text>Droite</Text>
      </View>
    ),
  ],
  args: { orientation: 'vertical', color: 'ink' },
};

export const AllColors: Story = {
  render: () => (
    <View className="gap-6">
      {(['ink', 'border', 'gradient'] as const).map(color => (
        <View key={color} className="gap-1">
          <Text className="text-xs">{color}</Text>
          <Divider color={color} />
        </View>
      ))}
    </View>
  ),
};
