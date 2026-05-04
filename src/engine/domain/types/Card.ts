import type {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { Cost, GameParameters, Resources } from '@engine/domain/types';

export type Condition =
  | { type: 'cardCount'; cards: CardSelector; min?: number; max?: number }
  | { type: 'production'; resourceType: ResourceType; min?: number; max?: number }
  | { type: 'and'; conditions: Condition[] }
  | { type: 'or'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };

export type CardDef = {
  id: number;
  name: string;
  chooseState?: number[]; // explicit list of state ids available at discovery time
  states: CardState[];
  parchmentCard?: boolean;
};

export type StepDef = {
  id: number;
  cost?: Cost;
  effects?: ActionEffect[];
  icon?: string;
};

export type TrackDef = {
  steps: StepDef[];
  inOrder: boolean;
  vertical?: boolean;
  inverse?: boolean;
};

export type GloryDef = {
  amount: number;
  valuePerElement?: ValuePerElement;
  condition?: Condition;
  emptyValues?: number;
};

export type CardState = {
  id: number;
  name: string;
  permanent?: boolean;
  chooseName?: boolean; // if true, the player can choose a name on the card
  tags?: CardTag[];
  negative?: boolean;
  productions?: Resources[];
  glory?: GloryDef;
  actions?: CardAction[];
  passives?: Passive[];
  upgrade?: UpgradeDef[];
  track?: TrackDef;
  illustration?: string;
  description?: boolean; // if true, the card has a description text that needs to be displayed in the UI
};

export type UpgradeDef = {
  cost: Cost;
  upgradeTo: number; // id of a state within the same card
};

export type CardAction = {
  id: string;
  actionEffects: ActionEffect[];
  unlimited?: boolean;
  cost?: Cost;
  endsTurn?: boolean;
  trigger?: Trigger;
  optional?: boolean;
  onTime?: boolean; // if true, the action is usable only one time then disappears
};

export type ValuePerElement = {
  amount: number;
  cards?: CardSelector;
  productionTotal?: ResourceType;
  accumulation?: boolean;
  deficitTarget?: number; // count = max(0, deficitTarget - actual_count)
};

export type RemovedResourceScope = 'production' | 'actionCost' | 'upgradeCost';
export type DeckTarget = 'draw' | 'discard' | 'discovery';

export type ActionEffect = {
  id: number;
  type: ActionEffectType;
  payingCost?: boolean;
  deck?: DeckTarget;
  cards?: CardSelector;
  resources?: ResourceSelector;
  value?: number;
  states?: number[];
  stickers?: StickerSelector;
  valuePerElement?: ValuePerElement;
  resourceScopes?: RemovedResourceScope[];
  effect?: Passive;
  position?: number | 'top' | 'bottom';
  effects?: ActionEffect[];
  steps?: {
    pickNumber?: number;
    pickMin?: number;
    pickMax?: number;
  };
};

export type Passive = {
  id: string;
  type: PassiveType;
  amount?: number;
  global?: boolean;
  cards?: CardSelector;
  trigger?: {
    type: Trigger;
    cards?: CardSelector;
    actions?: ActionEffect[];
  };
  resources?: {
    gold?: number;
    wood?: number;
    stone?: number;
    iron?: number;
    weapon?: number;
    goods?: number;
  };
  glory?: number;
  states?: number[];
  stickerIds?: number[];
  valuePerElement?: ValuePerElement;
  condition?: Condition;
  options?: unknown[];
  parameters?: Partial<GameParameters>;
};

export type Having = {
  minGlory?: number;
  maxGlory?: number;
};

export type CardSelector = {
  ids?: number[];
  tags?: CardTag[];
  scope?: TargetScope[];
  name?: string;
  label?: string;
  produces?: ResourceType[];
  having?: Having;
  pickNumber?: number;
  pickMin?: number;
  pickMax?: number;
};

export type ResourceSelector = {
  gold?: number;
  wood?: number;
  stone?: number;
  iron?: number;
  weapon?: number;
  goods?: number;
  choice?: {
    gold?: number;
    wood?: number;
    stone?: number;
    iron?: number;
    weapon?: number;
    goods?: number;
  }[];
  cards?: CardSelector;
  pickNumber?: number;
  pickMin?: number;
  pickMax?: number;
};

export type StickerSelector = {
  ids?: number[];
  pickNumber?: number;
  pickMin?: number;
  pickMax?: number;
};

export type ResolvedActionEffect = {
  id: string;
  type: ActionEffectType;
  sourceInstanceId: number;
  payingCost?: boolean;
  deck?: DeckTarget;
  instanceIds?: number[];
  effect?: Passive;
  resources?: Resources;
  stickerIds?: number[];
  stateId?: number;
  position?: number | 'top' | 'bottom';
  stepIds?: number[];
  resourceScopes?: RemovedResourceScope[];
  newActionEffects?: ActionEffect[];
  value?: number;
};
