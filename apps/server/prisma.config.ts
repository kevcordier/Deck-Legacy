import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    // `prisma generate` does not need a database; migrations do.
    url: process.env.DATABASE_URL ?? 'postgresql://deck:deck@localhost:5432/deck_legacy',
  },
});
