import { Divider } from '@components/ui/Divider/Divider';
import {
  GloryIcon,
  GoldIcon,
  GoodsIcon,
  IronIcon,
  PassifIcon,
  StoneIcon,
  TimeIcon,
  WeaponIcon,
  WoodIcon,
} from '@components/ui/Icon/icon';
import { Title } from '@components/ui/Title/Title';
import React from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ICON_MAP: Record<string, React.ComponentType> = {
  gold: GoldIcon,
  wood: WoodIcon,
  stone: StoneIcon,
  iron: IronIcon,
  weapon: WeaponIcon,
  goods: GoodsIcon,
  glory: GloryIcon,
  time: TimeIcon,
  passif: PassifIcon,
};

function injectIcons(content: string): string {
  return content.replace(
    /\{\{(gold|wood|stone|iron|weapon|goods|glory|time|passif)\}\}/g,
    (_, key: string) => `![${key}](./${key}.svg)`,
  );
}

function IconImg({
  src,
  alt,
  className,
}: {
  readonly src?: string;
  readonly alt?: string;
  readonly className?: string;
}) {
  const key = src?.replace('./', '').replace('.svg', '') ?? '';
  const Icon = ICON_MAP[key];
  if (Icon) {
    return React.createElement(Icon, { className } as React.ComponentProps<typeof Icon>);
  }
  return <img src={src} alt={alt} className={className} />;
}

type MarkdownTextProps = {
  readonly text: string;
};

const components: Components = {
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
  hr: () => <Divider color="border" />,
  p: ({ children }) => <p className="mt-2">{children}</p>,
  table: ({ children }) => (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-background-secondary">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-border">{children}</tbody>,
  tr: ({ children }) => (
    <tr className="hover:bg-background-secondary/50 transition-colors">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="border border-border px-3 py-2 text-left font-semibold text-primary">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-border px-3 py-2 text-secondary">{children}</td>
  ),
};

export function MarkdownText({ text }: MarkdownTextProps) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {injectIcons(text)}
    </ReactMarkdown>
  );
}
