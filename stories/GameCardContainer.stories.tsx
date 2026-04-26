import { GameCard } from '../src/components/GameCard/GameCard';
import { makeInstance } from '../tests/engine/application/fixtures';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';
import { CardPassives } from '@engine/domain/types/effects';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import type { Meta, StoryObj } from '@storybook/react-vite';

type GameCardContainerProps = {
  cardId: number;
  stickers: Record<number, number[]>;
  trackProgress: number[];
  cumulated: number;
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
    stickers = {},
    trackProgress = [],
    cumulated = 0,
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
    const instance = makeInstance({
      id: cardId,
      cardId: validCardId,
      stateId: 1,
      stickers,
      trackProgress,
      cumulated,
    });

    const colClass = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][
      defs[cardId].states.length - 1
    ];

    return (
      <GameProvider
        key={JSON.stringify({
          cardId,
          instance,
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
          instances: { [instance.id]: instance },
        }}
      >
        <div className={`grid gap-3 ${colClass} p-3`}>
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
    stickers: {},
    trackProgress: [],
    cumulated: 0,
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
