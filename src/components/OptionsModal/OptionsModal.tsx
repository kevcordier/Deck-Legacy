import { Button } from '@components/ui/Button/Button';
import { ButtonGroup } from '@components/ui/ButtonGroup/ButtonGroup';
import { Modal } from '@components/ui/Modal/Modal';
import { GameUIContext } from '@contexts/GameUIContext';
import type { Theme } from '@contexts/GameUIProvider';
import { exportSaveDataAsJson, importSaveDataFromJson } from '@engine/infrastructure/persistence';
import { type ChangeEvent, use, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface OptionsModalProps {
  readonly onClose: () => void;
  readonly onReset: () => void;
}

export function OptionsModal({ onClose, onReset }: OptionsModalProps) {
  const { t, i18n } = useTranslation();
  const [confirmReset, setConfirmReset] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { theme, applyTheme } = use(GameUIContext);

  function handleReset() {
    onReset();
    onClose();
  }

  function handleExportSave() {
    const saveAsJson = exportSaveDataAsJson();
    if (!saveAsJson) {
      toast.error(t('options.exportNoSave'));
      return;
    }

    const blob = new Blob([saveAsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deck-legacy-save.json';
    link.click();
    URL.revokeObjectURL(url);
    toast.success(t('options.exportSuccess'));
  }

  function handleOpenImport() {
    fileInputRef.current?.click();
  }

  async function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();
    const isJsonFile = fileName.endsWith('.json') || file.type === 'application/json';
    if (!isJsonFile) {
      toast.error(t('options.importInvalidFile'));
      event.target.value = '';
      return;
    }

    const rawContent = await file.text();
    const importError = importSaveDataFromJson(rawContent);
    event.target.value = '';

    if (importError === 'invalid_json') {
      toast.error(t('options.importInvalidJson'));
      return;
    }

    if (importError === 'invalid_schema') {
      toast.error(t('options.importInvalidSchema'));
      return;
    }

    toast.success(t('options.importSuccess'));
    window.location.reload();
  }

  return (
    <Modal title={t('options.title')} onClose={onClose}>
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

      <div className="flex flex-col items-start gap-2">
        <span className="text-xs">{t('options.saveData')}</span>
        <div className="flex gap-2">
          <Button size="sm" color="ink" onClick={handleExportSave} font="body">
            {t('options.exportJson')}
          </Button>
          <Button size="sm" color="ink" onClick={handleOpenImport} font="body">
            {t('options.importJson')}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={handleImportFile}
        />
      </div>

      <div className="flex flex-col items-start gap-2">
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
