import type { Meta, StoryObj } from '@storybook/react';
import { PillBtn } from './PillBtn';

const meta: Meta<typeof PillBtn> = {
  title: 'Components/PillBtn',
  component: PillBtn,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['gold', 'ghost', 'warning'],
    },
    disabled: { control: 'boolean' },
    large: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
};

export default meta;
type Story = StoryObj<typeof PillBtn>;

export const Gold: Story = {
  args: {
    variant: 'gold',
    children: 'Confirmer',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Annuler',
  },
};

export const Warning: Story = {
  args: {
    variant: 'warning',
    children: 'Supprimer',
  },
};

export const Large: Story = {
  args: {
    variant: 'gold',
    large: true,
    children: 'Grand bouton',
  },
};

export const Disabled: Story = {
  args: {
    variant: 'gold',
    disabled: true,
    children: 'Désactivé',
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
      <PillBtn variant="gold" onClick={() => {}}>Gold</PillBtn>
      <PillBtn variant="ghost" onClick={() => {}}>Ghost</PillBtn>
      <PillBtn variant="warning" onClick={() => {}}>Warning</PillBtn>
      <PillBtn variant="gold" large onClick={() => {}}>Gold Large</PillBtn>
      <PillBtn variant="gold" disabled onClick={() => {}}>Disabled</PillBtn>
    </div>
  ),
};
