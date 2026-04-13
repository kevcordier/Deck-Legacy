import { CardListModal } from '@components/CardListModal/CardListModal';
import { GameCard } from '@components/GameCard/GameCard';
import { Button } from '@components/ui/Button/Button';
import type { CardDef, CardInstance } from '@engine/domain/types';
import { tCardName } from '@helpers/cardI18n';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

function EyeIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

interface CardStatePreviewProps {
  instance: CardInstance;
  defs: Record<number, CardDef>;
}

export function CardStatePreview({ instance, defs }: CardStatePreviewProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const def = defs[instance.cardId];
  if (!def || def.states.length <= 1) return null;

  return (
    <>
      <Button
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={t('cardPreview.viewAllStates')}
        color="base-ink"
        variant="text"
        className="p-1!"
      >
        <EyeIcon />
      </Button>

      {open && <CardStatesModal instance={instance} def={def} onClose={() => setOpen(false)} />}
    </>
  );
}

function CardStatesModal({
  instance,
  def,
  onClose,
}: {
  instance: CardInstance;
  def: CardDef;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <CardListModal
      title={tCardName(t, def.id, 1)}
      subtitle={t('cardPreview.statesMeta', { count: def.states.length, id: instance.id })}
      onClose={onClose}
    >
      {def.states.map(s => {
        const isCurrent = s.id === instance.stateId;
        const fakeInstance: CardInstance = {
          ...instance,
          stateId: s.id,
          trackProgress: isCurrent ? instance.trackProgress : [],
        };
        return (
          <GameCard
            key={s.id}
            instance={fakeInstance}
            className={`${isCurrent ? 'ring-primary ring-3' : ''}`}
            hideStatePreview
          />
        );
      })}
    </CardListModal>
  );
}
