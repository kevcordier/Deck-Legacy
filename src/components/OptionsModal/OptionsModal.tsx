import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './OptionsModal.css';

interface OptionsModalProps {
  onClose: () => void;
  onReset: () => void;
}

export function OptionsModal({ onClose, onReset }: OptionsModalProps) {
  const { t, i18n } = useTranslation();
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    onReset();
    onClose();
  }

  return (
    <div className="om-overlay" onClick={onClose}>
      <div className="om-panel" onClick={e => e.stopPropagation()}>
        <div className="om-header">
          <div className="om-title">{t('options.title')}</div>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>
        <div className="om-body">
          <div className="om-row">
            <span className="om-label">{t('options.language')}</span>
            <div className="om-lang-btns">
              {(['en', 'fr'] as const).map(lang => (
                <button
                  key={lang}
                  onClick={() => i18n.changeLanguage(lang)}
                  className={`om-lang-btn ${i18n.language === lang ? 'active' : ''}`}
                >
                  {t(`options.${lang}`)}
                </button>
              ))}
            </div>
          </div>

          <div className="om-row om-row--danger">
            {confirmReset ? (
              <>
                <span className="om-label">{t('options.resetConfirm')}</span>
                <div className="om-lang-btns">
                  <button className="om-reset-btn om-reset-btn--confirm" onClick={handleReset}>
                    {t('options.resetYes')}
                  </button>
                  <button className="om-lang-btn" onClick={() => setConfirmReset(false)}>
                    {t('options.resetNo')}
                  </button>
                </div>
              </>
            ) : (
              <>
                <span className="om-label">{t('options.reset')}</span>
                <button className="om-reset-btn" onClick={() => setConfirmReset(true)}>
                  {t('options.resetBtn')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
