# Scripts de Déploiement EC2

Ce dossier contient tous les scripts nécessaires pour déployer l'application IUSJC Schedule Management sur AWS EC2.

## 📋 Liste des Scripts

### 1. `setup-ec2.sh`
**Installation initiale des dépendances sur EC2**

Installe:
- Docker & Docker Compose
- Git
- Nginx
- Configure le pare-feu UFW

**Usage:**
```bash
bash setup-ec2.sh
```

**Note:** Après l'exécution, déconnectez-vous et reconnectez-vous pour que les changements de groupe Docker prennent effet.

---

### 2. `deploy-app.sh`
**Déploiement de l'application**

- Construit les images Docker
- Démarre les conteneurs
- Vérifie l'état des services

**Usage:**
```bash
bash deploy-app.sh
```

**Prérequis:**
- Fichier `.env` configuré
- Fichier `docker-compose.yml` présent

---

### 3. `backup-db.sh`
**Sauvegarde de la base de données**

- Crée une sauvegarde SQL compressée
- Garde les 7 dernières sauvegardes
- Stocke dans `~/backups/`

**Usage:**
```bash
bash backup-db.sh
```

**Automatisation (cron):**
```bash
# Sauvegarde quotidienne à 2h du matin
crontab -e
# Ajouter:
0 2 * * * /home/ubuntu/deployment-scripts/backup-db.sh >> /home/ubuntu/backup.log 2>&1
```

---

### 4. `restore-db.sh`
**Restauration de la base de données**

Restaure une sauvegarde précédente.

**Usage:**
```bash
bash restore-db.sh ~/backups/iusjc_schedule_20260515_020000.sql.gz
```

---

### 5. `update-app.sh`
**Mise à jour de l'application**

- Crée une sauvegarde de sécurité
- Met à jour le code (si Git)
- Reconstruit les images
- Redémarre les services

**Usage:**
```bash
bash update-app.sh
```

---

## 📁 Fichiers de Configuration

### `nginx-config.conf`
Configuration Nginx pour reverse proxy et SSL.

**Installation:**
```bash
sudo cp nginx-config.conf /etc/nginx/sites-available/iusjc-schedule
sudo ln -s /etc/nginx/sites-available/iusjc-schedule /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

### `.env.production.example`
Template de configuration pour la production.

**Usage:**
```bash
cp .env.production.example ../.env
nano ../.env
# Remplissez toutes les valeurs
```

---

## 🚀 Guide de Déploiement Rapide

### Étape 1: Préparer l'Instance EC2

1. Créez une instance EC2 (Ubuntu 22.04, t3.medium)
2. Configurez le Security Group (ports 22, 80, 443)
3. Connectez-vous via SSH

### Étape 2: Installation

```bash
# Transférer les fichiers
scp -i votre-cle.pem -r deployment-scripts ubuntu@<IP-EC2>:~/
scp -i votre-cle.pem -r appointment-booking-platform ubuntu@<IP-EC2>:~/
scp -i votre-cle.pem docker-compose.yml ubuntu@<IP-EC2>:~/

# Se connecter
ssh -i votre-cle.pem ubuntu@<IP-EC2>

# Installer les dépendances
cd ~/deployment-scripts
bash setup-ec2.sh

# Déconnexion/Reconnexion
exit
ssh -i votre-cle.pem ubuntu@<IP-EC2>
```

### Étape 3: Configuration

```bash
# Configurer les variables d'environnement
cd ~
cp deployment-scripts/.env.production.example .env
nano .env
# Remplissez toutes les valeurs
```

### Étape 4: Déploiement

```bash
cd ~
bash deployment-scripts/deploy-app.sh
```

### Étape 5: Configuration Nginx (Optionnel)

```bash
sudo cp deployment-scripts/nginx-config.conf /etc/nginx/sites-available/iusjc-schedule
sudo ln -s /etc/nginx/sites-available/iusjc-schedule /etc/nginx/sites-enabled/
sudo nano /etc/nginx/sites-available/iusjc-schedule
# Remplacez "votre-domaine.com" par votre domaine
sudo nginx -t
sudo systemctl restart nginx
```

### Étape 6: SSL avec Let's Encrypt (Optionnel)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com
```

---

## 🔧 Commandes Utiles

### Voir les logs
```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker logs -f iusjc-backend
docker logs -f iusjc-frontend
docker logs -f iusjc-postgres
```

### Redémarrer les services
```bash
# Tous
docker-compose restart

# Spécifique
docker-compose restart backend
```

### Vérifier l'état
```bash
docker-compose ps
docker ps
```

### Nettoyer Docker
```bash
# Supprimer les images inutilisées
docker system prune -a

# Supprimer les volumes inutilisés
docker volume prune
```

---

## 🛡️ Sécurité

### Checklist de Sécurité

- [ ] Mots de passe forts pour DB_PASSWORD
- [ ] JWT_SECRET généré aléatoirement (64+ caractères)
- [ ] Mot de passe d'application Gmail (pas le mot de passe principal)
- [ ] Pare-feu UFW activé
- [ ] SSL/HTTPS configuré (Let's Encrypt)
- [ ] Sauvegardes automatiques configurées
- [ ] Security Group EC2 restreint aux ports nécessaires
- [ ] Variables d'environnement sensibles non commitées dans Git

### Générer des Secrets Forts

```bash
# JWT Secret
openssl rand -base64 64

# Mot de passe de base de données
openssl rand -base64 32
```

---

## 📊 Monitoring

### Vérifier la santé de l'application

```bash
# Backend
curl http://localhost:8080/api/health

# Frontend
curl http://localhost/

# Base de données
docker exec iusjc-postgres pg_isready -U iusjc_user
```

### Espace disque

```bash
df -h
docker system df
```

### Utilisation des ressources

```bash
docker stats
```

---

## 🆘 Dépannage

### Les conteneurs ne démarrent pas

```bash
# Vérifier les logs
docker-compose logs

# Vérifier l'espace disque
df -h

# Nettoyer Docker
docker system prune -a
```

### Erreur de connexion à la base de données

```bash
# Vérifier PostgreSQL
docker logs iusjc-postgres

# Se connecter manuellement
docker exec -it iusjc-postgres psql -U iusjc_user -d iusjc_schedule
```

### L'application n'est pas accessible

```bash
# Vérifier Nginx
sudo systemctl status nginx
sudo nginx -t

# Vérifier les ports
sudo netstat -tulpn | grep LISTEN

# Vérifier le pare-feu
sudo ufw status
```

---

## 📚 Ressources

- [Guide de déploiement complet](../DEPLOYMENT_EC2_GUIDE.md)
- [Documentation Docker](https://docs.docker.com/)
- [Documentation AWS EC2](https://docs.aws.amazon.com/ec2/)
- [Documentation Nginx](https://nginx.org/en/docs/)

---

## 📝 Notes

- Tous les scripts doivent être exécutés depuis le répertoire racine du projet
- Les sauvegardes sont stockées dans `~/backups/`
- Les logs Nginx sont dans `/var/log/nginx/`
- Testez toujours dans un environnement de staging avant la production
