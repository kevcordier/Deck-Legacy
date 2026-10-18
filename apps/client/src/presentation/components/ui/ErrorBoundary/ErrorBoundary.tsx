import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { kingdomUseCases } from '@composition/kingdomUseCases';
import { CorruptedSaveError } from '@deck-legacy/engine/domain/errors/CorruptedSaveError';
import { reloadAppAsync } from 'expo';
import type { ReactNode } from 'react';
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

type ErrorBoundaryProps = {
  readonly children: ReactNode;
  /** Kingdom shown below the boundary: its local save can be cleared when it is corrupted. */
  readonly kingdomId?: string;
};

function ErrorFallback({ error, kingdomId }: Readonly<FallbackProps & { kingdomId?: string }>) {
  const { t } = useTranslation();
  const canClearSave = error instanceof CorruptedSaveError && kingdomId !== undefined;

  const reloadApp = () => {
    void reloadAppAsync();
  };

  const clearSaveAndReload = () => {
    if (kingdomId) kingdomUseCases.discardLocalSave.execute(kingdomId);
    void reloadAppAsync();
  };

  return (
    <View className="bg-background flex-1 items-center justify-center p-6">
      <EmptyState
        title={t('errors.boundary.title')}
        subtitle={canClearSave ? t('errors.boundary.corruptedSave') : t('errors.boundary.subtitle')}
      >
        <View className="items-center gap-3 sm:flex-row">
          {canClearSave && (
            <Button color="primary" size="md" onPress={clearSaveAndReload}>
              {t('errors.boundary.clearSave')}
            </Button>
          )}
          <Button variant="text" color="ink" size="md" onPress={reloadApp}>
            {t('errors.boundary.reload')}
          </Button>
        </View>
      </EmptyState>
    </View>
  );
}

export function ErrorBoundary({ children, kingdomId }: ErrorBoundaryProps) {
  return (
    <ReactErrorBoundary
      fallbackRender={props => <ErrorFallback {...props} kingdomId={kingdomId} />}
    >
      {children}
    </ReactErrorBoundary>
  );
}
