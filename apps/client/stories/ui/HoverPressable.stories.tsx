import { HoverPressable } from '@components/ui/HoverPressable/HoverPressable';
import { Text } from '@components/ui/Text/Text';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const meta: Meta<typeof HoverPressable> = {
  title: 'UI/HoverPressable',
  component: HoverPressable,
};

export default meta;
type Story = StoryObj<typeof HoverPressable>;

export const EnabledAndDisabled: Story = {
  render: () => (
    <View className="bg-card items-start gap-2 p-4">
      <HoverPressable className="active:bg-base-ink/20 rounded-md bg-white/60 p-2">
        <Text className="text-base-ink text-xs">Hover me</Text>
      </HoverPressable>
      <HoverPressable disabled className="rounded-md bg-white/60 p-2 opacity-50">
        <Text className="text-base-ink text-xs">Disabled: no effect</Text>
      </HoverPressable>
    </View>
  ),
};
