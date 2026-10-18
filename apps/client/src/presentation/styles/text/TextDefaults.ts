/**
 * React Native does not cascade text styles from a `View` to its `Text` children.
 * These helpers let a container declare default text classes (color, font family, size)
 * that the `Text` primitive applies unless it sets its own class for the same category.
 */

export type TextDefaults = {
  color?: string;
  family?: string;
  size?: string;
};
