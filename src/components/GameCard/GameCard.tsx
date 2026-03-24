import React from 'react';
import { useTranslation } from 'react-i18next';
import './GameCard.css';
import {
  tCardName,
  tCardActionLabel,
  tCardActionDescription,
  tCardPassiveLabel,
  tCardPassiveDescription,
  tCardTag,
} from '@i18n/cardI18n';
import {
  type CardInstance,
  type CardDef,
  type Resources,
  getActiveState,
  canAffordCost,
} from '@engine/types';
import gloryIcon from '@assets/icons/glory.svg';
import { getEffectiveProductions, tagClass } from '@helpers/cardHelpers';
import { renderTextWithIcons } from '@helpers/renderHelpers';
import { getResMeta } from '@helpers/resourceHelpers';
import { CardStatePreview } from '@components/CardStatePreview';
import { ResourceList } from '@components/Resource/ResourceList';
import { ResourcePill } from '@components/Resource/ResourcePill';
import passifIcon from '@assets/icons/passif.svg';
import activatedIcon from '@assets/icons/activated.png';
import timeIcon from '@assets/icons/time.png';
import destroyIcon from '@assets/icons/destroy.png';

interface GameCardProps {
  instance: CardInstance;
  defs: Record<number, CardDef>;
  currentResources: Resources;
  activated: string[];
  isInTableau: boolean;
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
  currentResources,
  activated,
  isInTableau,
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

  const isActivated = activated.includes(instance.uid);
  const isBlocked = instance.blockedBy !== null;
  const isEnemy = cs.tags.some(t => t.toLowerCase() === 'enemy' || t.toLowerCase() === 'ennemy');
  const isPermanent = def.permanent;
  const productions = getEffectiveProductions(cs, instance);
  const hasProductions = Object.keys(productions).length > 0;
  const canActivate = isInTableau && !isActivated && !isBlocked && hasProductions && !!onActivate;
  const track = cs.track;
  const progress = instance.trackProgress;
  const upgrades = cs.upgrade ?? [];
  const actions = cs.actions ?? [];
  const glory = cs.glory ?? 0;
  const resourceOptions = cs.productions as Resources[] | undefined;

  const cardCls = [
    'gc',
    isEnemy ? 'enemy' : '',
    isBlocked ? 'blocked' : '',
    isActivated ? 'activated' : '',
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

      {/* Activated shimmer */}
      {isActivated && <div className="gc-shimmer" />}

      {/* Header */}
      <div className={`gc-header${isEnemy ? ' enemy' : ''}`}>
        <div className="gc-name-row">
          <span className={`gc-name${isEnemy ? ' enemy' : ''}`}>
            {instance.deckEntryId !== undefined && (
              <span className="gc-deck-id">#{instance.deckEntryId}</span>
            )}
            {tCardName(t, instance.cardId, cs.id, cs.name)}
          </span>
          {!hideStatePreview && <CardStatePreview instance={instance} defs={defs} />}
        </div>

        <div className="gc-tags">
          {cs.tags.map(tag => (
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
              {isInTableau && !isBlocked ? (
                <button
                  onClick={onActivate}
                  disabled={isActivated || !canActivate}
                  title={isActivated ? t('card.alreadyProduced') : t('card.chooseProduction')}
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

          {/* Track */}
          {track && (
            <div>
              <div className="gc-section-label">{t('card.track')}</div>
              <div className="gc-track-row">
                {track.steps.map(step => {
                  const done = progress !== null && step.index <= progress;
                  return (
                    <div
                      key={step.index}
                      title={step.label}
                      className={`gc-track-step${done ? ' done' : ''}`}
                    >
                      {done ? '×' : ''}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stickers */}
          {instance.stickers.length > 0 && (
            <div className="gc-stickers">
              {instance.stickers.map((v, i) => {
                const eff = v.effect;
                if (eff.type === 'resource')
                  return <ResourcePill key={i} resource={eff.resource} />;
                if (eff.type === 'glory_points')
                  return (
                    <span key={i} className="gc-sticker-glory">
                      +{eff.amount}★
                    </span>
                  );
                return null;
              })}
            </div>
          )}
        </div>
        {/* Actions zone */}
        <div className="gc-actions">
          {/* Passif */}
          {cs.stayInPlay && (
            <span className="gc-passive-effect">
              <img className="gc-passive-effect-icon" src={passifIcon} alt="passif" />
              {t('card.stayInPlay')}
            </span>
          )}
          {(cs.passifs ?? cs.passives ?? []).map((p, i) => {
            const passiveLabel = tCardPassiveLabel(t, instance.cardId, cs.id, i, p.label);
            const passiveDesc =
              tCardPassiveDescription(t, instance.cardId, cs.id, i) || passiveLabel;
            return (
              <span key={i} className="gc-passive-effect" title={passiveDesc}>
                <img className="gc-passive-effect-icon" src={passifIcon} alt="passif" />
                {renderTextWithIcons(passiveLabel)}
              </span>
            );
          })}

          {/* Action buttons */}
          {!isBlocked &&
            actions.map((action, i) => {
              if (action.trigger === 'on_play') return null;
              const affordable = !action.cost || canAffordCost(currentResources, action.cost);
              const actionLabel = tCardActionLabel(t, instance.cardId, cs.id, i, action.label);
              const actionDesc =
                tCardActionDescription(t, instance.cardId, cs.id, i) || actionLabel;
              return (
                <button
                  key={i}
                  onClick={() => onAction?.(action.label)}
                  disabled={!affordable}
                  title={actionDesc}
                  className="gc-action-btn"
                >
                  {action.cost?.destroy === 'self' ? (
                    <img src={destroyIcon} className="gc-action-icon" alt="" />
                  ) : action.endsTurn ? (
                    <img src={timeIcon} className="gc-action-icon" alt="" />
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
              const targetState = def.states.find(s => s.id === upg.upgradeTo);
              return (
                <button
                  key={i}
                  onClick={() => onUpgrade?.(upg.upgradeTo)}
                  disabled={!affordable}
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
