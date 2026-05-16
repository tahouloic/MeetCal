#!/bin/bash

# Script d'installation automatique pour EC2
# Usage: bash setup-ec2.sh

set -e

echo "=========================================="
echo "Installation des dépendances sur EC2"
echo "=========================================="

# Mise à jour du système
echo "Mise à jour du système..."
sudo apt update
sudo apt upgrade -y

# Installation de Docker
echo "Installation de Docker..."
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Ajouter l'utilisateur au groupe docker
sudo usermod -aG docker $USER

# Installation de Docker Compose
echo "Installation de Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Installation de Git
echo "Installation de Git..."
sudo apt install -y git

# Installation de Nginx
echo "Installation de Nginx..."
sudo apt install -y nginx

# Configuration du pare-feu
echo "Configuration du pare-feu..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# Vérification des installations
echo ""
echo "=========================================="
echo "Vérification des installations"
echo "=========================================="
docker --version
docker-compose --version
git --version
nginx -v

echo ""
echo "=========================================="
echo "Installation terminée!"
echo "=========================================="
echo "IMPORTANT: Déconnectez-vous et reconnectez-vous pour que les changements de groupe Docker prennent effet."
echo "Ensuite, exécutez: bash deploy-app.sh"
