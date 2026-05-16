-- Vérifier la contrainte actuelle
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND conname = 'users_role_check';

-- Supprimer l'ancienne contrainte
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Créer la nouvelle contrainte avec USER inclus
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT', 'USER'));

-- Vérifier que la contrainte a été créée
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass AND conname = 'users_role_check';
