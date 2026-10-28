import { Button } from '@components/ui/Button/Button';
import { Checkbox } from '@components/ui/Checkbox/Checkbox';
import { Modal } from '@components/ui/Modal/Modal';
import { Text } from '@components/ui/Text/Text';
import { GameUIContext } from '@contexts/GameUIContext';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

/** `progress`: drawing a card with resources left; `action`: leaving while a card can spend them. */
export type ResourceWarningKind = 'progress' | 'action';

interface ResourceWarningModalProps {
  readonly kind: ResourceWarningKind;
  readonly onCancel: () => void;
  readonly onConfirm: () => void;
}

/** Asks before a move that loses the resources; "don't remind me" turns the warning off. */
export function ResourceWarningModal({ kind, onCancel, onConfirm }: ResourceWarningModalProps) {
  const { t } = useTranslation();
  const { setResourceWarningEnabled } = use(GameUIContext);
  const [dontRemind, setDontRemind] = useState(false);
  const key = kind === 'action' ? 'actionWarning' : 'progressWarning';

  const close = (then: () => void) => () => {
    if (dontRemind) setResourceWarningEnabled(false);
    then();
  };

  return (
    <Modal
      title={t(`${key}.title`)}
      onClose={close(onCancel)}
      footer={
        <View className="flex-row justify-end gap-2">
          <Button variant="outlined" size="sm" onPress={close(onCancel)}>
            {t('progressWarning.cancel')}
          </Button>
          <Button color="primary" size="sm" onPress={close(onConfirm)}>
            {t(`${key}.confirm`)}
          </Button>
        </View>
      }
    >
      <Text>{t(`${key}.message`)}</Text>
      <Checkbox
        label={t('progressWarning.dontRemind')}
        checked={dontRemind}
        onChange={setDontRemind}
      />
    </Modal>
  );
}
