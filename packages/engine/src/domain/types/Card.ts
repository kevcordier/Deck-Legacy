import type { Cost, GameParameters, Resources } from '.';
import type {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '../enums';

export type Condition =
  | { type: 'cardCount'; cards: CardSelector; min?: number; max?: number }
  | { type: 'production'; resourceType: ResourceType; min?: number; max?: number }
  | { type: 'resource'; resourceType: ResourceType; min?: number; max?: number }
  | { type: 'and'; conditions: Condition[] }
  | { type: 'or'; conditions: Condition[] }
  | { type: 'not'; condition: Condition }
  // true while this expansion is played (selected and its score not saved yet)
  | { type: 'expansionActive'; name: string }
  // accumulation (`cumulated`) of the card owning the condition
  | { type: 'accumulation'; min?: number; max?: number }
  // the card owning the condition is one of the cards just played (drawn or played by an effect)
  | { type: 'justPlayed' };

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
  limitedTime?: number; // max number of uses for this action
  condition?: Condition; // checked when the trigger fires, or before the action is used
  defeat?: boolean; // the action defeats an enemy: fires ON_DEFEAT triggers once resolved
  // the trigger also fires while this card is in play when a card matching this selector causes
  // it (scope DRAWN = the cards just played, DISCARDED = the cards just discarded)
  triggeredBy?: CardSelector;
};

export type ValuePerElement = {
  amount: number;
  cards?: CardSelector;
  productionTotal?: ResourceType;
  accumulation?: boolean;
  ownProduction?: boolean; // total production of the card itself
  deficitTarget?: number; // count = max(0, deficitTarget - actual_count)
  includeSelf?: boolean; // "including this": the card counts too, even once discarded by its action
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
  states?: StateSelector;
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
  sourceStepId?: number;
  repeat?: number | 'accumulation'; // number of times this action will be repeated
  condition?: Condition; // checked when the effect resolves: skipped when it does not hold
  sourceInstanceId?: number; // card the effect resolves for, when not the acting card (USE_CARD_ACTION)
  usedAction?: { instanceId: number; actionId: string }; // USE_CARD_ACTION: the chosen action
};

export type Passive = {
  id: string;
  type: PassiveType;
  amount?: number;
  cards?: CardSelector;
  resources?: {
    gold?: number;
    wood?: number;
    stone?: number;
    iron?: number;
    weapon?: number;
    goods?: number;
  };
  glory?: number;
  stickerIds?: number[];
  valuePerElement?: ValuePerElement;
  condition?: Condition;
  options?: unknown[];
  parameters?: Partial<GameParameters>;
};

export type Having = {
  minGlory?: number;
  maxGlory?: number;
  minProduction?: number;
  maxProduction?: number;
  minStickers?: number;
  maxStickers?: number;
};

export type CardSelector = {
  ids?: number[];
  tags?: CardTag[];
  scope?: TargetScope[];
  lastSelectedIds?: number[];
  name?: string;
  label?: string;
  produces?: ResourceType[];
  having?: Having;
  pickNumber?: number;
  pickMin?: number;
  pickMax?: number;
  autoPick?: boolean;
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
    any?: number;
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

export type StateSelector = {
  ids?: number[];
  having?: Having;
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
  unresolvable?: boolean;
};
