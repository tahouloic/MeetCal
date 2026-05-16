-- Script pour vérifier et corriger les noms de classes dupliqués
-- Date: 2026-03-09

-- 1. Afficher les classes actuelles avec leurs noms
SELECT 
    cg.id,
    cg.code,
    cg.name AS current_name,
    cg.level,
    cg.language,
    fos.name AS field_of_study_name
FROM class_groups cg
JOIN fields_of_study fos ON cg.field_of_study_id = fos.id
ORDER BY cg.created_at DESC;

-- 2. Supprimer toutes les classes (pour repartir à zéro)
-- ATTENTION: Cela supprimera toutes les classes existantes!
-- Décommentez la ligne suivante si vous voulez supprimer les classes:
-- DELETE FROM class_groups;

-- 3. Vérifier que les filières ont des noms corrects
SELECT 
    id,
    code,
    label,
    name,
    school_id
FROM fields_of_study
ORDER BY created_at DESC;
