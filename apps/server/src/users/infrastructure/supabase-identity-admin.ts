import { APP_CONFIG } from '../../config/app-config.token';
import type { AppConfig } from '../../config/env';
import { IdentityAdmin } from '../application/identity-admin';
import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

/** Deletes users through the Supabase admin API (needs `SUPABASE_SERVICE_ROLE_KEY`). */
@Injectable()
export class SupabaseIdentityAdmin extends IdentityAdmin {
  private readonly logger = new Logger(SupabaseIdentityAdmin.name);

  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {
    super();
  }

  async deleteUser(userId: string): Promise<void> {
    const serviceKey = this.config.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      throw new ServiceUnavailableException('errors.accountDeletionUnavailable');
    }
    // A secret key (`sb_secret_…`) is not a JWT: Supabase refuses it as a Bearer token and
    // accepts it in `apikey` only. A legacy service_role key (a JWT) goes in both.
    const headers: Record<string, string> = { apikey: serviceKey };
    if (!serviceKey.startsWith('sb_')) headers.Authorization = `Bearer ${serviceKey}`;
    const response = await fetch(`${this.config.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers,
    });
    // 404: already deleted in Supabase; the data is still removed.
    if (!response.ok && response.status !== 404) {
      this.logger.error(
        `Supabase refused to delete user ${userId}: ${response.status} ${await response.text()}`,
      );
      throw new BadGatewayException('errors.accountDeletionFailed');
    }
  }
}
