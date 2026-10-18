import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Grid } from '@components/ui/Grid/Grid';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { getActiveState } from '@deck-legacy/engine/domain/cardHelpers';
import { PassiveType } from '@deck-legacy/engine/domain/enums';
import type { CardDef, CardInstance } from '@deck-legacy/engine/domain/types';
import { useIsDesktop } from '@hooks/useIsDesktop';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface PurgeModalProps {
  readonly defs: Record<number, CardDef>;
  readonly instances: Record<number, CardInstance>;
  readonly batchSize: number;
  /** Allied permanents the expansion purges. */
  readonly permanentToPurge: number;
  readonly purgeBatch: number[];
  readonly purgeCandidates: number[];
  readonly purgePermanentCandidates: number[];
  readonly selectedPurgeIds: number[];
  readonly canSelectPermanentForPurge: boolean;
  readonly isPurgeSelectionComplete: boolean;
  readonly selectPurgeCard: (instanceId: number) => void;
  readonly selectPurgePermanent: (instanceId: number) => void;
  readonly finalizePurge: () => void;
}

interface PurgeCardTileProps {
  readonly instance: CardInstance;
  readonly disabled?: boolean;
  readonly instanceId: number;
  readonly onSelect?: (instanceId: number) => void;
}

function formatInstanceLabel(instanceId: number): string {
  return `#${instanceId}`;
}

function PurgeCardTile({ instance, instanceId, onSelect, disabled }: PurgeCardTileProps) {
  const { t } = useTranslation();
  return (
    <View className="max-w-80 items-stretch gap-2">
      <View className={disabled ? 'opacity-40' : undefined}>
        <GameCard instance={instance} />
      </View>
      {onSelect ? (
        <Button onPress={() => onSelect(instanceId)} color="danger" size="sm" disabled={disabled}>
          {t('campaign.purge')}
        </Button>
      ) : (
        <Text className="text-ink/80 text-center text-xs">{formatInstanceLabel(instanceId)}</Text>
      )}
    </View>
  );
}

export function PurgeModal({
  defs,
  instances,
  batchSize,
  permanentToPurge,
  purgeBatch,
  purgeCandidates,
  purgePermanentCandidates,
  selectedPurgeIds,
  canSelectPermanentForPurge,
  isPurgeSelectionComplete,
  selectPurgeCard,
  selectPurgePermanent,
  finalizePurge,
}: PurgeModalProps) {
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  // Phone: at least two cards per row (the board's mini card width).
  const gridProps = isDesktop ? { minItemWidth: 240 } : { minItemWidth: 140, gap: 8 };

  return (
    <Modal title={t('campaign.purgeTitle')}>
      <View className="flex-1 gap-4 p-4">
        <Text className="text-sm">
          {t('campaign.purgeDescription', { size: batchSize })}
          {permanentToPurge > 0 &&
            ` ${t('campaign.details.purgePermanent', { count: permanentToPurge })}`}
        </Text>

        <View className="gap-2">
          {purgeCandidates.length > 0 && (
            <>
              <Text className="text-sm">{t('campaign.purgeBatchLabel')}</Text>
              <Grid {...gridProps} maxColumns={5} className="p-2">
                {purgeBatch.map(id => {
                  const instance = instances[id];
                  if (!instance) return null;
                  const state = getActiveState(instance, defs);
                  // Not a candidate: negative, or outside the purge focus while it is unmet.
                  const disabled =
                    !purgeCandidates.includes(id) ||
                    Boolean(
                      state.passives?.some(
                        passive => passive.type === PassiveType.CANT_BE_DESTROYED,
                      ),
                    );

                  return (
                    <PurgeCardTile
                      key={id}
                      instance={instance}
                      disabled={disabled}
                      instanceId={id}
                      onSelect={selectPurgeCard}
                    />
                  );
                })}
              </Grid>
            </>
          )}

          {purgeCandidates.length === 0 &&
            canSelectPermanentForPurge &&
            purgePermanentCandidates.length > 0 && (
              <>
                <Text className="text-sm">{t('campaign.purgePermanentLabel')}</Text>
                <Grid {...gridProps} maxColumns={5} className="p-2">
                  {purgePermanentCandidates.map(id => {
                    const instance = instances[id];
                    if (!instance) return null;

                    return (
                      <PurgeCardTile
                        key={id}
                        instance={instance}
                        instanceId={id}
                        onSelect={selectPurgePermanent}
                      />
                    );
                  })}
                </Grid>
              </>
            )}

          <Text className="text-sm">
            {t('campaign.purgeSelected', { count: selectedPurgeIds.length })}
          </Text>

          {selectedPurgeIds.length > 0 && (
            <Grid {...gridProps} maxColumns={5} className="p-2">
              {selectedPurgeIds.map(id => {
                const instance = instances[id];
                if (!instance) {
                  return (
                    <View
                      key={id}
                      className="border-border bg-background/70 rounded-sm border px-2 py-1"
                    >
                      <Text className="text-xs">{formatInstanceLabel(id)}</Text>
                    </View>
                  );
                }

                return <PurgeCardTile key={id} instance={instance} instanceId={id} />;
              })}
            </Grid>
          )}
        </View>

        <View className="flex-row justify-end">
          <Button
            onPress={finalizePurge}
            color="primary"
            size="md"
            disabled={!isPurgeSelectionComplete}
          >
            {t('campaign.finalizePurge')}
          </Button>
        </View>
      </View>
    </Modal>
  );
}
