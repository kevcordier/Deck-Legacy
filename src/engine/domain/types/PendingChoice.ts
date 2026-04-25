import type { ActionEffectType, PendingChoiceType } from '@engine/domain/enums';
import type { Resources } from '@engine/domain/types/Resource';

export type PendingChoice = {
  id: string;
  kind: ActionEffectType;
  type: PendingChoiceType;
  sourceInstanceId: number;
  targetInstanceId?: number;
  choices: (number | string | Resources)[];
  pickCount: number;
  pickMin?: number;
  pickMax?: number;
  isMandatory: boolean;
};
