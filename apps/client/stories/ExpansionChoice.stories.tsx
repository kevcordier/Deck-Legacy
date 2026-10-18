import { ExpansionChoice } from '@components/ExpansionChoice/ExpansionChoice';
import { catalog } from '@helpers/catalog';
import type { Meta, StoryObj } from '@storybook/react-native';
import { View } from 'react-native';

const meta: Meta<typeof ExpansionChoice> = {
  title: 'Components/ExpansionChoice',
  component: ExpansionChoice,
  decorators: [
    Story => (
      <View className="bg-background flex-1">
        <Story />
      </View>
    ),
  ],
  argTypes: { onSelect: { action: 'select' } },
  args: { expansions: Object.keys(catalog.expansions), configs: catalog.expansions },
};

export default meta;
type Story = StoryObj<typeof ExpansionChoice>;

export const AllExpansions: Story = {};

export const LastExpansion: Story = { args: { expansions: ['Ridding the Woods'] } };
