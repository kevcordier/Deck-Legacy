import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from './EmptyState';

const meta: Meta<typeof EmptyState> = {
  title: 'layout/EmptyState',
  component: EmptyState,
  args: {
    title: 'No cards here',
  },
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {};

export const WithSubtitle: Story = {
  args: { subtitle: 'Play a card to get started.' },
};

export const WithAction: Story = {
  args: {
    title: 'Deck is empty',
    subtitle: 'All cards have been played.',
    action: (
      <button
        style={{
          padding: '8px 16px',
          background: '#c9a83c',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Reset Deck
      </button>
    ),
  },
};
