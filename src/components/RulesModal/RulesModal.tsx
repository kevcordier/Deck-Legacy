import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rulesEn from '../../i18n/locales/rules.en.md?raw';
import rulesFr from '../../i18n/locales/rules.fr.md?raw';
import './RulesModal.css';
import {
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  IronIcon,
  StoneIcon,
  WeaponIcon,
  WoodIcon,
} from '@components/ui/Icon';
import type { ComponentType } from 'react';

interface RulesModalProps {
  onClose: () => void;
}

const rulesContent: Record<string, string> = {
  en: rulesEn,
  fr: rulesFr,
};

const ICON_MAP: Record<string, ComponentType> = {
  gold: GoldIcon,
  wood: WoodIcon,
  stone: StoneIcon,
  iron: IronIcon,
  weapon: WeaponIcon,
  goods: GoodsIcon,
  glory: GloryIcon,
};

function injectIcons(content: string): string {
  return content.replace(
    /\{\{(gold|wood|stone|iron|weapon|goods|glory)\}\}/g,
    (_, key: string) => `![${key}](./${key}.svg)`,
  );
}

function IconImg({ src, alt }: { src?: string; alt?: string }) {
  const key = src?.replace('./', '').replace('.svg', '') ?? '';
  const Icon = ICON_MAP[key];
  if (Icon) {
    return <Icon />;
  }
  return <img src={src} alt={alt} />;
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
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{ img: ({ src, alt }) => <IconImg src={src} alt={alt} /> }}
          >
            {injectIcons(raw)}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
