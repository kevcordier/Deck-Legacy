import type { Prisma } from '../generated/prisma/client';

/** A Prisma transaction, passed to the writes that must commit with a game. */
export type Transaction = Prisma.TransactionClient;
