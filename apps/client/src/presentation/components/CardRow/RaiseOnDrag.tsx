import { RaiseContext } from './RaiseContext';
import { type ReactNode, useState } from 'react';
import { View } from 'react-native';

const RAISED_STYLE = { zIndex: 50 };

/**
 * Keeps its content above the next sections while one of its cards is dragged: every view is a
 * stacking context (react-native-web gives views `zIndex: 0`), so the dragged card's own z-index
 * only counts inside its grid.
 */
export function RaiseOnDrag({ children }: { readonly children: ReactNode }) {
  const [raised, setRaised] = useState(false);
  return (
    <RaiseContext value={setRaised}>
      <View style={raised ? RAISED_STYLE : undefined}>{children}</View>
    </RaiseContext>
  );
}
