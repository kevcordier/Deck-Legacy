import type { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
import type { ActionEffect } from '@engine/domain/types/Card';
import type { Resources } from '@engine/domain/types/Resource';

export type PendingChoice = {
  id: string;
  kind: ActionEffectType;
  type: PendingChoiceType;
  sourceInstanceId: number;
  targetInstanceId?: number;
  choices: (number | string | Resources | ActionEffect)[];
  pickMin: number;
  pickMax: number;
  isMandatory: boolean;
};
