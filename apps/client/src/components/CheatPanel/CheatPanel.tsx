import { Divider } from '@components/ui/Divider/Divider';
import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Text } from '@components/ui/Text/Text';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@deck-legacy/engine/application/cardHelpers';
import { GameEventType, ResourceType } from '@deck-legacy/engine/domain/enums';
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
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

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
          {t('cheatPanel.roundStarted', { round: (event as RoundStartedEvent).round })}
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
          {t('cheatPanel.turnStarted', { turn: e.turn, count: e.turnCards.length })}
        </Text>
        <View className="flex-1">
          <Divider orientation="horizontal" color="gradient" />
        </View>
      </View>
    );
  }

  switch (event.type) {
    case GameEventType.GAME_STARTED:
      label = t('cheatPanel.gameStarted');
      color = 'text-primary';
      break;
    case GameEventType.TURN_ENDED:
      label = t('cheatPanel.turnEnded');
      color = 'text-ink/60';
      break;
    case GameEventType.CARD_PRODUCED: {
      const e = event as CardProducedEvent;
      label = t('cheatPanel.cardProduced', {
        card: e.cardInstanceId ? cardName(e.cardInstanceId) : '',
      });
      break;
    }
    case GameEventType.ADVANCE: {
      const e = event as AdvanceEvent;
      label = t('cheatPanel.advance', { count: e.turnCards.length });
      break;
    }
    case GameEventType.UPGRADE_CARD: {
      const e = event as UpgradeCardEvent;
      label = t('cheatPanel.upgradeCard', {
        card: e.cardInstanceId ? cardName(e.cardInstanceId) : '',
      });
      color = 'text-base-primary';
      break;
    }
    case GameEventType.CARD_ACTION: {
      const e = event as CardActionEvent;
      label = t('cheatPanel.cardAction', {
        card: e.sourceInstanceId ? cardName(e.sourceInstanceId) : '',
      });
      break;
    }
    case GameEventType.SKIP_TRIGGER:
      label = t('cheatPanel.skipTrigger');
      color = 'text-ink/60';
      break;
    case GameEventType.CHOOSE_STATE:
      label = t('cheatPanel.chooseState');
      color = 'text-ink/60';
      break;
    case GameEventType.ROUND_ENDED:
      label = t('cheatPanel.roundEnded', { round: (event as RoundEndedEvent).round });
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

type CheatAPI = {
  addResources: (resources: Record<string, number>) => void;
  drawCard: (...instanceIds: number[]) => void;
  discardCard: (...instanceIds: number[]) => void;
  destroyCard: (...instanceIds: number[]) => void;
  discoverCard: (...instanceIds: number[]) => void;
  chooseState: (instanceId: number, stateId: number) => void;
  addSticker: (instanceId: number, stickerId: number) => void;
};

const RESOURCE_LABELS: Record<ResourceType, string> = {
  [ResourceType.GOLD]: 'or',
  [ResourceType.WOOD]: 'bois',
  [ResourceType.STONE]: 'pierre',
  [ResourceType.IRON]: 'fer',
  [ResourceType.WEAPON]: 'arme',
  [ResourceType.GOODS]: 'biens',
};

function CheatButton({ label, onPress }: { readonly label: string; readonly onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="bg-primary/20 active:bg-primary/30 rounded px-2 py-0.5"
    >
      <Text className="text-primary text-[10px]">{label}</Text>
    </Pressable>
  );
}

function CheatRow({
  label,
  children,
}: {
  readonly label: string;
  readonly children: React.ReactNode;
}) {
  return (
    <View>
      <Text className="text-ink/50 mb-0.5 font-mono text-[10px]">{label}</Text>
      <View className="flex-row flex-wrap items-center gap-1">{children}</View>
    </View>
  );
}

type Option = { label: string; value: string };

function Cheat() {
  const { gameState, defs, stickerDefs } = useGame();
  const { t } = useTranslation();

  const cheat = (globalThis as unknown as { __cheat?: CheatAPI }).__cheat;

  const [resAmounts, setResAmounts] = useState<Partial<Record<ResourceType, string>>>({});
  const [drawTarget, setDrawTarget] = useState('');
  const [discardTarget, setDiscardTarget] = useState('');
  const [destroyTarget, setDestroyTarget] = useState('');
  const [discoverTarget, setDiscoverTarget] = useState('');
  const [stateInst, setStateInst] = useState('');
  const [targetState, setTargetState] = useState('');
  const [stickerInst, setStickerInst] = useState('');
  const [stickerTarget, setStickerTarget] = useState('');

  const instName = (id: number) => {
    const inst = gameState.instances[id];
    if (!inst) return `${id}`;
    const cs = getActiveState(inst, defs);
    return `${id} ${tCardName(t, cs?.name ?? '')}`;
  };
  const instanceOptions = (ids: number[]): Option[] => [
    { label: '— instance —', value: '' },
    ...ids.map(id => ({ label: instName(id), value: String(id) })),
  ];

  const notOnBoard = [...gameState.drawPile, ...gameState.discardPile, ...gameState.discoveryPile];
  const onBoard = [...gameState.board, ...gameState.permanents];
  const allAlive = Object.keys(gameState.instances)
    .map(Number)
    .filter(id => !gameState.destroyedPile.includes(id));

  const stateInstDef = stateInst ? defs[gameState.instances[Number(stateInst)]?.cardId] : null;
  const stateOptions: Option[] = [
    { label: '— state —', value: '' },
    ...(stateInstDef?.states ?? []).map(s => ({
      label: `${s.id} ${tCardName(t, s.name)}`,
      value: String(s.id),
    })),
  ];
  const stickerOptions: Option[] = [
    { label: '— sticker —', value: '' },
    ...Object.entries(stickerDefs).map(([sid, s]) => ({
      label: `${sid} ${s.label ?? s.icon ?? sid}`,
      value: sid,
    })),
  ];

  const selectClass = 'max-w-36';

  return (
    <ScrollView
      className="border-border w-80 shrink-0 border-l"
      contentContainerClassName="gap-2 p-2"
    >
      <CheatRow label="addResources">
        {(Object.values(ResourceType) as ResourceType[]).map(rt => (
          <View key={rt} className="flex-row items-center gap-1">
            <Text className="text-ink/40 text-[10px]">{RESOURCE_LABELS[rt]}</Text>
            <TextInput
              keyboardType="numeric"
              className="w-10 px-1 py-0.5 font-mono text-[10px]"
              value={resAmounts[rt] ?? ''}
              onChangeText={value => setResAmounts(a => ({ ...a, [rt]: value }))}
            />
          </View>
        ))}
        <CheatButton
          label="Apply"
          onPress={() => {
            const r: Record<string, number> = {};
            for (const [k, v] of Object.entries(resAmounts)) {
              const n = Number.parseInt(v);
              if (!Number.isNaN(n) && n !== 0) r[k] = n;
            }
            cheat?.addResources(r);
            setResAmounts({});
          }}
        />
      </CheatRow>

      <CheatRow label="drawCard">
        <SelectInput
          className={selectClass}
          value={drawTarget}
          onChange={setDrawTarget}
          options={instanceOptions(notOnBoard)}
        />
        <CheatButton
          label="Play"
          onPress={() => {
            if (drawTarget) {
              cheat?.drawCard(Number(drawTarget));
              setDrawTarget('');
            }
          }}
        />
      </CheatRow>

      <CheatRow label="discardCard">
        <SelectInput
          className={selectClass}
          value={discardTarget}
          onChange={setDiscardTarget}
          options={instanceOptions(onBoard)}
        />
        <CheatButton
          label="Discard"
          onPress={() => {
            if (discardTarget) {
              cheat?.discardCard(Number(discardTarget));
              setDiscardTarget('');
            }
          }}
        />
      </CheatRow>

      <CheatRow label="destroyCard">
        <SelectInput
          className={selectClass}
          value={destroyTarget}
          onChange={setDestroyTarget}
          options={instanceOptions(allAlive)}
        />
        <CheatButton
          label="Destroy"
          onPress={() => {
            if (destroyTarget) {
              cheat?.destroyCard(Number(destroyTarget));
              setDestroyTarget('');
            }
          }}
        />
      </CheatRow>

      <CheatRow label="discoverCard">
        <SelectInput
          className={selectClass}
          value={discoverTarget}
          onChange={setDiscoverTarget}
          options={instanceOptions(gameState.discoveryPile)}
        />
        <CheatButton
          label="Discover"
          onPress={() => {
            if (discoverTarget) {
              cheat?.discoverCard(Number(discoverTarget));
              setDiscoverTarget('');
            }
          }}
        />
      </CheatRow>

      <CheatRow label="chooseState">
        <SelectInput
          className={selectClass}
          value={stateInst}
          onChange={value => {
            setStateInst(value);
            setTargetState('');
          }}
          options={instanceOptions(allAlive)}
        />
        <SelectInput
          className={selectClass}
          value={targetState}
          onChange={setTargetState}
          options={stateOptions}
          disabled={!stateInst}
        />
        <CheatButton
          label="Set"
          onPress={() => {
            if (stateInst && targetState) {
              cheat?.chooseState(Number(stateInst), Number(targetState));
              setStateInst('');
              setTargetState('');
            }
          }}
        />
      </CheatRow>

      <CheatRow label="addSticker">
        <SelectInput
          className={selectClass}
          value={stickerInst}
          onChange={setStickerInst}
          options={instanceOptions(allAlive)}
        />
        <SelectInput
          className={selectClass}
          value={stickerTarget}
          onChange={setStickerTarget}
          options={stickerOptions}
        />
        <CheatButton
          label="Add"
          onPress={() => {
            if (stickerInst && stickerTarget) {
              cheat?.addSticker(Number(stickerInst), Number(stickerTarget));
              setStickerInst('');
              setStickerTarget('');
            }
          }}
        />
      </CheatRow>
    </ScrollView>
  );
}

export function CheatPanel() {
  const { t } = useTranslation();
  const { gameState, defs, getEvents } = useGame();
  const [open, setOpen] = useState(false);

  const events = getEvents();

  if (!__DEV__) return null;

  return (
    <View className="bg-background border-t-border border-t">
      <Pressable
        onPress={() => setOpen(o => !o)}
        accessibilityRole="button"
        className="active:bg-ink/10 w-full flex-row items-center gap-2 px-4 py-1.5"
      >
        <View className="bg-ink/10 rounded-full px-2 py-0.5">
          <Text className="text-ink/60 font-mono text-xs">{events.length}</Text>
        </View>
        <Text className="text-ink/70 text-xs">{t('cheatPanel.title')}</Text>
        <Text className="ml-auto text-xs opacity-50">{open ? '▼' : '▲'}</Text>
      </Pressable>

      {open && (
        <View className="max-h-48 flex-row">
          <ScrollView className="flex-1">
            {[...events].reverse().map(e => (
              <EventRow key={e.id} event={e} gameState={gameState} defs={defs} />
            ))}
          </ScrollView>
          <Cheat />
        </View>
      )}
    </View>
  );
}
