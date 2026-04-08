import React from 'react';
import { getResMeta } from './resourceHelpers';

// Detects tokens like {{gold}}, {{wood}}, etc. in translated texts
const ICON_TOKEN = /\{\{(gold|wood|stone|iron|weapon|goods|glory)\}\}/g;

/**
 * Replaces {{resource}} tokens in a text with the corresponding SVG icon.
 * Example: "Gain 3 {{wood}}, then upgrade." → "Gain 3 [wood icon], then upgrade."
 */
export function renderTextWithIcons(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  ICON_TOKEN.lastIndex = 0;

  while ((match = ICON_TOKEN.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    const key = match[1];
    const meta = getResMeta(key);
    parts.push(
      meta.icon ? (
        <meta.icon key={match.index} className={`${meta.cls} size-4 align-middle`} alt={key} />
      ) : (
        key
      ),
    );
    last = match.index + match[0].length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length === 1 ? parts[0] : <>{parts}</>;
}
