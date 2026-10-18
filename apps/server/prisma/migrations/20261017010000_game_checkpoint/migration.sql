-- State of each game at the start of its last round, kept once its log was checked: a sync starts
-- from it instead of running the whole log again (EDR-052). Filled by the next sync of each game.
ALTER TABLE "Game" ADD COLUMN "checkpointSeq" INTEGER,
ADD COLUMN "checkpointState" JSONB;
