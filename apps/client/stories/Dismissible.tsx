import { Button } from '@components/ui/Button/Button';
import { type ReactNode, useState } from 'react';

type DismissibleProps = {
  readonly children: (close: () => void) => ReactNode;
};

/** Modal stories: closing really hides the modal, else it covers Storybook's UI for good. */
export function Dismissible({ children }: DismissibleProps) {
  const [open, setOpen] = useState(true);
  return open ? (
    children(() => setOpen(false))
  ) : (
    <Button onPress={() => setOpen(true)}>Open again</Button>
  );
}
