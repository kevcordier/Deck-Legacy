import { FULL_SIZE, PAGE_BACKGROUND } from '@styles/pageConstants';
import type { ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';

/** Page filled with the background image under its content (replaces the deprecated `ImageBackground`). */
export function PageBackground({ children }: { readonly children: ReactNode }) {
  return (
    <View className="flex-1">
      <Image
        source={PAGE_BACKGROUND}
        resizeMode="cover"
        style={[StyleSheet.absoluteFill, FULL_SIZE]}
      />
      {children}
    </View>
  );
}
