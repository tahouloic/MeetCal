#!/bin/bash

# Script de restauration de la base de données
# Usage: bash restore-db.sh <fichier-backup.sql.gz>

if [ -z "$1" ]; then
    echo "Usage: bash restore-db.sh <fichier-backup.sql.gz>"
    echo ""
    echo "Sauvegardes disponibles:"
    ls -lh $HOME/backups/iusjc_schedule_*.sql.gz 2>/dev/null || echo "Aucune sauvegarde trouvée"
    exit 1
fi

BACKUP_FILE=$1

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Erreur: Fichier $BACKUP_FILE introuvable"
    exit 1
fi

echo "⚠️  ATTENTION: Cette opération va écraser la base de données actuelle!"
read -p "Êtes-vous sûr de vouloir continuer? (oui/non): " confirm

if [ "$confirm" != "oui" ]; then
    echo "Restauration annulée"
    exit 0
fi

echo "Décompression de la sauvegarde..."
gunzip -c $BACKUP_FILE > /tmp/restore.sql

echo "Restauration de la base de données..."
docker exec -i iusjc-postgres psql -U iusjc_user -d iusjc_schedule < /tmp/restore.sql

if [ $? -eq 0 ]; then
    echo "✅ Base de données restaurée avec succès"
    rm /tmp/restore.sql
else
    echo "❌ Erreur lors de la restauration"
    rm /tmp/restore.sql
    exit 1
fi
