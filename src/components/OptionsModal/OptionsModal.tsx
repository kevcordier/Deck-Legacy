import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GameUIContext } from '@contexts/GameUIContext';
import { Button } from '@components/ui/Button/Button';
import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import type { Theme } from '@contexts/GameUIProvider';
import { Modal } from '@components/ui/Modal/Modal';

interface OptionsModalProps {
  onClose: () => void;
  onReset: () => void;
}

export function OptionsModal({ onClose, onReset }: OptionsModalProps) {
  const { t, i18n } = useTranslation();
  const [confirmReset, setConfirmReset] = useState(false);
  const { theme, setTheme } = useContext(GameUIContext);

  function handleReset() {
    onReset();
    onClose();
  }

  return (
    <Modal title={t('options.title')} onClose={onClose} className="w-full max-w-xs">
      <ButtonGroup
        label={t('options.theme')}
        value={theme}
        onChange={value => setTheme(value as Theme)}
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

      <div className="flex flex-col gap-2">
        {confirmReset ? (
          <>
            <span className="text-xs">{t('options.resetConfirm')}</span>
            <div className="flex gap-2">
              <Button size="sm" color="danger" onClick={handleReset} font="body">
                {t('options.resetYes')}
              </Button>
              <Button size="sm" color="ink" onClick={() => setConfirmReset(false)} font="body">
                {t('options.resetNo')}
              </Button>
            </div>
          </>
        ) : (
          <>
            <span className="text-xs">{t('options.reset')}</span>
            <Button onClick={() => setConfirmReset(true)} size="sm" color="danger" font="body">
              {t('options.resetBtn')}
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
