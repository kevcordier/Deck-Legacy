import { GameCard } from './GameCard';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { createInstance } from '@engine/application/factory';
import type { CardInstance, Resources } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import type { Meta, StoryObj } from '@storybook/react-vite';

type GameCardContainerProps = {
  id: number;
  cardId: number;
  stateId: number;
  instance: CardInstance;
  currentResources: Resources;
  isOnBoard: boolean;
  isBlocked: boolean;
};

const meta: Meta<GameCardContainerProps> = {
  title: 'Components/GameCard',
  component: GameCard,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    id: { control: 'number' },
    cardId: { control: 'number' },
    stateId: { control: 'number' },
    currentResources: { control: 'object' },
    isOnBoard: { control: 'boolean' },
    isBlocked: { control: 'boolean' },
  },
  render: ({ id, cardId, stateId, isOnBoard, isBlocked, currentResources, ...props }) => {
    const defs = loadCardDefs();

    const validCardId = defs[cardId] ? cardId : 1;
    const maxStateId = defs[validCardId]?.states.length ?? 0;
    const validStateId = stateId > 0 && stateId <= maxStateId ? stateId : 1;

    const instance = createInstance(id, validCardId, validStateId, defs);

    return (
      <GameProvider
        key={JSON.stringify({ id, cardId, stateId, isOnBoard, isBlocked, currentResources })}
        initialState={{
          ...EMPTY_STATE,
          resources: currentResources as Resources,
          boardEffects: isBlocked
            ? { [1]: [{ ...CardPassives.block_card, cards: { ids: [instance.id] } }] }
            : {},
        }}
      >
        <GameCard
          {...props}
          className="w-screen max-w-sm"
          instance={instance}
          isOnBoard={isOnBoard}
        />
      </GameProvider>
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const GameCardPreview: Story = {
  args: {
    id: 1,
    cardId: 1,
    stateId: 1,
    currentResources: { wood: 2, gold: 2, stone: 2, iron: 2, weapon: 2, goods: 2 },
    isOnBoard: true,
    isBlocked: false,
  },
};
