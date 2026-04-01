import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import type {
  GameEvent,
  GameStartedEvent,
  RoundStartedEvent,
  TurnStartedEvent,
  CardProducedEvent,
  UpgradeCardEvent,
  UseCardEffectEvent,
  AdvanceEvent,
  Resources,
} from '@engine/domain/types';
import { GameEventType } from '@engine/domain/enums';
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
        {events.map((evt, i) => renderEvent(evt, i, t))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

// ── Renderers ────────────────────────────────────────────────────────────────

function renderEvent(evt: GameEvent, key: number, t: TFunction): React.ReactNode {
  switch (evt.type) {
    case GameEventType.GAME_STARTED: {
      const e = evt as GameStartedEvent;
      return (
        <div key={key} className="el-header el-header--game">
          <span className="el-header-icon">⚜</span>
          <span className="el-header-label">{t('eventLog.gameStarted')}</span>
          <span className="el-header-detail">
            {t('eventLog.cards', { count: e.initialDeck.length })}
          </span>
        </div>
      );
    }

    case GameEventType.ROUND_STARTED: {
      const e = evt as RoundStartedEvent;
      return (
        <div key={key} className="el-header el-header--round">
          <span className="el-header-label">{t('eventLog.round', { round: e.round })}</span>
          {e.newCards.length > 0 && (
            <span className="el-header-detail">
              {t('eventLog.discoveries', { count: e.newCards.length })}
            </span>
          )}
        </div>
      );
    }

    case GameEventType.TURN_STARTED: {
      const e = evt as TurnStartedEvent;
      return (
        <div key={key} className="el-turn">
          <span className="el-turn-label">{t('eventLog.turn', { turn: e.turn })}</span>
          <span className="el-turn-detail">
            {t('eventLog.deckCards', { count: e.turnCards.length })}
          </span>
        </div>
      );
    }

    case GameEventType.CARD_PRODUCED: {
      const e = evt as CardProducedEvent;
      const gained = res(e.productions);
      return (
        <div key={key} className="el-entry el-entry--produced">
          <span className="el-entry-icon">◆</span>
          <span className="el-entry-label">{t('eventLog.production')}</span>
          {gained && <span className="el-entry-detail">+{gained}</span>}
        </div>
      );
    }

    case GameEventType.UPGRADE_CARD: {
      const e = evt as UpgradeCardEvent;
      return (
        <div key={key} className="el-entry el-entry--upgrade">
          <span className="el-entry-icon">▲</span>
          <span className="el-entry-label">{t('eventLog.upgrade')}</span>
          <span className="el-entry-detail">{t('eventLog.toState', { id: e.stateId })}</span>
        </div>
      );
    }

    case GameEventType.USE_CARD_EFFECT: {
      const e = evt as UseCardEffectEvent;
      return (
        <div
          key={key}
          className={`el-entry ${e.isDiscarded ? 'el-entry--passive' : 'el-entry--action'}`}
        >
          <span className="el-entry-icon">{e.isDiscarded ? '◎' : '▶'}</span>
          <span className="el-entry-label">
            {e.isDiscarded ? t('eventLog.passiveEffect') : t('eventLog.action')}
          </span>
        </div>
      );
    }

    case GameEventType.ADVANCE: {
      const e = evt as AdvanceEvent;
      return (
        <div key={key} className="el-entry el-entry--advance">
          <span className="el-entry-icon">»</span>
          <span className="el-entry-label">{t('eventLog.advance')}</span>
          {e.turnCards.length > 0 && (
            <span className="el-entry-detail">
              {t('eventLog.addedCards', { count: e.turnCards.length })}
            </span>
          )}
        </div>
      );
    }

    case GameEventType.PASS: {
      return (
        <div key={key} className="el-entry el-entry--pass">
          <span className="el-entry-icon">—</span>
          <span className="el-entry-label">{t('eventLog.pass')}</span>
        </div>
      );
    }

    default:
      return (
        <div key={key} className="el-entry">
          <span className="el-entry-icon">·</span>
          <span className="el-entry-label">{evt.type.replace(/_/g, ' ').toLowerCase()}</span>
        </div>
      );
  }
}

function res(r: Resources): string {
  return Object.entries(r)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ');
}
