import type { CardDef, CardInstance, PendingChoice } from '@deck-legacy/engine/domain/types';
import { tCardActionLabel } from '@i18n/card/tCardActionLabel';
import { tCardEffectLabel } from '@i18n/card/tCardEffectLabel';
import { tCardTrackAction } from '@i18n/card/tCardTrackAction';
import type { TFunction } from 'i18next';
import type { ReactNode } from 'react';

type ChoiceActionLabel = {
  value: ReactNode;
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
