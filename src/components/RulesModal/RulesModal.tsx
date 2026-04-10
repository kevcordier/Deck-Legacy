import { useTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rulesEn from '../../i18n/locales/rules.en.md?raw';
import rulesFr from '../../i18n/locales/rules.fr.md?raw';
import {
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  IronIcon,
  StoneIcon,
  WeaponIcon,
  WoodIcon,
} from '@components/ui/Icon/icon';
import React from 'react';
import { Modal } from '@components/ui/Modal/Modal';
import { Title } from '@components/ui/Title/Title';
import { Divider } from '@components/ui/Divider/Divider';

interface RulesModalProps {
  onClose: () => void;
}

const rulesContent: Record<string, string> = {
  en: rulesEn,
  fr: rulesFr,
};

const ICON_MAP: Record<string, React.ComponentType> = {
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

function IconImg({ src, alt, className }: { src?: string; alt?: string; className?: string }) {
  const key = src?.replace('./', '').replace('.svg', '') ?? '';
  const Icon = ICON_MAP[key];
  if (Icon) {
    return React.createElement(Icon, { className } as React.ComponentProps<typeof Icon>);
  }
  return <img src={src} alt={alt} className={className} />;
}

export function RulesModal({ onClose }: RulesModalProps) {
  const { t, i18n } = useTranslation();
  const raw = rulesContent[i18n.language] ?? rulesEn;

  return (
    <Modal title={t('rules.title')} onClose={onClose}>
      <div className="flex-1 p-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            img: ({ src, alt }) => <IconImg src={src} alt={alt} className="inline-block size-5" />,
            h1: () => '',
            h2: ({ children }) => (
              <Title level={2} className="mb-1 not-first-of-type:mt-3">
                {children}
              </Title>
            ),
            h3: ({ children }) => (
              <Title level={3} className="mb-1 not-first-of-type:mt-3">
                {children}
              </Title>
            ),
            strong: ({ children }) => <strong className="font-bold">{children}</strong>,
            table: ({ children }) => (
              <table className="mt-2 w-full border-collapse">{children}</table>
            ),
            th: ({ children }) => (
              <th className="border-border border bg-black/20 px-2 py-1">{children}</th>
            ),
            td: ({ children }) => <td className="border-border border px-2 py-1">{children}</td>,
            hr: () => <Divider color="border" />,
            p: ({ children }) => <p className="mt-2">{children}</p>,
          }}
        >
          {injectIcons(raw)}
        </ReactMarkdown>
      </div>
    </Modal>
  );
}
