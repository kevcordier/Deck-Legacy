import { useTranslation } from 'react-i18next';
import type {
  PendingChoice,
  CardDef,
  Resources,
  CardInstance,
  CardState,
} from '@engine/domain/types';

function makePreviewInstance(def: CardDef, state: CardState): CardInstance {
  return {
    id: `preview-${def.id}-${state.id}`,
    cardId: def.id,
    stateId: state.id,
    deckEntryId: 0,
    stickers: {},
    trackProgress: null,
  };
}
import '@components/PendingChoiceModal/PendingChoiceModal.css';
import { ResourceChoice } from '@components/Resource/ResourceChoice';
import { GameCard } from '@components/GameCard';

interface PendingChoiceModalProps {
  choice: PendingChoice;
  defs: Record<number, CardDef>;
  instances: Record<string, CardInstance>;
  currentResources: Resources;
  // resolvers
  onDiscoverCard: (ids: number[]) => void;
  onChooseUpgrade: (toStateId: number) => void;
  onPlayFromDiscard: (uids: string[]) => void;
  onChooseResource: (r: Resources) => void;
  onChooseState: (stateId: number) => void;
  onCopyProduction: (uid: string) => void;
  onBlockCard: (uid: string) => void;
  onDiscardForCost: (uid: string) => void;
  onCancelDiscardCost: () => void;
}

export function PendingChoiceModal({
  choice,
  defs,
  instances,
  currentResources,
  onDiscoverCard,
  onChooseUpgrade,
  onPlayFromDiscard,
  onChooseResource,
  onChooseState,
  onCopyProduction,
  onBlockCard,
  onDiscardForCost,
  onCancelDiscardCost,
}: PendingChoiceModalProps) {
  const { t } = useTranslation();

  // ── discover_card ──────────────────────────────────────────────────────
  if (choice.kind === 'discover_card') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.discoverCard')}</div>
          <div className="pcm-subtitle">
            {t('pendingChoice.chooseCard', { count: choice.pickCount })}
          </div>
          <div className="pcm-card-grid">
            {choice.candidates.map(cardId => {
              const def = defs[cardId];
              if (!def)
                return (
                  <div
                    key={cardId}
                    className="pcm-card-placeholder"
                    onClick={() => onDiscoverCard([cardId])}
                  >
                    <span className="pcm-placeholder-name">
                      {t('pendingChoice.cardPlaceholder', { id: cardId })}
                    </span>
                    <span className="pcm-placeholder-label">{t('pendingChoice.toDiscover')}</span>
                  </div>
                );
              const state = def.states[0];
              return (
                <div
                  key={cardId}
                  onClick={() => onDiscoverCard([cardId])}
                  className="pcm-card-clickable"
                >
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
  if (choice.kind === 'choose_state') {
    const def = defs[choice.instance.cardId];
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.chooseState')}</div>
          <div className="pcm-subtitle">{t('pendingChoice.chooseStateSubtitle')}</div>
          <div className="pcm-card-grid">
            {choice.options.map(state => (
              <div
                key={state.id}
                onClick={() => onChooseState(state.id)}
                className="pcm-card-clickable"
              >
                <GameCard
                  instance={makePreviewInstance(def, state)}
                  defs={defs}
                  currentResources={currentResources}
                  isOnBoard={false}
                  hideStatePreview
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── choose_upgrade ─────────────────────────────────────────────────────
  if (choice.kind === 'choose_upgrade') {
    const instance = instances[choice.cardUid];
    const def = defs[instance?.cardId ?? 0];
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.chooseUpgrade')}</div>
          <div className="pcm-subtitle">{t('pendingChoice.chooseUpgradeSubtitle')}</div>
          <div className="pcm-card-grid">
            {choice.options.map((upg, i) => {
              const targetState = def?.states.find(s => s.id === upg.upgradeTo);
              return (
                <div
                  key={i}
                  onClick={() => onChooseUpgrade(upg.upgradeTo)}
                  style={{ cursor: 'pointer' }}
                >
                  {targetState && (
                    <GameCard
                      instance={makePreviewInstance(def, targetState)}
                      defs={defs}
                      currentResources={currentResources}
                      isOnBoard={false}
                      hideStatePreview
                    />
                  )}
                  <div className="pcm-upgrade-cost">
                    {t('pendingChoice.cost')}{' '}
                    {Object.entries(upg.cost.resources?.[0] ?? {})
                      .map(([k, v]) => `${v} ${k}`)
                      .join(', ') || t('pendingChoice.free')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── choose_resource ────────────────────────────────────────────────────
  if (choice.kind === 'choose_resource') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.chooseResource')}</div>
          <div className="pcm-subtitle">
            {choice.source === 'activation'
              ? t('pendingChoice.produceResource')
              : t('pendingChoice.gainResource')}
          </div>
          <ResourceChoice options={choice.options} onSelect={onChooseResource} />
        </div>
      </div>
    );
  }

  // ── play_from_discard ──────────────────────────────────────────────────
  if (choice.kind === 'play_from_discard') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.playFromDiscard')}</div>
          <div className="pcm-subtitle">
            {t('pendingChoice.chooseFromDiscard', { count: choice.pickCount })}
          </div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid];
              if (!inst) return null;
              return (
                <div
                  key={uid}
                  onClick={() => onPlayFromDiscard([uid])}
                  className="pcm-card-clickable"
                >
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    isOnBoard={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── copy_production ────────────────────────────────────────────────────
  if (choice.kind === 'copy_production') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.copyProduction')}</div>
          <div className="pcm-subtitle">{t('pendingChoice.copyProductionSubtitle')}</div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid];
              if (!inst) return null;
              return (
                <div key={uid} onClick={() => onCopyProduction(uid)} className="pcm-card-clickable">
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    isOnBoard={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── block_card ─────────────────────────────────────────────────────────
  if (choice.kind === 'block_card') {
    return (
      <div className="pcm-overlay">
        <div className="pcm-panel">
          <div className="pcm-title">{t('pendingChoice.blockCard')}</div>
          <div className="pcm-subtitle">{choice.actionLabel}</div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid];
              if (!inst) return null;
              return (
                <div key={uid} onClick={() => onBlockCard(uid)} className="pcm-card-clickable">
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    isOnBoard={false}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ── discard_for_cost ───────────────────────────────────────────────────
  if (choice.kind === 'discard_for_cost') {
    const total = choice.collectedUids.length + 1 + choice.remainingScopes.length;
    const current = choice.collectedUids.length + 1;
    return (
      <div className="pcm-overlay" onClick={onCancelDiscardCost}>
        <div className="pcm-panel" onClick={e => e.stopPropagation()}>
          <div className="pcm-title">{t('pendingChoice.discardForCost')}</div>
          <div className="pcm-subtitle">
            {t('pendingChoice.discardForCostSubtitle', { current, total })}
          </div>
          <div className="pcm-card-grid">
            {choice.candidates.map(uid => {
              const inst = instances[uid];
              if (!inst) return null;
              return (
                <div key={uid} onClick={() => onDiscardForCost(uid)} className="pcm-card-clickable">
                  <GameCard
                    instance={inst}
                    defs={defs}
                    currentResources={currentResources}
                    isOnBoard={false}
                  />
                </div>
              );
            })}
          </div>
          <button className="pcm-cancel-btn" onClick={onCancelDiscardCost}>
            {t('pendingChoice.cancel')}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
