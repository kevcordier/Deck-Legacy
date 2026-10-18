import type { IconProps } from '@components/ui/Icon/IconProps';
import { SvgIcon } from '@components/ui/Icon/SvgIcon';
import { IconColors } from '@components/ui/Icon/iconColors';
import { G, Path } from 'react-native-svg';

// ─── Expansion logos ──────────────────────────────────────────────────────────

/** Prosperity: a pile of coins. */
export function ProsperityIcon({ color = IconColors.gold, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M4 7c0-1.66 3.13-3 7-3s7 1.34 7 3-3.13 3-7 3-7-1.34-7-3Z" />
        <Path d="M4 7v4c0 1.66 3.13 3 7 3s7-1.34 7-3V7" />
        <Path d="M4 11v4c0 1.66 3.13 3 7 3 1.1 0 2.14-.11 3.07-.3" />
        <Path d="M14 16.5c0-1.38 1.79-2.5 4-2.5s4 1.12 4 2.5-1.79 2.5-4 2.5-4-1.12-4-2.5Z" />
        <Path d="M14 16.5V19c0 1.38 1.79 2.5 4 2.5s4-1.12 4-2.5v-2.5" />
      </G>
    </SvgIcon>
  );
}
