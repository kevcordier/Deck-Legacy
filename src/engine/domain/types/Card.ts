import type { CardTag, Trigger } from '@engine/domain/enums';
import type { Cost, Action, Resources } from '@engine/domain/types';

export type CardDef = {
  id: number;
  name: string;
  permanent?: boolean;
  chooseState?: boolean; // le joueur choisit l'état au moment de la découverte
  states: CardState[];
  parchmentCard?: boolean;
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
  upgradeTo: number; // id d'un state dans la même carte
};
