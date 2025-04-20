-- Add missing user fields to the users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN NOT NULL DEFAULT false;

-- First add a temporary column
ALTER TABLE users
ADD COLUMN IF NOT EXISTS balance_json JSONB NOT NULL DEFAULT '{"BTC": 0.01, "ETH": 0.1, "USDT": 1000, "INR": 75000}';

-- Drop the original balance column
ALTER TABLE users
DROP COLUMN IF EXISTS balance;

-- Rename the temporary column to the original name
ALTER TABLE users
RENAME COLUMN balance_json TO balance;