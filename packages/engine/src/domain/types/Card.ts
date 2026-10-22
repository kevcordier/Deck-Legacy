import type { Cost, GameParameters, Resources, StickerStock } from '.';
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
  whenPurged?: number; // "* worth −5 when purged": the glory of the card in a purge
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
  perTurn?: number; // max number of uses each turn ("once per turn")
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
  per?: number; // "for every N": the count is divided by N (rounded down)
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
  position?: number | 'top' | 'bottom' | 'index'; // 'index': before the first card with a higher id ("undiscover")
  effects?: ActionEffect[];
  steps?: {
    pickNumber?: number;
    pickMin?: number;
    pickMax?: number;
    ids?: number[]; // the steps that can be marked (Siege Tower: a green box)
  };
  sourceStepId?: number;
  // number of times this action will be repeated; 'valuePerElement': its count (the copies drop it)
  repeat?: number | 'accumulation' | 'valuePerElement';
  condition?: Condition; // checked when the effect resolves: skipped when it does not hold
  sourceInstanceId?: number; // card the effect resolves for, when not the acting card (USE_CARD_ACTION)
  usedAction?: { instanceId: number; actionId: string }; // USE_CARD_ACTION: the chosen action
  unlock?: Unlock; // UNLOCK: what a foundation brings
};

export type Unlock = {
  stickers?: StickerStock;
  resources?: ResourceType[];
};

export type Passive = {
  id: string;
  type: PassiveType;
  amount?: number;
  cards?: CardSelector;
  resources?: Resources;
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
  random?: boolean; // picks `pickNumber` cards at random (seeded: replayed identically)
  each?: boolean; // the effect is repeated for each matching card ("each land in play")
  fullyUpgraded?: boolean; // the card has no upgrade left
  topOfDeck?: number; // among the first cards of the deck, the player choosing (Air Balloons)
  stickerIds?: number[]; // the card carries one of these stickers (its current state)
  withoutStickerIds?: number[]; // the card carries none of these stickers
};

export type ResourceSelector = Resources & {
  choice?: (Resources & { any?: number })[];
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
  position?: number | 'top' | 'bottom' | 'index';
  stepIds?: number[];
  resourceScopes?: RemovedResourceScope[];
  newActionEffects?: ActionEffect[];
  value?: number;
  unlock?: Unlock;
  crossedOutAction?: { instanceId: number; actionId: string };
  unresolvable?: boolean;
};
