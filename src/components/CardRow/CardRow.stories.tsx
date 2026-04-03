import type { Meta, StoryObj } from '@storybook/react';
import { CardRow } from './CardRow';

const meta: Meta<typeof CardRow> = {
  title: 'Components/CardRow',
  component: CardRow,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof CardRow>;

export const WithPlaceholders: Story = {
  render: () => (
    <CardRow>
      <div
        style={{
          width: 120,
          height: 180,
          background: '#2a2a4a',
          borderRadius: 8,
          border: '1px solid #444',
        }}
      />
      <div
        style={{
          width: 120,
          height: 180,
          background: '#2a2a4a',
          borderRadius: 8,
          border: '1px solid #444',
        }}
      />
      <div
        style={{
          width: 120,
          height: 180,
          background: '#2a2a4a',
          borderRadius: 8,
          border: '1px solid #444',
        }}
      />
    </CardRow>
  ),
};

export const Empty: Story = {
  render: () => <CardRow>{null}</CardRow>,
};

export const SingleItem: Story = {
  render: () => (
    <CardRow>
      <div
        style={{
          width: 120,
          height: 180,
          background: '#2a2a4a',
          borderRadius: 8,
          border: '1px solid #444',
        }}
      />
    </CardRow>
  ),
};
