import { getStoryCatalog } from '../storyCatalog';
import { StickerChoice } from '@components/ui/StickerChoice/StickerChoice';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof StickerChoice> = {
  title: 'UI/StickerChoice',
  component: StickerChoice,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSelect: { action: 'selected' },
  },
};

export default meta;
type Story = StoryObj<typeof StickerChoice>;

export const TwoOptions: Story = {
  args: {
    options: [
      { id: 1, label: '+1 Gold', production: 'gold' },
      { id: 2, label: '+1 Wood', production: 'wood' },
    ],
  },
};

export const AllStickers: Story = {
  render: args => <StickerChoice {...args} options={Object.values(getStoryCatalog().stickers)} />,
};

export const Disabled: Story = {
  args: {
    disabled: true,
    options: [
      { id: 1, label: '+1 Gold', production: 'gold' },
      { id: 2, label: '+1 Wood', production: 'wood' },
    ],
  },
};
