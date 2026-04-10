import type { ActionType, PendingChoiceType } from '@engine/domain/enums';
import type { Resources } from '@engine/domain/types/Resource';

export type PendingChoice = {
  id: string;
  kind: 'PRODUCTION' | 'COST' | ActionType;
  type: PendingChoiceType;
  sourceInstanceId: number;
  choices: (number | string | Resources)[];
  pickCount: number;
  isMandatory: boolean;
};
