import type { StyleProp, ViewStyle } from 'react-native';

export interface IconProps {
  readonly color?: string;
  readonly className?: string;
  readonly style?: StyleProp<ViewStyle>;
  readonly alt?: string;
}
