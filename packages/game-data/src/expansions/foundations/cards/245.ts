import { blessCard } from './blessCard';
import { blessedProduction } from './blessedProduction';
import { chooseArchbishop } from './chooseArchbishop';
import { ARCHBISHOP_NAMES, BLESSED, CHURCH_CARDS } from './churchConstants';
import { discoverWhenComplete } from './discoverWhenComplete';
import { markTask } from './markTask';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type {
  CardAction,
  CardDef,
  CardState,
  Passive,
  Resources,
  StepDef,
} from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE, IRON, GOODS, HERB, SCIENCE } = ResourceType;
const ARCHBISHOP = CHURCH_CARDS.archbishop;

type Side = {
  /** The blue task squares, each with its cost (step ids unique on the card). */
  tasks: StepDef[];
  /** Task actions and "when complete". */
  actions: CardAction[];
  passive?: Passive;
};

const blessedTasks = (first: number): StepDef[] =>
  [0, 1, 2, 3].map(index => ({
    id: first + index,
    cost: { discard: [{ ...BLESSED, pickNumber: 1 }] },
  }));

const VALERIAN_TASKS: Resources[] = [
  { [GOLD]: 3 },
  { [GOLD]: 4 },
  { [GOLD]: 5 },
  { [HERB]: 2 },
  { [WOOD]: 4 },
  { [STONE]: 4 },
  { [IRON]: 2 },
  { [GOODS]: 3 },
  { [GOODS]: 3 },
];

const SIDES: Side[] = [
  {
    // Gregorius: 3 ⌛ tasks (end your turn to mark one) and 6 gold
    tasks: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4, cost: { resources: [{ [GOLD]: 6 }] } }],
    actions: [
      markTask('245-1-1', [1, 2, 3], true),
      markTask('245-1-2', [4]),
      discoverWhenComplete('245-1-3', CHURCH_CARDS.newParadigm),
    ],
    passive: blessedProduction('245-1-1', [{ [GOLD]: 1 }, { [SCIENCE]: 1 }]),
  },
  {
    // Seraphinus
    tasks: blessedTasks(11),
    actions: [
      markTask('245-2-1', [11, 12, 13, 14]),
      discoverWhenComplete('245-2-2', CHURCH_CARDS.monastery),
    ],
    passive: blessedProduction('245-2-1', [{ [STONE]: 1 }, { [SCIENCE]: 1 }]),
  },
  {
    // Benedictus: tasks marked before the round, by blocking 3 persons (chooseArchbishop)
    tasks: [{ id: 21 }, { id: 22 }],
    actions: [
      {
        id: '245-3-1',
        trigger: Trigger.END_OF_ROUND,
        condition: {
          type: 'and',
          conditions: [
            {
              type: 'cardCount',
              cards: { ids: [ARCHBISHOP], scope: [TargetScope.SELF, TargetScope.WITH_TRACK] },
              max: 0,
            },
            {
              type: 'cardCount',
              cards: { ids: [CHURCH_CARDS.pilgrimage], scope: [TargetScope.DISCOVERY] },
              min: 1,
            },
          ],
        },
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.DISCOVER_CARD,
            cards: { ids: [CHURCH_CARDS.pilgrimage] },
          },
        ],
      },
      {
        // The persons blocked this round are released, back to the deck next round.
        id: '245-3-2',
        trigger: Trigger.END_OF_ROUND,
        condition: {
          type: 'cardCount',
          cards: { scope: [TargetScope.BLOCKED_BY_THIS] },
          min: 1,
        },
        actionEffects: [
          {
            id: 1,
            type: ActionEffectType.UNBLOCK_CARD,
            cards: { scope: [TargetScope.BLOCKED_BY_THIS], autoPick: true },
          },
        ],
      },
    ],
    passive: blessedProduction('245-3-1', [{ [IRON]: 1 }, { [WOOD]: 1 }]),
  },
  {
    // Valerian
    tasks: VALERIAN_TASKS.map((resources, index) => ({
      id: 31 + index,
      cost: { resources: [resources] },
    })),
    actions: [
      markTask(
        '245-4-1',
        VALERIAN_TASKS.map((_, index) => 31 + index),
      ),
      discoverWhenComplete('245-4-2', CHURCH_CARDS.mysticScholar),
    ],
    passive: {
      id: '245-4-1',
      type: PassiveType.STAY_IN_PLAY,
      cards: { ...BLESSED, scope: [TargetScope.ANY] },
    },
  },
  {
    // Arbrosius
    tasks: [3, 3, 5, 5].map((gold, index) => ({
      id: 41 + index,
      cost: { resources: [{ [GOLD]: gold }] },
    })),
    actions: [
      markTask('245-5-1', [41, 42, 43, 44]),
      discoverWhenComplete('245-5-2', CHURCH_CARDS.reforestation),
    ],
    passive: blessedProduction('245-5-1', [{ [GOODS]: 1 }, { [HERB]: 1 }]),
  },
  {
    // Silvanus: its start of round is in chooseArchbishop
    tasks: blessedTasks(51),
    actions: [
      markTask('245-6-1', [51, 52, 53, 54]),
      discoverWhenComplete('245-6-2', CHURCH_CARDS.churchAuthority),
    ],
  },
];

const archbishopState = ({ tasks, actions, passive }: Side, index: number): CardState => {
  const stateId = index + 1;
  return {
    id: stateId,
    name: ARCHBISHOP_NAMES[index],
    tags: [CardTag.PERMANENT, CardTag.ARCHBISHOP],
    track: { inOrder: false, steps: tasks },
    actions: [
      ...actions,
      {
        // ∞ but one-time (crossed out)
        id: `245-${stateId}-9`,
        unlimited: true,
        limitedTime: 1,
        actionEffects: [blessCard(1)],
      },
      {
        id: `245-${stateId}-8`,
        trigger: Trigger.START_OF_ROUND,
        actionEffects: [chooseArchbishop(1, true)],
      },
    ],
    ...(passive && { passives: [passive] }),
  };
};

/**
 * The Archbishops (Foundations 72–74): the 3 printed cards count as one permanent card, so one
 * card here with a state per Archbishop. Marked tasks (unique step ids) and used blessings stay
 * when the card changes Archbishop.
 */
export const archbishop: CardDef = {
  id: 245,
  name: 'Gregorius',
  states: SIDES.map(archbishopState),
};
