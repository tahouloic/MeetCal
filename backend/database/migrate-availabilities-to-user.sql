-- Migration: Changer availabilities.teacher_id vers availabilities.user_id
-- Date: 9 mai 2026

-- Étape 1: Ajouter la nouvelle colonne user_id
ALTER TABLE availabilities ADD COLUMN IF NOT EXISTS user_id UUID;

-- Étape 2: Copier les données de teacher_id vers user_id en utilisant la relation teachers.user_id
UPDATE availabilities a
SET user_id = t.user_id
FROM teachers t
WHERE a.teacher_id = t.id;

-- Étape 3: Supprimer la contrainte de clé étrangère sur teacher_id
ALTER TABLE availabilities DROP CONSTRAINT IF EXISTS fk_availabilities_teacher;
ALTER TABLE availabilities DROP CONSTRAINT IF EXISTS availabilities_teacher_id_fkey;

-- Étape 4: Supprimer l'ancienne colonne teacher_id
ALTER TABLE availabilities DROP COLUMN IF EXISTS teacher_id;

-- Étape 5: Rendre user_id NOT NULL
ALTER TABLE availabilities ALTER COLUMN user_id SET NOT NULL;

-- Étape 6: Ajouter la contrainte de clé étrangère sur user_id
ALTER TABLE availabilities 
ADD CONSTRAINT fk_availabilities_user 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Étape 7: Créer un index sur user_id pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_availabilities_user_id ON availabilities(user_id);

-- Vérification
SELECT 'Migration terminée. Nombre de disponibilités migrées:' as message, COUNT(*) as count FROM availabilities;
