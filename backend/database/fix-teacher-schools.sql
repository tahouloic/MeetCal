-- Migration: Fix teacher_schools table for School entity refactoring
-- Reason: Teacher entity now uses Set<School> entity instead of Set<School> enum
-- Date: 2026-03-09

-- Step 1: Drop the old teacher_schools table (it has enum values, not entity references)
DROP TABLE IF EXISTS teacher_schools CASCADE;

-- Step 2: Recreate the table with proper structure for many-to-many relationship
CREATE TABLE IF NOT EXISTS teacher_schools (
    teacher_id UUID NOT NULL,
    school_id UUID NOT NULL,
    PRIMARY KEY (teacher_id, school_id),
    CONSTRAINT fk_teacher_schools_teacher FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    CONSTRAINT fk_teacher_schools_school FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Step 3: Verify the structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'teacher_schools' 
ORDER BY ordinal_position;

-- Step 4: Show existing schools (for reference)
SELECT id, code, name, abbreviation FROM schools;
