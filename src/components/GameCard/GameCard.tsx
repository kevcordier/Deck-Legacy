import React from 'react';
import { useTranslation } from 'react-i18next';
import './GameCard.css';
import { tCardName, tCardActionLabel, tCardActionDescription, tCardTag } from '@i18n/cardI18n';
import gloryIcon from '@assets/icons/glory.svg';
import {
  getActiveState,
  getEffectiveProductions,
  tagClass,
  canAffordCost,
} from '@engine/application/cardHelpers';
import { renderTextWithIcons } from '@engine/application/renderHelpers';
import { getResMeta } from '@engine/application/resourceHelpers';
import { CardStatePreview } from '@components/CardStatePreview';
import { ResourceList } from '@components/Resource/ResourceList';
import { ResourcePill } from '@components/Resource/ResourcePill';
import passifIcon from '@assets/icons/passif.svg';
import activatedIcon from '@assets/icons/activated.png';
import timeIcon from '@assets/icons/time.png';
import destroyIcon from '@assets/icons/destroy.png';
import type { CardDef, CardInstance, Sticker, Resources } from '@engine/domain/types';
import { TargetScope, Trigger } from '@engine/domain/enums';
import { useGame } from '@hooks/useGame';

interface GameCardProps {
  instance: CardInstance;
  defs: Record<number, CardDef>;
  stickerDefs?: Record<number, Sticker>;
  currentResources: Resources;
  isOnBoard: boolean;
  onActivate?: () => void;
  onAction?: (label: string) => void;
  onUpgrade?: (toStateId?: number) => void;
  style?: React.CSSProperties;
  animDelay?: number;
  hideStatePreview?: boolean;
}

export function GameCard({
  instance,
  defs,
  stickerDefs = {},
  currentResources,
  isOnBoard,
  onActivate,
  onAction,
  onUpgrade,
  style,
  animDelay = 0,
  hideStatePreview = false,
}: GameCardProps) {
  const { t } = useTranslation();
  const cs = getActiveState(instance, defs);
  const def = defs[instance.cardId];
  const { state } = useGame();

  const isBlocked = Object.values(state.blockingCards).includes(instance.id);
  const isEnemy = (cs.tags ?? []).some(
    tag => tag.toLowerCase() === 'enemy' || tag.toLowerCase() === 'ennemy',
  );
  const isPermanent = def?.permanent;
  const productions = getEffectiveProductions(cs, instance, stickerDefs);
  const hasProductions = Object.keys(productions).length > 0;
  const canActivate = isOnBoard && !isBlocked && hasProductions && !!onActivate;
  const upgrades = cs.upgrade ?? [];
  const actions = (cs.cardEffects ?? []).filter(
    ce => !ce.trigger || ce.trigger !== Trigger.ON_PLAY,
  );
  const glory = cs.glory ?? 0;
  const resourceOptions = cs.productions as Resources[] | undefined;

  // Stickers de l'état courant
  const currentStateStickers = instance.stickers[instance.stateId] ?? [];

  const cardCls = [
    'gc',
    isEnemy ? 'enemy' : '',
    isBlocked ? 'blocked' : '',
    isPermanent ? 'permanent' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cardCls} style={{ animationDelay: `${animDelay}ms`, ...style }}>
      {/* Blocked overlay */}
      {isBlocked && (
        <div className="gc-blocked-overlay">
          <span className="gc-blocked-label">{t('card.blocked')}</span>
        </div>
      )}

      {/* Header */}
      <div className={`gc-header${isEnemy ? ' enemy' : ''}`}>
        <div className="gc-name-row">
          <span className={`gc-name${isEnemy ? ' enemy' : ''}`}>
            {instance.deckEntryId !== undefined && instance.deckEntryId !== 0 && (
              <span className="gc-deck-id">#{instance.deckEntryId}</span>
            )}
            {tCardName(t, instance.cardId, cs.id, cs.name)}
          </span>
          {!hideStatePreview && <CardStatePreview instance={instance} defs={defs} />}
        </div>

        <div className="gc-tags">
          {(cs.tags ?? []).map(tag => (
            <span key={tag} className={tagClass(tag)}>
              {tCardTag(t, tag)}
            </span>
          ))}
          {isPermanent && <span className="tag tag-permanent">{t('card.permanent')}</span>}
        </div>
      </div>

      {/* Everything below the header */}
      <div className="gc-main">
        {cs.illustration && (
          <div className="gc-illustration" style={{ backgroundImage: `url(${cs.illustration})` }} />
        )}

        {/* Body */}
        <div className="gc-body">
          {/* Productions */}
          {hasProductions && (
            <React.Fragment>
              {isOnBoard && !isBlocked ? (
                <button
                  onClick={onActivate}
                  disabled={!canActivate}
                  title={t('card.chooseProduction')}
                  className="gc-produce-btn"
                >
                  <ResourceList resourceOptions={resourceOptions} />
                </button>
              ) : (
                <ResourceList resourceOptions={resourceOptions} />
              )}
            </React.Fragment>
          )}

          {glory !== 0 && (
            <div className={`gc-glory-badge${glory < 0 ? ' negative' : ''}`}>
              <img src={gloryIcon} alt="" />
              <span>
                {glory > 0 ? '+' : ''}
                {glory}
              </span>
            </div>
          )}

          {/* Stickers */}
          {currentStateStickers.length > 0 && (
            <div className="gc-stickers">
              {currentStateStickers.map((stickerId, i) => {
                const sticker = stickerDefs[stickerId];
                if (!sticker) return null;
                if (sticker.production)
                  return <ResourcePill key={i} resource={sticker.production} />;
                if (sticker.glory)
                  return (
                    <span key={i} className="gc-sticker-glory">
                      +{sticker.glory}★
                    </span>
                  );
                return null;
              })}
            </div>
          )}
        </div>

        {/* Actions zone */}
        <div className="gc-actions">
          {/* Reste en jeu */}
          {cs.stayInPlay && (
            <span className="gc-passive-effect">
              <img className="gc-passive-effect-icon" src={passifIcon} alt="passif" />
              {t('card.stayInPlay')}
            </span>
          )}

          {/* Action buttons */}
          {!isBlocked &&
            actions.map((action, i) => {
              const affordable = !action.cost || canAffordCost(currentResources, action.cost);
              const actionLabel = tCardActionLabel(t, instance.cardId, cs.id, i, action.label);
              const actionDesc =
                tCardActionDescription(t, instance.cardId, cs.id, i) || actionLabel;
              const hasDestroyItselfCost = action.cost?.destroy?.some(
                c => c.scope === TargetScope.SELF,
              );
              return (
                <button
                  key={i}
                  onClick={() => onAction?.(action.label)}
                  disabled={!affordable || !canActivate}
                  title={actionDesc}
                  className="gc-action-btn"
                >
                  {hasDestroyItselfCost ? (
                    <img src={destroyIcon} className="gc-action-icon" alt="" />
                  ) : action.endsTurn ? (
                    <img src={timeIcon} className="gc-action-icon" alt="" />
                  ) : action.passive ? (
                    <img src={passifIcon} className="gc-action-icon" alt="" />
                  ) : (
                    <img src={activatedIcon} className="gc-action-icon" alt="" />
                  )}

                  {renderTextWithIcons(actionLabel)}
                  {action.cost?.resources?.[0] && (
                    <span className="gc-action-cost">
                      (
                      {Object.entries(action.cost.resources[0]).map(([k, v], ci) => (
                        <React.Fragment key={k}>
                          {ci > 0 && ', '}
                          {v}
                          <img
                            src={getResMeta(k).iconUrl}
                            className={`res-icon ${getResMeta(k).cls} res-sm`}
                            alt={k}
                          />
                        </React.Fragment>
                      ))}
                      )
                    </span>
                  )}
                </button>
              );
            })}

          {/* Upgrade buttons */}
          {!isBlocked &&
            upgrades.map((upg, i) => {
              const affordable = canAffordCost(currentResources, upg.cost);
              const targetState = def?.states.find(s => s.id === upg.upgradeTo);
              return (
                <button
                  key={i}
                  onClick={() => onUpgrade?.(upg.upgradeTo)}
                  disabled={!affordable || !canActivate}
                  className="gc-upgrade-btn"
                >
                  ⬆{' '}
                  {targetState
                    ? tCardName(t, def.id, targetState.id, targetState.name)
                    : t('card.state', { id: upg.upgradeTo })}
                  {upg.cost.resources?.[0] && (
                    <span className="gc-action-cost">
                      (
                      {Object.entries(upg.cost.resources[0]).map(([k, v], ci) => (
                        <React.Fragment key={k}>
                          {ci > 0 && ', '}
                          {v}
                          <img
                            src={getResMeta(k).iconUrl}
                            className={`res-icon ${getResMeta(k).cls} res-sm`}
                            alt={k}
                          />
                        </React.Fragment>
                      ))}
                      )
                    </span>
                  )}
                </button>
              );
            })}
        </div>
      </div>
      {/* gc-main */}
    </div>
  );
}
