import type { Meta, StoryObj } from '@storybook/react';
import { PillBtn } from './PillBtn';

const meta: Meta<typeof PillBtn> = {
  title: 'ui/PillBtn',
  component: PillBtn,
  args: {
    onClick: () => {},
    children: 'End Turn',
  },
};

export default meta;
type Story = StoryObj<typeof PillBtn>;

export const Gold: Story = {
  args: { variant: 'gold' },
};

export const Ghost: Story = {
  args: { variant: 'ghost', children: 'Cancel' },
};

export const Warning: Story = {
  args: { variant: 'warning', children: 'Discard' },
};

export const Large: Story = {
  args: { variant: 'gold', large: true, children: 'Start Game' },
};

export const Disabled: Story = {
  args: { variant: 'gold', disabled: true, children: 'Cannot proceed' },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '16px' }}>
      <PillBtn variant="gold" onClick={() => {}}>Gold</PillBtn>
      <PillBtn variant="ghost" onClick={() => {}}>Ghost</PillBtn>
      <PillBtn variant="warning" onClick={() => {}}>Warning</PillBtn>
      <PillBtn variant="gold" large onClick={() => {}}>Gold Large</PillBtn>
      <PillBtn variant="gold" disabled onClick={() => {}}>Disabled</PillBtn>
    </div>
  ),
};
