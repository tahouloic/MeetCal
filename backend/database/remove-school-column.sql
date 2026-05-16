-- Migration: Remove school column from class_groups table
-- Reason: ClassGroup entity now uses fieldOfStudy relation instead of direct school field
-- Date: 2026-03-09

-- Drop the school column (it's no longer used in the entity)
ALTER TABLE class_groups DROP COLUMN IF EXISTS school;

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'class_groups' 
ORDER BY ordinal_position;
