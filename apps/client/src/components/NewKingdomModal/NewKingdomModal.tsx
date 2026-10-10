import { RulesModal } from '@components/RulesModal/RulesModal';
import { Button } from '@components/ui/Button/Button';
import { Checkbox } from '@components/ui/Checkbox/Checkbox';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { KINGDOM_NAME_MAX_LENGTH } from '@deck-legacy/api-contract';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type NewKingdomModalProps = {
  readonly onClose: () => void;
  readonly onCreate: (name: string, tutorial: boolean) => void;
  /** Initial value of the tutorial checkbox. */
  readonly tutorialByDefault: boolean;
};

/** Name of the new kingdom, tutorial choice and rules, then validation. */
export function NewKingdomModal({ onClose, onCreate, tutorialByDefault }: NewKingdomModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [tutorial, setTutorial] = useState(tutorialByDefault);
  const [rulesOpen, setRulesOpen] = useState(false);
  const trimmed = name.trim();

  const submit = () => {
    if (trimmed.length > 0) onCreate(trimmed, tutorial);
  };

  return (
    <>
      <Modal
        title={t('kingdom.newTitle')}
        onClose={onClose}
        footer={
          <View className="flex-row justify-end gap-2">
            <Button size="md" color="ink" variant="text" font="body" onPress={onClose}>
              {t('kingdom.cancel')}
            </Button>
            <Button
              size="md"
              color="primary"
              font="body"
              disabled={trimmed.length === 0}
              onPress={submit}
            >
              {t('kingdom.validate')}
            </Button>
          </View>
        }
      >
        <View className="gap-2">
          <Text className="text-sm">{t('kingdom.nameLabel')}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            maxLength={KINGDOM_NAME_MAX_LENGTH}
            placeholder={t('kingdom.namePlaceholder')}
            autoFocus
            returnKeyType="done"
            onSubmitEditing={submit}
            className="min-h-11"
          />
        </View>

        <View className="min-h-11 justify-center">
          <Checkbox label={t('pregame.tutorial')} checked={tutorial} onChange={setTutorial} />
        </View>

        <View className="items-start gap-1">
          <Text className="text-ink/70 text-xs">{t('kingdom.rulesHint')}</Text>
          <Button size="md" color="ink" font="body" onPress={() => setRulesOpen(true)}>
            {t('pregame.viewRules')}
          </Button>
        </View>
      </Modal>

      {rulesOpen && <RulesModal onClose={() => setRulesOpen(false)} />}
    </>
  );
}
