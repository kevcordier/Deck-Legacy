import type { Meta, StoryObj } from '@storybook/react-vite';
import { ResourceChoice } from './ResourceChoice';

const meta: Meta<typeof ResourceChoice> = {
  title: 'Components/Resource/ResourceChoice',
  component: ResourceChoice,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    onSelect: { action: 'selected' },
  },
};

export default meta;
type Story = StoryObj<typeof ResourceChoice>;

export const TwoOptions: Story = {
  args: {
    options: [{ gold: 1 }, { wood: 2 }],
  },
};

export const ThreeOptions: Story = {
  args: {
    options: [{ gold: 2 }, { wood: 1, stone: 1 }, { iron: 1 }],
  },
};

export const MultipleQuantities: Story = {
  args: {
    options: [{ gold: 3 }, { wood: 2 }],
  },
};
