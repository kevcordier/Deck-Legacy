-- Games whose log the server verified by running the recorded player commands (EDR-051).
ALTER TABLE "Game" ADD COLUMN "verified" BOOLEAN NOT NULL DEFAULT false;

-- Games synced before EDR-051 cannot be verified (no seed, no recorded commands). The only one in
-- progress is the maintainer's: they are trusted, and keep the flag on later syncs.
UPDATE "Game" SET "verified" = true;
