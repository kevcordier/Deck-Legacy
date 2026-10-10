import { Header } from '@components/Header/Header';
import { Button } from '@components/ui/Button/Button';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  args: { onOpenRules: () => {}, onOpenOptions: () => {} },
};

export default meta;
type Story = StoryObj<typeof Header>;

export const Home: Story = {};

export const WithPageActions: Story = {
  render: args => (
    <Header {...args}>
      <Button color="danger" size="xs">
        ↩︎
      </Button>
    </Header>
  ),
};
