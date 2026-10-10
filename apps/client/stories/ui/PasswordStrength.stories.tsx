import { PasswordStrength } from '@components/ui/PasswordStrength/PasswordStrength';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta = {
  title: 'UI/PasswordStrength',
  component: PasswordStrength,
} satisfies Meta<typeof PasswordStrength>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { password: '' } };

export const Weak: Story = { args: { password: 'abcdef' } };

export const Fair: Story = { args: { password: 'Abcdefg1' } };

export const Strong: Story = { args: { password: 'Abcdefghij1!' } };
