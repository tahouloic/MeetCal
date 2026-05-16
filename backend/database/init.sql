-- Script d'initialisation de la base de données IUSJC Schedule Management
-- PostgreSQL 13+

-- Créer la base de données
CREATE DATABASE iusjc_schedule;

-- Se connecter à la base de données
\c iusjc_schedule;

-- Créer un utilisateur dédié
CREATE USER iusjc_user WITH PASSWORD 'iusjc_password_2026';

-- Accorder tous les privilèges
GRANT ALL PRIVILEGES ON DATABASE iusjc_schedule TO iusjc_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO iusjc_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO iusjc_user;

-- Les tables seront créées automatiquement par Hibernate au démarrage de l'application
-- avec spring.jpa.hibernate.ddl-auto=update

-- Vérification
SELECT 'Base de données IUSJC Schedule créée avec succès !' AS status;
