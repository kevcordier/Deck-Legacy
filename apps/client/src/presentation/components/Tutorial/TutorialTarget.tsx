import { TutorialContext } from '@contexts/TutorialContext';
import { type ReactNode, use, useEffect, useRef } from 'react';
import { type HostInstance, View, type ViewProps } from 'react-native';

type TutorialTargetProps = ViewProps & {
  /** Target id referenced by tutorial steps. Nothing is registered when undefined. */
  readonly id?: string;
  readonly className?: string;
  readonly children: ReactNode;
};

/** Wraps an element the tutorial can point at (replaces the `data-tour` attributes). */
export function TutorialTarget({ id, className, children, ...rest }: TutorialTargetProps) {
  const tutorial = use(TutorialContext);
  const ref = useRef<HostInstance>(null);

  useEffect(() => {
    if (!tutorial || !id) return;
    tutorial.registerTarget(id, ref);
    return () => tutorial.unregisterTarget(id, ref);
  }, [tutorial, id]);

  return (
    <View ref={ref} collapsable={false} className={className} {...rest}>
      {children}
    </View>
  );
}
