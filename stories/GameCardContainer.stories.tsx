import { GameCard } from '../src/components/GameCard/GameCard';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { createInstance } from '@engine/application/factory';
import type { CardInstance } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import type { Meta, StoryObj } from '@storybook/react-vite';

type GameCardContainerProps = {
  cardId: number;
  stateId: number;
  instance: CardInstance;
  wood: number;
  gold: number;
  stone: number;
  iron: number;
  weapon: number;
  goods: number;
  isOnBoard: boolean;
  isBlocked: boolean;
};

const meta: Meta<GameCardContainerProps> = {
  title: 'Components/GameCard',
  component: GameCard,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    cardId: { control: 'number', min: 1, max: 120 },
    wood: { control: 'number' },
    gold: { control: 'number' },
    stone: { control: 'number' },
    iron: { control: 'number' },
    weapon: { control: 'number' },
    goods: { control: 'number' },
    isOnBoard: { control: 'boolean' },
    isBlocked: { control: 'boolean' },
  },
  render: ({
    cardId,
    stateId,
    isOnBoard,
    isBlocked,
    wood,
    gold,
    stone,
    iron,
    weapon,
    goods,
    ...props
  }) => {
    const defs = loadCardDefs();

    const validCardId = defs[cardId] ? cardId : 1;
    const maxStateId = defs[validCardId]?.states.length ?? 0;
    const validStateId = stateId > 0 && stateId <= maxStateId ? stateId : 1;
    const instance = createInstance(cardId, validCardId, validStateId, defs);

    return (
      <GameProvider
        key={JSON.stringify({
          cardId,
          stateId,
          isOnBoard,
          isBlocked,
          wood,
          gold,
          stone,
          iron,
          weapon,
          goods,
        })}
        initialState={{
          ...EMPTY_STATE,
          resources: { wood, gold, stone, iron, weapon, goods },
          boardEffects: isBlocked
            ? { [1]: [{ ...CardPassives.block_card, cards: { ids: [instance.id] } }] }
            : {},
        }}
      >
        <div className="grid gap-3 grid-cols-4 p-3">
          {defs[cardId].states.map(state => {
            return (
              <div className="@container" key={`game-card-${instance.id}-${state.id}`}>
                <GameCard
                  {...props}
                  instance={{ ...instance, stateId: state.id }}
                  isOnBoard={isOnBoard}
                />
              </div>
            );
          })}
        </div>
      </GameProvider>
    );
  },
};

export default meta;
type Story = StoryObj<GameCardContainerProps>;

export const GameCardPreview: Story = {
  args: {
    cardId: 1,
    wood: 2,
    gold: 2,
    stone: 2,
    iron: 2,
    weapon: 2,
    goods: 2,
    isOnBoard: true,
    isBlocked: false,
  },
};
