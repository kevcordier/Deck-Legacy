import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import { Modal } from '@components/ui/Modal/Modal';
import { getActiveState } from '@engine/application/cardHelpers';
import { PassiveType } from '@engine/domain/enums';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { useTranslation } from 'react-i18next';

interface PurgeModalProps {
  readonly defs: Record<number, CardDef>;
  readonly instances: Record<number, CardInstance>;
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
    <div className="flex min-w-60 max-w-80 flex-col items-stretch gap-2 @container">
      <GameCard instance={instance} />
      {onSelect ? (
        <Button onClick={() => onSelect(instanceId)} color="danger" size="sm" disabled={disabled}>
          {t('campaign.purge')}
        </Button>
      ) : (
        <span className="font-body text-base-ink/80 text-xs text-center">
          {formatInstanceLabel(instanceId)}
        </span>
      )}
    </div>
  );
}

export function PurgeModal({
  defs,
  instances,
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

  return (
    <Modal title={t('campaign.purgeTitle')}>
      <div className="flex-1 p-4">
        <p className="text-sm">{t('campaign.purgeDescription')}</p>

        <div className="flex flex-col gap-2">
          {purgeCandidates.length > 0 && (
            <>
              <p className="text-sm">{t('campaign.purgeBatchLabel')}</p>
              <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {purgeCandidates.map(id => {
                  const instance = instances[id];
                  if (!instance) return null;
                  const state = getActiveState(instance, defs);
                  const disabled =
                    state.negative === true ||
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
              </div>
            </>
          )}

          {purgeCandidates.length === 0 &&
            canSelectPermanentForPurge &&
            purgePermanentCandidates.length > 0 && (
              <>
                <p className="text-sm">{t('campaign.purgePermanentLabel')}</p>
                <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
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
                </div>
              </>
            )}

          <div className="text-sm">
            {t('campaign.purgeSelected', { count: selectedPurgeIds.length })}
          </div>

          {selectedPurgeIds.length > 0 && (
            <div className="grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
              {selectedPurgeIds.map(id => {
                const instance = instances[id];
                if (!instance) {
                  return (
                    <span
                      key={id}
                      className="border-border bg-background/70 font-body rounded-sm border px-2 py-1 text-xs"
                    >
                      {formatInstanceLabel(id)}
                    </span>
                  );
                }

                return <PurgeCardTile key={id} instance={instance} instanceId={id} />;
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={finalizePurge}
            color="primary"
            size="md"
            disabled={!isPurgeSelectionComplete}
          >
            {t('campaign.finalizePurge')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
