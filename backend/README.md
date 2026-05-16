# IUSJC Schedule Management - Backend API

![Java](https://img.shields.io/badge/Java-17-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.1-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

## 📋 Description

Backend Spring Boot pour le système de gestion des emplois du temps et réservations de salles de l'Institut Universitaire Saint Jean du Cameroun (IUSJC).

## 🎯 Fonctionnalités Implémentées

### 🔐 Authentification & Sécurité
- **Authentification 2FA** par email (codes à 4 chiffres)
- **JWT** avec access tokens (15 min) et refresh tokens (7 jours)
- **Gestion des rôles** : ADMIN et TEACHER
- **Hachage sécurisé** des mots de passe avec BCrypt (12 rounds)
- **Rate limiting** et protection contre les attaques par force brute
- **Verrouillage de compte** après 3 tentatives échouées (30 minutes)

### 👥 Gestion des Utilisateurs

#### Administrateur
- **Compte unique préexistant** créé automatiquement au démarrage
- Validation/rejet des candidatures enseignants
- Gestion de tous les enseignants
- Accès complet au système

#### Enseignants
- **Inscription libre** avec validation admin obligatoire
- Profil avec spécialité et écoles assignées (SJI, SJM, PrepaVogt, CPGE)
- Upload de photo de profil via Cloudinary
- Statuts : PENDING, ACTIVE, REJECTED, BLOCKED

### 📧 Système d'Emails
- Templates HTML professionnels et responsive
- **Codes 2FA** envoyés par email
- **Confirmation de candidature** pour les enseignants
- **Notification d'approbation/rejet** avec raison
- **Email de bienvenue** après validation
- **Notification admin** pour nouvelles candidatures

### 🛡️ Sécurité Avancée
- Protection CSRF désactivée (API REST stateless)
- CORS configuré pour Angular (localhost:4200)
- Headers de sécurité avec Spring Security
- Validation stricte des données d'entrée
- Nettoyage automatique des données expirées

## 🛠️ Technologies Utilisées

### Backend
- **Java 17** - Langage de programmation
- **Spring Boot 3.2.1** - Framework principal
- **Spring Security** - Authentification et autorisation
- **Spring Data JPA** - ORM et accès aux données
- **PostgreSQL** - Base de données relationnelle
- **JWT (jjwt 0.12.3)** - Gestion des tokens
- **BCrypt** - Hachage des mots de passe

### Services Externes
- **Cloudinary** - Stockage et traitement d'images (mêmes clés que Node.js)
- **JavaMailSender** - Envoi d'emails
- **Gmail SMTP** - Service d'email

### Outils de Développement
- **Maven** - Gestion des dépendances
- **Lombok** - Réduction du code boilerplate
- **Spring DevTools** - Rechargement automatique en développement

## 📦 Installation

### Prérequis
- **Java 17** ou supérieur
- **Maven 3.8+**
- **PostgreSQL 13+**
- **Git**

### 1. Cloner le repository
```bash
cd schedule-backend
```

### 2. Créer la base de données PostgreSQL
```sql
CREATE DATABASE iusjc_schedule;
CREATE USER iusjc_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE iusjc_schedule TO iusjc_user;
```

### 3. Configuration de l'environnement
Créez un fichier `.env` à la racine ou configurez les variables d'environnement :

```env
# Database
DB_USER=iusjc_user
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production_min_256_bits_long

# Cloudinary (mêmes clés que Node.js)
CLOUDINARY_CLOUD_NAME=dfrih870v
CLOUDINARY_API_KEY=548975784295799
CLOUDINARY_API_SECRET=NC9aYFrzBEaoDNiNQYzXJeZ98WM

# Email
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password

# Admin par défaut
DEFAULT_ADMIN_EMAIL=admin@iusjc.cm
DEFAULT_ADMIN_PASSWORD=Admin123!@#
```

### 4. Installer les dépendances
```bash
mvn clean install
```

### 5. Lancer l'application
```bash
mvn spring-boot:run
```

L'API démarre sur `http://localhost:8080`

## 🚀 Endpoints API

### Authentification

#### `POST /api/auth/register/teacher`
Inscription d'un nouvel enseignant (candidature).

**Body:**
```json
{
  "email": "teacher@example.com",
  "password": "StrongPass123!@#",
  "firstName": "Jean",
  "lastName": "Dupont",
  "phone": "6 12 34 56 78",
  "specialty": "Mathématiques",
  "schools": ["SJI", "CPGE"],
  "profilePicture": "https://res.cloudinary.com/..."
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Inscription réussie ! Votre candidature est en cours d'examen par l'administration.",
  "data": {
    "user": {
      "id": "uuid",
      "email": "teacher@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "TEACHER",
      "status": "PENDING"
    },
    "requiresVerification": false
  }
}
```

#### `POST /api/auth/login`
Connexion utilisateur (première étape - envoie code 2FA).

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Code de vérification envoyé par email",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "TEACHER",
      "status": "ACTIVE"
    },
    "requiresVerification": true
  }
}
```

#### `POST /api/auth/verify-2fa`
Vérification du code 2FA (deuxième étape - retourne tokens).

**Body:**
```json
{
  "userId": "uuid",
  "code": "1234"
}
```

**Réponse:**
```json
{
  "success": true,
  "message": "Connexion réussie !",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "Jean",
      "lastName": "Dupont",
      "role": "TEACHER",
      "status": "ACTIVE"
    },
    "requiresVerification": false
  }
}
```

#### `POST /api/auth/refresh`
Rafraîchir les tokens.

**Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### `GET /api/auth/profile`
Obtenir le profil de l'utilisateur connecté.

**Headers:**
```
Authorization: Bearer <access_token>
```

### Administration (ADMIN uniquement)

#### `GET /api/admin/teachers/pending`
Liste des enseignants en attente de validation.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Réponse:**
```json
{
  "success": true,
  "message": "Liste des enseignants en attente récupérée avec succès",
  "data": [
    {
      "id": "uuid",
      "user": {
        "id": "uuid",
        "email": "teacher@example.com",
        "firstName": "Jean",
        "lastName": "Dupont",
        "role": "TEACHER",
        "status": "PENDING"
      },
      "specialty": "Mathématiques",
      "schools": ["SJI", "CPGE"],
      "isActive": false,
      "isApproved": false,
      "createdAt": "2026-01-20T10:00:00"
    }
  ]
}
```

#### `GET /api/admin/teachers`
Liste de tous les enseignants.

#### `GET /api/admin/teachers/{teacherId}`
Détails d'un enseignant spécifique.

#### `POST /api/admin/teachers/{teacherId}/validate`
Valider ou rejeter une candidature enseignant.

**Body (Approbation):**
```json
{
  "action": "approve"
}
```

**Body (Rejet):**
```json
{
  "action": "reject",
  "rejectionReason": "Diplômes non conformes aux exigences"
}
```

### Santé

#### `GET /api/health`
Vérification de l'état du serveur.

**Réponse:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-01-20T10:00:00",
    "service": "IUSJC Schedule Management API",
    "version": "1.0.0",
    "services": {
      "server": {
        "status": "running",
        "uptime": 3600000
      },
      "database": {
        "status": "connected",
        "type": "PostgreSQL"
      }
    }
  }
}
```

## 🗄️ Base de Données

### Schéma Principal

#### Table `users`
- `id` (UUID, PK)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR, haché)
- `first_name`, `last_name` (VARCHAR)
- `phone` (VARCHAR)
- `profile_picture` (VARCHAR, URL Cloudinary)
- `role` (ENUM: ADMIN, TEACHER)
- `status` (ENUM: ACTIVE, PENDING, APPROVED, REJECTED, BLOCKED)
- `is_active_2fa` (BOOLEAN)
- `login_attempts`, `locked_until` (sécurité)
- `last_connection`, `created_at`, `updated_at`

#### Table `teachers`
- `id` (UUID, PK)
- `user_id` (UUID, FK vers users)
- `specialty` (VARCHAR)
- `approved_by` (UUID, FK vers users)
- `approved_at` (TIMESTAMP)
- `rejection_reason` (TEXT)
- `is_active` (BOOLEAN)
- `created_at`, `updated_at`

#### Table `teacher_schools`
- `teacher_id` (UUID, FK vers teachers)
- `school` (ENUM: SJI, SJM, PREPA_VOGT, CPGE)

#### Table `two_factor_codes`
- `id` (UUID, PK)
- `user_id` (UUID, FK vers users)
- `code` (VARCHAR(6))
- `expires_at` (TIMESTAMP)
- `is_used` (BOOLEAN)
- `attempts` (INTEGER)
- `created_at`

#### Table `refresh_tokens`
- `id` (UUID, PK)
- `user_id` (UUID, FK vers users)
- `token` (VARCHAR, UNIQUE)
- `expires_at` (TIMESTAMP)
- `is_revoked` (BOOLEAN)
- `created_at`

## 🔒 Sécurité

### Authentification 2FA
1. Utilisateur entre email/mot de passe
2. Système génère code à 4 chiffres
3. Code envoyé par email (expire en 10 minutes)
4. Utilisateur entre le code
5. Système retourne access token + refresh token

### Gestion des Tokens
- **Access Token** : 15 minutes (pour les requêtes API)
- **Refresh Token** : 7 jours (pour renouveler l'access token)
- Rotation automatique des refresh tokens

### Protection Compte
- **3 tentatives** de connexion échouées → Verrouillage 30 minutes
- **3 tentatives** de code 2FA incorrect → Code invalidé
- Nettoyage automatique des codes/tokens expirés

## 🧹 Tâches Planifiées

### Nettoyage des codes 2FA
- **Fréquence** : Toutes les heures
- **Action** : Supprime les codes expirés ou utilisés

### Nettoyage des refresh tokens
- **Fréquence** : Toutes les 6 heures
- **Action** : Supprime les tokens expirés ou révoqués

## 🔧 Configuration

### Variables d'Environnement Importantes

```yaml
# JWT
jwt.secret: Clé secrète (min 256 bits)
jwt.expiration: 900000 (15 min)
jwt.refresh-expiration: 604800000 (7 jours)

# 2FA
two-factor.code-expiry-minutes: 10
two-factor.max-attempts: 3

# Sécurité
security.max-login-attempts: 3
security.lockout-time-minutes: 30

# Admin par défaut
admin.email: admin@iusjc.cm
admin.password: Admin123!@#
```

## 📝 Logs

L'application utilise SLF4J avec Logback :
- **INFO** : Événements importants (connexions, inscriptions)
- **WARN** : Tentatives suspectes, verrouillages
- **ERROR** : Erreurs système, échecs d'envoi d'emails

## 🚀 Déploiement

### Build Production
```bash
mvn clean package -DskipTests
```

Le JAR sera généré dans `target/schedule-management-1.0.0.jar`

### Lancer en Production
```bash
java -jar target/schedule-management-1.0.0.jar \
  --spring.profiles.active=prod \
  --DB_USER=prod_user \
  --DB_PASSWORD=prod_password \
  --JWT_SECRET=your_production_secret
```

## 🔗 Intégration avec Angular

Le frontend Angular (localhost:4200) est déjà configuré dans CORS.

### Exemple d'appel depuis Angular
```typescript
// Service d'authentification
login(email: string, password: string) {
  return this.http.post<ApiResponse<AuthResponse>>(
    'http://localhost:8080/api/auth/login',
    { email, password }
  );
}

verify2FA(userId: string, code: string) {
  return this.http.post<ApiResponse<AuthResponse>>(
    'http://localhost:8080/api/auth/verify-2fa',
    { userId, code }
  );
}
```

## 📚 Prochaines Étapes

- [ ] Gestion des emplois du temps
- [ ] Gestion des salles
- [ ] Gestion des disponibilités enseignants
- [ ] Algorithme d'assignation automatique des salles
- [ ] Détection et résolution des conflits d'horaires
- [ ] Notifications (email, SMS)
- [ ] Calendrier et synchronisation externe
- [ ] Tableaux de bord et rapports

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

© 2026 Institut Universitaire Saint Jean du Cameroun

---

**Status** : ✅ **Phase 1 Complète** - Authentification et gestion des utilisateurs fonctionnelles
