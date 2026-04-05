import React from 'react';
import { useTranslation } from 'react-i18next';
import './GameCard.css';
import { tCardName, tCardActionLabel, tCardActionDescription, tCardTag } from '@i18n/cardI18n';
import {
  getActiveState,
  getEffectiveProductions,
  tagClass,
  canAffordResources,
} from '@engine/application/cardHelpers';
import { renderTextWithIcons } from '@engine/application/renderHelpers';
import { getResMeta } from '@engine/application/resourceHelpers';
import { CardStatePreview } from '@components/CardStatePreview';
import { CardTrack } from '@components/CardTrack';
import { ResourceList } from '@components/Resource/ResourceList';
import { ResourcePill } from '@components/Resource/ResourcePill';
import type { CardDef, CardInstance, Sticker, Resources } from '@engine/domain/types';
import { TargetScope } from '@engine/domain/enums';
import {
  ActivatedIcon,
  DestroyIcon,
  GloryIcon,
  IconColors,
  PassifIcon,
  TimeIcon,
  TriggerIcon,
} from '@components/Icon';

interface GameCardProps {
  instance: CardInstance;
  defs: Record<number, CardDef>;
  stickerDefs?: Record<number, Sticker>;
  currentResources: Resources;
  isOnBoard: boolean;
  onActivate?: () => void;
  onAction?: (label: string) => void;
  onUpgrade?: (toStateId?: number) => void;
  onTrackStep?: (stepId: number) => void;
  style?: React.CSSProperties;
  animDelay?: number;
  hideStatePreview?: boolean;
  isBlocked?: boolean;
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
  onTrackStep,
  style,
  animDelay = 0,
  hideStatePreview = false,
  isBlocked = false,
}: GameCardProps) {
  const { t } = useTranslation();
  const cs = getActiveState(instance, defs);
  const def = defs[instance.cardId];

  const isEnemy = (cs.tags ?? []).some(
    tag => tag.toLowerCase() === 'enemy' || tag.toLowerCase() === 'ennemy',
  );
  const isPermanent = def?.permanent;
  const isParchment = def?.parchmentCard ?? false;
  const sc = getActiveState(instance, defs);
  const base = sc.productions?.[0] || {};
  const productions = getEffectiveProductions(base, instance, stickerDefs);
  const hasProductions = Object.keys(productions).length > 0;
  const canActivate = isOnBoard && !isBlocked;
  const upgrades = cs.upgrade ?? [];
  const actions = cs.cardEffects ?? [];

  // Description: state-level i18n key, falling back to first effect's description (parchment cards)
  const glory = cs.glory ?? 0;
  const resourceOptions = cs.productions as Resources[] | undefined;

  // Stickers for the current state
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
      <div className={`gc-header ${isEnemy ? 'enemy' : ''}`}>
        <div className="gc-name-row">
          <span className={`gc-name ${isEnemy ? 'enemy' : ''}`}>
            {instance.id !== undefined && instance.id !== 0 && (
              <span className="gc-deck-id">#{instance.id}</span>
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
            <div className={`gc-glory-badge ${glory < 0 ? 'negative' : ''}`}>
              <GloryIcon color={IconColors.gold} className="gc-glory-badge-icon" />
              <span>
                {glory > 0 ? '+' : ''}
                {glory}
              </span>
            </div>
          )}

          {/* Action description */}
          {isParchment &&
            actions.map((action, i) => {
              return (
                <React.Fragment key={i}>
                  <span className="gc-action-label">
                    {tCardActionLabel(t, instance.cardId, cs.id, i, action.label)}
                  </span>
                  {action.description && (
                    <p className="gc-description">{renderTextWithIcons(action.description)}</p>
                  )}
                </React.Fragment>
              );
            })}

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
          {/* Stay in play */}
          {cs.stayInPlay && (
            <span className="gc-passive-effect">
              <PassifIcon className="gc-passive-effect-icon" alt="passif" />
              {t('card.stayInPlay')}
            </span>
          )}

          {/* Action buttons — hidden for parchment cards */}
          {!isBlocked &&
            !isParchment &&
            actions.map((action, i) => {
              const affordable = !action.cost || canAffordResources(currentResources, action.cost);
              const actionLabel = tCardActionLabel(t, instance.cardId, cs.id, i, action.label);
              const actionDesc = tCardActionDescription(t, instance.cardId, cs.id, i, actionLabel);
              const hasDestroyItselfCost = action.cost?.destroy?.scope === TargetScope.SELF;
              const haveTrigger = !!action.trigger;
              const isOptional = action.optional;
              return (
                <button
                  key={i}
                  onClick={() => onAction?.(action.label)}
                  disabled={!affordable || !canActivate || haveTrigger}
                  title={actionDesc}
                  className="gc-action-btn"
                >
                  {haveTrigger && !isOptional ? (
                    <TriggerIcon color="red" className="gc-action-icon" />
                  ) : haveTrigger && isOptional ? (
                    <TriggerIcon color="yellow" className="gc-action-icon" />
                  ) : hasDestroyItselfCost ? (
                    <DestroyIcon color="red" className="gc-action-icon" />
                  ) : action.endsTurn ? (
                    <TimeIcon className="gc-action-icon" />
                  ) : action.passive ? (
                    <PassifIcon className="gc-action-icon" />
                  ) : (
                    <ActivatedIcon color="green" className="gc-action-icon" />
                  )}

                  {renderTextWithIcons(actionLabel)}
                </button>
              );
            })}

          {/* Track */}
          {!isBlocked && cs.track && (
            <CardTrack
              track={cs.track}
              validatedSteps={instance.trackProgress}
              currentResources={currentResources}
              canActivate={canActivate}
              onStep={stepId => onTrackStep?.(stepId)}
            />
          )}

          {/* Upgrade buttons */}
          {!isBlocked &&
            upgrades.map((upg, i) => {
              const affordable = canAffordResources(currentResources, upg.cost);
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
                      {Object.entries(upg.cost.resources[0]).map(([k, v], ci) => {
                        const meta = getResMeta(k);
                        return (
                          <React.Fragment key={k}>
                            {ci > 0 && ', '}
                            {v}
                            {meta.icon && (
                              <meta.icon className={`res-icon ${meta.cls} res-sm`} alt={k} />
                            )}
                          </React.Fragment>
                        );
                      })}
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
