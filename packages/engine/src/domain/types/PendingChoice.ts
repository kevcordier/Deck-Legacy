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
  pickMin: number;
  pickMax: number;
  isMandatory: boolean;
};
