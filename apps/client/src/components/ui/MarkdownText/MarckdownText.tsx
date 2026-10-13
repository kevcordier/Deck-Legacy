import { Divider } from '@components/ui/Divider/Divider';
import { IconColors } from '@components/ui/Icon/iconColors';
import { renderTextWithIcons } from '@helpers/renderHelpers';
import { useThemeColors } from '@helpers/themeColors';
import { type ReactNode, isValidElement, useMemo } from 'react';
import { Text, type TextStyle, View, type ViewStyle } from 'react-native';
import { type MarkedStyles, Renderer, useMarkdown } from 'react-native-marked';

/** Renders `{{resource}}` tokens as inline icons and hides the document title (h1). */
class GameRenderer extends Renderer {
  text(text: string | ReactNode[], styles?: TextStyle): ReactNode {
    return (
      <Text key={this.getKey()} style={styles}>
        {typeof text === 'string' ? renderTextWithIcons(text) : text}
      </Text>
    );
  }

  heading(text: string | ReactNode[], styles?: TextStyle, depth?: number): ReactNode {
    if (depth === 1) return null;
    return (
      <Text key={this.getKey()} style={styles} accessibilityRole="header">
        {typeof text === 'string' ? renderTextWithIcons(text) : text}
      </Text>
    );
  }

  hr(): ReactNode {
    return <Divider key={this.getKey()} color="border" />;
  }

  /**
   * The library sizes every column at 43 % of the window width (horizontal scroll on wide screens):
   * columns share the available width instead, weighted by their longest content.
   */
  table(
    header: ReactNode[][],
    rows: ReactNode[][][],
    tableStyle?: ViewStyle,
    rowStyle?: ViewStyle,
    cellStyle?: ViewStyle,
  ): ReactNode {
    const allRows = [header, ...rows];
    const weights = header.map((_, col) =>
      Math.sqrt(Math.max(2, ...allRows.map(row => contentLength(row[col])))),
    );
    const border = { borderColor: tableStyle?.borderColor };
    return (
      <View key={this.getKey()} style={tableStyle}>
        {allRows.map((row, r) => (
          <View key={this.getKey()} style={[rowStyle, border, r > 0 && { borderTopWidth: 1 }]}>
            {row.map((cell, c) => (
              <View
                key={this.getKey()}
                style={[cellStyle, border, { flex: weights[c] }, c > 0 && { borderLeftWidth: 1 }]}
              >
                {cell}
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  }
}

/** Approximate text length of a rendered cell; an inline icon counts as 2 characters. */
function contentLength(node: ReactNode): number {
  if (typeof node === 'string' || typeof node === 'number') return String(node).length;
  if (Array.isArray(node)) return node.reduce<number>((sum, n) => sum + contentLength(n), 0);
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return node.props.children === undefined ? 2 : contentLength(node.props.children);
  }
  return 0;
}

type MarkdownTextProps = {
  readonly text: string;
  /** Forces the (light) card ink color, for text displayed on a card background. */
  readonly ink?: boolean;
  /** Much smaller text and spacing (e.g. a parchment text on a card). */
  readonly compact?: boolean;
};

export function MarkdownText({ text, ink, compact = false }: MarkdownTextProps) {
  const colors = useThemeColors();
  const textColor = ink ? IconColors.baseInk : colors.ink;
  const titleColor = ink ? IconColors.baseInk : colors.primary;
  const k = compact ? 0.65 : 1;

  const styles = useMemo<MarkedStyles>(
    () => ({
      text: { fontFamily: 'EBGaramond_400Regular', fontSize: 16 * k, color: textColor },
      paragraph: { marginTop: 8 * k },
      strong: { fontFamily: 'EBGaramond_700Bold', color: textColor },
      em: { fontFamily: 'EBGaramond_400Regular_Italic', color: textColor },
      h2: {
        fontFamily: 'CinzelDecorative_700Bold',
        fontSize: 20 * k,
        letterSpacing: 2 * k,
        color: titleColor,
        marginTop: 12 * k,
        marginBottom: 4 * k,
      },
      h3: {
        fontFamily: 'EBGaramond_700Bold',
        fontSize: 18 * k,
        color: titleColor,
        marginTop: 12 * k,
        marginBottom: 4 * k,
      },
      li: { fontFamily: 'EBGaramond_400Regular', fontSize: 16 * k, color: textColor },
      table: { borderColor: colors.border, borderWidth: 1, marginTop: 8 },
      tableCell: { padding: 8 * k },
    }),
    [colors.border, textColor, titleColor, k],
  );

  const renderer = useMemo(() => new GameRenderer({ selectable: false }), []);
  const elements = useMarkdown(text, { renderer, styles, colorScheme: 'light' });

  return <View>{elements}</View>;
}
