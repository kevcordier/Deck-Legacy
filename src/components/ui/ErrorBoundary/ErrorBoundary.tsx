import { Button } from '@components/ui/Button/Button';
import { EmptyState } from '@components/ui/EmptyState/EmptyState';
import { CorruptedSaveError } from '@engine/domain/errors/CorruptedSaveError';
import { deleteSave } from '@engine/infrastructure/persistence';
import type { ReactNode } from 'react';
import { type FallbackProps, ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';

type ErrorBoundaryProps = {
  readonly children: ReactNode;
};

function ErrorFallback({ error }: Readonly<FallbackProps>) {
  const { t } = useTranslation();
  const canClearSave = error instanceof CorruptedSaveError;

  const reloadApp = () => {
    globalThis.location.reload();
  };

  const clearSaveAndReload = () => {
    deleteSave();
    globalThis.location.reload();
  };

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-6">
      <EmptyState
        title={t('errors.boundary.title')}
        subtitle={canClearSave ? t('errors.boundary.corruptedSave') : t('errors.boundary.subtitle')}
      >
        <div className="flex flex-col items-center gap-3 sm:flex-row">
          {canClearSave && (
            <Button color="primary" size="md" onClick={clearSaveAndReload}>
              {t('errors.boundary.clearSave')}
            </Button>
          )}
          <Button variant="text" color="ink" size="md" onClick={reloadApp}>
            {t('errors.boundary.reload')}
          </Button>
        </div>
      </EmptyState>
    </div>
  );
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ReactErrorBoundary FallbackComponent={ErrorFallback}>{children}</ReactErrorBoundary>;
}
