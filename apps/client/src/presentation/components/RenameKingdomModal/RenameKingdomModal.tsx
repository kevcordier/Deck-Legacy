import { Button } from '@components/ui/Button/Button';
import { TextInput } from '@components/ui/Input/TextInput';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { KINGDOM_NAME_MAX_LENGTH } from '@deck-legacy/engine/domain/kingdom/kingdomConstants';
import type { KingdomMeta } from '@domain/kingdom/KingdomMeta';
import { useAppServices } from '@hooks/useAppServices';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type RenameKingdomModalProps = {
  readonly kingdom: KingdomMeta;
  readonly onClose: () => void;
};

/** Renames a kingdom on this device and pushes the new name at the next sync. */
export function RenameKingdomModal({ kingdom, onClose }: RenameKingdomModalProps) {
  const { kingdomUseCases } = useAppServices();
  const { t } = useTranslation();
  const [name, setName] = useState(kingdom.name);
  const trimmed = name.trim();

  const confirm = () => {
    if (trimmed.length === 0) return;
    kingdomUseCases.rename.execute(kingdom.id, trimmed);
    onClose();
  };

  return (
    <Modal
      title={t('kingdom.renameTitle')}
      onClose={onClose}
      footer={
        <View className="flex-row justify-end gap-2">
          <Button size="md" variant="text" color="ink" font="body" onPress={onClose}>
            {t('kingdom.cancel')}
          </Button>
          <Button
            size="md"
            color="primary"
            font="body"
            disabled={trimmed.length === 0}
            onPress={confirm}
          >
            {t('kingdom.renameConfirm')}
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
          autoFocus
          returnKeyType="done"
          onSubmitEditing={confirm}
          className="min-h-11"
        />
      </View>
    </Modal>
  );
}
