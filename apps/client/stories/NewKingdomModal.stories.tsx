import { Dismissible } from './Dismissible';
import { NewKingdomModal } from '@components/NewKingdomModal/NewKingdomModal';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof NewKingdomModal> = {
  title: 'Components/NewKingdomModal',
  component: NewKingdomModal,
  argTypes: {
    onClose: { action: 'close' },
    onCreate: { action: 'create' },
  },
  render: args => (
    <Dismissible>
      {close => (
        <NewKingdomModal
          {...args}
          onClose={() => {
            args.onClose();
            close();
          }}
        />
      )}
    </Dismissible>
  ),
};

export default meta;
type Story = StoryObj<typeof NewKingdomModal>;

export const WithTutorial: Story = { args: { tutorialByDefault: true } };

export const WithoutTutorial: Story = { args: { tutorialByDefault: false } };
