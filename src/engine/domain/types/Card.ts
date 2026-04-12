import type { CardTag, Trigger } from '@engine/domain/enums';
import type { Action, Cost, Resources } from '@engine/domain/types';

export type CardDef = {
  id: number;
  name: string;
  permanent?: boolean;
  chooseState?: boolean; // the player chooses the state at discovery time
  states: CardState[];
  parchmentCard?: boolean;
  text?: string;
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
  stayInPlay?: boolean;
  cardEffects?: Effect[];
  upgrade?: UpgradeDef[];
  track?: TrackDef;
  illustration?: string;
};

export type Effect = {
  label: string;
  description?: string;
  actions: Action[];
  passive?: boolean;
  cost?: Cost;
  endsTurn?: boolean;
  trigger?: Trigger;
  optional?: boolean;
};

export type UpgradeDef = {
  cost: Cost;
  upgradeTo: number; // id of a state within the same card
};
