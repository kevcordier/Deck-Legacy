import { StoryProviders } from './StoryProviders';
import { makeInstance } from './storyCatalog';
import {
  CardUpgradeFlip,
  CardUpgradeReveal,
} from '@components/CardUpgradeReveal/CardUpgradeReveal';
import type { Meta, StoryObj } from '@storybook/react-native';
import { useState } from 'react';

const meta: Meta<typeof CardUpgradeReveal> = {
  title: 'Components/CardUpgradeReveal',
  component: CardUpgradeReveal,
};

export default meta;
type Story = StoryObj<typeof CardUpgradeReveal>;

function Replayable() {
  // Each close replays the animation.
  const [run, setRun] = useState(0);
  return (
    <CardUpgradeReveal
      key={run}
      before={makeInstance({ id: 1, cardId: 1, stateId: 1 })}
      after={makeInstance({ id: 1, cardId: 1, stateId: 2 })}
      onClose={() => setRun(value => value + 1)}
    />
  );
}

export const WildGrassToPlains: Story = {
  render: () => (
    <StoryProviders>
      <Replayable />
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
