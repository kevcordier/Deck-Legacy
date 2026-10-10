import { Divider } from '@components/ui/Divider/Divider';
import { IconColors } from '@components/ui/Icon/iconColors';
import { renderTextWithIcons } from '@helpers/renderHelpers';
import { useThemeColors } from '@helpers/themeColors';
import { type ReactNode, useMemo } from 'react';
import { Text, type TextStyle, View } from 'react-native';
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
}

type MarkdownTextProps = {
  readonly text: string;
  /** Forces the (light) card ink color, for text displayed on a card background. */
  readonly ink?: boolean;
};

export function MarkdownText({ text, ink }: MarkdownTextProps) {
  const colors = useThemeColors();
  const textColor = ink ? IconColors.baseInk : colors.ink;
  const titleColor = ink ? IconColors.baseInk : colors.primary;

  const styles = useMemo<MarkedStyles>(
    () => ({
      text: { fontFamily: 'EBGaramond_400Regular', fontSize: 16, color: textColor },
      paragraph: { marginTop: 8 },
      strong: { fontFamily: 'EBGaramond_700Bold', color: textColor },
      em: { fontFamily: 'EBGaramond_400Regular_Italic', color: textColor },
      h2: {
        fontFamily: 'CinzelDecorative_700Bold',
        fontSize: 20,
        letterSpacing: 2,
        color: titleColor,
        marginTop: 12,
        marginBottom: 4,
      },
      h3: {
        fontFamily: 'EBGaramond_700Bold',
        fontSize: 18,
        color: titleColor,
        marginTop: 12,
        marginBottom: 4,
      },
      li: { fontFamily: 'EBGaramond_400Regular', fontSize: 16, color: textColor },
      table: { borderColor: colors.border, borderWidth: 1, marginTop: 8 },
      tableCell: { padding: 8 },
    }),
    [colors.border, textColor, titleColor],
  );

  const renderer = useMemo(() => new GameRenderer({ selectable: false }), []);
  const elements = useMarkdown(text, { renderer, styles, colorScheme: 'light' });

  return <View>{elements}</View>;
}
