import type {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { Cost, Resources } from '@engine/domain/types';

export type Condition =
  | { type: 'cardCount'; cards: CardeSelector; min?: number; max?: number }
  | { type: 'production'; resourceType: ResourceType; min?: number; max?: number }
  | { type: 'and'; conditions: Condition[] }
  | { type: 'or'; conditions: Condition[] }
  | { type: 'not'; condition: Condition };

export type CardDef = {
  id: number;
  name: string;
  permanent?: boolean;
  chooseState?: boolean; // the player chooses the state at discovery time
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
};

export type CardState = {
  id: number;
  name: string;
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
  resource?: ResourceType[];
  cards?: CardeSelector;
  productionTotal?: ResourceType;
  accumulation?: boolean;
  deficitTarget?: number; // count = max(0, deficitTarget - actual_count)
};

export type ActionEffect = {
  id: number;
  type: ActionEffectType;
  cards?: CardeSelector;
  resources?: ResourceSelector;
  accumulated?: number;
  states?: number[];
  stickerIds?: number[];
  valuePerElement?: ValuePerElement;
  effect?: Passive;
  pickNumber?: number;
  pickMin?: number;
  pickMax?: number;
  effects?: ActionEffect[];
};

export type Passive = {
  id: string;
  type: PassiveType;
  cards?: CardeSelector;
  trigger?: {
    type: Trigger;
    cards?: CardeSelector;
    actions?: ActionEffect[];
  };
  resources?: {
    gold?: number;
    wood?: number;
    stone?: number;
    food?: number;
    iron?: number;
    weapon?: number;
    goods?: number;
  };
  glory?: number;
  states?: number[];
  stickerIds?: number[];
  valuePerElement?: ValuePerElement;
  condition?: Condition;
};

export type Having = {
  minGlory?: number;
  maxGlory?: number;
};

export type CardeSelector = {
  ids?: number[];
  tags?: CardTag[];
  scope?: TargetScope[];
  name?: string;
  label?: string;
  produces?: ResourceType[];
  having?: Having;
};

export type CountedCardSelector = CardeSelector & {
  number?: number;
};

export type ResourceSelector = {
  gold?: number;
  wood?: number;
  stone?: number;
  food?: number;
  iron?: number;
  weapon?: number;
  goods?: number;
  choice?: {
    gold?: number;
    wood?: number;
    stone?: number;
    food?: number;
    iron?: number;
    weapon?: number;
    goods?: number;
  }[];
  cards?: CardeSelector;
};

export type ResolvedActionEffect = {
  id: string;
  type: ActionEffectType;
  sourceInstanceId: number;
  instanceIds?: number[];
  effect?: Passive;
  resources?: Resources;
  stickerId?: number;
  stateId?: number;
  position?: number;
  stepIds?: number[];
  accumulated?: number;
  newActionEffects?: ActionEffect[];
};
