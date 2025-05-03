-- Add full_name column
ALTER TABLE users ADD COLUMN full_name TEXT;

-- Make phone required - set defaults for existing records first
UPDATE users SET phone = 'Not Provided' WHERE phone IS NULL;
ALTER TABLE users ALTER COLUMN phone SET NOT NULL;

-- Copy date_of_birth data to full_name for existing records temporarily
UPDATE users SET full_name = 'User ' || id WHERE full_name IS NULL;

-- Make full_name required
ALTER TABLE users ALTER COLUMN full_name SET NOT NULL;

-- Drop date_of_birth column (optional, can be kept for backward compatibility)
-- ALTER TABLE users DROP COLUMN date_of_birth;