import type { Meta, StoryObj } from '@storybook/react';
import { ResourceChoice } from './ResourceChoice';

const meta: Meta<typeof ResourceChoice> = {
  title: 'ui/ResourceChoice',
  component: ResourceChoice,
  args: { onSelect: () => {} },
};

export default meta;
type Story = StoryObj<typeof ResourceChoice>;

export const TwoOptions: Story = {
  args: { options: [{ gold: 1 }, { wood: 1 }] },
};

export const ThreeOptions: Story = {
  args: { options: [{ gold: 1 }, { wood: 1 }, { stone: 1 }] },
};

export const MultiQuantity: Story = {
  args: { options: [{ wood: 2 }, { stone: 2 }] },
};
