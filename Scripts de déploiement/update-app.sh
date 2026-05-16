#!/bin/bash

# Script de mise à jour de l'application
# Usage: bash update-app.sh

set -e

echo "=========================================="
echo "Mise à jour de l'application IUSJC"
echo "=========================================="

# Créer une sauvegarde avant la mise à jour
echo "Création d'une sauvegarde de sécurité..."
bash backup-db.sh

# Arrêter les services
echo "Arrêt des services..."
docker-compose down

# Mettre à jour le code (si Git est utilisé)
if [ -d ".git" ]; then
    echo "Mise à jour du code depuis Git..."
    git pull
fi

# Reconstruire les images
echo "Reconstruction des images Docker..."
docker-compose build --no-cache

# Redémarrer les services
echo "Redémarrage des services..."
docker-compose up -d

# Attendre que les services démarrent
echo "Attente du démarrage des services..."
sleep 30

# Vérifier l'état
echo ""
echo "=========================================="
echo "État des conteneurs"
echo "=========================================="
docker-compose ps

echo ""
echo "=========================================="
echo "Mise à jour terminée!"
echo "=========================================="
echo "Vérifiez les logs avec: docker-compose logs -f"
