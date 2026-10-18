import { Dismissible } from './Dismissible';
import { StoryProviders } from './StoryProviders';
import { makeInstance } from './storyCatalog';
import { CardUpgradeFlip } from '@components/CardUpgradeReveal/CardUpgradeFlip';
import { CardUpgradeReveal } from '@components/CardUpgradeReveal/CardUpgradeReveal';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof CardUpgradeReveal> = {
  title: 'Components/CardUpgradeReveal',
  component: CardUpgradeReveal,
};

export default meta;
type Story = StoryObj<typeof CardUpgradeReveal>;

export const WildGrassToPlains: Story = {
  render: () => (
    <StoryProviders>
      <Dismissible>
        {close => (
          <CardUpgradeReveal
            before={makeInstance({ id: 1, cardId: 1, stateId: 1 })}
            after={makeInstance({ id: 1, cardId: 1, stateId: 2 })}
            onClose={close}
          />
        )}
      </Dismissible>
    </StoryProviders>
  ),
};

/** Inline flip, as shown in the turn transition panel after an upgrade ends the turn. */
export const InTurnTransition: Story = {
  render: () => (
    <StoryProviders>
      <CardUpgradeFlip
        before={makeInstance({ id: 1, cardId: 1, stateId: 1 })}
        after={makeInstance({ id: 1, cardId: 1, stateId: 2 })}
        width={240}
      />
    </StoryProviders>
  ),
};
