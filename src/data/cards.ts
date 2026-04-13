import {
  ActionType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const cardsData: CardDef[] = [
  {
    id: 1,
    name: 'Wild Grass',
    states: [
      {
        id: 1,
        name: 'Wild Grass',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
      },
      {
        id: 2,
        name: 'Plains',
        tags: [CardTag.LAND],
        actions: [
          {
            id: '1-2-1',
            cost: {
              discard: {
                scope: TargetScope.FRIENDLY,
              },
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  [ResourceType.GOLD]: 2,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
      },
      {
        id: 3,
        name: 'Farmlands',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 3,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
        productions: [
          {
            [ResourceType.GOLD]: 2,
          },
        ],
      },
      {
        id: 4,
        name: 'Food Barns',
        tags: [CardTag.BUILDING],
        glory: 3,
        productions: [
          {
            [ResourceType.GOLD]: 2,
          },
        ],
        passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      },
    ],
  },
  {
    id: 2,
    name: 'Distant Mountain',
    states: [
      {
        id: 1,
        name: 'Distant Mountain',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
      },
      {
        id: 2,
        name: 'Rocky Area',
        tags: [CardTag.LAND],
        actions: [
          {
            id: '2-2-1',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  [ResourceType.STONE]: 2,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                  [ResourceType.WOOD]: 2,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
        productions: [
          {
            [ResourceType.STONE]: 1,
          },
        ],
      },
      {
        id: 3,
        name: 'Quarry',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 2,
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
        productions: [
          {
            [ResourceType.STONE]: 2,
          },
        ],
      },
      {
        id: 4,
        name: 'Shallow Mine',
        tags: [CardTag.LAND],
        glory: 3,
        actions: [
          {
            id: '2-4-1',
            cost: {
              destroy: { scope: TargetScope.SELF },
            },
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: { ids: [84, 85] },
              },
            ],
          },
        ],
        productions: [
          {
            [ResourceType.STONE]: 1,
            [ResourceType.IRON]: 1,
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Forest',
    states: [
      {
        id: 1,
        name: 'Forest',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 2,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
        actions: [
          {
            id: '3-1-1',
            // label: 'Gain 3 woods, then upgrade.',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WOOD]: 3,
                },
              },
              {
                id: 2,
                type: ActionType.UPGRADE_CARD,
                cards: {
                  scope: TargetScope.SELF,
                },
                states: [2],
              },
            ],
          },
        ],
        productions: [
          {
            [ResourceType.WOOD]: 1,
          },
        ],
      },
      {
        id: 2,
        name: 'Felled Forest',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            upgradeTo: 1,
          },
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                  [ResourceType.WOOD]: 1,
                  [ResourceType.STONE]: 1,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Lumberjack',
        tags: [CardTag.BUILDING],
        glory: 2,
        productions: [
          {
            [ResourceType.WOOD]: 2,
          },
        ],
      },
      {
        id: 4,
        name: 'Sacred Well',
        tags: [CardTag.BUILDING],
        glory: 2,
        actions: [
          {
            id: '3-4-1',
            // label: 'Discover Shrine (82/83).',
            cost: {
              destroy: { scope: TargetScope.SELF },
            },
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: { ids: [82, 83] },
              },
            ],
          },
        ],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Headquarters',
    states: [
      {
        id: 1,
        name: 'Headquarters',
        tags: [CardTag.BUILDING],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 3,
                  [ResourceType.WOOD]: 1,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
      },
      {
        id: 2,
        name: 'Town Hall',
        tags: [CardTag.BUILDING],
        glory: 3,
        actions: [
          {
            id: '4-2-1',
            // label: 'Play 1 Land from discard pile.',
            actions: [
              {
                id: 1,
                type: ActionType.PLAY_CARD,
                cards: {
                  tags: [CardTag.LAND],
                  scope: TargetScope.DISCARD,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 4,
                  [ResourceType.WOOD]: 2,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
        productions: [
          {
            [ResourceType.WEAPON]: 1,
          },
        ],
      },
      {
        id: 3,
        name: 'Keep',
        tags: [CardTag.BUILDING],
        glory: 7,
        actions: [
          {
            id: '4-3-1',
            // label: 'Play 1 Land or Building from discard pile.',
            actions: [
              {
                id: 1,
                type: ActionType.PLAY_CARD,
                cards: {
                  tags: [CardTag.LAND, CardTag.BUILDING],
                  scope: TargetScope.DISCARD,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 6,
                  [ResourceType.WOOD]: 2,
                  [ResourceType.IRON]: 1,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
        productions: [
          {
            [ResourceType.WEAPON]: 1,
          },
        ],
      },
      {
        id: 4,
        name: 'Castle',
        tags: [CardTag.BUILDING],
        glory: 12,
        actions: [
          {
            id: '4-4-1',
            // label: 'Play 1 card from discard pile.',
            actions: [
              {
                id: 1,
                type: ActionType.PLAY_CARD,
                cards: {
                  scope: TargetScope.DISCARD,
                },
              },
            ],
          },
        ],
        productions: [
          {
            [ResourceType.WEAPON]: 1,
          },
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Trader',
    states: [
      {
        id: 1,
        name: 'Trader',
        tags: [CardTag.PERSON],
        actions: [
          {
            id: '5-1-1',
            // label: 'Spend 1 gold to gain 1 Wood.',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WOOD]: 1,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Bazaar',
        tags: [CardTag.BUILDING],
        glory: 1,
        actions: [
          {
            id: '5-2-1',
            // label: 'Spend 1 gold to gain 1 Wood or Stone.',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                  ],
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Market',
        tags: [CardTag.BUILDING],
        glory: 3,
        actions: [
          {
            id: '5-3-1',
            // label: 'Spend 1 gold to gain 1 Wood, Stone, or Iron.',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                    {
                      [ResourceType.IRON]: 1,
                    },
                  ],
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 5,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 4,
        name: 'Festival',
        tags: [CardTag.EVENT],
        glory: 4,
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
          {
            [ResourceType.WOOD]: 1,
          },
          {
            [ResourceType.STONE]: 1,
          },
          {
            [ResourceType.IRON]: 1,
          },
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Jungle',
    states: [
      {
        id: 1,
        name: 'Jungle',
        tags: [CardTag.LAND],
        actions: [
          {
            id: '6-1-1',
            // label: 'Spend 1 gold to gain 1 Wood.',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WOOD]: 1,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Huge Trees',
        tags: [CardTag.LAND],
        actions: [
          {
            id: '6-2-1',
            // label: 'Spend 1 gold to gain 2 Wood.',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  [ResourceType.WOOD]: 2,
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
        productions: [
          {
            [ResourceType.WOOD]: 1,
          },
        ],
      },
      {
        id: 3,
        name: 'Deep Jungle',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 4,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
        productions: [
          {
            [ResourceType.WOOD]: 2,
          },
        ],
      },
      {
        id: 4,
        name: 'Treehouses',
        tags: [CardTag.BUILDING],
        glory: 4,
        productions: [
          {
            [ResourceType.GOLD]: 1,
            [ResourceType.WOOD]: 2,
          },
        ],
        passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      },
    ],
  },
  {
    id: 7,
    name: 'River',
    states: [
      {
        id: 1,
        name: 'River',
        tags: [CardTag.LAND],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 3,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Bridge',
        tags: [CardTag.LAND],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 2,
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Stone Bridge',
        tags: [CardTag.LAND],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 4,
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 4,
        name: 'Explorers',
        tags: [CardTag.PERSON],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 4,
        actions: [
          {
            id: '7-4-1',
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [71, 72, 73, 74],
                },
              },
              {
                id: 2,
                type: ActionType.UPGRADE_CARD,
                cards: {
                  scope: TargetScope.SELF,
                },
                states: [3],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 8,
    name: 'Field Worker',
    chooseState: true,
    states: [
      {
        id: 1,
        name: 'Field Worker',
        tags: [CardTag.PERSON],
        actions: [
          {
            id: '8-1-1',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  cards: {
                    scope: TargetScope.BOARD,
                    tags: [CardTag.LAND],
                    produces: [
                      ResourceType.GOLD,
                      ResourceType.WOOD,
                      ResourceType.STONE,
                      ResourceType.IRON,
                      ResourceType.WEAPON,
                      ResourceType.GOODS,
                    ],
                  },
                },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Servant',
        tags: [CardTag.PERSON],
        actions: [
          {
            id: '8-2-1',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.GOLD]: 1,
                    },
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 9,
    name: 'Bandit',
    states: [
      {
        id: 1,
        name: 'Bandit',
        tags: [CardTag.ENEMY],
        negative: true,
        glory: -2,
        illustration: 'cards/bandit.webp',
        actions: [
          {
            id: '9-1-1',
            trigger: Trigger.ON_PLAY,
            optional: false,
            actions: [
              {
                id: 1,
                type: ActionType.BLOCK_CARD,
                cards: {
                  scope: TargetScope.BOARD,
                  tags: [CardTag.LAND],
                  produces: [ResourceType.GOLD],
                },
              },
            ],
          },
          {
            id: '9-1-2',
            // label: 'Spend 1 weapon to defeat (destroy this card) and gain any 2 resources.',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 1,
                },
              ],
              destroy: { scope: TargetScope.SELF },
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.GOLD]: 1,
                    },
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                    {
                      [ResourceType.IRON]: 1,
                    },
                    {
                      [ResourceType.WEAPON]: 1,
                    },
                    {
                      [ResourceType.GOODS]: 1,
                    },
                  ],
                },
              },
              {
                id: 2,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.GOLD]: 1,
                    },
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                    {
                      [ResourceType.IRON]: 1,
                    },
                    {
                      [ResourceType.WEAPON]: 1,
                    },
                    {
                      [ResourceType.GOODS]: 1,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Worker',
        tags: [CardTag.PERSON],
        actions: [
          {
            id: '9-2-1',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  cards: {
                    scope: TargetScope.BOARD,
                    tags: [CardTag.BUILDING],
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 10,
    name: 'Bandit',
    states: [
      {
        id: 1,
        name: 'Bandit',
        tags: [CardTag.ENEMY],
        negative: true,
        glory: -2,
        illustration: 'cards/bandit.webp',
        actions: [
          {
            id: '10-1-1',
            trigger: Trigger.ON_PLAY,
            optional: false,
            actions: [
              {
                id: 1,
                type: ActionType.BLOCK_CARD,
                cards: {
                  scope: TargetScope.BOARD,
                  tags: [CardTag.LAND],
                  produces: [ResourceType.GOLD],
                },
              },
            ],
          },
          {
            id: '10-1-2',
            cost: {
              resources: [
                {
                  [ResourceType.WEAPON]: 1,
                },
              ],
              destroy: { scope: TargetScope.SELF },
            },
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.GOLD]: 1,
                    },
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                    {
                      [ResourceType.IRON]: 1,
                    },
                    {
                      [ResourceType.WEAPON]: 1,
                    },
                    {
                      [ResourceType.GOODS]: 1,
                    },
                  ],
                },
              },
              {
                id: 2,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  choice: [
                    {
                      [ResourceType.GOLD]: 1,
                    },
                    {
                      [ResourceType.WOOD]: 1,
                    },
                    {
                      [ResourceType.STONE]: 1,
                    },
                    {
                      [ResourceType.IRON]: 1,
                    },
                    {
                      [ResourceType.WEAPON]: 1,
                    },
                    {
                      [ResourceType.GOODS]: 1,
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
      {
        id: 2,
        name: 'Field Worker',
        tags: [CardTag.PERSON],
        actions: [
          {
            id: '10-2-1',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resources: {
                  cards: {
                    scope: TargetScope.BOARD,
                    tags: [CardTag.LAND],
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 11,
    name: 'Hill',
    states: [
      {
        id: 1,
        name: 'Hill',
        tags: [CardTag.LAND],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 1,
                  [ResourceType.WOOD]: 1,
                  [ResourceType.STONE]: 1,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Chapel',
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 1,
        actions: [
          {
            id: '11-2-1',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 3,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [103],
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 2,
                  [ResourceType.STONE]: 2,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Church',
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 3,
        actions: [
          {
            id: '11-3-1',
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 4,
                },
              ],
            },
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [104],
                },
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 2,
                  [ResourceType.STONE]: 3,
                  [ResourceType.IRON]: 1,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 4,
        name: 'Cathedral',
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 7,
        actions: [
          {
            id: '11-4-1',
            // label: 'This card has +1 gold production for each person you have in play.',
            passive: true,
            actions: [
              // {
              //   id: 1,
              //   type: 'increase_production',
              //   cards: {
              //     scope: TargetScope.SELF,
              //   },
              //   resource_per_card: {
              //     resource: ResourceType.GOLD,
              //     amount: 1,
              //     scope: TargetScope.BOARD,
              //     tags: [CardTag.PERSON],
              //   },
              // },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 12,
    name: 'East Cliffs',
    states: [
      {
        id: 1,
        name: 'East Cliffs',
        tags: [CardTag.LAND],
        productions: [
          {
            [ResourceType.STONE]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 1,
                  [ResourceType.WOOD]: 1,
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Smithy',
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.IRON]: 1,
          },
        ],
        glory: 1,
        actions: [
          {
            id: '12-2-1',
            // label: 'Reset to discover Jewellery (90).',
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [90],
                },
              },
              {
                id: 2,
                type: ActionType.UPGRADE_CARD,
                cards: {
                  scope: TargetScope.SELF,
                },
                states: [1],
              },
            ],
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                  [ResourceType.IRON]: 2,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Arsenal',
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.IRON]: 1,
          },
        ],
        glory: 4,
        actions: [
          {
            id: '12-3-1',
            // label: 'Gain 1 Weapon for each Person in play.',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resource_per_card: {
                  amount: 1,
                  resource: ResourceType.WEAPON,
                  scope: TargetScope.BOARD,
                  tags: [CardTag.PERSON],
                },
              },
            ],
          },
        ],
      },
      {
        id: 4,
        name: 'Wall',
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.WEAPON]: 1,
          },
        ],
        glory: 3,
        passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      },
    ],
  },
  {
    id: 13,
    name: 'Swamp',
    states: [
      {
        id: 1,
        name: 'Swamp',
        tags: [CardTag.LAND],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 1,
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Accessible Swamp',
        tags: [CardTag.LAND],
        glory: 1,
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 1,
                  [ResourceType.GOLD]: 2,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Swamp Garden',
        tags: [CardTag.LAND],
        glory: 3,
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 2,
                  [ResourceType.GOLD]: 1,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 4,
        name: 'Exotic Fruit Trees',
        tags: [CardTag.LAND],
        glory: 4,
        productions: [
          {
            [ResourceType.GOODS]: 2,
          },
        ],
      },
    ],
  },
  {
    id: 14,
    name: 'Lake',
    states: [
      {
        id: 1,
        name: 'Lake',
        tags: [CardTag.LAND],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 1,
                  [ResourceType.STONE]: 2,
                },
              ],
            },
            upgradeTo: 2,
          },
          {
            cost: {
              resources: [
                {
                  [ResourceType.STONE]: 4,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 2,
        name: "Fisherman's Cabin",
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 1,
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Fishing Boat',
        tags: [CardTag.SEAFARING],
        productions: [
          {
            [ResourceType.GOLD]: 2,
          },
        ],
        glory: 1,
        actions: [
          {
            id: '14-3-1',
            // label: 'Discover Shore 75.',
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [75],
                },
              },
            ],
          },
        ],
      },
      {
        id: 4,
        name: 'Lighthouse',
        tags: [CardTag.BUILDING],
        glory: 5,
        passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
        actions: [
          {
            id: '14-4-1',
            // label: 'As long as this card is in play, you may discard the top card of your deck.',
            passive: true,
            actions: [
              {
                id: 1,
                type: ActionType.DISCARD_CARD,
                cards: {
                  scope: TargetScope.TOP_OF_DECK,
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 15,
    name: 'Stop',
    parchmentCard: true,
    states: [
      {
        id: 1,
        name: 'Stop',
        actions: [
          {
            id: '15-1-1',
            // label: 'Stop',
            trigger: Trigger.ON_DISCOVER,
            actions: [
              {
                id: 2,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [25],
                },
              },
              {
                id: 3,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [26],
                },
              },
              {
                id: 4,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [27],
                },
              },
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  ids: [24],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 16,
    name: 'Stop',
    parchmentCard: true,
    states: [
      {
        id: 1,
        name: 'Stop',
        actions: [
          {
            id: '16-1-1',
            // label: '',
            trigger: Trigger.ON_DISCOVER,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_STICKER,
                stickerIds: [1],
                cards: {
                  tags: [CardTag.LAND],
                },
              },
              {
                id: 2,
                type: ActionType.BOOST_CARD,
                cards: {
                  tags: [CardTag.BUILDING],
                },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 17,
    name: 'Army',
    permanent: true,
    states: [
      {
        id: 1,
        name: 'Army',
        track: {
          cumulative: false,
          inOrder: true,
          endsTurn: true,
          steps: [
            {
              id: 1,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 1,
                  },
                ],
              },
              onClick: {
                glory: 1,
              },
            },
            {
              id: 2,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 2,
                  },
                ],
              },
              onClick: {
                glory: 4,
              },
            },
            {
              id: 3,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 3,
                  },
                ],
              },
              onClick: {
                glory: 7,
              },
            },
            {
              id: 4,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 4,
                  },
                ],
              },
              onClick: {
                glory: 10,
              },
            },
            {
              id: 5,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 5,
                  },
                ],
              },
              onClick: {
                glory: 14,
              },
            },
            {
              id: 6,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 6,
                  },
                ],
              },
              onClick: {
                glory: 19,
              },
            },
            {
              id: 7,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 7,
                  },
                ],
              },
              onClick: {
                glory: 25,
              },
            },
            {
              id: 8,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 8,
                  },
                ],
              },
              onClick: {
                glory: 32,
              },
            },
            {
              id: 9,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 9,
                  },
                ],
              },
              onClick: {
                glory: 40,
              },
            },
            {
              id: 10,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 10,
                  },
                ],
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.DISCOVER_CARD,
                    cards: {
                      ids: [135],
                    },
                  },
                  {
                    id: 2,
                    type: ActionType.UPGRADE_CARD,
                    cards: {
                      scope: TargetScope.SELF,
                    },
                    states: [2],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        id: 2,
        name: 'Grand Army',
        glory: 50,
        track: {
          cumulative: false,
          inOrder: true,
          endsTurn: true,
          steps: [
            {
              id: 11,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 10,
                  },
                ],
              },
              onClick: {
                glory: 10,
              },
            },
            {
              id: 12,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 10,
                  },
                ],
              },
              onClick: {
                glory: 20,
              },
            },
            {
              id: 13,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 12,
                  },
                ],
              },
              onClick: {
                glory: 30,
              },
            },
            {
              id: 14,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 12,
                  },
                ],
              },
              onClick: {
                glory: 40,
              },
            },
            {
              id: 15,
              cost: {
                resources: [
                  {
                    [ResourceType.WEAPON]: 15,
                  },
                ],
              },
              onClick: {
                glory: 50,
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 18,
    name: 'Treasury',
    permanent: true,
    states: [
      {
        id: 1,
        name: 'Treasury',
        description: 'Store up those riches, you never know when you might need them!',
        track: {
          cumulative: false,
          inOrder: true,
          endsTurn: true,
          steps: [
            {
              id: 1,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 1,
                  },
                ],
              },
              onClick: {
                glory: 1,
              },
            },
            {
              id: 2,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 2,
                  },
                ],
              },
              onClick: {
                glory: 2,
              },
            },
            {
              id: 3,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 3,
                  },
                ],
              },
              onClick: {
                glory: 3,
              },
            },
            {
              id: 4,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 4,
                  },
                ],
              },
              onClick: {
                glory: 5,
              },
            },
            {
              id: 5,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 5,
                  },
                ],
              },
              onClick: {
                glory: 7,
              },
            },
            {
              id: 6,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 6,
                  },
                ],
              },
              onClick: {
                glory: 10,
              },
            },
            {
              id: 7,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 7,
                  },
                ],
              },
              onClick: {
                glory: 14,
              },
            },
            {
              id: 8,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 8,
                  },
                ],
              },
              onClick: {
                glory: 19,
              },
            },
            {
              id: 9,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 9,
                  },
                ],
              },
              onClick: {
                glory: 25,
              },
            },
            {
              id: 10,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 10,
                  },
                ],
              },
              onClick: {
                glory: 32,
              },
            },
            {
              id: 11,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 11,
                  },
                ],
              },
              onClick: {
                glory: 40,
              },
            },
            {
              id: 12,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 12,
                  },
                ],
              },
              onClick: {
                actions: [
                  {
                    id: 2,
                    type: ActionType.UPGRADE_CARD,
                    cards: {
                      scope: TargetScope.SELF,
                    },
                    states: [2],
                  },
                ],
              },
            },
          ],
        },
      },
      {
        id: 2,
        name: 'Extended Treasury',
        glory: 50,
        description: 'I want to be unreasonably rich and put King Midas to shame.',
        track: {
          cumulative: false,
          inOrder: true,
          endsTurn: true,
          steps: [
            {
              id: 13,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 13,
                  },
                ],
              },
              onClick: {
                glory: 10,
              },
            },
            {
              id: 14,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 14,
                  },
                ],
              },
              onClick: {
                glory: 20,
              },
            },
            {
              id: 15,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 15,
                  },
                ],
              },
              onClick: {
                glory: 30,
              },
            },
            {
              id: 16,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 16,
                  },
                ],
              },
              onClick: {
                glory: 40,
              },
            },
            {
              id: 17,
              cost: {
                resources: [
                  {
                    [ResourceType.GOLD]: 17,
                  },
                ],
              },
              onClick: {
                glory: 50,
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 19,
    name: 'Export',
    permanent: true,
    states: [
      {
        id: 1,
        name: 'Export',
        description: 'Make yourself invaluable for your neighbours, it will surely pay off.',
        actions: [
          {
            id: '19-1-1',
            passive: true,
            // label: 'Spend goods and keep track of how much you have spent.',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_CUMULATED,
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
            cost: {
              resources: [
                {
                  [ResourceType.GOODS]: 1,
                },
              ],
            },
          },
        ],
        track: {
          cumulative: true,
          inOrder: true,
          endsTurn: false,
          preround: true,
          steps: [
            {
              id: 1,
              // label: 'Sticker 1/2/3 on 1 land.',
              cost: {
                accumulated: 10,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [1, 2, 3],
                    cards: {
                      tags: [CardTag.LAND],
                    },
                  },
                ],
              },
            },
            {
              id: 2,
              // label: 'Sticker 7 on 1 person.',
              cost: {
                accumulated: 20,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [7],
                    cards: {
                      tags: [CardTag.PERSON],
                    },
                  },
                ],
              },
            },
            {
              id: 3,
              // label: 'Discover Dubing (86).',
              cost: {
                accumulated: 30,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.DISCOVER_CARD,
                    cards: {
                      ids: [86],
                    },
                  },
                ],
              },
            },
            {
              id: 4,
              // label: 'Sticker 4/5/6 on 1 building.',
              cost: {
                accumulated: 40,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [4, 5, 6],
                    cards: {
                      tags: [CardTag.BUILDING],
                    },
                  },
                ],
              },
            },
            {
              id: 5,
              // label: 'Sticker 2/3/4 on 1 friendly card.',
              cost: {
                accumulated: 55,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [2, 3, 4],
                    cards: {
                      scope: TargetScope.FRIENDLY,
                    },
                  },
                ],
              },
            },
            {
              id: 6,
              // label: 'Sticker 10 on any card.',
              cost: {
                accumulated: 75,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [10],
                    cards: {
                      scope: TargetScope.ANY,
                    },
                  },
                ],
              },
            },
            {
              id: 7,
              // label: 'Upgrade.',
              cost: {
                accumulated: 100,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.UPGRADE_CARD,
                    states: [2],
                    cards: {
                      scope: TargetScope.SELF,
                    },
                  },
                ],
              },
            },
          ],
        },
      },
      {
        id: 2,
        name: 'Extended Treasury',
        glory: 25,
        description: 'I want to be unreasonably rich and put King Midas to shame.',
        actions: [
          {
            id: '19-2-1',
            passive: true,
            // label: 'Spend goods and keep track of how much you have spent.',
            actions: [
              {
                id: 1,
                type: ActionType.ADD_CUMULATED,
                cards: {
                  scope: TargetScope.SELF,
                },
              },
            ],
            cost: {
              resources: [
                {
                  [ResourceType.GOODS]: 1,
                },
              ],
            },
          },
        ],
        track: {
          cumulative: false,
          inOrder: true,
          endsTurn: false,
          steps: [
            {
              id: 8,
              // label: 'Sticker 8 on 2 different lands.',
              cost: {
                accumulated: 50,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [8],
                    cards: {
                      tags: [CardTag.LAND],
                    },
                  },
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [8],
                    cards: {
                      tags: [CardTag.LAND],
                    },
                  },
                ],
              },
            },
            {
              id: 9,
              // label: 'Sticker 10 on 1 person.',
              cost: {
                accumulated: 50,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [10],
                    cards: {
                      tags: [CardTag.PERSON],
                    },
                  },
                ],
              },
            },
            {
              id: 10,
              // label: 'Discover Royal Visit (107).',
              cost: {
                accumulated: 75,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.DISCOVER_CARD,
                    cards: {
                      ids: [107],
                    },
                  },
                ],
              },
            },
            {
              id: 11,
              // label: 'Sticker 10 on 1 building.',
              cost: {
                accumulated: 100,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.ADD_STICKER,
                    stickerIds: [10],
                    cards: {
                      tags: [CardTag.BUILDING],
                    },
                  },
                ],
              },
            },
            {
              id: 12,
              // label: 'check 1 other permanent card, gain any effect.',
              cost: {
                accumulated: 150,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.TRACK_ADVANCE,
                    cards: {
                      scope: TargetScope.PERMANENTS,
                    },
                  },
                ],
              },
            },
            {
              id: 13,
              // label: 'check all other permanent cards you want.',
              cost: {
                accumulated: 200,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.TRACK_ADVANCE,
                    cards: {
                      scope: TargetScope.PERMANENTS,
                    },
                  },
                ],
              },
            },
            {
              id: 14,
              // label: 'Discover Trade Relations (117).',
              cost: {
                accumulated: 200,
              },
              onClick: {
                actions: [
                  {
                    id: 1,
                    type: ActionType.DISCOVER_CARD,
                    cards: {
                      ids: [117],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
  {
    id: 20,
    name: 'Mine',
    states: [
      {
        id: 1,
        name: 'Mine',
        tags: [CardTag.BUILDING],
        glory: 4,
        productions: [
          {
            [ResourceType.STONE]: 1,
            [ResourceType.IRON]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.WOOD]: 3,
                },
              ],
            },
            upgradeTo: 2,
          },
        ],
      },
      {
        id: 2,
        name: 'Deep Mine',
        tags: [CardTag.BUILDING],
        glory: 6,
        productions: [
          {
            [ResourceType.STONE]: 1,
            [ResourceType.IRON]: 2,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                  [ResourceType.WOOD]: 3,
                },
              ],
            },
            upgradeTo: 3,
          },
        ],
      },
      {
        id: 3,
        name: 'Ruby Mine',
        tags: [CardTag.BUILDING],
        glory: 9,
        productions: [
          {
            [ResourceType.STONE]: 1,
            [ResourceType.IRON]: 2,
            [ResourceType.GOODS]: 1,
          },
        ],
        upgrade: [
          {
            cost: {
              resources: [
                {
                  [ResourceType.GOLD]: 2,
                  [ResourceType.WOOD]: 2,
                  [ResourceType.STONE]: 2,
                },
              ],
            },
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 4,
        name: 'Diamond Mine',
        glory: 13,
        tags: [CardTag.BUILDING],
        productions: [
          {
            [ResourceType.STONE]: 1,
            [ResourceType.IRON]: 2,
            [ResourceType.GOODS]: 2,
          },
        ],
      },
    ],
  },
  // {
  //   id: 21,
  //   name: 'Shrine',
  //   states: [
  //     {
  //       id: 1,
  //       name: 'Shrine',
  //       tags: [CardTag.LAND],
  //       glory: 3,
  //       actions: [
  //         {
  //           // label: 'End of Turn: Discard to make 1 other card stay in play.',
  //           trigger: Trigger.END_TURN,
  //           optional: true,
  //           actions: [
  //             {
  //               id: 1,
  //               type: ActionType.ADD_BOARD_EFFECT,
  //               cards: {
  //                 scope: TargetScope.BOARD,
  //               },
  //               effect: {
  //                 // label: 'This card stays in play.',
  //               },
  //             },
  //           ],
  //         },
  //       ],
  //       upgrade: [
  //         {
  //           cost: {
  //             resources: [
  //               {
  //                 [ResourceType.GOLD]: 3,
  //               },
  //             ],
  //           },
  //           upgradeTo: 2,
  //         },
  //       ],
  //     },
  //     {
  //       id: 2,
  //       name: 'Sanctuary',
  //       tags: [CardTag.BUILDING],
  //       glory: 5,
  //       actions: [
  //         {
  //           // label: 'End of Turn: Discard to make 2 other cards stay in play.',
  //           trigger: Trigger.END_TURN,
  //           optional: true,
  //         },
  //       ],
  //       upgrade: [
  //         {
  //           cost: {
  //             resources: [
  //               {
  //                 [ResourceType.GOLD]: 3,
  //                 [ResourceType.STONE]: 2,
  //               },
  //             ],
  //           },
  //           upgradeTo: 3,
  //         },
  //       ],
  //     },
  //     {
  //       id: 3,
  //       name: 'Oratory',
  //       tags: [CardTag.BUILDING],
  //       glory: 9,
  //       actions: [
  //         {
  //           // label: 'End of Turn: Discard to make 3 other cards stay in play.',
  //           trigger: Trigger.END_TURN,
  //           optional: true,
  //         },
  //       ],
  //       upgrade: [
  //         {
  //           cost: {
  //             resources: [
  //               {
  //                 [ResourceType.GOLD]: 2,
  //                 [ResourceType.WOOD]: 2,
  //               },
  //             ],
  //           },
  //           upgradeTo: 4,
  //         },
  //       ],
  //     },
  //     {
  //       id: 4,
  //       name: 'Temple',
  //       tags: [CardTag.BUILDING],
  //       glory: 15,
  //       actions: [
  //         {
  //           // label: 'End of Turn: Discard to make 4 other cards stay in play.',
  //           trigger: Trigger.END_TURN,
  //           optional: true,
  //         },
  //       ],
  //     },
  //   ],
  // },
];
