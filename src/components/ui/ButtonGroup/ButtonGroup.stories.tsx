import type { Meta, StoryObj } from '@storybook/react-vite';
import { ButtonGroup } from './ButtonGroup';

const meta: Meta<typeof ButtonGroup> = {
  title: 'UI/ButtonGroup',
  component: ButtonGroup,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['xs', 'sm', 'md', 'lg'],
    },
    font: {
      control: 'inline-radio',
      options: ['display', 'body'],
    },
    onChange: { action: 'changed' },
  },
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Default: Story = {
  args: {
    label: 'Langue',
    value: 'fr',
    options: [
      { value: 'fr', children: 'FR' },
      { value: 'en', children: 'EN' },
    ],
  },
};

export const ThreeOptions: Story = {
  args: {
    label: 'Thème',
    value: 'dark',
    options: [
      { value: 'light', children: 'Clair' },
      { value: 'dark', children: 'Sombre' },
      { value: 'auto', children: 'Auto' },
    ],
  },
};

export const SmallSize: Story = {
  args: {
    label: 'Taille',
    value: 'sm',
    size: 'sm',
    options: [
      { value: 'sm', children: 'SM' },
      { value: 'md', children: 'MD' },
      { value: 'lg', children: 'LG' },
    ],
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => (
        <ButtonGroup
          key={size}
          label={`Taille : ${size}`}
          value="a"
          size={size}
          options={[
            { value: 'a', children: 'Option A' },
            { value: 'b', children: 'Option B' },
          ]}
        />
      ))}
    </div>
  ),
};
