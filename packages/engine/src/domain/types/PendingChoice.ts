import type { ActionEffectType, PendingChoiceType } from '../enums';
import type { ActionEffect, RemovedResourceScope } from './Card';
import type { Resources } from './Resource';

export type PendingChoice = {
  id: string;
  actionId?: string;
  effectId?: number;
  sourceStepId?: number;
  kind: ActionEffectType;
  type: PendingChoiceType;
  sourceInstanceId: number;
  targetInstanceId?: number;
  choices: (number | string | Resources | ActionEffect)[];
  selectedChoices?: Resources[];
  resourceScopes?: RemovedResourceScope[];
  /** SPLIT_RESOURCES: how many resources to pay in total. */
  total?: number;
  pickMin: number;
  pickMax: number;
  isMandatory: boolean;
};
