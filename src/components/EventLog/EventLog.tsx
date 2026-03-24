import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type { GameEvent, Resources } from '@engine/types';
import './EventLog.css';

interface EventLogProps {
  events: GameEvent[];
}

export function EventLog({ events }: EventLogProps) {
  const { t } = useTranslation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events.length]);

  return (
    <div className="el-root">
      <div className="el-scroll">
        {events.map((evt, i) => {
          const meta = formatEvent(evt, t);
          return (
            <div key={i} className="el-entry" style={{ borderLeft: `2px solid ${meta.color}33` }}>
              <span className="el-index">{i + 1}</span>
              <span className="el-dot" style={{ background: meta.color }} />
              <span className="el-label" style={{ color: meta.color }}>
                {meta.label}
              </span>
              {meta.detail && <span className="el-detail">{meta.detail}</span>}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Event formatters ──────────────────────────────────────────────────────────

function res(r: Resources): string {
  return Object.entries(r)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
}

const COLORS: Record<string, string> = {
  GAME_STARTED: '#c9963a',
  ROUND_STARTED: '#c9963a',
  ROUND_ENDED: '#8a6420',
  TURN_STARTED: '#7a9a7a',
  TURN_ENDED: '#6a7a6a',
  CARD_ACTIVATED: '#c9963a',
  ACTION_RESOLVED: '#a0c0e0',
  UPGRADE_RESOLVED: '#d4832a',
  UPGRADE_CARD_EFFECT: '#d4832a',
  PROGRESSED: '#8a9a8a',
  CARD_BLOCKED: '#c04040',
  CARD_UNBLOCKED: '#40a040',
  CARD_DESTROYED: '#c04040',
  CARD_DISCOVERED: '#c9963a',
  CARD_STATE_CHOSEN: '#c9963a',
  CARD_PLAYED_FROM_DISCARD: '#a0c0e0',
  CARD_ADDED_TO_DECK: '#8a9a8a',
  STICKER_ADDED: '#c0a8e8',
  TRACK_ADVANCED: '#90c890',
  CHOICE_MADE: '#a0a0c0',
};

function formatEvent(
  evt: GameEvent,
  t: TFunction,
): { label: string; detail?: string; color: string } {
  const color = COLORS[evt.type] ?? '#8a8478';
  const p = evt.payload;

  switch (evt.type) {
    case 'GAME_STARTED':
      return {
        label: t('eventLog.gameStarted'),
        detail: t('eventLog.cards', { count: p.deckSize ?? 0 }),
        color,
      };

    case 'ROUND_STARTED':
      return {
        label: t('eventLog.round', { round: p.round }),
        detail: p.addedCardUids?.length
          ? t('eventLog.discoveries', { count: p.addedCardUids.length })
          : undefined,
        color,
      };

    case 'ROUND_ENDED':
      return { label: t('eventLog.roundEnded'), color };

    case 'TURN_STARTED':
      return {
        label: t('eventLog.turn', { turn: p.turn }),
        detail: t('eventLog.deckCards', { count: p.drawnUids?.length ?? 0 }),
        color,
      };

    case 'TURN_ENDED':
      return { label: t('eventLog.endOfTurn'), detail: p.reason, color };

    case 'CARD_ACTIVATED': {
      const gained = p.resourcesGained ? res(p.resourcesGained as Resources) : '';
      const discarded = p.discardedUid ? ` ${t('eventLog.toDiscard')}` : '';
      return {
        label: t('eventLog.production'),
        detail: gained ? `${gained}${discarded}` : discarded || undefined,
        color,
      };
    }

    case 'ACTION_RESOLVED': {
      const gained = p.resourcesGained ? res(p.resourcesGained as Resources) : '';
      return { label: t('eventLog.action'), detail: gained ? `+${gained}` : p.actionId, color };
    }

    case 'UPGRADE_RESOLVED':
    case 'UPGRADE_CARD_EFFECT':
      return {
        label: t('eventLog.upgrade'),
        detail: t('eventLog.toState', { id: p.toStateId }),
        color,
      };

    case 'PROGRESSED':
      return {
        label: t('eventLog.progress'),
        detail: t('eventLog.addedCards', { count: p.drawnUids?.length ?? 2 }),
        color,
      };

    case 'CARD_BLOCKED':
      return { label: t('eventLog.cardBlocked'), color };

    case 'CARD_UNBLOCKED':
      return { label: t('eventLog.cardUnblocked'), color };

    case 'CARD_DESTROYED':
      return { label: t('eventLog.cardDestroyed'), color };

    case 'CARD_DISCOVERED':
      return { label: t('eventLog.discovery'), color };

    case 'CARD_STATE_CHOSEN':
      return {
        label: t('eventLog.stateChosen'),
        detail: t('eventLog.state', { id: p.chosenStateId }),
        color,
      };

    case 'CARD_PLAYED_FROM_DISCARD':
      return { label: t('eventLog.fromDiscard'), color };

    case 'CARD_ADDED_TO_DECK':
      return { label: t('eventLog.addedToDeck'), color };

    case 'STICKER_ADDED':
      return { label: t('eventLog.sticker'), detail: `#${p.stickerNumber}`, color };

    case 'TRACK_ADVANCED':
      return {
        label: t('eventLog.track'),
        detail: t('eventLog.step', { progress: p.newProgress }),
        color,
      };

    case 'CHOICE_MADE':
      return { label: t('eventLog.choice'), color };

    default:
      return { label: evt.type.replace(/_/g, ' ').toLowerCase(), color };
  }
}
