import type { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  CardState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
} from '@engine/domain/types';
import { tCardActionLabel } from '@helpers/cardI18n';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';

export type ChoiceSection = {
  title: string;
  subtitle: ReactNode;
  content: ReactNode;
  handleMultiConfirm?: () => void;
};

export type ChoiceSectionProps = {
  choice: PendingChoice;
  instances: Record<number, CardInstance>;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  t: TFunction;
  resolvePlayerChoice: (option: ResolvedActionEffect, choiceType: PendingChoiceType) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  selectedIds: number[];
  selectedCount: number;
  onToggleId: (id: number) => void;
  isMultiSelect: boolean;
  minSelect: number;
  maxSelect: number;
};

export function getChoiceActionLabel(
  choice: PendingChoice,
  instances: Record<number, CardInstance>,
  defs: Record<number, CardDef>,
  t: TFunction,
): ReactNode | undefined {
  const actionEffectId = Number.parseInt(choice.id.split('-')[1]);
  if (Number.isNaN(actionEffectId)) return undefined;
  const inst = instances[choice.sourceInstanceId];
  const def = inst ? defs[inst.cardId] : undefined;
  const state = def?.states.find(s => s.id === inst?.stateId);
  const actions = state?.actions;
  if (!actions || !def || !state) return undefined;
  const action = actions.find(a =>
    a.actionEffects.some(ae => ae.id === actionEffectId && ae.type === choice.kind),
  );
  if (!action) return undefined;
  return tCardActionLabel(t, action.id, inst.cumulated) ?? undefined;
}

export function makePreviewInstance(
  instanceId: number,
  def: CardDef,
  state: CardState,
): CardInstance {
  return {
    id: instanceId,
    cardId: def.id,
    stateId: state.id,
    stickers: {},
    trackProgress: [],
    cumulated: 0,
    usedActionIds: [],
    glories: [],
  };
}

export function buildCardCostResolution(
  choice: PendingChoice,
  selectedIds: number[],
): ResolvedCost {
  const isDestroyCost = choice.id.includes('-destroy');
  return {
    resources: {},
    discardedCardIds: isDestroyCost ? [] : selectedIds,
    destroyedCardIds: isDestroyCost ? selectedIds : [],
  };
}
