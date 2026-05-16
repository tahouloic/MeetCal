-- Script pour ajouter ON DELETE CASCADE aux contraintes de clés étrangères
-- Cela permettra la suppression automatique des dépendances lors de la suppression d'un enseignant

-- 1. Availabilities -> Teachers
-- Supprimer l'ancienne contrainte
ALTER TABLE availabilities 
DROP CONSTRAINT IF EXISTS fka77v36h6luy9gkamo7wtaljgo;

-- Recréer avec CASCADE
ALTER TABLE availabilities
ADD CONSTRAINT fka77v36h6luy9gkamo7wtaljgo 
FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

-- 2. Teacher Courses (many-to-many) -> Teachers
-- Supprimer l'ancienne contrainte
ALTER TABLE teacher_courses
DROP CONSTRAINT IF EXISTS fkg5rpjxn8vjt9v81ura5taiulf;

-- Recréer avec CASCADE
ALTER TABLE teacher_courses
ADD CONSTRAINT fkg5rpjxn8vjt9v81ura5taiulf
FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE;

-- 3. Teachers -> Users
-- Supprimer l'ancienne contrainte
ALTER TABLE teachers
DROP CONSTRAINT IF EXISTS fk7v42t1wxx9nht7039mitqm97dyq;

-- Recréer avec CASCADE
ALTER TABLE teachers
ADD CONSTRAINT fk7v42t1wxx9nht7039mitqm97dyq
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 4. Refresh Tokens -> Users
-- Supprimer l'ancienne contrainte
ALTER TABLE refresh_tokens
DROP CONSTRAINT IF EXISTS fk1lih5y2npsf8u5o3vhdb9y0os;

-- Recréer avec CASCADE
ALTER TABLE refresh_tokens
ADD CONSTRAINT fk1lih5y2npsf8u5o3vhdb9y0os
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- 5. Two Factor Codes -> Users
-- Supprimer l'ancienne contrainte
ALTER TABLE two_factor_codes
DROP CONSTRAINT IF EXISTS fk5rfemgajmn6wibusanio5a8be;

-- Recréer avec CASCADE
ALTER TABLE two_factor_codes
ADD CONSTRAINT fk5rfemgajmn6wibusanio5a8be
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Vérifier les contraintes
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('teachers', 'availabilities', 'teacher_courses', 'refresh_tokens', 'two_factor_codes')
ORDER BY tc.table_name, tc.constraint_name;
