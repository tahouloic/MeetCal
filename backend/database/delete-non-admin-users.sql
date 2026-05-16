-- Supprimer tous les utilisateurs sauf l'admin
-- D'abord, supprimer les données liées en cascade

-- Supprimer les rendez-vous
DELETE FROM appointments WHERE sender_id IN (SELECT id FROM users WHERE role != 'ADMIN');
DELETE FROM appointments WHERE receiver_id IN (SELECT id FROM users WHERE role != 'ADMIN');

-- Supprimer les disponibilités
DELETE FROM availabilities WHERE user_id IN (SELECT id FROM users WHERE role != 'ADMIN');

-- Supprimer les codes 2FA
DELETE FROM two_factor_codes WHERE user_id IN (SELECT id FROM users WHERE role != 'ADMIN');

-- Supprimer les utilisateurs non-admin
DELETE FROM users WHERE role != 'ADMIN';

-- Vérifier les utilisateurs restants
SELECT id, email, first_name, last_name, role, status FROM users;
