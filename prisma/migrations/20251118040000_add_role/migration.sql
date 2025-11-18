-- Add a non-nullable `role` column with default 'user', then set existing user(s) to 'admin'
-- Adjusts the Prisma `User` table created in the initial migration.

ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'user';

-- For the single existing record in the database, set role to 'admin'.
-- This uses a broad update because the DB currently contains only one User record.
UPDATE "User" SET "role" = 'admin';
