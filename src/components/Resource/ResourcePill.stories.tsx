import type { Meta, StoryObj } from '@storybook/react';
import { ResourcePill } from './ResourcePill';

const meta: Meta<typeof ResourcePill> = {
  title: 'Components/Resource/ResourcePill',
  component: ResourcePill,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    resource: {
      control: 'select',
      options: ['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'glory'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResourcePill>;

export const Gold: Story = {
  args: { resource: 'gold', size: 'md' },
};

export const Wood: Story = {
  args: { resource: 'wood', size: 'md' },
};

export const Stone: Story = {
  args: { resource: 'stone', size: 'md' },
};

export const Iron: Story = {
  args: { resource: 'iron', size: 'md' },
};

export const Weapon: Story = {
  args: { resource: 'weapon', size: 'md' },
};

export const Goods: Story = {
  args: { resource: 'goods', size: 'md' },
};

export const AllResources: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {(['sm', 'md', 'lg'] as const).map(size => (
        <div key={size} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ color: 'var(--cream)', width: '24px', fontSize: '12px' }}>{size}</span>
          {['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'glory'].map(r => (
            <ResourcePill key={r} resource={r} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};
