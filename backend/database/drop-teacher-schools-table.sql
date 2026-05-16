-- Migration: Suppression de la table teacher_schools
-- Raison: Les écoles sont déduites des cours enseignés (Course -> FieldOfStudy -> School)
-- Date: 2026-03-09

-- Supprimer la table teacher_schools
DROP TABLE IF EXISTS teacher_schools CASCADE;

-- Vérifier que la table a été supprimée
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'teacher_schools';
