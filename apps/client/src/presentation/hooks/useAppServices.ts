import { type AppServices, AppServicesContext } from '@contexts/AppServicesContext';
import { use } from 'react';

/** The services of the app (`AppServicesProvider`). */
export function useAppServices(): AppServices {
  const services = use(AppServicesContext);
  if (!services) throw new Error('useAppServices must be used inside AppServicesProvider');
  return services;
}
