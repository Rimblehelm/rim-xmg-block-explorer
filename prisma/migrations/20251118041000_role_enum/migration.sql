-- Create a Postgres enum type and convert the existing text column to that enum.
-- Existing values in the `role` column are lowercase ('user'/'admin').
-- We map them to uppercase enum values 'USER'/'ADMIN'.

-- Drop any existing default so the column value can be cast safely
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;

CREATE TYPE "Role" AS ENUM ('USER','ADMIN');

-- Convert the column from TEXT to the new enum type, mapping lowercase values.
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role" USING (
  CASE
    WHEN "role" = 'admin' THEN 'ADMIN'::text
    ELSE 'USER'::text
  END
)::"Role";

-- Ensure default is set to 'USER'.
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
