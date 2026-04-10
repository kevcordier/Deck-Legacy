import { useTranslation } from 'react-i18next';
import type { CardDef } from '@engine/domain/types';
import { Modal } from '@components/ui/Modal/Modal';
import { Button } from '@components/ui/Button/Button';
import { MarkdownText } from '@components/ui/MarkdownText/MarckdownText';

interface ParchmentModalProps {
  def: CardDef;
  onContinue: () => void;
}

export function ParchmentModal({ def, onContinue }: ParchmentModalProps) {
  const { t } = useTranslation();

  return (
    <Modal>
      <div className="flex flex-col gap-4 p-4">
        <MarkdownText text={def.text ?? ''} />
        <div className="flex justify-end">
          <Button color="base-primary" onClick={onContinue}>
            {t('parchmentCard.continue')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
