import { Divider } from '@components/ui/Divider/Divider';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@deck-legacy/engine/application/cardHelpers';
import { GameEventType } from '@deck-legacy/engine/domain/enums';
import type {
  AdvanceEvent,
  CardActionEvent,
  CardProducedEvent,
  GameEvent,
  RoundEndedEvent,
  RoundStartedEvent,
  TurnStartedEvent,
  UpgradeCardEvent,
} from '@deck-legacy/engine/domain/types';
import { tCardName } from '@helpers/cardI18n';
import { useGame } from '@hooks/useGame';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type EventRowProps = {
  readonly event: GameEvent;
  readonly gameState: ReturnType<typeof useGame>['gameState'];
  readonly defs: ReturnType<typeof useGame>['defs'];
};

function EventRow({ event, gameState, defs }: EventRowProps) {
  const { t } = useTranslation();

  const cardName = (instanceId: number): React.ReactNode => {
    const inst = gameState.instances[instanceId];
    const cs = getActiveState(inst, defs);
    return tCardName(t, cs.name || '');
  };

  const time = new Date(event.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  let label: React.ReactNode;
  let color = 'text-ink';

  if (event.type === GameEventType.ROUND_STARTED) {
    return (
      <View className="flex-row items-center gap-2 px-4 py-0.5">
        <Text className="text-ink/40 w-16 shrink-0 font-mono text-xs">{time}</Text>
        <Title level={4} className="shrink-0">
          {t('history.roundStarted', { round: (event as RoundStartedEvent).round })}
        </Title>
        <View className="flex-1">
          <Divider orientation="horizontal" />
        </View>
      </View>
    );
  }

  if (event.type === GameEventType.TURN_STARTED) {
    const e = event as TurnStartedEvent;
    return (
      <View className="flex-row items-center gap-2 px-4 py-0.5">
        <Text className="text-ink/40 w-16 shrink-0 font-mono text-xs">{time}</Text>
        <Text className="shrink-0 text-xs">
          {t('history.turnStarted', { turn: e.turn, count: e.turnCards.length })}
        </Text>
        <View className="flex-1">
          <Divider orientation="horizontal" color="gradient" />
        </View>
      </View>
    );
  }

  switch (event.type) {
    case GameEventType.GAME_STARTED:
      label = t('history.gameStarted');
      color = 'text-primary';
      break;
    case GameEventType.TURN_ENDED:
      label = t('history.turnEnded');
      color = 'text-ink/60';
      break;
    case GameEventType.CARD_PRODUCED: {
      const e = event as CardProducedEvent;
      label = t('history.cardProduced', {
        card: e.cardInstanceId ? cardName(e.cardInstanceId) : '',
      });
      break;
    }
    case GameEventType.ADVANCE: {
      const e = event as AdvanceEvent;
      label = t('history.advance', { count: e.turnCards.length });
      break;
    }
    case GameEventType.UPGRADE_CARD: {
      const e = event as UpgradeCardEvent;
      label = t('history.upgradeCard', {
        card: e.cardInstanceId ? cardName(e.cardInstanceId) : '',
      });
      color = 'text-base-primary';
      break;
    }
    case GameEventType.CARD_ACTION: {
      const e = event as CardActionEvent;
      label = t('history.cardAction', {
        card: e.sourceInstanceId ? cardName(e.sourceInstanceId) : '',
      });
      break;
    }
    case GameEventType.SKIP_TRIGGER:
      label = t('history.skipTrigger');
      color = 'text-ink/60';
      break;
    case GameEventType.CHOOSE_STATE:
      label = t('history.chooseState');
      color = 'text-ink/60';
      break;
    case GameEventType.ROUND_ENDED:
      label = t('history.roundEnded', { round: (event as RoundEndedEvent).round });
      color = 'text-ink/60';
      break;
    default:
      label = event.type;
  }

  return (
    <View className="flex-row items-center gap-2 px-4 py-0.5">
      <Text className="text-ink/40 w-16 shrink-0 font-mono text-xs">{time}</Text>
      <Text className={`text-xs ${color}`}>{label}</Text>
    </View>
  );
}

/** Right-side drawer listing the game events, most recent first. */
export function HistoryDrawer({ onClose }: { readonly onClose: () => void }) {
  const { t } = useTranslation();
  const { gameState, defs, getEvents } = useGame();

  return (
    <Modal title={t('history.title')} onClose={onClose} side="right" className="lg:w-[28rem]">
      <View>
        {[...getEvents()].reverse().map(e => (
          <EventRow key={e.id} event={e} gameState={gameState} defs={defs} />
        ))}
      </View>
    </Modal>
  );
}
