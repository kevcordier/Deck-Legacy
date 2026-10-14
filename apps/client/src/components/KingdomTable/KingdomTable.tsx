import { Button } from '@components/ui/Button/Button';
import { DestroyIcon } from '@components/ui/Icon/icon';
import { Text, TextStyle } from '@components/ui/Text/Text';
import type { CampaignSegmentScore } from '@deck-legacy/api-contract';
import { ExpansionIcon } from '@helpers/expansionIcon';
import type { KingdomMeta } from '@services/persistence';
import { useTranslation } from 'react-i18next';
import { Pressable, View, useWindowDimensions } from 'react-native';

/** Below this width, each kingdom is a card instead of a table row. */
const TABLE_MIN_WIDTH = 640;

type KingdomTableProps = {
  readonly kingdoms: readonly KingdomMeta[];
  readonly onOpen: (kingdom: KingdomMeta) => void;
  readonly onDelete: (kingdom: KingdomMeta) => void;
};

function baseScore(kingdom: KingdomMeta): number | undefined {
  return kingdom.summary.segments.find(s => s.segment === 'base')?.score;
}

/** Expansions in the order they were played. */
function expansions(kingdom: KingdomMeta): CampaignSegmentScore[] {
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

function DeleteButton({
  kingdom,
  onDelete,
}: Pick<KingdomTableProps, 'onDelete'> & {
  readonly kingdom: KingdomMeta;
}) {
  const { t } = useTranslation();
  return (
    <Button
      variant="text"
      color="danger"
      size="sm"
      className="min-h-11 min-w-11 items-center justify-center"
      accessibilityLabel={t('kingdom.delete', { name: kingdom.name })}
      title={t('kingdom.delete', { name: kingdom.name })}
      onPress={() => onDelete(kingdom)}
    >
      <DestroyIcon className="size-5" color="currentColor" />
    </Button>
  );
}

/**
 * The player's kingdoms: name, total score, base game score, then each expansion (logo and
 * cumulative score) in the order it was played, and the delete action.
 */
export function KingdomTable({ kingdoms, onOpen, onDelete }: KingdomTableProps) {
  const { t } = useTranslation();
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
                onPress={() => onOpen(kingdom)}
                accessibilityLabel={t('kingdom.open', { name: kingdom.name })}
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
                  <Text className="text-ink-card/70 text-sm">
                    {t('home.table.base')}{' '}
                    <Text className="font-body-bold">{baseScore(kingdom) ?? '–'}</Text>
                  </Text>
                  {expansions(kingdom).map(segment => (
                    <ExpansionScore key={segment.segment} segment={segment} />
                  ))}
                </View>
              </Pressable>
              <DeleteButton kingdom={kingdom} onDelete={onDelete} />
            </View>
          ))}
        </View>
      </TextStyle>
    );
  }

  // `bg-card` keeps its color in every theme: use `ink-card` and `base-primary` on it.
  return (
    <TextStyle className="text-ink-card">
      <View className="border-ink-card/30 bg-card overflow-hidden rounded-lg border">
        <View className="border-ink-card/30 bg-ink-card/10 flex-row items-center gap-2 border-b px-3 py-2">
          <Text className="flex-[2] text-xs uppercase">{t('home.table.name')}</Text>
          <Text className="w-20 text-right text-xs uppercase">{t('home.table.total')}</Text>
          <Text className="w-20 text-right text-xs uppercase">{t('home.table.base')}</Text>
          {Array.from({ length: columns }, (_, i) => (
            <Text key={i} className="w-24 text-center text-xs uppercase">
              {t('home.table.expansion', { number: i + 1 })}
            </Text>
          ))}
          <View className="w-11" />
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
                onPress={() => onOpen(kingdom)}
                accessibilityLabel={t('kingdom.open', { name: kingdom.name })}
                className="min-h-12 flex-1 flex-row items-center gap-2 active:opacity-70"
              >
                <Text className="font-display flex-[2] text-lg" numberOfLines={1}>
                  {kingdom.name}
                </Text>
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
              <DeleteButton kingdom={kingdom} onDelete={onDelete} />
            </View>
          );
        })}
      </View>
    </TextStyle>
  );
}
