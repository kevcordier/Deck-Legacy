import { Glory } from './Glory';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof Glory> = {
  title: 'UI/Glory',
  component: Glory,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    glory: { control: { type: 'number', min: -10, max: 20, step: 1 } },
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Glory>;

export const Positive: Story = {
  args: { glory: 5, size: 'md' },
};

export const Negative: Story = {
  args: { glory: -2, size: 'md' },
};

export const Zero: Story = {
  args: { glory: 0, size: 'md' },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div
          key={size}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
        >
          <span style={{ color: 'var(--cream)', fontSize: '11px' }}>{size}</span>
          <Glory glory={7} size={size} />
        </div>
      ))}
    </div>
  ),
};

export const PositiveAndNegative: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
      <Glory glory={10} size="md" />
      <Glory glory={0} size="md" />
      <Glory glory={-3} size="md" />
    </div>
  ),
};
