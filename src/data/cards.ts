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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/6d09374f-b960-4b6b-a2b7-27402db0dc25/width=450,quality=90/01612-3845234348.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/ea5be381-3332-462c-b5aa-bf8e03a75814/width=450,quality=90/32A3CA7B52F85F1F6336A4F00BA8A0AEA3AD12AF2B49E2F45F8245CF1A6235C9.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1ccb9805-79c6-4fbf-9956-1f836a249e5c/width=450,quality=90/HZ283XYYHS6XG3QG47CT1B0EJ0.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/69f4028b-f52a-4243-afcc-55a038210221/width=450,quality=90/00040-1126433715.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0e18ba94-f431-433a-9569-1d38cf978d97/width=450,quality=90/00533-1442497315.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/91754d5e-54e3-40d3-942f-445a3724bde0/width=450,quality=90/C5B77689692C7248558CEF3DB8DE191F008F1E70177D4D34BB205F3887C6BFDC.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/bb398332-8a0d-4a6f-9757-82ad98d69f24/width=450,quality=90/SNE1X41SFDY147PY0HN1068XE0?sig=CfDJ8J868rbHQQlNuTOL2qbAsuS8128hQnVA7sW5n5sZVPhGH2YDUXnnme4xI7TjGw-qRgzDiJBA--GXM99V3FTYUVvxCM8sYgmsLgYNWzOG2f0Ks2cQukChYnEmwwbmclxgcTESIbHGkrqYsnVk4hyTNjDBkAAtTgjAmzr9I_E8vHQgQBwB2aNWcUhFfCpF1xUDj5MWqDgUh78TN74N2O66lfXzlS8LHXLA7mt3j41ZbkWUZig-QR-e__koTOILBoV4C0aCtAuTke4fAJqBV04wKmFqo7rgpmvUNIeH-QDCGcJM&exp=2026-09-16T11:38:25.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b4c3bd3b-0202-4f39-8c35-e329d17eb41d/width=450,quality=90/2026-02-05-125447_flux_0.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/1d7adfad-280d-4cc5-8c88-97f3a42cb7b5/anim=false,width=450,optimized=true/8088900BBA42AB5468EFEAE413FD1584F4F2ED2F8DB7A12E06D3E3E1E945503D.jpeg',
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
        illustration:
          'https://www.azolifesciences.com/image-handler/ts/20200320043042/ri/673/picture/2020/3/shutterstock_569562037.jpg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/289541b5-4f30-4dba-936f-68502266080f/width=450,quality=90/00079-3523319267.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a4fa3901-a970-4c5b-8e43-002c66fded99/width=450,quality=90/00084.jpeg',
        glory: 2,
        actions: [
          {
            id: '3-4-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/5a04b232-0a88-4b5c-97ae-399aa109b3d4/width=450,quality=90/1P7KP4HEYR2NJQ5T54PVHXF4A0.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e33f38e6-50a1-45b8-832a-7d1c07d405cb/width=450,quality=90/5M4AR3T0ACAWE2Q7TEEK1ZFK80.jpeg',
        glory: 3,
        actions: [
          {
            id: '4-2-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/83d38c62-35ff-41e5-917c-df91b3b7c4e0/width=450,quality=90/9BBA545BFEBB64D6E822FBC2DBDBB43070FFC4E76475DAB0A070380A9A229A41.jpeg',
        glory: 7,
        actions: [
          {
            id: '4-3-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/39e939dc-f7c2-449c-bbd5-2d3e33d5dc5e/width=450,quality=90/00049-2184064133.jpeg',
        glory: 12,
        actions: [
          {
            id: '4-4-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a3c75bb9-fce0-4f97-835b-bab57310e6d3/width=450,quality=90/cyberxl21_41.jpeg',
        actions: [
          {
            id: '5-1-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/90745e0d-7ca2-417d-9453-579e41b10885/anim=false,width=450,optimized=true/00006-3168783046.jpeg',
        glory: 1,
        actions: [
          {
            id: '5-2-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/72551fc7-1c5d-4693-b553-0f08265c85b2/width=450,quality=90/7AJB24JBKRCX20WQGBAC85VPQ0.jpeg',
        glory: 3,
        actions: [
          {
            id: '5-3-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/e6224f49-a89d-4180-8ac3-2264855ced51/width=450,quality=90/00013-2617315028.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d189302c-ea8e-444f-80ab-e64415e97789/anim=false,width=450,optimized=true/00312-841554700.jpeg',
        actions: [
          {
            id: '6-1-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/56def3aa-dfb9-4cb8-66b9-a7832a433200/anim=false,width=450,optimized=true/311658.jpeg',
        actions: [
          {
            id: '6-2-1',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/d5c28b95-a4e0-4904-9651-be5379577fb9/anim=false,width=450,optimized=true/775F1ECF5D20E5A39C93164302B69062A32D6ECAB4E710A536DEDB267CE1D2F8.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8ac9e087-8d36-49b6-8f02-9d422c10faa1/width=450,quality=90/00004-4001576903.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/eea05c7b-ba60-4dc7-269a-a60c100c3200/width=450,quality=90/303606.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/84fe0ac9-bf08-43a1-ace2-d8a3bb7e031c/width=450,quality=90/917C9432AD8F6E1400F86041E08556D6B4CEE45B81C1978436B7CA303EF933E1.jpeg',
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
        illustration:
          'https://assets.lummi.ai/assets/QmPYBqiJxrZNah6ePyGB78vngDTtkUwzgSv1yoEAGNa1a5?auto=format&w=1500',
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
        illustration:
          'https://assets.lummi.ai/assets/QmRN7MxixVDs23HevqGV7pmr9GMAZCcB67NhXpNRcBArp6?auto=format&w=1500',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a6fb5b03-1fa4-4cda-9387-a7c69c29d745/anim=false,width=450,optimized=true/00333-2099362640.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/9f3f38ed-1c0a-413d-8a60-862efc680b99/anim=false,width=450,optimized=true/servant%20male%201%20photoMovieX.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2f2966e7-17b9-418c-b5ec-842f368f390d/width=450,quality=90/bandit%204%20epic.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/649b5682-509e-4cbd-bdb7-7ca61511aa7c/anim=false,width=450,optimized=true/RBB7BJW5YGRBW6WY6P5MTZM1N0.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/2f2966e7-17b9-418c-b5ec-842f368f390d/width=450,quality=90/bandit%204%20epic.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/a6fb5b03-1fa4-4cda-9387-a7c69c29d745/anim=false,width=450,optimized=true/00333-2099362640.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0bd7af9f-e425-4ea7-a8a7-eb89823a3e80/anim=false,width=450,optimized=true/00110-3590513962.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/4f400b8e-4ffd-4916-45fc-fe70f9617b00/width=450,quality=90/191194.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/06e9ad48-aa32-475d-a4a7-a4b079629dd1/anim=false,width=450,optimized=true/00024-1545763525.jpeg',
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/8e57ba5b-479a-402f-5963-ae2e0275ed00/anim=false,width=450,optimized=true/02136-1053066258-modelshoot%20style,%20(extremely%20detailed%20CG%20unity%208k%20wallpaper),%20full%20shot%20body%20photo%20of%20the%20most%20beautiful%20artwork%20in%20the%20world,%20e.jpeg',
        productions: [
          {
            [ResourceType.GOLD]: 1,
          },
        ],
        glory: 7,
        passives: [
          {
            id: 'increase_production',
            type: PassiveType.INCREASE_PRODUCTION,
            cards: {
              scope: TargetScope.SELF,
            },
            resourcePerCard: {
              resource: ResourceType.GOLD,
              amount: 1,
              cards: {
                scope: TargetScope.BOARD,
                tags: [CardTag.PERSON],
              },
            },
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
        illustration:
          'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/0b355473-abc7-45b7-8454-f9fcc0767d43/width=450,quality=90/PRQ3CTSP15QFNGQN1ZYVTJ0DN0.jpeg',
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
            actions: [
              {
                id: 1,
                type: ActionType.ADD_RESOURCES,
                resourcePerCard: {
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
  {
    id: 21,
    name: 'Shrine',
    states: [
      {
        id: 1,
        name: 'Shrine',
        tags: [CardTag.LAND],
        glory: 3,
        actions: [
          {
            id: '21-1-1',
            trigger: Trigger.END_TURN,
            optional: true,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
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
        name: 'Sanctuary',
        tags: [CardTag.BUILDING],
        glory: 5,
        actions: [
          {
            id: '21-2-1',
            trigger: Trigger.END_TURN,
            optional: true,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
              {
                id: 2,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
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
        name: 'Oratory',
        tags: [CardTag.BUILDING],
        glory: 9,
        actions: [
          {
            id: '21-3-1',
            trigger: Trigger.END_TURN,
            optional: true,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
              {
                id: 2,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
              {
                id: 3,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
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
            upgradeTo: 4,
          },
        ],
      },
      {
        id: 4,
        name: 'Temple',
        tags: [CardTag.BUILDING],
        glory: 15,
        actions: [
          {
            id: '21-4-1',
            trigger: Trigger.END_TURN,
            optional: true,
            actions: [
              {
                id: 1,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
              {
                id: 2,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
              {
                id: 3,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
              {
                id: 3,
                type: ActionType.ADD_BOARD_EFFECT,
                cards: {
                  scope: TargetScope.BOARD,
                },
                effect: {
                  ...CardPassives[PassiveType.STAY_IN_PLAY],
                  cards: {
                    scope: TargetScope.SELF,
                  },
                },
              },
            ],
          },
        ],
      },
    ],
  },
];
