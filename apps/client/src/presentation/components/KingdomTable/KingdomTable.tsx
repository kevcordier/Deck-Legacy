import { KingdomMenu } from './KingdomMenu';
import type { KingdomRow } from './KingdomRow';
import { ExpansionIcon } from '@components/ExpansionIcon/ExpansionIcon';
import { Text } from '@components/ui/Text/Text';
import { TextStyle } from '@components/ui/Text/TextStyle';
import type { CampaignSegmentScore } from '@domain/kingdom/CampaignSegmentScore';
import { useTranslation } from 'react-i18next';
import { Pressable, View, useWindowDimensions } from 'react-native';

/** Below this width, each kingdom is a card instead of a table row. */
const TABLE_MIN_WIDTH = 640;

type KingdomTableProps<T extends KingdomRow> = {
  readonly kingdoms: readonly T[];
  /** Scoreboard: shows the player instead of the round and turn. */
  readonly ranking?: boolean;
  readonly onOpen?: (kingdom: T) => void;
  /** Menu actions; the "⋮" menu shows only when one is given. */
  readonly onView?: (kingdom: T) => void;
  readonly onRename?: (kingdom: T) => void;
  readonly onDelete?: (kingdom: T) => void;
};

function baseScore(kingdom: KingdomRow): number | undefined {
  return kingdom.summary.segments.find(s => s.segment === 'base')?.score;
}

/** Expansions in the order they were played. */
function expansions(kingdom: KingdomRow): CampaignSegmentScore[] {
  return kingdom.summary.segments.filter(s => s.segment !== 'base');
}

function ExpansionScore({ segment }: { readonly segment: CampaignSegmentScore }) {
  const { t } = useTranslation();
  const title = t(`campaign.expansions.${segment.segment}.title`);
  return (
    <View className="flex-row items-center gap-1" accessibilityLabel={`${title}: ${segment.score}`}>
      <ExpansionIcon expansion={segment.segment} className="size-6" alt={title} />
      <Text className="font-body-bold">{segment.score}</Text>
    </View>
  );
}

/**
 * Kingdoms: name, current round and turn (or the player on the scoreboard), total score, base
 * game score, then each expansion (logo and cumulative score) in the order it was played, and a
 * menu to view, rename or delete the kingdom when those actions are given.
 */
export function KingdomTable<T extends KingdomRow>({
  kingdoms,
  ranking = false,
  onOpen,
  onView,
  onRename,
  onDelete,
}: KingdomTableProps<T>) {
  const { t } = useTranslation();
  const hasMenu = Boolean(onView ?? onRename ?? onDelete);
  const menu = (kingdom: T) =>
    hasMenu && (
      <KingdomMenu kingdom={kingdom} onView={onView} onRename={onRename} onDelete={onDelete} />
    );
  const { width } = useWindowDimensions();
  const columns = Math.max(0, ...kingdoms.map(k => expansions(k).length));

  if (width < TABLE_MIN_WIDTH) {
    return (
      <TextStyle className="text-ink-card">
        <View className="gap-3">
          {kingdoms.map(kingdom => (
            <View
              key={kingdom.id}
              className="bg-card border-ink-card/30 flex-row items-center gap-2 rounded-lg border p-3"
            >
              <Pressable
                disabled={!onOpen}
                onPress={() => onOpen?.(kingdom)}
                accessibilityLabel={onOpen && t('kingdom.open', { name: kingdom.name })}
                className="min-h-11 flex-1 gap-2 active:opacity-70"
              >
                <View className="flex-row items-baseline justify-between gap-2">
                  <Text className="font-display shrink text-lg" numberOfLines={1}>
                    {kingdom.name}
                  </Text>
                  <Text className="font-body-bold text-base-primary text-lg">
                    {kingdom.summary.score}
                  </Text>
                </View>
                <View className="flex-row flex-wrap items-center gap-x-4 gap-y-1">
                  {ranking ? (
                    <Text className="text-ink-card/70 text-sm">
                      {t('scoreboard.player')}{' '}
                      <Text className="font-body-bold">{kingdom.player}</Text>
                    </Text>
                  ) : (
                    <>
                      <Text className="text-ink-card/70 text-sm">
                        {t('resourceBar.round')}{' '}
                        <Text className="font-body-bold">{kingdom.summary.round ?? '–'}</Text>
                      </Text>
                      <Text className="text-ink-card/70 text-sm">
                        {t('resourceBar.turn')}{' '}
                        <Text className="font-body-bold">{kingdom.summary.turn ?? '–'}</Text>
                      </Text>
                    </>
                  )}
                  <Text className="text-ink-card/70 text-sm">
                    {t('home.table.base')}{' '}
                    <Text className="font-body-bold">{baseScore(kingdom) ?? '–'}</Text>
                  </Text>
                  {expansions(kingdom).map(segment => (
                    <ExpansionScore key={segment.segment} segment={segment} />
                  ))}
                </View>
              </Pressable>
              {menu(kingdom)}
            </View>
          ))}
        </View>
      </TextStyle>
    );
  }

  // `bg-card` is light on the dark page: use `ink-card` and `base-primary` on it.
  return (
    <TextStyle className="text-ink-card">
      <View className="border-ink-card/30 bg-card overflow-hidden rounded-lg border">
        <View className="border-ink-card/30 bg-ink-card/10 flex-row items-center gap-2 border-b px-3 py-2">
          <Text className="flex-[2] text-xs uppercase">{t('home.table.name')}</Text>
          {ranking ? (
            <Text className="flex-[2] text-xs uppercase">{t('scoreboard.player')}</Text>
          ) : (
            <>
              <Text className="w-16 text-right text-xs uppercase">{t('resourceBar.round')}</Text>
              <Text className="w-16 text-right text-xs uppercase">{t('resourceBar.turn')}</Text>
            </>
          )}
          <Text className="w-20 text-right text-xs uppercase">{t('home.table.total')}</Text>
          <Text className="w-20 text-right text-xs uppercase">{t('home.table.base')}</Text>
          {Array.from({ length: columns }, (_, i) => (
            <Text key={i} className="w-24 text-center text-xs uppercase">
              {t('home.table.expansion', { number: i + 1 })}
            </Text>
          ))}
          {hasMenu && <View className="w-11" />}
        </View>
        {kingdoms.map((kingdom, index) => {
          const played = expansions(kingdom);
          const isLast = index === kingdoms.length - 1;
          return (
            <View
              key={kingdom.id}
              className={`flex-row items-center gap-2 px-3 ${isLast ? '' : 'border-ink-card/30 border-b'}`}
            >
              <Pressable
                disabled={!onOpen}
                onPress={() => onOpen?.(kingdom)}
                accessibilityLabel={onOpen && t('kingdom.open', { name: kingdom.name })}
                className="min-h-12 flex-1 flex-row items-center gap-2 active:opacity-70"
              >
                <Text className="font-display flex-[2] text-lg" numberOfLines={1}>
                  {kingdom.name}
                </Text>
                {ranking ? (
                  <Text className="flex-[2]" numberOfLines={1}>
                    {kingdom.player}
                  </Text>
                ) : (
                  <>
                    <Text className="w-16 text-right">{kingdom.summary.round ?? '–'}</Text>
                    <Text className="w-16 text-right">{kingdom.summary.turn ?? '–'}</Text>
                  </>
                )}
                <Text className="font-body-bold text-base-primary w-20 text-right">
                  {kingdom.summary.score}
                </Text>
                <Text className="w-20 text-right">{baseScore(kingdom) ?? '–'}</Text>
                {Array.from({ length: columns }, (_, i) => (
                  <View key={i} className="w-24 items-center">
                    {played[i] ? (
                      <ExpansionScore segment={played[i]} />
                    ) : (
                      <Text className="text-ink-card/40">–</Text>
                    )}
                  </View>
                ))}
              </Pressable>
              {menu(kingdom)}
            </View>
          );
        })}
      </View>
    </TextStyle>
  );
}
