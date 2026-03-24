import type { Meta, StoryObj } from '@storybook/react';
import { CardRow } from './CardRow';

const meta: Meta<typeof CardRow> = {
  title: 'layout/CardRow',
  component: CardRow,
};

export default meta;
type Story = StoryObj<typeof CardRow>;

const FakeCard = ({ label }: { label: string }) => (
  <div
    style={{
      width: 80,
      height: 110,
      background: '#2a2a4a',
      border: '1px solid #555',
      borderRadius: 6,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#ccc',
      fontSize: 12,
    }}
  >
    {label}
  </div>
);

export const Default: Story = {
  render: () => (
    <CardRow>
      <FakeCard label="Card 1" />
      <FakeCard label="Card 2" />
      <FakeCard label="Card 3" />
    </CardRow>
  ),
};

export const Single: Story = {
  render: () => (
    <CardRow>
      <FakeCard label="Lone Card" />
    </CardRow>
  ),
};

export const ManyCards: Story = {
  render: () => (
    <CardRow>
      {Array.from({ length: 8 }, (_, i) => (
        <FakeCard key={i} label={`Card ${i + 1}`} />
      ))}
    </CardRow>
  ),
};
