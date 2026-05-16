#!/bin/bash

# Script de déploiement de l'application
# Usage: bash deploy-app.sh

set -e

echo "=========================================="
echo "Déploiement de l'application IUSJC"
echo "=========================================="

# Vérifier que Docker fonctionne
if ! docker ps > /dev/null 2>&1; then
    echo "Erreur: Docker n'est pas accessible. Avez-vous redémarré votre session après l'installation?"
    exit 1
fi

# Créer le répertoire de l'application
APP_DIR="$HOME/iusjc-schedule-app"
mkdir -p $APP_DIR

echo "Répertoire de l'application: $APP_DIR"

# Vérifier si .env existe
if [ ! -f ".env" ]; then
    echo "Erreur: Fichier .env introuvable!"
    echo "Veuillez créer un fichier .env avec les variables d'environnement nécessaires."
    exit 1
fi

# Vérifier si docker-compose.yml existe
if [ ! -f "docker-compose.yml" ]; then
    echo "Erreur: Fichier docker-compose.yml introuvable!"
    exit 1
fi

# Arrêter les conteneurs existants
echo "Arrêt des conteneurs existants..."
docker-compose down || true

# Construire les images
echo "Construction des images Docker..."
docker-compose build --no-cache

# Démarrer les services
echo "Démarrage des services..."
docker-compose up -d

# Attendre que les services démarrent
echo "Attente du démarrage des services..."
sleep 30

# Vérifier l'état des conteneurs
echo ""
echo "=========================================="
echo "État des conteneurs"
echo "=========================================="
docker-compose ps

# Vérifier les logs
echo ""
echo "=========================================="
echo "Derniers logs du backend"
echo "=========================================="
docker logs iusjc-backend --tail 20

echo ""
echo "=========================================="
echo "Déploiement terminé!"
echo "=========================================="
echo "L'application devrait être accessible sur:"
echo "- Frontend: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
echo "- Backend API: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)/api"
echo ""
echo "Pour voir les logs en temps réel:"
echo "  docker-compose logs -f"
