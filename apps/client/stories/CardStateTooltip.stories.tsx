import { StoryProviders } from './StoryProviders';
import { baseInstances } from './storyCatalog';
import { CardStateTooltip } from '@components/CardStateTooltip/CardStateTooltip';
import { GameCard } from '@components/GameCard/GameCard';
import { UpgradeIcon } from '@components/ui/Icon/icons/UpgradeIcon';
import { Text } from '@components/ui/Text/Text';
import { EMPTY_STATE } from '@deck-legacy/engine/domain/state/emptyState';
import type { Meta, StoryObj } from '@storybook/react-native';

const meta: Meta<typeof CardStateTooltip> = {
  title: 'Components/CardStateTooltip',
  component: CardStateTooltip,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    Story => (
      <StoryProviders initialState={{ ...EMPTY_STATE, instances: baseInstances() }}>
        <Story />
      </StoryProviders>
    ),
  ],
  args: {
    targets: [{ instanceId: 1 }],
    renderCard: instance => <GameCard instance={instance} hideStatePreview />,
  },
};

export default meta;
type Story = StoryObj<typeof CardStateTooltip>;

/** Hover (web) or tap the icon to preview the upgraded state. */
export const UpgradeTarget: Story = {
  args: {
    targets: [{ instanceId: 1, stateId: 2 }],
    children: <UpgradeIcon className="size-6" />,
  },
};

/** A card reference, previewed in its current state. */
export const CardReference: Story = {
  args: {
    children: <Text className="underline">#1</Text>,
  },
};

/** Several cards (e.g. an upgrade that also discovers a card), shown side by side. */
export const SeveralCards: Story = {
  args: {
    targets: [{ instanceId: 1, stateId: 2 }, { instanceId: 2 }],
    children: <Text className="underline">#1 / #2</Text>,
  },
};
