import { AccountPanel } from '@components/AccountPanel/AccountPanel';
import { Button } from '@components/ui/Button/Button';
import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import { Checkbox } from '@components/ui/Checkbox/Checkbox';
import { Modal } from '@components/ui/Modal/Modal';
import { Tabs } from '@components/ui/Tabs/Tabs';
import { GameUIContext } from '@contexts/GameUIContext';
import type { Theme } from '@contexts/GameUIProvider';
import { useAuth } from '@hooks/useAuth';
import { use, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

export type OptionsTab = 'general' | 'account';

interface OptionsModalProps {
  readonly onClose: () => void;
  /** Leaves the game for the kingdoms (home page); omitted on the home page itself. */
  readonly onGoHome?: () => void;
  readonly initialTab?: OptionsTab;
}

/** Options (theme, language) and, when accounts are available, the account tab. */
export function OptionsModal({ onClose, onGoHome, initialTab = 'general' }: OptionsModalProps) {
  const { t } = useTranslation();
  const { status } = useAuth();
  const accountsAvailable = status !== 'disabled';
  const [tab, setTab] = useState<OptionsTab>(accountsAvailable ? initialTab : 'general');

  return (
    <Modal title={t('options.title')} onClose={onClose}>
      {accountsAvailable && (
        <Tabs
          tabs={[
            { id: 'general', label: t('options.general') },
            { id: 'account', label: t('account.title') },
          ]}
          value={tab}
          onChange={setTab}
        />
      )}

      {tab === 'account' ? (
        <AccountPanel onDone={onClose} />
      ) : (
        <GeneralOptions onGoHome={onGoHome} />
      )}
    </Modal>
  );
}

function GeneralOptions({ onGoHome }: { readonly onGoHome?: () => void }) {
  const { t, i18n } = useTranslation();
  const { theme, applyTheme, resourceWarningEnabled, setResourceWarningEnabled } =
    use(GameUIContext);

  return (
    <>
      <ButtonGroup
        label={t('options.theme')}
        value={theme}
        onChange={value => applyTheme(value as Theme)}
        size="sm"
        font="body"
        options={[
          { children: t('options.theme_light'), value: 'light' },
          { children: t('options.theme_dark'), value: 'dark' },
          { children: t('options.theme_system'), value: 'system' },
        ]}
      />

      <ButtonGroup
        label={t('options.language')}
        value={i18n.language}
        onChange={value => i18n.changeLanguage(value)}
        size="sm"
        font="body"
        options={[
          { children: t('options.en'), value: 'en' },
          { children: t('options.fr'), value: 'fr' },
        ]}
      />

      <Checkbox
        label={t('options.resourceWarning')}
        checked={resourceWarningEnabled}
        onChange={setResourceWarningEnabled}
      />

      {onGoHome && (
        <View className="items-start">
          <Button size="sm" color="ink" onPress={onGoHome} font="body">
            {t('options.backHome')}
          </Button>
        </View>
      )}
    </>
  );
}
