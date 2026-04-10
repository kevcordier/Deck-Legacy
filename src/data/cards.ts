import type { CardDef } from '@engine/domain/types';
import { ResourceType, CardTag, Trigger, ActionType, TargetScope } from '@engine/domain/enums';

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
        cardEffects: [
          {
            label: 'Discard a friendly card to gain 2 gold.',
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
        stayInPlay: true,
        productions: [
          {
            [ResourceType.GOLD]: 2,
          },
        ],
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
        cardEffects: [
          {
            label: 'Spend 1 gold to gain 2 stones.',
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
        cardEffects: [
          {
            label: 'Discover Mine (84/85).',
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
        cardEffects: [
          {
            label: 'Gain 3 woods, then upgrade.',
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
        cardEffects: [
          {
            label: 'Discover Shrine (82/83).',
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
        cardEffects: [
          {
            label: 'Play 1 Land from discard pile.',
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
        cardEffects: [
          {
            label: 'Play 1 Land or Building from discard pile.',
            actions: [
              {
                id: 1,
                type: ActionType.PLAY_CARD,
                cards: {
                  number: 1,
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
        cardEffects: [
          {
            label: 'Play 1 card from discard pile.',
            actions: [
              {
                id: 1,
                type: ActionType.PLAY_CARD,
                cards: {
                  number: 1,
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
        cardEffects: [
          {
            label: 'Spend 1 gold to gain 1 Wood.',
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
        cardEffects: [
          {
            label: 'Spend 1 gold to gain 1 Wood or Stone.',
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
        cardEffects: [
          {
            label: 'Spend 1 gold to gain 1 Wood, Stone, or Iron.',
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
        cardEffects: [
          {
            label: 'Spend 1 gold to gain 1 Wood.',
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
        cardEffects: [
          {
            label: 'Spend 1 gold to gain 2 Wood.',
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
        stayInPlay: true,
        productions: [
          {
            [ResourceType.GOLD]: 1,
            [ResourceType.WOOD]: 2,
          },
        ],
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
        cardEffects: [
          {
            label: 'Discover a new region (71/72/73/74). Then upgrade.',
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  number: 1,
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
        cardEffects: [
          {
            label: 'Choose a Land in play. Gain its productions as resources.',
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
      {
        id: 2,
        name: 'Servant',
        tags: [CardTag.PERSON],
        cardEffects: [
          {
            label: 'Gain 1 Gold/Wood/Stone.',
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
        cardEffects: [
          {
            label: 'When played, blocks 1 card with gold productions.',
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
            label: 'Spend 1 weapon to defeat (destroy this card) and gain any 2 resources.',
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
        cardEffects: [
          {
            label: 'Choose a Building in play. Gain its productions as resources.',
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
        cardEffects: [
          {
            label: 'When played, blocks 1 card with gold productions.',
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
            label: 'Spend 1 weapon to defeat (destroy this card) and gain any 2 resources.',
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
        cardEffects: [
          {
            label: 'Choose a Land in play. Gain its productions as resources.',
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
        cardEffects: [
          {
            label: 'Spend 3 gold to discover a Missionary (103).',
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
                  number: 1,
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
        cardEffects: [
          {
            label: 'Spend 4 gold to discover a Priest (104).',
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
                  number: 1,
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
        cardEffects: [
          {
            label: 'This card has +1 gold production for each person you have in play.',
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
        cardEffects: [
          {
            label: 'Reset to discover Jewellery (90).',
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  number: 1,
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
        cardEffects: [
          {
            label: 'Gain 1 Weapon for each Person in play.',
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
        stayInPlay: true,
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
        cardEffects: [
          {
            label: 'Discover Shore 75.',
            actions: [
              {
                id: 1,
                type: ActionType.DISCOVER_CARD,
                cards: {
                  number: 1,
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
        stayInPlay: true,
        cardEffects: [
          {
            label: 'As long as this card is in play, you may discard the top card of your deck.',
            description:
              'As long as this card is in play, you may discard the top card of your deck. You may do this repeatedly, and this card is not discarded by doing so.',
            passive: true,
            actions: [
              {
                id: 1,
                type: ActionType.DISCARD_CARD,
                cards: {
                  number: 1,
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
    text: `
## Stop! 
Now that you have got the hang of the game, you may reset to start again if you like to give it your best shot. If you continue, you will discover 4 cards, cards 24-27. Look at them now and THEN decide if you want to restart or continue.

Cards 25, 26, and 27 are **permanent** cards, meaning they are never shuffled into your deck and cannot be discarded. They are always visible and active, but are not counted as "in play"

The Army and Treasury are track cards. They let you spend your turn ({{time}}) and resources ({{weapon}}/{{gold}}) to gain fame . Export is a tally card. It doesn't end your turn ({{passif}}) and lets you spend trade goods ({{goods}}) to gain stickers, new cards, and other cool effects.

You will not be able to complete all tracks before the game ends. Try to get as far as possible!
    `,
    states: [
      {
        id: 1,
        name: 'Stop',
        cardEffects: [
          {
            label: 'Stop',
            description:
              'Now that you have got the hang of the game, you may reset to start again if you like to give it your best shot. If you continue, you will discover 4 cards, cards 24-27. Look at them now and THEN decide if you want to restart or continue. After this card comes the legacy part of the game, where some cards will permanently change over the course of the game. You will not be able to reset the game once you continue down this road.',
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
    text: `
## Fertile Soil 

This land seems to grow anything you put into the ground.

Add sticker 1 ({{gold}}) as production to a land.

## Efficiency 

You're getting the hang of this!

Choose 1 **building** and **boost** its production (add a resource sticker to it to make it produce 1 more of a resource it already produces. Resource stickers are numbered 1-6 on the sticker sheet).

(Reminder: When discovering a parchment card like this, follow all its instructions, then destroy this.)
    `,
    states: [
      {
        id: 1,
        name: 'Stop',
        cardEffects: [
          {
            label: 'Fertile Soil',
            description:
              'This land seems to grow anything you put into the ground. Add sticker 1 (Gold) as production to a land.',
            trigger: Trigger.ON_DISCOVER,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_STICKER,
                stickerId: 1,
                cards: {
                  number: 1,
                  tags: [CardTag.LAND],
                },
              },
            ],
          },
          {
            label: 'Efficiency',
            description:
              "You're getting the hang of this! Choose 1 building and boost its production (add a resource sticker to it to make it produce 1 more of a resource it already produces. Resource stickers are numbered 1-6 on the sticker sheet).",
            trigger: Trigger.ON_DISCOVER,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_STICKER,
                stickerId: 'boost',
                cards: {
                  number: 1,
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
                      number: 1,
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
              id: 1,
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
              id: 2,
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
              id: 3,
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
              id: 4,
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
              id: 5,
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
];
