import { CardNumber } from '@components/CardNumber/CardNumber';
import { Button } from '@components/ui/Button/Button';
import { Grid } from '@components/ui/Grid/Grid';
import { EyeIcon } from '@components/ui/Icon/icon';
import { Modal } from '@components/ui/Modal/Modal';
import type { CardDef, CardInstance } from '@deck-legacy/engine/domain/types';
import { tCardName } from '@helpers/cardI18n';
import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

interface CardStatePreviewProps {
  readonly instance: CardInstance;
  readonly defs: Record<number, CardDef>;
  /** Injected by GameCard to avoid a GameCard <-> CardStatePreview import cycle. */
  readonly renderCard: (instance: CardInstance) => ReactNode;
}

export function CardStatePreview({ instance, defs, renderCard }: CardStatePreviewProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const def = defs[instance.cardId];
  if (!def || def.states.length <= 1) return null;

  return (
    <View>
      <Button
        onPress={() => setOpen(true)}
        title={t('cardPreview.viewAllStates')}
        color="ink-card"
        variant="text"
        size="sm"
      >
        <EyeIcon className="text-ink-card size-4" />
      </Button>

      {open && (
        <CardStatesModal
          instance={instance}
          def={def}
          renderCard={renderCard}
          onClose={() => setOpen(false)}
        />
      )}
    </View>
  );
}

type CardStatesModalProps = {
  readonly instance: CardInstance;
  readonly def: CardDef;
  readonly renderCard: (instance: CardInstance) => ReactNode;
  readonly onClose: () => void;
};

function CardStatesModal({ instance, def, renderCard, onClose }: CardStatesModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      title={tCardName(t, def.states[0]?.name || '')}
      subtitle={
        <>
          {t('cardPreview.statesMeta', { count: def.states.length })}{' '}
          <CardNumber instanceId={instance.id} iconClassName="size-4" />
        </>
      }
      onClose={onClose}
    >
      <Grid minItemWidth={240} maxColumns={4}>
        {def.states.map(s => {
          const isCurrent = s.id === instance.stateId;
          const fakeInstance: CardInstance = {
            ...instance,
            stateId: s.id,
            trackProgress: isCurrent ? instance.trackProgress : [],
          };
          return (
            <View
              key={s.id}
              className={`max-w-80 rounded-xl ${isCurrent ? 'border-primary border-4' : ''}`}
            >
              {renderCard(fakeInstance)}
            </View>
          );
        })}
      </Grid>
    </Modal>
  );
}
