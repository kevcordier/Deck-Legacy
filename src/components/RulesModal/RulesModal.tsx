import rulesEn from '../../data/locales/rules.en.md?raw';
import rulesFr from '../../data/locales/rules.fr.md?raw';
import { MarkdownText } from '@components/ui/MarkdownText/MarckdownText';
import { Modal } from '@components/ui/Modal/Modal';
import { useTranslation } from 'react-i18next';

interface RulesModalProps {
  readonly onClose: () => void;
}

const rulesContent: Record<string, string> = {
  en: rulesEn,
  fr: rulesFr,
};

export function RulesModal({ onClose }: RulesModalProps) {
  const { t, i18n } = useTranslation();
  const raw = rulesContent[i18n.language] ?? rulesEn;

  return (
    <Modal title={t('rules.title')} onClose={onClose}>
      <div className="flex-1 p-4">
        <MarkdownText text={raw} />
      </div>
    </Modal>
  );
}
