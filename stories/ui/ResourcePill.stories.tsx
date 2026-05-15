import { ResourcePill } from '@components/ui/ResourcePill/ResourcePill';
import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta<typeof ResourcePill> = {
  title: 'UI/ResourcePill',
  component: ResourcePill,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    resource: {
      control: 'select',
      options: ['gold', 'wood', 'stone', 'iron', 'weapon', 'goods', 'glory'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ResourcePill>;

export const Gold: Story = {
  args: { resource: 'gold' },
};

export const Wood: Story = {
  args: { resource: 'wood' },
};

export const Stone: Story = {
  args: { resource: 'stone' },
};

export const Iron: Story = {
  args: { resource: 'iron' },
};

export const Weapon: Story = {
  args: { resource: 'weapon' },
};

export const Goods: Story = {
  args: { resource: 'goods' },
};

export const AllResources: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {['gold', 'wood', 'stone', 'iron', 'weapon', 'goods'].map(r => (
          <ResourcePill key={r} resource={r} className="max-block-8" />
        ))}
      </div>
    </div>
  ),
};
