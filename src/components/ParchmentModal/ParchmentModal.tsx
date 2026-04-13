import { Button } from '@components/ui/Button/Button';
import { MarkdownText } from '@components/ui/MarkdownText/MarckdownText';
import { Modal } from '@components/ui/Modal/Modal';
import type { CardDef } from '@engine/domain/types';
import { tCardParchmentText } from '@helpers/cardI18n';
import { useTranslation } from 'react-i18next';

interface ParchmentModalProps {
  def: CardDef;
  onContinue: () => void;
}

export function ParchmentModal({ def, onContinue }: ParchmentModalProps) {
  const { t } = useTranslation();

  return (
    <Modal>
      <div className="flex flex-col gap-4 p-4">
        <MarkdownText text={tCardParchmentText(t, def.id)} />
        <div className="flex justify-end">
          <Button color="base-primary" onClick={onContinue}>
            {t('parchmentCard.continue')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
