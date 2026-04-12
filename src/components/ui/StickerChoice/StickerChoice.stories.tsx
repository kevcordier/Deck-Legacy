import type { Meta, StoryObj } from '@storybook/react-vite';
import { StickerChoice } from './StickerChoice';
import { stickerData } from '@data/stickers';

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
      { id: 1, label: 'Gold', type: 'add', description: '+1 gold', production: 'gold' },
      { id: 2, label: 'Wood', type: 'add', description: '+1 wood', production: 'wood' },
    ],
  },
};

export const AllStickers: Story = {
  args: {
    options: stickerData,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    options: [
      { id: 1, label: 'Gold', type: 'add', description: '+1 gold', production: 'gold' },
      { id: 2, label: 'Wood', type: 'add', description: '+1 wood', production: 'wood' },
    ],
  },
};
