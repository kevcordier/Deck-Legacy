import type { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
import type { ActionEffect, RemovedResourceScope } from '@engine/domain/types/Card';
import type { Resources } from '@engine/domain/types/Resource';

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
