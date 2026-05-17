import type { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
} from '@engine/domain/types';
import { tCardActionLabel, tCardEffectLabel, tCardTrackAction } from '@helpers/cardI18n';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';

export type ChoiceSection = {
  title: string;
  subtitle: ReactNode;
  content: ReactNode;
  handleMultiConfirm?: () => void;
};

type ChoiceActionLabel = {
  value: ReactNode;
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
): ChoiceActionLabel {
  const inst = instances[choice.sourceInstanceId];
  const def = inst ? defs[inst.cardId] : undefined;
  const state = def?.states.find(s => s.id === inst?.stateId);
  const actions = state?.actions;
  if (!actions || !def || !state) return { value: null };

  if (choice.sourceStepId !== undefined) {
    const stepLabel = tCardTrackAction(t, def.id, state.id, choice.sourceStepId);
    return { value: stepLabel ?? null };
  }

  if (choice.actionId && choice.effectId !== undefined) {
    const effectKey = `${choice.actionId}_${choice.effectId}`;
    if (t(`effect.${effectKey}`, { ns: 'cards' }) !== `effect.${effectKey}`) {
      return { value: tCardEffectLabel(t, effectKey, inst.cumulated) };
    }
  }

  const actionEffectId = choice.effectId ?? Number.parseInt(choice.id.split('-')[1]);
  if (Number.isNaN(actionEffectId)) return { value: null };
  const action = actions.find(a =>
    a.actionEffects.some(ae => ae.id === actionEffectId && ae.type === choice.kind),
  );
  if (!action) return { value: null };
  return { value: tCardActionLabel(t, action.id, inst.cumulated) ?? null };
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
