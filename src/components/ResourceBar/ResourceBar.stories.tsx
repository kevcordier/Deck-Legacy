import type { Meta, StoryObj } from '@storybook/react';
import { ResourceBar } from './ResourceBar';

const meta: Meta<typeof ResourceBar> = {
  title: 'game/ResourceBar',
  component: ResourceBar,
  parameters: { layout: 'fullscreen' },
  args: {
    resources: { gold: 3, wood: 2 },
    score: 7,
    round: 2,
    turn: 4,
    deckSize: 14,
    discardSize: 3,
  },
};

export default meta;
type Story = StoryObj<typeof ResourceBar>;

export const Default: Story = {};

export const NoResources: Story = {
  args: { resources: {}, score: 0, round: 1, turn: 1, deckSize: 20, discardSize: 0 },
};

export const RichResources: Story = {
  args: {
    resources: { gold: 5, wood: 3, stone: 2, iron: 1, sword: 2 },
    score: 24,
    round: 5,
    turn: 12,
    deckSize: 8,
    discardSize: 10,
  },
};
