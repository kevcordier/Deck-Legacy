import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rulesEn from '../../i18n/locales/rules.en.md?raw';
import rulesFr from '../../i18n/locales/rules.fr.md?raw';
import goldIcon from '@assets/icons/gold.svg';
import woodIcon from '@assets/icons/wood.svg';
import stoneIcon from '@assets/icons/stone.svg';
import ironIcon from '@assets/icons/iron.svg';
import swordIcon from '@assets/icons/sword.svg';
import goodsIcon from '@assets/icons/goods.svg';
import gloryIcon from '@assets/icons/glory.svg';
import './RulesModal.css';

interface RulesModalProps {
  onClose: () => void;
}

const rulesContent: Record<string, string> = {
  en: rulesEn,
  fr: rulesFr,
};

const ICON_URLS: Record<string, string> = {
  gold: goldIcon,
  wood: woodIcon,
  stone: stoneIcon,
  iron: ironIcon,
  sword: swordIcon,
  goods: goodsIcon,
  glory: gloryIcon,
};

function injectIcons(content: string): string {
  return content.replace(
    /\{\{(gold|wood|stone|iron|sword|goods|glory)\}\}/g,
    (_, key: string) => `![${key}](${ICON_URLS[key]})`,
  );
}

export function RulesModal({ onClose }: RulesModalProps) {
  const { t, i18n } = useTranslation();
  const raw = rulesContent[i18n.language] ?? rulesEn;

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-panel" onClick={e => e.stopPropagation()}>
        <div className="rm-header">
          <div className="rm-title">{t('rules.title')}</div>
          <button onClick={onClose} className="btn-close">
            ✕
          </button>
        </div>
        <div className="rm-body">
          <ReactMarkdown remarkPlugins={[remarkGfm]} urlTransform={url => url}>
            {injectIcons(raw)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
