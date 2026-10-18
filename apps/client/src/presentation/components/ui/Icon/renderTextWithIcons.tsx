import { getResMeta } from './getResMeta';
import React from 'react';

// Detects tokens like {{gold}}, {{wood}}, etc. in translated texts
const ICON_TOKEN =
  /\{\{(gold|wood|stone|iron|weapon|goods|glory|action|time|passif|unlimited|destroy|trigger|optionalTrigger|upgrade|discovered)\}\}/g;

/**
 * Replaces {{resource}} tokens in a text with the corresponding SVG icon.
 * Example: "Gain 3 {{wood}}, then upgrade." → "Gain 3 [wood icon], then upgrade."
 * The result must be rendered inside a `Text` (icons are inline views).
 * `wrapIcon` can wrap an icon, e.g. in a tooltip; `iconClassName` sizes the icons.
 */
export function renderTextWithIcons(
  text: string,
  wrapIcon?: (key: string, icon: React.ReactNode) => React.ReactNode,
  iconClassName = 'size-4',
): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  ICON_TOKEN.lastIndex = 0;

  while ((match = ICON_TOKEN.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = match[1];
    // {{discovered}} is a card number, only rendered by a `wrapIcon` that knows the card.
    if (key === 'discovered' && !wrapIcon) {
      last = match.index + match[0].length;
      continue;
    }
    const meta = getResMeta(key);
    const icon = meta.icon ? (
      <meta.icon color={meta.color} className={iconClassName} alt={key} />
    ) : (
      key
    );
    parts.push(
      <React.Fragment key={match.index}>{wrapIcon ? wrapIcon(key, icon) : icon}</React.Fragment>,
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
