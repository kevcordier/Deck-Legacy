import type { Meta, StoryObj } from '@storybook/react';
import { ResourcePill } from './ResourcePill';

const meta: Meta<typeof ResourcePill> = {
  title: 'ui/ResourcePill',
  component: ResourcePill,
  args: { resource: 'gold', size: 'md' },
};

export default meta;
type Story = StoryObj<typeof ResourcePill>;

export const Gold: Story = { args: { resource: 'gold' } };
export const Wood: Story = { args: { resource: 'wood' } };
export const Stone: Story = { args: { resource: 'stone' } };
export const Iron: Story = { args: { resource: 'iron' } };
export const Sword: Story = { args: { resource: 'sword' } };
export const Glory: Story = { args: { resource: 'glory' } };

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px' }}>
      <ResourcePill resource="gold" size="sm" />
      <ResourcePill resource="gold" size="md" />
      <ResourcePill resource="gold" size="lg" />
    </div>
  ),
};

export const AllResources: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '12px', padding: '16px' }}>
      {['gold', 'wood', 'stone', 'iron', 'sword', 'goods', 'glory'].map(r => (
        <ResourcePill key={r} resource={r} size="md" />
      ))}
    </div>
  ),
};
