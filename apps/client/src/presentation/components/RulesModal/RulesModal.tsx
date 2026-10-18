// Relative paths: babel-plugin-inline-import does not resolve the tsconfig aliases.
import rulesEn from '../../../data/locales/rules.en.md';
import rulesFr from '../../../data/locales/rules.fr.md';
import { MarkdownText } from '@components/ui/MarkdownText/MarkdownText';
import { Modal } from '@components/ui/Modal/Modal';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

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
      <View className="flex-1 p-4">
        <MarkdownText text={raw} />
      </View>
    </Modal>
  );
}
