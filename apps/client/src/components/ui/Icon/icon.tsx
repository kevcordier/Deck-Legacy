import { IconColors } from './iconColors';
import { useTextDefaults } from '@components/ui/Text/Text';
import { textCategories } from '@helpers/textClasses';
import type { ReactNode } from 'react';
import { Platform, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Line, Path, Polygon, Rect } from 'react-native-svg';

export interface IconProps {
  readonly color?: string;
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly alt?: string;
}

const SIZE_CLASS = /(^|\s)(size|w|h)-/;

// On web, react-native-svg renders a block element: keep icons inline when nested in text.
const WEB_INLINE_STYLE = {
  display: 'inline-flex',
  verticalAlign: 'middle',
} as unknown as ViewStyle;

type SvgIconProps = Omit<IconProps, 'color'> & {
  readonly viewBox: string;
  readonly fill?: string;
  readonly children: ReactNode;
};

/**
 * Base SVG wrapper. `currentColor` resolves to the text color class of `className`
 * or, when absent, to the inherited text color (see `TextStyle`).
 */
function SvgIcon({ viewBox, fill, className = '', style, alt, children }: SvgIconProps) {
  const { color: inheritedColor } = useTextDefaults();
  const colorClass = textCategories(className).color ? '' : (inheritedColor ?? '');
  const sizeClass = SIZE_CLASS.test(className) ? '' : 'size-4';

  return (
    <Svg
      viewBox={viewBox}
      fill={fill}
      className={`${sizeClass} ${colorClass} ${className}`.trim()}
      style={Platform.OS === 'web' ? [WEB_INLINE_STYLE, style] : style}
      accessibilityLabel={alt}
    >
      {children}
    </Svg>
  );
}

export function ActivatedIcon({ color = 'green', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M1.25 7.25C1.25 3.93629 3.93629 1.25 7.25 1.25H16.75C20.0637 1.25 22.75 3.93629 22.75 7.25V16.75C22.75 20.0637 20.0637 22.75 16.75 22.75H7.25C3.93629 22.75 1.25 20.0637 1.25 16.75V7.25Z"
      />
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.0183 8.17565C18.2525 8.40985 18.2525 8.78956 18.0183 9.02376L11.6861 15.356C10.8274 16.2147 9.43512 16.2147 8.57639 15.356L5.9757 12.7553C5.7415 12.5211 5.7415 12.1414 5.9757 11.9072C6.2099 11.673 6.58961 11.673 6.82381 11.9072L9.4245 14.5078C9.81483 14.8982 10.4477 14.8982 10.838 14.5078L17.1702 8.17565C17.4044 7.94145 17.7841 7.94145 18.0183 8.17565Z"
        fill="white"
      />
    </SvgIcon>
  );
}

/** Action that may be used repeatedly: the activated square with a loop instead of the check. */
export function UnlimitedIcon({ color = 'green', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M1.25 7.25C1.25 3.93629 3.93629 1.25 7.25 1.25H16.75C20.0637 1.25 22.75 3.93629 22.75 7.25V16.75C22.75 20.0637 20.0637 22.75 16.75 22.75H7.25C3.93629 22.75 1.25 20.0637 1.25 16.75V7.25Z"
      />
      <Path
        stroke="white"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 12a5 5 0 1 1-1.46-3.54M17 6.5v3h-3"
      />
    </SvgIcon>
  );
}

export function CrownIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Path
        d="M4 8L6 20H18L20 8M4 8L5.71624 9.37299C6.83218 10.2657 7.39014 10.7121 7.95256 10.7814C8.4453 10.8421 8.94299 10.7173 9.34885 10.4314C9.81211 10.1051 10.0936 9.4483 10.6565 8.13476L12 5M4 8C4.55228 8 5 7.55228 5 7C5 6.44772 4.55228 6 4 6C3.44772 6 3 6.44772 3 7C3 7.55228 3.44772 8 4 8ZM20 8L18.2838 9.373C17.1678 10.2657 16.6099 10.7121 16.0474 10.7814C15.5547 10.8421 15.057 10.7173 14.6511 10.4314C14.1879 10.1051 13.9064 9.4483 13.3435 8.13476L12 5M20 8C20.5523 8 21 7.55228 21 7C21 6.44772 20.5523 6 20 6C19.4477 6 19 6.44772 19 7C19 7.55228 19.4477 8 20 8ZM12 5C12.5523 5 13 4.55228 13 4C13 3.44772 12.5523 3 12 3C11.4477 3 11 3.44772 11 4C11 4.55228 11.4477 5 12 5ZM12 4H12.01M20 7H20.01M4 7H4.01"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export function DestroyIcon({ color = 'red', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="-0.5 0 19 19" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M4.91666667,14.8888889 C4.91666667,15.3571429 5.60416667,16 6.0625,16 L12.9375,16 C13.3958333,16 14.0833333,15.3571429 14.0833333,14.8888889 L14.0833333,6 L4.91666667,6 L4.91666667,14.8888889 L4.91666667,14.8888889 L4.91666667,14.8888889 Z M15,3.46500003 L12.5555556,3.46500003 L11.3333333,2 L7.66666667,2 L6.44444444,3.46500003 L4,3.46500003 L4,4.93000007 L15,4.93000007 L15,3.46500003 L15,3.46500003 L15,3.46500003 Z"
      />
    </SvgIcon>
  );
}

export function AsteriskIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth={3} strokeLinecap="round">
        <Line x1="12" y1="3" x2="12" y2="21" />
        <Line x1="4.2" y1="7.5" x2="19.8" y2="16.5" />
        <Line x1="4.2" y1="16.5" x2="19.8" y2="7.5" />
      </G>
    </SvgIcon>
  );
}

export function DrawCardIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 512 512" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="m209.955 488.202-121.242-46.62c-11.308-4.34-11.643-12.087-.79-17.288L204.8 469.236c15.024 5.777 37.23 4.92 51.774-1.96l161.522-76.6c10.014 4.436 9.864 11.818-.67 16.798L250.43 486.668c-10.983 5.195-29.128 5.902-40.477 1.534zm0-32.37L88.713 409.21c-9.623-3.69-11.303-9.85-4.903-14.81l120.99 46.517c15.024 5.776 37.23 4.92 51.774-1.96l165.393-78.433c5.855 4.417 4.38 10.36-4.542 14.58l-166.993 79.193c-10.983 5.196-29.128 5.903-40.477 1.534zm0-28.314L88.713 380.892c-9.624-3.69-11.302-9.85-4.902-14.813l120.99 46.523c15.024 5.77 37.23 4.914 51.774-1.96l165.393-78.438c5.855 4.416 4.38 10.36-4.542 14.58l-166.993 79.2c-10.983 5.194-29.128 5.895-40.477 1.533zm0-28.32L88.713 352.572c-9.624-3.69-11.302-9.85-4.902-14.812l120.99 46.524c15.024 5.776 37.23 4.92 51.774-1.96l165.393-78.44c5.855 4.424 4.38 10.368-4.542 14.586l-166.993 79.194c-10.983 5.196-29.128 5.897-40.477 1.534zm0-28.32L88.713 324.26c-11.35-4.355-11.643-12.15-.66-17.353l87.236-41.376 34.826 18.323c15.365 8.09 37.937 7.06 52.5-2.39l65.74-42.672 88.404 34.007c11.344 4.357 11.65 12.16.665 17.354l-166.993 79.195c-10.983 5.195-29.128 5.902-40.477 1.534zm6.85-99.73L93.44 206.22c-10.767-5.67-11.217-15.647-1.018-22.268l105.11-68.228h25.845l.015 64.962h58.664v-64.962H332.2l-27.487-41.39 118.91 62.584c10.763 5.67 11.212 15.646 1.013 22.268L254.803 269.418c-10.2 6.62-27.23 7.4-37.997 1.73zm21.637-105.523V100.67h-34.845l49.13-79.74 49.12 79.74H267v64.955z"
      />
    </SvgIcon>
  );
}

export function DiscardIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 512 512" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="m150.79 479.797-85.27-185.08c-3.13-6.79-.15-14.862 6.634-17.993l129.163-59.51c6.783-3.12 14.862-.15 17.987 6.646l85.283 185.067c3.13 6.802.15 14.863-6.646 18L168.79 486.43c-6.795 3.144-14.868.15-18-6.633m26.17-69.31 15.318-44.522 44.522 15.32 7.66-22.253-44.523-15.318 15.325-44.522-22.252-7.66-15.325 44.516-44.515-15.324-7.66 22.258 44.516 15.324-15.324 44.522zm106.07-211.05c47.9-85.625-53.11-105.304-102.586-62.593l-38.9 51.353C105.95 210 97.853 175.98 109.226 158.424l54.106-73.515 97.158-52.146c7.108-5.2 17.838-8.133 32.767-8.445l194.467 1.463.866 112.044-107.304-7.725c1.818 43.394-42.734 53.08-66.683 106.905l-13.813 46.38c-30.217-10.16-41.29-34.367-17.76-83.95zm-129.828-3.077 39.046-51.33c12.434-10.477 29.51-17.675 46.92-17.375-15.264 16.008-20.158 25.557-23.475 39.046-8 19.775-17.74 29.69-30.366 23.296-10.712 10.322-21.412 14.87-32.125 6.364z"
      />
    </SvgIcon>
  );
}

export function GloryIcon({
  color = IconColors.gold,
  fill = 'none',
  className,
  style,
  alt,
}: IconProps & {
  /** Inner fill of the outline. */
  readonly fill?: string;
}) {
  return (
    <SvgIcon viewBox="2 2 20 20" fill={fill} className={className} style={style} alt={alt}>
      <Path
        d="M18.364 5.636C17.8001 5.07212 17.0676 4.77963 16.3287 4.75855C15.5976 4.73769 15.2321 4.72726 15.147 4.70581C14.9649 4.65988 15.0937 4.71324 14.9325 4.61693C14.8571 4.57194 14.5913 4.32084 14.0595 3.81864C13.5222 3.31114 12.7974 3 12 3C11.2026 3 10.4778 3.31113 9.94047 3.81863C9.40876 4.32082 9.14287 4.57195 9.06753 4.61694C8.90626 4.71325 9.0351 4.65988 8.85296 4.70581C8.76788 4.72727 8.40232 4.73769 7.67121 4.75855C6.93238 4.77963 6.19986 5.07211 5.63597 5.636C5.07207 6.1999 4.77959 6.93243 4.75852 7.67126C4.73766 8.40235 4.72724 8.7679 4.70578 8.85299C4.65985 9.03512 4.71322 8.90628 4.61691 9.06755C4.57192 9.14289 4.32082 9.40876 3.81862 9.94048C3.31113 10.4778 3 11.2026 3 12C3 12.7974 3.31113 13.5222 3.81862 14.0595C4.32082 14.5912 4.57192 14.8571 4.61691 14.9324C4.71322 15.0937 4.65985 14.9649 4.70578 15.147C4.72724 15.2321 4.73766 15.5976 4.75852 16.3287C4.77959 17.0676 5.07207 17.8001 5.63597 18.364C6.19986 18.9279 6.93238 19.2204 7.67121 19.2414C8.40225 19.2623 8.76788 19.2727 8.85296 19.2942C9.0351 19.3401 8.90626 19.2868 9.06753 19.3831C9.14287 19.4281 9.40874 19.6792 9.94047 20.1814C10.4778 20.6889 11.2026 21 12 21C12.7974 21 13.5222 20.6889 14.0595 20.1814C14.5912 19.6792 14.8571 19.4281 14.9325 19.3831C15.0937 19.2868 14.9649 19.3401 15.147 19.2942C15.2321 19.2727 15.5976 19.2623 16.3287 19.2414C17.0676 19.2204 17.8001 18.9279 18.364 18.364C18.9278 17.8001 19.2203 17.0676 19.2414 16.3288C19.2623 15.5977 19.2727 15.2321 19.2942 15.147C19.3401 14.9649 19.2867 15.0937 19.383 14.9325C19.428 14.8571 19.6792 14.5912 20.1814 14.0595C20.6889 13.5222 21 12.7974 21 12C21 11.2026 20.6889 10.4778 20.1814 9.94045C19.6792 9.40876 19.428 9.14286 19.383 9.06752C19.2867 8.90625 19.3401 9.0351 19.2942 8.85296C19.2727 8.76787 19.2623 8.40232 19.2414 7.67121C19.2203 6.9324 18.9278 6.19989 18.364 5.636Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export function TimeIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill={color} className={className} style={style} alt={alt}>
      <Path d="M6.108,20H4a1,1,0,0,0,0,2H20a1,1,0,0,0,0-2H17.892c-.247-2.774-1.071-7.61-3.826-9,2.564-1.423,3.453-4.81,3.764-7H20a1,1,0,0,0,0-2H4A1,1,0,0,0,4,4H6.17c.311,2.19,1.2,5.577,3.764,7C7.179,12.39,6.355,17.226,6.108,20ZM9,16.6c0-1.2,3-3.6,3-3.6s3,2.4,3,3.6V20H9Z" />
    </SvgIcon>
  );
}

/** Outline of the resource and trigger icons: keeps them readable on any card or background. */
const OUTLINE = '#1c1408';
const OUTLINE_WIDTH = 1.2;
/** Relief drawn over the main color, so it works with any `color` (e.g. greyed out). */
const SHINE = 'rgba(255,255,255,0.45)';
const SHADE = 'rgba(0,0,0,0.3)';

export function TriggerIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    // Room around the bolt for its outline (the viewBox is 512 wide: 24 px ≈ 21 units per px).
    <SvgIcon viewBox="-24 -24 560 560" className={className} style={style} alt={alt}>
      <Polygon
        fill={color}
        stroke={OUTLINE}
        strokeWidth={28}
        strokeLinejoin="round"
        points="386.415,193.208 287.481,193.208 359.434,0 161.566,0 125.585,280.151 206.528,280.151 170.557,512"
      />
    </SvgIcon>
  );
}

/** Log seen from its cut end: bark, rings and a lighter cut face. */
export function WoodIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M6.5 4.5h12a4 7.5 0 0 1 0 15h-12z"
      />
      <Path
        stroke={SHADE}
        strokeWidth={1}
        strokeLinecap="round"
        d="M11 8.5h6.5M12.5 15.5h5.5M10.5 12h3"
      />
      <Ellipse cx="6.5" cy="12" rx="5" ry="7.5" fill={color} />
      <Ellipse
        cx="6.5"
        cy="12"
        rx="5"
        ry="7.5"
        fill={SHINE}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
      />
      <Ellipse cx="6.5" cy="12" rx="2.8" ry="4.3" fill="none" stroke={SHADE} strokeWidth={0.9} />
      <Circle cx="6.5" cy="12" r="1" fill={SHADE} />
    </SvgIcon>
  );
}

/** Coin with a raised rim, an embossed star and a shine. */
export function GoldIcon({ color = IconColors.gold, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Circle cx="12" cy="12" r="10" fill={color} stroke={OUTLINE} strokeWidth={OUTLINE_WIDTH} />
      <Circle cx="12" cy="12" r="7" fill="none" stroke={SHADE} strokeWidth={1.2} />
      <Polygon
        fill={SHADE}
        points="12,7.6 13.3,10.4 16.3,10.6 14,12.6 14.7,15.6 12,14 9.3,15.6 10,12.6 7.7,10.6 10.7,10.4"
      />
      <Path
        stroke={SHINE}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
        d="M5.5 9.5a7 7 0 0 1 4-4"
      />
    </SvgIcon>
  );
}

/** Rock with a lit facet and cracks. */
export function StoneIcon({ color = IconColors.stone, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M2.5 19.5l2.5-8 4.5-5.5 5.5 1 4.5 4 2 8.5z"
      />
      <Path fill={SHINE} d="M5 11.5l4.5-5.5 1.5 6z" />
      <Path fill={SHADE} d="M15 7l4.5 4 2 8.5-6-3z" />
      <Path
        stroke={SHADE}
        strokeWidth={0.9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        d="M11 12l4.5 4.5M11 12l-3.5 7.5"
      />
    </SvgIcon>
  );
}

/** Ingot in three-quarter view: lit top with a stamp, front face, shaded right side. */
export function IronIcon({ color = IconColors.iron, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M1.5 18.5L4.5 12.5L9.5 8H19L22.5 14L15 18.5Z"
      />
      <Path fill={SHINE} d="M4.5 12.5L9.5 8H19L13.5 12.5Z" />
      <Path fill={SHADE} d="M13.5 12.5L19 8L22.5 14L15 18.5Z" />
      <Path
        fill="none"
        stroke={OUTLINE}
        strokeWidth={0.8}
        strokeLinejoin="round"
        d="M4.5 12.5H13.5L19 8M13.5 12.5L15 18.5"
      />
      <Path fill="none" stroke={SHADE} strokeWidth={0.8} d="M10 9.6h4.6l-1.6 1.3h-4.6z" />
      <Path stroke={SHINE} strokeWidth={1} strokeLinecap="round" d="M4.2 16.8h7" />
    </SvgIcon>
  );
}

/** Barrel: staves, two hoops and a shine. */
export function GoodsIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
        d="M6.5 2.5h11q3 9.5 0 19h-11q-3-9.5 0-19z"
      />
      <Path
        stroke={SHADE}
        strokeWidth={0.9}
        fill="none"
        d="M10 2.5q-1.2 9.5 0 19M14 2.5q1.2 9.5 0 19"
      />
      <Path
        stroke={SHINE}
        strokeWidth={1.4}
        strokeLinecap="round"
        fill="none"
        d="M7.2 8q-.7 4 0 8"
      />
      <Path
        stroke={OUTLINE}
        strokeWidth={1.6}
        strokeLinecap="round"
        d="M4.9 7.5h14.2M4.9 16.5h14.2"
      />
    </SvgIcon>
  );
}

/** Sword, point up and to the right: steel blade, gold guard, leather grip. */
export function WeaponIcon({ color = IconColors.iron, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <G
        transform="rotate(45 12 12)"
        stroke={OUTLINE}
        strokeWidth={OUTLINE_WIDTH}
        strokeLinejoin="round"
      >
        <Path fill={color} d="M10.2 15.5V4.5L12 1.2l1.8 3.3v11z" />
        <Path fill={SHINE} stroke="none" d="M12 2.4v13.1h1.8v-11z" />
        <Rect x="7.5" y="15.5" width="9" height="2" rx="1" fill={IconColors.gold} />
        <Rect x="11" y="17.5" width="2" height="3.6" fill={IconColors.wood} />
        <Circle cx="12" cy="22" r="1.3" fill={IconColors.gold} />
      </G>
    </SvgIcon>
  );
}

export function PassifIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 16 16" className={className} style={style} alt={alt}>
      <G transform="translate(6.025 -1038.1)">
        <Path
          fill={color}
          d="M-2.025 1042.1a4 4 0 0 0 0 8c2 0 4-1 5-4-1-3-3-4-5-4zm0 2s2 0 3 2c-1 2-3 2-3 2a2 2 0 1 1 0-4z"
        />
        <Path
          fill={color}
          d="M5.975 1042.1a4 4 0 0 1 0 8c-2 0-4-1-5-4 1-3 3-4 5-4zm0 2s-2 0-3 2c1 2 3 2 3 2a2 2 0 1 0 0-4z"
        />
      </G>
    </SvgIcon>
  );
}

/** Round sticker whose bottom-right edge peels off (sticker stock). */
export function StickerIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path d="M21 12A9 9 0 1 0 12 21" stroke={color} strokeWidth={2} strokeLinecap="round" />
      {/* Flap folded back over the sticker, along the line between the two arc ends. */}
      <Path
        d="M12 21L21 12Q12.8 12.8 12 21Z"
        fill={color}
        fillOpacity={0.25}
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </SvgIcon>
  );
}

export function UpgradeIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 512 512" className={className} style={style} alt={alt}>
      <G transform="translate(256 256) scale(0.85) translate(-256 -256)">
        <Path d="M256.003 0 18.618 316.508h134.983V512H358.4V316.508h134.982z" fill={color} />
      </G>
    </SvgIcon>
  );
}

/** Magnifying glass with a minus sign, or a plus sign when `plus` is set. */
function MagnifierIcon({
  color = 'currentColor',
  className,
  style,
  alt,
  plus,
}: IconProps & { readonly plus?: boolean }) {
  const line = { stroke: color, strokeWidth: '2', strokeLinecap: 'round' } as const;
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <Circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth="2" />
      <Line x1="15.5" y1="15.5" x2="20" y2="20" {...line} />
      <Line x1="7.5" y1="10.5" x2="13.5" y2="10.5" {...line} />
      {plus && <Line x1="10.5" y1="7.5" x2="10.5" y2="13.5" {...line} />}
    </SvgIcon>
  );
}

export function ZoomOutIcon(props: IconProps) {
  return <MagnifierIcon {...props} />;
}

export function ZoomInIcon(props: IconProps) {
  return <MagnifierIcon {...props} plus />;
}

export function PencilIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 20h4L19.3 8.7a1.4 1.4 0 0 0 0-2l-2-2a1.4 1.4 0 0 0-2 0L4 16zM14 6l4 4"
      />
    </SvgIcon>
  );
}

export function ChevronDownIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 9l6 6 6-6"
      />
    </SvgIcon>
  );
}

export function DotsVerticalIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </SvgIcon>
  );
}

export function EyeIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        fillRule="evenodd"
        d="M11.994 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m0-2.006a1.494 1.494 0 1 1 0-2.988 1.494 1.494 0 0 1 0 2.988"
        clipRule="evenodd"
      />
      <Path
        fill={color}
        fillRule="evenodd"
        d="M12 5C7.189 5 3.917 7.609 2.19 9.48a3.68 3.68 0 0 0 0 5.04C3.916 16.391 7.188 19 12 19s8.083-2.609 9.81-4.48a3.68 3.68 0 0 0 0-5.04C20.084 7.609 16.812 5 12 5m-8.341 5.837C5.189 9.18 7.967 7 12 7s6.812 2.18 8.341 3.837a1.68 1.68 0 0 1 0 2.326C18.811 14.82 16.033 17 12 17s-6.812-2.18-8.341-3.837a1.68 1.68 0 0 1 0-2.326"
        clipRule="evenodd"
      />
    </SvgIcon>
  );
}

export function EyeOffIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M4.496 7.44c-.949.678-1.718 1.402-2.307 2.04a3.68 3.68 0 0 0 0 5.04C3.917 16.391 7.19 19 12 19c1.296 0 2.48-.19 3.552-.502l-1.662-1.663A11 11 0 0 1 12 17c-4.033 0-6.812-2.18-8.341-3.837a1.68 1.68 0 0 1 0-2.326 13 13 0 0 1 2.273-1.96z"
      />
      <Path
        fill={color}
        d="M8.533 11.478q-.038.256-.039.522a3.5 3.5 0 0 0 4.022 3.461zM15.466 12.447l-3.919-3.919q.22-.027.447-.028a3.5 3.5 0 0 1 3.472 3.947"
      />
      <Path
        fill={color}
        d="M18.112 15.093a13 13 0 0 0 2.23-1.93 1.68 1.68 0 0 0 0-2.326C18.811 9.18 16.032 7 12 7c-.64 0-1.25.055-1.827.154L8.505 5.486A12.6 12.6 0 0 1 12 5c4.811 0 8.083 2.609 9.81 4.48a3.68 3.68 0 0 1 0 5.04c-.58.629-1.334 1.34-2.263 2.008zM2.008 3.422a1 1 0 1 1 1.414-1.414L22 20.586A1 1 0 1 1 20.586 22z"
      />
    </SvgIcon>
  );
}

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

/** The Water Mill: a mill wheel above the water. */
export function WaterMillIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Circle cx="12" cy="10" r="7" />
        <Circle cx="12" cy="10" r="1.5" />
        <Line x1="12" y1="3" x2="12" y2="17" />
        <Line x1="5" y1="10" x2="19" y2="10" />
        <Line x1="7.05" y1="5.05" x2="16.95" y2="14.95" />
        <Line x1="16.95" y1="5.05" x2="7.05" y2="14.95" />
        <Path d="M2 20.5c1.67 0 1.67-1 3.33-1s1.67 1 3.34 1 1.66-1 3.33-1 1.67 1 3.33 1 1.67-1 3.34-1 1.66 1 3.33 1" />
      </G>
    </SvgIcon>
  );
}

/** Border Dispute: two crossed swords. */
export function BorderDisputeIcon({ color = IconColors.iron, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
        <Line x1="13" y1="19" x2="19" y2="13" />
        <Line x1="16" y1="16" x2="20" y2="20" />
        <Line x1="19" y1="21" x2="21" y2="19" />
        <Path d="M14.5 6.5 18 3h3v3l-3.5 3.5" />
        <Line x1="5" y1="14" x2="9" y2="18" />
        <Line x1="7" y1="17" x2="4" y2="20" />
        <Line x1="3" y1="19" x2="5" y2="21" />
      </G>
    </SvgIcon>
  );
}

/** Ridding the Woods: a leafy tree. */
export function RiddingTheWoodsIcon({ color = IconColors.wood, className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 24 24" fill="none" className={className} style={style} alt={alt}>
      <G stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <Path
          d="M12 3a4 4 0 0 1 3.9 3.1A4 4 0 0 1 18 14H6a4 4 0 0 1 2.1-7.9A4 4 0 0 1 12 3Z"
          fill={IconColors.leaf}
        />
        <Path d="M12 21v-9" />
        <Path d="M12 16.5 9.5 14M12 14l2.5-2.5" />
        <Path d="M8 21h8" />
      </G>
    </SvgIcon>
  );
}

export function HistoryIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon viewBox="0 0 512 513.11" className={className} style={style} alt={alt}>
      <Path
        fill={color}
        d="M210.48 160.8c0-14.61 11.84-26.46 26.45-26.46s26.45 11.85 26.45 26.46v110.88l73.34 32.24c13.36 5.88 19.42 21.47 13.54 34.82-5.88 13.35-21.47 19.41-34.82 13.54l-87.8-38.6c-10.03-3.76-17.16-13.43-17.16-24.77V160.8zM5.4 168.54c-.76-2.25-1.23-4.64-1.36-7.13l-4-73.49c-.75-14.55 10.45-26.95 25-27.69 14.55-.75 26.95 10.45 27.69 25l.74 13.6a254.258 254.258 0 0136.81-38.32c17.97-15.16 38.38-28.09 61.01-38.18 64.67-28.85 134.85-28.78 196.02-5.35 60.55 23.2 112.36 69.27 141.4 132.83.77 1.38 1.42 2.84 1.94 4.36 27.86 64.06 27.53 133.33 4.37 193.81-23.2 60.55-69.27 112.36-132.83 141.39a26.24 26.24 0 01-12.89 3.35c-14.61 0-26.45-11.84-26.45-26.45 0-11.5 7.34-21.28 17.59-24.92 7.69-3.53 15.06-7.47 22.09-11.8.8-.66 1.65-1.28 2.55-1.86 11.33-7.32 22.1-15.7 31.84-25.04.64-.61 1.31-1.19 2-1.72 20.66-20.5 36.48-45.06 46.71-71.76 18.66-48.7 18.77-104.46-4.1-155.72l-.01-.03C418.65 122.16 377.13 85 328.5 66.37c-48.7-18.65-104.46-18.76-155.72 4.1a203.616 203.616 0 00-48.4 30.33c-9.86 8.32-18.8 17.46-26.75 27.29l3.45-.43c14.49-1.77 27.68 8.55 29.45 23.04 1.77 14.49-8.55 27.68-23.04 29.45l-73.06 9c-13.66 1.66-26.16-7.41-29.03-20.61zM283.49 511.5c20.88-2.34 30.84-26.93 17.46-43.16-5.71-6.93-14.39-10.34-23.29-9.42-15.56 1.75-31.13 1.72-46.68-.13-9.34-1.11-18.45 2.72-24.19 10.17-12.36 16.43-2.55 39.77 17.82 42.35 19.58 2.34 39.28 2.39 58.88.19zm-168.74-40.67c7.92 5.26 17.77 5.86 26.32 1.74 18.29-9.06 19.97-34.41 3.01-45.76-12.81-8.45-25.14-18.96-35.61-30.16-9.58-10.2-25.28-11.25-36.11-2.39a26.436 26.436 0 00-2.55 38.5c13.34 14.2 28.66 27.34 44.94 38.07zM10.93 331.97c2.92 9.44 10.72 16.32 20.41 18.18 19.54 3.63 36.01-14.84 30.13-33.82-4.66-15-7.49-30.26-8.64-45.93-1.36-18.33-20.21-29.62-37.06-22.33C5.5 252.72-.69 262.86.06 274.14c1.42 19.66 5.02 39 10.87 57.83z"
      />
    </SvgIcon>
  );
}

export function TrophyIcon({ color = 'currentColor', className, style, alt }: IconProps) {
  return (
    <SvgIcon fill="none" viewBox="0 0 24 24" className={className} style={style} alt={alt}>
      <Path
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3"
      />
    </SvgIcon>
  );
}
