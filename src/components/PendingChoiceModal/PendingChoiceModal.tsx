import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { TriggerIcon } from '@components/ui/Icon/icon';
import { Modal } from '@components/ui/Modal/Modal';
import { ResourceChoice } from '@components/ui/ResourceChoice/ResourceChoice';
import { StickerChoice } from '@components/ui/StickerChoice/StickerChoice';
import { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  CardState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Resources,
  Sticker,
  TriggerEntry,
} from '@engine/domain/types';
import { tCardActionLabel, tCardName } from '@helpers/cardI18n';
import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

function getChoiceActionLabel(
  choice: PendingChoice,
  instances: Record<number, CardInstance>,
  defs: Record<number, CardDef>,
  t: TFunction,
): React.ReactNode | undefined {
  const actionId = parseInt(choice.id.split('-')[1]);
  if (isNaN(actionId)) return undefined;
  const inst = instances[choice.sourceInstanceId];
  const def = inst ? defs[inst.cardId] : undefined;
  const state = def?.states.find(s => s.id === inst?.stateId);
  const effects = state?.actions;
  if (!effects || !def || !state) return undefined;
  const effectIdx = effects.findIndex(e => e.actions.some(a => a.id === actionId));
  if (effectIdx === -1) return undefined;
  return tCardActionLabel(t, def.id, state.id, effectIdx) || undefined;
}

function makePreviewInstance(def: CardDef, state: CardState): CardInstance {
  return {
    id: 0,
    cardId: def.id,
    stateId: state.id,
    stickers: {},
    trackProgress: [],
    cumulated: 0,
  };
}

interface PendingChoiceModalProps {
  readonly choice?: PendingChoice;
  readonly triggerPile?: Record<string, TriggerEntry> | null;
  readonly defs: Record<number, CardDef>;
  readonly instances: Record<number, CardInstance>;
  readonly stickerDefs: Record<number, Sticker>;
  readonly resolvePlayerChoice: (option: ResolvedAction) => void;
  readonly resolvePayCost: (resolved: ResolvedCost) => void;
  readonly onResolveTrigger: (
    sourceInstanceId: number,
    actionId: string,
    triggerId: string,
  ) => void;
  readonly onSkipTrigger: (uuid: string) => void;
  readonly onSkipChoice: (uuid: string) => void;
}

export function PendingChoiceModal({
  choice,
  triggerPile,
  defs,
  instances,
  stickerDefs,
  resolvePlayerChoice,
  resolvePayCost,
  onResolveTrigger,
  onSkipTrigger,
  onSkipChoice,
}: PendingChoiceModalProps) {
  const { t } = useTranslation();

  let content;
  let title = '';
  let subtitle;
  // ── trigger_pile ───────────────────────────────────────────────────────
  if (triggerPile && Object.keys(triggerPile).length > 0) {
    title = t('triggerPile.title');
    subtitle = Object.keys(triggerPile).length > 1 ? t('triggerPile.subtitle') : null;
    content = (
      <div className="flex flex-col gap-4">
        {Object.entries(triggerPile).map(([triggerId, trigger]) => {
          const inst = instances[trigger.sourceInstanceId];
          const def = inst ? defs[inst.cardId] : undefined;
          const state = def?.states.find(s => s.id === inst?.stateId) ?? def?.states[0];
          const actionIdx = state?.actions?.findIndex(e => e.id === trigger.effectDef.id) ?? -1;
          const cardName = tCardName(t, def?.id, state?.id);
          const actionLabel = tCardActionLabel(t, def?.id, state?.id, actionIdx);
          return (
            <div
              key={triggerId}
              className="bg-card flex items-center justify-between gap-5 rounded border p-4"
            >
              <TriggerIcon
                className="size-8"
                color={trigger.effectDef.optional ? 'yellow' : 'red'}
              />
              <div className="flex-1">
                {cardName && (
                  <div className="font-display text-base-primary mb-1 text-sm font-semibold">
                    #{trigger.sourceInstanceId} {cardName}
                  </div>
                )}
                <div className="font-display text-base-ink text-xs">{actionLabel}</div>
              </div>
              <div className="flex items-end gap-2">
                <Button
                  size="sm"
                  color="base-primary"
                  onClick={() =>
                    onResolveTrigger(trigger.sourceInstanceId, trigger.effectDef.id, triggerId)
                  }
                >
                  {t('triggerPile.resolve')}
                </Button>
                {trigger.effectDef.optional && (
                  <Button
                    size="sm"
                    variant="outlined"
                    color="base-ink"
                    onClick={() => onSkipTrigger(triggerId)}
                  >
                    {t('triggerPile.skip')}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── choose_card ──────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_CARD) {
    const handleCardClick = (instanceId: number) => {
      if (choice.kind === 'COST') {
        resolvePayCost({ resources: {}, discardedCardIds: [instanceId], destroyedCardIds: [] });
      } else {
        resolvePlayerChoice({
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          instanceId,
        });
      }
    };

    title = t(`pendingChoice.chooseCard.${choice.kind}`, { count: choice.pickCount });
    subtitle = getChoiceActionLabel(choice, instances, defs, t);

    content = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {choice.choices.map(id => {
          if (typeof id !== 'number') return null;
          const inst = instances[id];
          const def = inst ? defs[inst.cardId] : undefined;
          if (!def || !inst) return null;
          const state = def.states.find(s => s.id === inst.stateId) ?? def.states[0];
          return (
            <div className="relative transition-transform hover:scale-[1.02]" key={id}>
              <button
                onClick={() => handleCardClick(id)}
                className="absolute inset-0 z-12 cursor-pointer!"
              ></button>
              <GameCard instance={makePreviewInstance(def, state)} hideStatePreview />
            </div>
          );
        })}
      </div>
    );
  }

  // ── choose_state ───────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_STATE) {
    const sourceInst = instances[choice.sourceInstanceId];
    const cardDef = sourceInst ? defs[sourceInst.cardId] : undefined;

    title = t(`pendingChoice.chooseState`);
    subtitle = getChoiceActionLabel(choice, instances, defs, t);
    content = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {choice.choices.map(stateId => {
          if (typeof stateId !== 'number') return null;
          const state = cardDef?.states.find(s => s.id === stateId);
          if (!cardDef || !state) return null;
          return (
            <div key={stateId} className="relative transition-transform hover:scale-[1.02]">
              <button
                onClick={() =>
                  resolvePlayerChoice({
                    id: choice.id,
                    type: choice.kind,
                    sourceInstanceId: choice.sourceInstanceId,
                    stateId,
                  })
                }
                className="absolute inset-0 z-12 cursor-pointer!"
              ></button>
              <GameCard instance={makePreviewInstance(cardDef, state)} hideStatePreview />
            </div>
          );
        })}
      </div>
    );
  }

  // ── choose_resource ────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_RESOURCE) {
    const handleResourceSelect = (i: number) => {
      const r = choice.choices[i] as Resources;
      if (choice.kind === 'COST') {
        resolvePayCost({ resources: r, discardedCardIds: [], destroyedCardIds: [] });
      } else {
        resolvePlayerChoice({
          id: choice.id,
          type: choice.kind,
          sourceInstanceId: choice.sourceInstanceId,
          resources: r,
        });
      }
    };

    title = t(`pendingChoice.chooseResource`);
    subtitle = getChoiceActionLabel(choice, instances, defs, t);

    content = (
      <ResourceChoice
        options={choice.choices.filter(
          (c): c is Resources => typeof c !== 'number' && typeof c !== 'string',
        )}
        size="lg"
        onSelect={handleResourceSelect}
      />
    );
  }

  // ── choose_sticker ────────────────────────────────────────────────────
  if (choice && choice.type === PendingChoiceType.CHOOSE_STICKER) {
    const handleStickerSelect = (stickerId: number) => {
      resolvePlayerChoice({
        id: choice.id,
        type: choice.kind,
        sourceInstanceId: choice.sourceInstanceId,
        stickerId,
      });
    };

    title = t(`pendingChoice.chooseSticker`);
    subtitle = getChoiceActionLabel(choice, instances, defs, t);

    content = (
      <StickerChoice
        options={choice.choices
          .filter((c): c is number => typeof c === 'number')
          .map(id => stickerDefs[id])
          .filter((s): s is NonNullable<typeof s> => s !== undefined)}
        size="lg"
        onSelect={handleStickerSelect}
      />
    );
  }

  const onClose = choice?.isMandatory === false ? () => onSkipChoice(choice.id) : undefined;
  const isCardChoice =
    choice?.type === PendingChoiceType.CHOOSE_CARD ||
    choice?.type === PendingChoiceType.CHOOSE_STATE;

  return (
    <Modal
      title={title}
      onClose={onClose}
      subtitle={subtitle}
      className={isCardChoice ? 'lg:min-w-2xl' : ''}
    >
      {content}
    </Modal>
  );
}
