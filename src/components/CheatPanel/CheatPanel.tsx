import { Divider } from '@components/ui/Divider/Divider';
import { Title } from '@components/ui/Title/Title';
import { getActiveState } from '@engine/application/cardHelpers';
import { GameEventType, ResourceType } from '@engine/domain/enums';
import type {
  AdvanceEvent,
  CardActionEvent,
  CardProducedEvent,
  GameEvent,
  RoundEndedEvent,
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
      <div className="flex items-baseline gap-2 px-4 py-0.5 text-xs odd:bg-surface/40">
        <span className="text-ink/40 w-16 shrink-0 font-mono">{time}</span>
        <Title level={4} className="shrink-0">
          {t('cheatPanel.roundStarted', { round: (event as RoundStartedEvent).round })}
        </Title>
        <Divider orientation="horizontal" className="relative -top-px" />
      </div>
    );
  }

  if (event.type === GameEventType.TURN_STARTED) {
    const e = event as TurnStartedEvent;
    return (
      <div className="flex items-baseline gap-2 px-4 py-0.5 text-xs odd:bg-surface/40">
        <span className="text-ink/40 w-16 shrink-0 font-mono">{time}</span>
        <span className="shrink-0 text-shadow-md font-medium">
          {t('cheatPanel.turnStarted', { turn: e.turn, count: e.turnCards.length })}
        </span>
        <Divider orientation="horizontal" color="gradient" className="relative -top-px" />
      </div>
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
      color = 'text-amber-600';
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
    <div className="flex items-baseline gap-2 px-4 py-0.5 text-xs odd:bg-surface/40">
      <span className="text-ink/40 w-16 shrink-0 font-mono">{time}</span>
      <span className={color}>{label}</span>
    </div>
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

  const notOnBoard = [...gameState.drawPile, ...gameState.discardPile, ...gameState.discoveryPile];
  const onBoard = [...gameState.board, ...gameState.permanents];
  const allAlive = Object.keys(gameState.instances)
    .map(Number)
    .filter(id => !gameState.destroyedPile.includes(id));

  const stateInstDef = stateInst ? defs[gameState.instances[Number(stateInst)]?.cardId] : null;
  const availableStates = stateInstDef?.states ?? [];

  const allStickers = Object.entries(stickerDefs);

  const selectClass =
    'rounded border border-border bg-surface px-1 py-0.5 text-ink font-mono text-[10px] max-w-36';
  const btnClass =
    'rounded bg-primary/20 px-2 py-0.5 text-[10px] text-primary hover:bg-primary/30 transition-colors cursor-pointer';
  const labelClass = 'text-ink/50 text-[10px] font-mono mb-0.5 block';

  return (
    <div className="scrollbar border-border flex w-150 shrink-0 flex-col gap-2 overflow-y-auto border-l p-2">
      {/* addResources */}
      <div>
        <span className={labelClass}>addResources</span>
        <div className="flex flex-wrap gap-x-2 gap-y-1">
          {(Object.values(ResourceType) as ResourceType[]).map(rt => (
            <label key={rt} className="flex items-center gap-1">
              <span className="text-ink/40 text-[10px]">{RESOURCE_LABELS[rt]}</span>
              <input
                type="number"
                className="border-border bg-surface text-ink w-10 rounded border px-1 py-0.5 text-[10px] font-mono"
                value={resAmounts[rt] ?? ''}
                onChange={e => setResAmounts(a => ({ ...a, [rt]: e.target.value }))}
              />
            </label>
          ))}
          <button
            type="button"
            className={`${btnClass} mt-1`}
            onClick={() => {
              const r: Record<string, number> = {};
              for (const [k, v] of Object.entries(resAmounts)) {
                const n = Number.parseInt(v);
                if (!Number.isNaN(n) && n !== 0) r[k] = n;
              }
              cheat?.addResources(r);
              setResAmounts({});
            }}
          >
            Apply
          </button>
        </div>
      </div>

      {/* drawCard */}
      <div>
        <span className={labelClass}>drawCard</span>
        <div className="flex items-center gap-1">
          <select
            className={selectClass}
            value={drawTarget}
            onChange={e => setDrawTarget(e.target.value)}
          >
            <option value="">— instance —</option>
            {notOnBoard.map(id => (
              <option key={id} value={id}>
                {instName(id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              if (drawTarget) {
                cheat?.drawCard(Number(drawTarget));
                setDrawTarget('');
              }
            }}
          >
            Play
          </button>
        </div>
      </div>

      {/* discardCard */}
      <div>
        <span className={labelClass}>discardCard</span>
        <div className="flex items-center gap-1">
          <select
            className={selectClass}
            value={discardTarget}
            onChange={e => setDiscardTarget(e.target.value)}
          >
            <option value="">— instance —</option>
            {onBoard.map(id => (
              <option key={id} value={id}>
                {instName(id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              if (discardTarget) {
                cheat?.discardCard(Number(discardTarget));
                setDiscardTarget('');
              }
            }}
          >
            Discard
          </button>
        </div>
      </div>

      {/* destroyCard */}
      <div>
        <span className={labelClass}>destroyCard</span>
        <div className="flex items-center gap-1">
          <select
            className={selectClass}
            value={destroyTarget}
            onChange={e => setDestroyTarget(e.target.value)}
          >
            <option value="">— instance —</option>
            {allAlive.map(id => (
              <option key={id} value={id}>
                {instName(id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              if (destroyTarget) {
                cheat?.destroyCard(Number(destroyTarget));
                setDestroyTarget('');
              }
            }}
          >
            Destroy
          </button>
        </div>
      </div>

      {/* discoverCard */}
      <div>
        <span className={labelClass}>discoverCard</span>
        <div className="flex items-center gap-1">
          <select
            className={selectClass}
            value={discoverTarget}
            onChange={e => setDiscoverTarget(e.target.value)}
          >
            <option value="">— instance —</option>
            {gameState.discoveryPile.map(id => (
              <option key={id} value={id}>
                {instName(id)}
              </option>
            ))}
          </select>
          <button
            type="button"
            className={btnClass}
            onClick={() => {
              if (discoverTarget) {
                cheat?.discoverCard(Number(discoverTarget));
                setDiscoverTarget('');
              }
            }}
          >
            Discover
          </button>
        </div>
      </div>

      {/* chooseState */}
      <div>
        <span className={labelClass}>chooseState</span>
        <div className="flex gap-1">
          <select
            className={selectClass}
            value={stateInst}
            onChange={e => {
              setStateInst(e.target.value);
              setTargetState('');
            }}
          >
            <option value="">— instance —</option>
            {allAlive.map(id => (
              <option key={id} value={id}>
                {instName(id)}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <select
              className={selectClass}
              value={targetState}
              onChange={e => setTargetState(e.target.value)}
              disabled={!stateInst}
            >
              <option value="">— state —</option>
              {availableStates.map(s => (
                <option key={s.id} value={s.id}>
                  {s.id} {tCardName(t, s.name)}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={btnClass}
              onClick={() => {
                if (stateInst && targetState) {
                  cheat?.chooseState(Number(stateInst), Number(targetState));
                  setStateInst('');
                  setTargetState('');
                }
              }}
            >
              Set
            </button>
          </div>
        </div>
      </div>

      {/* addSticker */}
      <div>
        <span className={labelClass}>addSticker</span>
        <div className="flex gap-1">
          <select
            className={selectClass}
            value={stickerInst}
            onChange={e => setStickerInst(e.target.value)}
          >
            <option value="">— instance —</option>
            {allAlive.map(id => (
              <option key={id} value={id}>
                {instName(id)}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-1">
            <select
              className={selectClass}
              value={stickerTarget}
              onChange={e => setStickerTarget(e.target.value)}
            >
              <option value="">— sticker —</option>
              {allStickers.map(([sid, s]) => (
                <option key={sid} value={sid}>
                  {sid} {s.label ?? s.icon ?? sid}
                </option>
              ))}
            </select>
            <button
              type="button"
              className={btnClass}
              onClick={() => {
                if (stickerInst && stickerTarget) {
                  cheat?.addSticker(Number(stickerInst), Number(stickerTarget));
                  setStickerInst('');
                  setStickerTarget('');
                }
              }}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheatPanel() {
  const { t } = useTranslation();
  const { gameState, defs, getEvents } = useGame();
  const [open, setOpen] = useState(false);

  const events = getEvents();

  if (!import.meta.env.DEV) return null;

  return (
    <div className="bg-background border-t-border border-t">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="text-ink/70 hover:bg-surface flex w-full items-center gap-2 px-4 py-1.5 text-xs font-medium transition-colors"
      >
        <span className="bg-surface text-ink/60 rounded-full px-2 py-0.5 font-mono tabular-nums">
          {events.length}
        </span>
        {t('cheatPanel.title')}
        <span className="ml-auto opacity-50">{open ? '▼' : '▲'}</span>
      </button>

      {open && (
        <div className="flex max-h-48">
          <div className="scrollbar flex flex-1 flex-col-reverse overflow-y-auto">
            {[...events].reverse().map(e => (
              <EventRow key={e.id} event={e} gameState={gameState} defs={defs} />
            ))}
          </div>
          <Cheat />
        </div>
      )}
    </div>
  );
}
