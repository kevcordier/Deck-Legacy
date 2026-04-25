import { Divider } from '@components/ui/Divider/Divider';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@engine/application/cardHelpers';
import { GameEventType } from '@engine/domain/enums';
import type {
  AdvanceEvent,
  CardActionEvent,
  CardProducedEvent,
  GameEvent,
  RoundStartedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
} from '@engine/domain/types';
import { tCardName } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

type EventRowProps = {
  readonly event: GameEvent;
  readonly state: ReturnType<typeof useGame>['state'];
  readonly defs: ReturnType<typeof useGame>['defs'];
};

function EventRow({ event, state, defs }: EventRowProps) {
  const { t } = useTranslation();

  const cardName = (instanceId: number): React.ReactNode => {
    const inst = state.instances[instanceId];
    const cs = getActiveState(inst, defs);
    return tCardName(t, inst.cardId, cs.id);
  };

  const time = new Date(event.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  let label: React.ReactNode;
  let color = 'text-base-ink';

  if (event.type === GameEventType.ROUND_STARTED) {
    return (
      <div className="flex items-baseline gap-2 px-4 py-0.5 text-xs odd:bg-surface/40">
        <span className="text-base-ink/40 w-16 shrink-0 font-mono">{time}</span>
        <Title level={4} className="shrink-0">
          {t('eventLog.roundStarted', { round: (event as RoundStartedEvent).round })}
        </Title>
        <Divider orientation="horizontal" className="relative -top-px" />
      </div>
    );
  }

  if (event.type === GameEventType.TURN_STARTED) {
    const e = event as TurnStartedEvent;
    return (
      <div className="flex items-baseline gap-2 px-4 py-0.5 text-xs odd:bg-surface/40">
        <span className="text-base-ink/40 w-16 shrink-0 font-mono">{time}</span>
        <span className="shrink-0 text-shadow-md font-medium">
          {t('eventLog.turnStarted', { turn: e.turn, count: e.turnCards.length })}
        </span>
        <Divider orientation="horizontal" color="gradient" className="relative -top-px" />
      </div>
    );
  }

  switch (event.type) {
    case GameEventType.GAME_STARTED:
      label = t('eventLog.gameStarted');
      color = 'text-primary';
      break;
    case GameEventType.TURN_ENDED:
      label = t('eventLog.turnEnded');
      color = 'text-base-ink/60';
      break;
    case GameEventType.CARD_PRODUCED: {
      const e = event as CardProducedEvent;
      label = t('eventLog.cardProduced', { card: cardName(e.cardInstanceId) });
      break;
    }
    case GameEventType.ADVANCE: {
      const e = event as AdvanceEvent;
      label = t('eventLog.advance', { count: e.turnCards.length });
      break;
    }
    case GameEventType.UPGRADE_CARD: {
      const e = event as UpgradeCardEvent;
      label = t('eventLog.upgradeCard', { card: cardName(e.cardInstanceId) });
      color = 'text-amber-600';
      break;
    }
    case GameEventType.CARD_ACTION: {
      const e = event as CardActionEvent;
      label = t('eventLog.cardAction', { card: cardName(e.sourceInstanceId) });
      break;
    }
    case GameEventType.SKIP_TRIGGER:
      label = t('eventLog.skipTrigger');
      color = 'text-base-ink/60';
      break;
    default:
      label = event.type;
  }

  return (
    <div className="flex items-baseline gap-2 px-4 py-0.5 text-xs odd:bg-surface/40">
      <span className="text-base-ink/40 w-16 shrink-0 font-mono">{time}</span>
      <span className={color}>{label}</span>
    </div>
  );
}

export function EventPanel() {
  const { t } = useTranslation();
  const { state, defs, getEvents } = useGame();
  const [open, setOpen] = useState(false);

  const events = getEvents();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="bg-background border-t-border border-t">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-base-ink/70 hover:bg-surface flex w-full items-center gap-2 px-4 py-1.5 text-xs font-medium transition-colors"
      >
        <span className="bg-surface text-base-ink/60 rounded-full px-2 py-0.5 font-mono tabular-nums">
          {events.length}
        </span>
        {t('eventLog.title')}
        <span className="ml-auto opacity-50">{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="scrollbar flex max-h-48 flex-col-reverse overflow-y-auto">
          {[...events].map(e => (
            <EventRow key={e.id} event={e} state={state} defs={defs} />
          ))}
        </div>
      )}
    </div>
  );
}
