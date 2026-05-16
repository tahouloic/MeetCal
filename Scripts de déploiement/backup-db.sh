#!/bin/bash

# Script de sauvegarde de la base de données
# Usage: bash backup-db.sh

BACKUP_DIR="$HOME/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/iusjc_schedule_$TIMESTAMP.sql"

# Créer le répertoire de sauvegarde
mkdir -p $BACKUP_DIR

echo "Création de la sauvegarde..."

# Effectuer la sauvegarde
docker exec iusjc-postgres pg_dump -U iusjc_user iusjc_schedule > $BACKUP_FILE

if [ $? -eq 0 ]; then
    echo "✅ Sauvegarde créée avec succès: $BACKUP_FILE"
    
    # Compresser la sauvegarde
    gzip $BACKUP_FILE
    echo "✅ Sauvegarde compressée: $BACKUP_FILE.gz"
    
    # Garder seulement les 7 dernières sauvegardes
    find $BACKUP_DIR -name "iusjc_schedule_*.sql.gz" -mtime +7 -delete
    echo "✅ Anciennes sauvegardes nettoyées (>7 jours)"
    
    # Afficher la taille de la sauvegarde
    SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "📦 Taille de la sauvegarde: $SIZE"
    
    # Lister les sauvegardes disponibles
    echo ""
    echo "Sauvegardes disponibles:"
    ls -lh $BACKUP_DIR/iusjc_schedule_*.sql.gz
else
    echo "❌ Erreur lors de la création de la sauvegarde"
    exit 1
fi
