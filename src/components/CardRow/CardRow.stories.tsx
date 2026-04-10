import type { Meta, StoryObj } from '@storybook/react-vite';
import { CardRow } from './CardRow';
import { loadCardDefs } from '@engine/infrastructure/loaders';
import { createInstance } from '@engine/application/factory';
import { GameProvider } from '@contexts/GameProvider';
import { EMPTY_STATE } from '@engine/application/aggregates/GameAggregate';

const meta: Meta<typeof CardRow> = {
  title: 'Components/CardRow',
  component: CardRow,
  parameters: {
    layout: 'padded',
  },
  decorators: [
    Story => (
      <GameProvider initialState={EMPTY_STATE}>
        <Story />
      </GameProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof CardRow>;

function makeInstances(cardIds: number[]) {
  const defs = loadCardDefs();
  return Object.fromEntries(
    cardIds.map((id, i) => {
      const inst = createInstance(i + 1, id, 1, defs);
      return [inst.id, inst];
    }),
  );
}

export const SingleCard: Story = {
  args: (() => {
    const instances = makeInstances([1]);
    const ids = Object.keys(instances).map(Number);
    return { cardIds: ids, blockingCards: {}, instances };
  })(),
};

export const MultipleCards: Story = {
  args: (() => {
    const instances = makeInstances([1, 2, 3]);
    const ids = Object.keys(instances).map(Number);
    return { cardIds: ids, blockingCards: {}, instances };
  })(),
};

export const WithBlockingCard: Story = {
  args: (() => {
    const defs = loadCardDefs();
    const blocked = createInstance(1, 1, 1, defs);
    const blocker = createInstance(2, 2, 1, defs);
    const instances = { [blocked.id]: blocked, [blocker.id]: blocker };
    return {
      cardIds: [blocked.id, blocker.id],
      blockingCards: { [blocker.id]: blocked.id },
      instances,
    };
  })(),
};
