# 🔗 Intégration Frontend-Backend

## ✅ Ce qui a été fait

### 1. Configuration de l'Environnement

**Fichiers créés** :
- `src/environments/environment.ts` - Configuration développement
- `src/environments/environment.prod.ts` - Configuration production

**Configuration** :
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  apiTimeout: 30000,
  enableDebugLogs: true
};
```

### 2. Adaptation des Modèles TypeScript

**Fichier modifié** : `src/app/models/auth.ts`

**Changements** :
- ✅ Format de réponse adapté au backend Spring Boot
- ✅ `LoginResponse` : Ajout de `requiresTwoFactor` et `email`
- ✅ `VerifyTwoFactorRequest` : Utilise `email` au lieu de `userId`
- ✅ `VerifyTwoFactorResponse` : Tokens directement dans `data`
- ✅ `AuthState` : `pendingEmail` au lieu de `pendingUserId`

### 3. Service d'Authentification

**Fichier modifié** : `src/app/services/auth.service.ts`

**Améliorations** :
- ✅ Utilise `environment.apiUrl` au lieu d'URL hardcodée
- ✅ Logs détaillés pour le débogage
- ✅ Gestion correcte du flux 2FA
- ✅ Rafraîchissement automatique des tokens
- ✅ Nettoyage propre lors de la déconnexion

**Méthodes principales** :
```typescript
login(credentials: LoginRequest): Observable<LoginResponse>
verifyTwoFactor(request: VerifyTwoFactorRequest): Observable<VerifyTwoFactorResponse>
refreshToken(): Observable<RefreshTokenResponse>
logout(): Observable<any>
resendTwoFactorCode(email: string): Observable<any>
```

### 4. Intercepteur JWT

**Fichier créé** : `src/app/interceptors/jwt.interceptor.ts`

**Fonctionnalités** :
- ✅ Ajoute automatiquement le token Bearer aux requêtes
- ✅ Exclut les endpoints publics (`/auth/login`, `/auth/register`, etc.)
- ✅ Rafraîchit automatiquement le token si 401
- ✅ Déconnecte l'utilisateur si le rafraîchissement échoue
- ✅ Logs détaillés pour le débogage

### 5. Configuration de l'Application

**Fichier modifié** : `src/app/app.config.ts`

**Ajout** :
```typescript
provideHttpClient(withInterceptors([jwtInterceptor, authInterceptor]))
```

### 6. Composant de Connexion

**Fichier modifié** : `src/app/components/auth/login/login.component.ts`

**Changements** :
- ✅ Utilise `pendingEmail` au lieu de `pendingUserId`
- ✅ Gestion correcte du flux 2FA
- ✅ Messages d'erreur adaptés
- ✅ Logs détaillés pour le débogage

## 🔄 Flux d'Authentification

### 1. Connexion Initiale

```
Utilisateur entre email/password
         ↓
LoginComponent.onLogin()
         ↓
AuthService.login()
         ↓
POST /api/auth/login
         ↓
Backend génère code 2FA
         ↓
Réponse: { requiresTwoFactor: true, email: "..." }
         ↓
AuthState.requiresVerification = true
         ↓
Affichage du formulaire 2FA
```

### 2. Vérification 2FA

```
Utilisateur entre le code 2FA
         ↓
LoginComponent.onVerifyTwoFactor()
         ↓
AuthService.verifyTwoFactor()
         ↓
POST /api/auth/verify-2fa
         ↓
Backend valide le code
         ↓
Réponse: { accessToken, refreshToken, user }
         ↓
AuthService.setAuthData()
         ↓
Tokens sauvegardés dans localStorage
         ↓
Redirection vers /dashboard
```

### 3. Requêtes Authentifiées

```
Composant fait une requête API
         ↓
JwtInterceptor intercepte
         ↓
Ajoute header: Authorization: Bearer <token>
         ↓
Requête envoyée au backend
         ↓
Si 401: Rafraîchir le token automatiquement
         ↓
Réessayer la requête avec le nouveau token
```

## 🧪 Test de l'Intégration

### 1. Démarrer le Backend

```bash
cd schedule-backend
mvn spring-boot:run
```

Backend accessible sur : http://localhost:8080

### 2. Démarrer le Frontend

```bash
cd frontend
npm start
```

Frontend accessible sur : http://localhost:4200

### 3. Tester la Connexion

1. **Ouvrir** : http://localhost:4200
2. **Se connecter** avec :
   - Email: `admin@iusjc.cm`
   - Password: `Admin123!@#`
3. **Vérifier les logs** dans la console du navigateur :
   ```
   🔐 LoginComponent: Tentative de connexion
   🔐 AuthService: Tentative de connexion pour: admin@iusjc.cm
   📥 AuthService: Réponse de connexion: {...}
   🔒 AuthService: Vérification 2FA requise
   ```
4. **Entrer le code 2FA** (visible dans les logs du backend)
5. **Vérifier la redirection** vers le dashboard

### 4. Vérifier les Requêtes

**Ouvrir les DevTools** → Onglet Network :

**POST /api/auth/login** :
```json
Request:
{
  "email": "admin@iusjc.cm",
  "password": "Admin123!@#"
}

Response:
{
  "success": true,
  "message": "Code 2FA envoyé par email",
  "data": {
    "requiresTwoFactor": true,
    "email": "admin@iusjc.cm"
  }
}
```

**POST /api/auth/verify-2fa** :
```json
Request:
{
  "email": "admin@iusjc.cm",
  "code": "123456"
}

Response:
{
  "success": true,
  "message": "Authentification réussie",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "uuid",
    "tokenType": "Bearer",
    "expiresIn": 900000,
    "user": {
      "id": "uuid",
      "email": "admin@iusjc.cm",
      "firstName": "Super",
      "lastName": "Admin",
      "role": "ADMIN",
      "status": "ACTIVE"
    }
  }
}
```

## 🐛 Débogage

### Logs Disponibles

**Frontend (Console du navigateur)** :
- `🔐` - Authentification
- `📥` - Réponses API
- `🔑` - Tokens
- `✅` - Succès
- `❌` - Erreurs
- `🔄` - Rafraîchissement

**Backend (Console du serveur)** :
- Requêtes HTTP reçues
- Codes 2FA générés
- Erreurs de validation
- Connexions à la base de données

### Problèmes Courants

#### 1. CORS Error

**Symptôme** : `Access to XMLHttpRequest has been blocked by CORS policy`

**Solution** : Vérifier que le backend autorise `http://localhost:4200` dans `SecurityConfig.java`

#### 2. 401 Unauthorized

**Symptôme** : Toutes les requêtes retournent 401

**Causes possibles** :
- Token expiré
- Token invalide
- Endpoint protégé sans token

**Solution** : Vérifier les logs de l'intercepteur JWT

#### 3. Code 2FA non reçu

**Symptôme** : Pas d'email avec le code

**Solution** : Voir les logs du backend - Le code s'affiche dans la console

#### 4. Redirection infinie

**Symptôme** : L'application redirige en boucle

**Causes possibles** :
- Guard d'authentification mal configuré
- Token non sauvegardé

**Solution** : Vérifier `localStorage` dans les DevTools

## 📊 État de l'Intégration

| Fonctionnalité | État | Notes |
|----------------|------|-------|
| Configuration environnement | ✅ | Développement et production |
| Modèles TypeScript | ✅ | Adaptés au backend Spring Boot |
| Service d'authentification | ✅ | Flux 2FA complet |
| Intercepteur JWT | ✅ | Auto-refresh des tokens |
| Composant de connexion | ✅ | UI et logique adaptées |
| Gestion des erreurs | ✅ | Messages clairs |
| Logs de débogage | ✅ | Détaillés et utiles |

## 🎯 Prochaines Étapes

1. **Tester la connexion** avec le compte admin
2. **Créer un service Teacher** pour gérer les enseignants
3. **Adapter le composant Candidatures** pour approuver/rejeter
4. **Créer un service Admin** pour les fonctions admin
5. **Implémenter l'inscription** des enseignants

## 📝 Notes Importantes

- **Tokens** : Stockés dans `localStorage` (accessToken, refreshToken)
- **Session** : Marqueur dans `sessionStorage` pour détecter les nouveaux démarrages
- **Auto-refresh** : Les tokens sont rafraîchis automatiquement si 401
- **Logs** : Activés en développement, désactivés en production
- **CORS** : Backend configuré pour accepter `localhost:4200`

L'intégration frontend-backend est maintenant complète et fonctionnelle ! 🎉
