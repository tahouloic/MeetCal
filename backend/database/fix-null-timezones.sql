-- Fix null timezones for existing users
UPDATE users 
SET timezone = 'Africa/Douala' 
WHERE timezone IS NULL;

-- Verify the update
SELECT id, email, timezone 
FROM users 
WHERE timezone = 'Africa/Douala'
LIMIT 10;
