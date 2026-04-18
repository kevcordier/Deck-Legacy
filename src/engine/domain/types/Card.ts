import type {
  ActionType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@engine/domain/enums';
import type { Cost, Resources } from '@engine/domain/types';

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
  label?: string;
  cost: Cost;
  onClick: {
    actions?: Action[];
    glory?: number;
  };
};

export type TrackDef = {
  steps: StepDef[];
  inOrder: boolean;
  cumulative: boolean;
  endsTurn: boolean;
  preround?: boolean;
};

export type CardState = {
  id: number;
  name: string;
  tags?: CardTag[];
  description?: string;
  negative?: boolean;
  productions?: Resources[];
  glory?: number;
  actions?: CardAction[];
  passives?: Passive[];
  triggers?: Trigger[];
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
  actions: Action[];
  passive?: boolean;
  cost?: Cost;
  endsTurn?: boolean;
  trigger?: Trigger;
  optional?: boolean;
};

export type Action = {
  id: number;
  type: ActionType;
  cards?: CardeSelector;
  numberOfTimes?: number;
  resources?: ResourceSelector;
  states?: number[];
  stickerIds?: number[];
  resourcePerCard?: {
    amount: number;
    resource: ResourceType;
    scope?: TargetScope;
    tags?: string[];
    ids?: number[];
  };
  effect?: Passive;
};

export type Passive = {
  id: string;
  type: PassiveType;
  cards?: CardeSelector;
  onPlayCards?: CardeSelector;
  resources?: {
    gold?: number;
    wood?: number;
    stone?: number;
    food?: number;
    iron?: number;
    weapon?: number;
    goods?: number;
  };
  states?: number[];
  stickerIds?: number[];
  resourcePerCard?: {
    amount: number;
    resource: ResourceType;
    cards: CardeSelector;
  };
};

export type CardeSelector = {
  number?: number;
  ids?: number[];
  tags?: string[];
  scope?: TargetScope;
  label?: string;
  produces?: ResourceType[];
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

export type ResolvedAction = {
  id: string;
  type: ActionType;
  sourceInstanceId: number;
  instanceId?: number;
  instanceIds?: number[];
  effect?: Passive;
  resources?: Resources;
  stickerId?: number;
  stateId?: number;
  position?: number;
};
