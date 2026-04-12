import type { ActionType, ResourceType, TargetScope } from '@engine/domain/enums';
import type { Resources } from '@engine/domain/types/Resource';

export interface Action {
  id: number;
  type: ActionType;
  cards?: CardeSelector;
  resources?: {
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
  states?: number[];
  stickerIds?: number[];
  resource_per_card?: {
    amount: number;
    resource: ResourceType;
  } & CardeSelector;
}

export type CardeSelector = {
  number?: number;
  ids?: number[];
  tags?: string[];
  scope?: TargetScope;
  label?: string;
  produces?: ResourceType[];
};

export type ResolvedAction = {
  id: string;
  type: ActionType;
  sourceInstanceId: number;
  instanceId?: number;
  resources?: Resources;
  stickerId?: number;
  stateId?: number;
  position?: number;
};
