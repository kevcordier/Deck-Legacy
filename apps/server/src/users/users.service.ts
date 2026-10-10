import type { AuthUser } from '../auth/auth-user';
import { APP_CONFIG, type AppConfig } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import type { UserProfile } from '@deck-legacy/api-contract';
import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';

const KNOWN_USERS_LIMIT = 10_000;

@Injectable()
export class UsersService {
  /** Last identity written to the database, per user id, to avoid one upsert per request. */
  private readonly known = new Map<string, string>();
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(APP_CONFIG) private readonly config: AppConfig,
  ) {}

  /** Creates the user on first sight and keeps email / anonymous flag in sync with Supabase. */
  async ensureUser(user: AuthUser): Promise<void> {
    const fingerprint = `${user.email ?? ''}|${user.isAnonymous}`;
    if (this.known.get(user.id) === fingerprint) return;

    await this.prisma.user.upsert({
      where: { id: user.id },
      create: { id: user.id, email: user.email, isAnonymous: user.isAnonymous },
      update: { email: user.email, isAnonymous: user.isAnonymous },
    });

    if (this.known.size >= KNOWN_USERS_LIMIT) this.known.clear();
    this.known.set(user.id, fingerprint);
  }

  async getProfile(userId: string): Promise<UserProfile> {
    const user = await this.prisma.user.findUniqueOrThrow({ where: { id: userId } });
    return {
      id: user.id,
      displayName: user.displayName,
      isAnonymous: user.isAnonymous,
      email: user.email,
    };
  }

  /**
   * Deletes the account: the Supabase user first (its tokens stop working), then the user's
   * data (games, events and scores are deleted in cascade).
   */
  async deleteAccount(userId: string): Promise<void> {
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
    // 404: already deleted in Supabase; the data below is still removed.
    if (!response.ok && response.status !== 404) {
      this.logger.error(
        `Supabase refused to delete user ${userId}: ${response.status} ${await response.text()}`,
      );
      throw new BadGatewayException('errors.accountDeletionFailed');
    }
    await this.prisma.user.deleteMany({ where: { id: userId } });
    this.known.delete(userId);
  }

  async updateDisplayName(userId: string, displayName: string): Promise<UserProfile> {
    await this.prisma.user.update({ where: { id: userId }, data: { displayName } });
    return this.getProfile(userId);
  }
}
