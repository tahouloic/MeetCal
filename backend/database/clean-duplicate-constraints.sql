-- Nettoyer les contraintes en double sur la table teachers

-- Supprimer la contrainte en double sans CASCADE
ALTER TABLE teachers 
DROP CONSTRAINT IF EXISTS fkb8dct7w2j1vl1r2bpstw5isc0;

-- Vérifier les contraintes restantes
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
    AND tc.table_name = 'teachers'
ORDER BY tc.constraint_name;
