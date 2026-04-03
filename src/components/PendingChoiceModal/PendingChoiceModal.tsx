import { useTranslation } from 'react-i18next';
import type {
  PendingChoice,
  CardDef,
  Resources,
  CardInstance,
  CardState,
  ResolvedAction,
  ResolvedCost,
  TriggerEntry,
} from '@engine/domain/types';
import triggerIcon from '@assets/icons/trigger.png';
import forcedTriggerIcon from '@assets/icons/forcedtrigger.png';
import '@components/PendingChoiceModal/PendingChoiceModal.css';
import { ResourceChoice } from '@components/Resource/ResourceChoice';
import { GameCard } from '@components/GameCard';
import { PendingChoiceType } from '@engine/domain/enums';
import { tCardName, tCardActionLabel } from '@i18n/cardI18n';

function makePreviewInstance(def: CardDef, state: CardState): CardInstance {
  return {
    id: 0,
    cardId: def.id,
    stateId: state.id,
    stickers: {},
    trackProgress: [],
  };
}

interface PendingChoiceModalProps {
  choice?: PendingChoice;
  triggerPile?: Record<string, TriggerEntry> | null;
  defs: Record<number, CardDef>;
  instances: Record<number, CardInstance>;
  currentResources: Resources;
  resolvePlayerChoice(option: ResolvedAction): void;
  resolvePayCost(resolved: ResolvedCost): void;
  onResolveTrigger(sourceInstanceId: number, actionId: string, triggerId: string): void;
  onSkipTrigger(uuid: string): void;
}

export function PendingChoiceModal({
  choice,
  triggerPile,
  defs,
  instances,
  currentResources,
  resolvePlayerChoice,
  resolvePayCost,
  onResolveTrigger,
  onSkipTrigger,
}: PendingChoiceModalProps) {
  const { t } = useTranslation();

  // ── trigger_pile ───────────────────────────────────────────────────────
  if (triggerPile && Object.keys(triggerPile).length > 0) {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('triggerPile.title')}</div>
          {Object.keys(triggerPile).length > 1 && (
            <div className="pcm-subtitle">{t('triggerPile.subtitle')}</div>
          )}
          <div className="pcm-trigger-list">
            {Object.entries(triggerPile).map(([triggerId, trigger]) => {
              const inst = instances[trigger.sourceInstanceId];
              const def = inst ? defs[inst.cardId] : undefined;
              const state = def?.states.find(s => s.id === inst?.stateId) ?? def?.states[0];
              const actionIdx =
                state?.cardEffects?.findIndex(e => e.label === trigger.effectDef.label) ?? -1;
              const cardName = tCardName(t, def?.id, state?.id, state?.name);
              const actionLabel = tCardActionLabel(
                t,
                def?.id,
                state?.id,
                actionIdx,
                trigger.effectDef.label,
              );
              return (
                <div key={triggerId} className="pcm-trigger-item">
                  <img
                    src={trigger.effectDef.optional ? triggerIcon : forcedTriggerIcon}
                    className="pcm-trigger-icon"
                    alt=""
                  />
                  <div className="pcm-trigger-info">
                    {cardName && (
                      <div className="pcm-trigger-card-name">
                        #{trigger.sourceInstanceId} {cardName}
                      </div>
                    )}
                    <div className="pcm-trigger-label">{actionLabel}</div>
                  </div>
                  <div className="pcm-trigger-actions">
                    <button
                      className="pcm-trigger-btn-resolve"
                      onClick={() =>
                        onResolveTrigger(
                          trigger.sourceInstanceId,
                          trigger.effectDef.label,
                          triggerId,
                        )
                      }
                    >
                      {t('triggerPile.resolve')}
                    </button>
                    {trigger.effectDef.optional && (
                      <button
                        className="pcm-trigger-btn-skip"
                        onClick={() => onSkipTrigger(triggerId)}
                      >
                        {t('triggerPile.skip')}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (!choice) return null;

  // ── choose_card ──────────────────────────────────────────────────────
  if (choice.type === PendingChoiceType.CHOOSE_CARD) {
    const handleCardClick = (instanceId: number) => {
      if (choice.kind === 'cost') {
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

    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">
            {t('pendingChoice.chooseCard', { count: choice.pickCount })}
          </div>
          <div className="pcm-card-grid">
            {choice.choices.map(id => {
              if (typeof id !== 'number') return null;
              const inst = instances[id];
              const def = inst ? defs[inst.cardId] : undefined;
              if (!def || !inst)
                return (
                  <div
                    key={id}
                    className="pcm-card-placeholder"
                    onClick={() => handleCardClick(id)}
                  >
                    <span className="pcm-placeholder-name">
                      {t('pendingChoice.cardPlaceholder', { id })}
                    </span>
                    <span className="pcm-placeholder-label">{t('pendingChoice.toDiscover')}</span>
                  </div>
                );
              const state = def.states.find(s => s.id === inst.stateId) ?? def.states[0];
              return (
                <div key={id} onClick={() => handleCardClick(id)} className="pcm-card-clickable">
                  <GameCard
                    instance={makePreviewInstance(def, state)}
                    defs={defs}
                    currentResources={currentResources}
                    isOnBoard={false}
                    hideStatePreview
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── choose_state ───────────────────────────────────────────────────────
  if (choice.type === PendingChoiceType.CHOOSE_STATE) {
    const sourceInst = instances[choice.sourceInstanceId];
    const cardDef = sourceInst ? defs[sourceInst.cardId] : undefined;

    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.chooseState')}</div>
          <div className="pcm-subtitle">{t('pendingChoice.chooseStateSubtitle')}</div>
          <div className="pcm-card-grid">
            {choice.choices.map(stateId => {
              if (typeof stateId !== 'number') return null;
              const state = cardDef?.states.find(s => s.id === stateId);
              if (!cardDef || !state) return null;
              return (
                <div
                  key={stateId}
                  onClick={() =>
                    resolvePlayerChoice({
                      id: choice.id,
                      type: choice.kind,
                      sourceInstanceId: choice.sourceInstanceId,
                      stateId,
                    })
                  }
                  className="pcm-card-clickable"
                >
                  <GameCard
                    instance={makePreviewInstance(cardDef, state)}
                    defs={defs}
                    currentResources={currentResources}
                    isOnBoard={false}
                    hideStatePreview
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── choose_resource ────────────────────────────────────────────────────
  if (choice.type === PendingChoiceType.CHOOSE_RESOURCE) {
    const handleResourceSelect = (r: Resources) => {
      if (choice.kind === 'cost') {
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

    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.chooseResource')}</div>
          <div className="pcm-subtitle">{t('pendingChoice.gainResource')}</div>
          <ResourceChoice
            options={choice.choices.filter(
              (c): c is Resources => typeof c !== 'number' && typeof c !== 'string',
            )}
            onSelect={handleResourceSelect}
          />
        </div>
      </div>
    );
  }

  return null;
}
