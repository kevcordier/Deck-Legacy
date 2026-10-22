import { SelectInput } from '@components/ui/Input/SelectInput';
import { TextInput } from '@components/ui/Input/TextInput';
import { Text } from '@components/ui/Text/Text';
import { getActiveState } from '@deck-legacy/engine/domain/cards/selection/getActiveState';
import { ResourceType } from '@deck-legacy/engine/domain/enums';
import { useGame } from '@hooks/useGame';
import { tCardName } from '@i18n/card/tCardName';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, View } from 'react-native';

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
  [ResourceType.SCIENCE]: 'science',
  [ResourceType.HERB]: 'herbes',
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

  const discovery = [...gameState.discoveryPile, ...(gameState.discoverablePile ?? [])];
  const notOnBoard = [...gameState.drawPile, ...gameState.discardPile, ...discovery];
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
    <ScrollView className="max-h-48" contentContainerClassName="gap-2 p-2">
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
          options={instanceOptions(discovery)}
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
  const [open, setOpen] = useState(false);

  if (!__DEV__) return null;

  return (
    <View className="bg-background border-t-border border-t">
      <Pressable
        onPress={() => setOpen(o => !o)}
        accessibilityRole="button"
        className="active:bg-ink/10 w-full flex-row items-center gap-2 px-4 py-1.5"
      >
        <Text className="text-ink/70 text-xs">{t('cheatPanel.title')}</Text>
        <Text className="ml-auto text-xs opacity-50">{open ? '▼' : '▲'}</Text>
      </Pressable>

      {open && <Cheat />}
    </View>
  );
}
