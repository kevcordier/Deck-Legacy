import type { ResolvedActionEffect } from './Card';
import type { ResolvedCost } from './Cost';

export type ActionExecutionState = {
  instanceId: number;
  actionId: string;
  sourceCardId: number;
  sourceStateId: number;
  resolvedCost: ResolvedCost | null;
  resolvedAction: ResolvedActionEffect[];
  triggerId: string;
  nextEffectIndex?: number;
  trackStepId?: number;
  trackTargetId?: number;
};
