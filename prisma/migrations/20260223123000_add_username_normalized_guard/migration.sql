-- Ensure unaccent is available for diacritic-insensitive username normalization.
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Add normalized username column.
ALTER TABLE "user"
ADD COLUMN "usernameNormalized" TEXT;

-- Backfill current values.
UPDATE "user"
SET "usernameNormalized" = lower(unaccent("username"))
WHERE "username" IS NOT NULL;

-- Stop migration when normalization collisions exist.
DO $$
DECLARE
  duplicate_value TEXT;
BEGIN
  SELECT duplicate_rows.normalized_username
  INTO duplicate_value
  FROM (
    SELECT lower(unaccent("username")) AS normalized_username
    FROM "user"
    WHERE "username" IS NOT NULL
    GROUP BY lower(unaccent("username"))
    HAVING COUNT(*) > 1
  ) duplicate_rows
  LIMIT 1;

  IF duplicate_value IS NOT NULL THEN
    RAISE EXCEPTION 'Username normalization collision detected: %', duplicate_value;
  END IF;
END $$;

-- Enforce uniqueness on normalized usernames.
ALTER TABLE "user"
ADD CONSTRAINT "user_usernameNormalized_key" UNIQUE ("usernameNormalized");

-- Keep normalized username synced on every insert/update.
CREATE OR REPLACE FUNCTION sync_user_username_normalized()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."username" IS NULL THEN
    NEW."usernameNormalized" := NULL;
  ELSE
    NEW."usernameNormalized" := lower(unaccent(NEW."username"));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_username_normalized_sync_trigger ON "user";

CREATE TRIGGER user_username_normalized_sync_trigger
BEFORE INSERT OR UPDATE OF "username"
ON "user"
FOR EACH ROW
EXECUTE FUNCTION sync_user_username_normalized();