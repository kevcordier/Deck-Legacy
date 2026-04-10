import type { Meta, StoryObj } from '@storybook/react-vite';
import { Divider } from './Divider';

const meta: Meta<typeof Divider> = {
  title: 'UI/Divider',
  component: Divider,
  parameters: {
    layout: 'padded',
  },
  argTypes: {
    orientation: {
      control: 'inline-radio',
      options: ['horizontal', 'vertical'],
    },
    color: {
      control: 'inline-radio',
      options: ['ink', 'border', 'gradient'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Divider>;

export const Horizontal: Story = {
  args: { orientation: 'horizontal', color: 'ink' },
};

export const Vertical: Story = {
  decorators: [
    Story => (
      <div style={{ display: 'flex', height: '80px', alignItems: 'stretch' }}>
        <span style={{ color: 'var(--cream)' }}>Gauche</span>
        <Story />
        <span style={{ color: 'var(--cream)' }}>Droite</span>
      </div>
    ),
  ],
  args: { orientation: 'vertical', color: 'ink' },
};

export const AllColors: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['ink', 'border', 'gradient'] as const).map(color => (
        <div key={color} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ color: 'var(--cream)', fontSize: '12px' }}>{color}</span>
          <Divider color={color} />
        </div>
      ))}
    </div>
  ),
};
