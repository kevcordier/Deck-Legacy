import { useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { GameUIContext } from '@contexts/GameUIContext';
import { Button } from '@components/ui/Button/Button';
import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import type { Theme } from '@contexts/GameUIProvider';

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
    <div
      className="fixed inset-0 z-200 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="bg-background border-border min-w rounded-lg border p-8"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <div className="text-primary font-bold uppercase">{t('options.title')}</div>
          <Button onClick={onClose} variant="text" color="ink" size="sm">
            ✕
          </Button>
        </div>
        <div className="flex flex-col gap-6">
          <ButtonGroup
            label={t('options.theme')}
            value={theme}
            onChange={value => setTheme(value as Theme)}
            size="sm"
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
            options={[
              { children: t('options.en'), value: 'en' },
              { children: t('options.fr'), value: 'fr' },
            ]}
          />

          <div className="flex flex-col gap-2">
            {confirmReset ? (
              <>
                <span className="text-xs">{t('options.resetConfirm')}</span>
                <div className="om-lang-btns">
                  <Button size="sm" color="danger" onClick={handleReset}>
                    {t('options.resetYes')}
                  </Button>
                  <Button size="sm" color="ink" onClick={() => setConfirmReset(false)}>
                    {t('options.resetNo')}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <span className="text-xs">{t('options.reset')}</span>
                <Button onClick={() => setConfirmReset(true)} size="sm" color="danger">
                  {t('options.resetBtn')}
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
