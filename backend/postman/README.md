# 📮 Collection Postman - IUSJC Schedule Management API

## Import de la Collection

1. Ouvrez Postman
2. Cliquez sur **Import**
3. Sélectionnez le fichier `IUSJC_Schedule_API.postman_collection.json`
4. La collection sera importée avec toutes les requêtes

## Variables de Collection

La collection utilise des variables automatiquement mises à jour :

- `baseUrl` : URL de base de l'API (http://localhost:8080/api)
- `accessToken` : Token d'accès JWT (mis à jour automatiquement)
- `refreshToken` : Token de rafraîchissement (mis à jour automatiquement)
- `userId` : ID de l'utilisateur (mis à jour automatiquement)
- `teacherId` : ID de l'enseignant (mis à jour automatiquement)

## Scénario de Test Complet

### 1. Vérifier la Santé du Serveur

**Requête** : `Health Check`

Vérifiez que le serveur est démarré et opérationnel.

### 2. Inscription d'un Enseignant

**Requête** : `Register Teacher`

Inscrivez un nouvel enseignant. Le `userId` sera automatiquement sauvegardé.

**Note** : L'enseignant sera en statut `PENDING` et devra être validé par un admin.

### 3. Connexion Admin (Étape 1)

**Requête** : `Login (Step 1 - Send 2FA Code)`

Connectez-vous avec le compte admin par défaut :
- Email : `admin@iusjc.cm`
- Mot de passe : `Admin123!@#`

Un code 2FA sera envoyé par email. Le `userId` sera automatiquement sauvegardé.

**Note** : Vérifiez votre boîte email pour récupérer le code à 4 chiffres.

### 4. Vérification 2FA (Étape 2)

**Requête** : `Verify 2FA (Step 2 - Get Tokens)`

Entrez le code 2FA reçu par email. Les tokens `accessToken` et `refreshToken` seront automatiquement sauvegardés.

### 5. Obtenir le Profil

**Requête** : `Get Profile`

Récupérez les informations de l'utilisateur connecté.

### 6. Lister les Enseignants en Attente

**Requête** : `Get Pending Teachers`

Listez tous les enseignants en attente de validation. Le premier `teacherId` sera automatiquement sauvegardé.

### 7. Approuver un Enseignant

**Requête** : `Approve Teacher`

Approuvez l'enseignant. Il recevra un email de confirmation et pourra se connecter.

**Alternative** : Utilisez `Reject Teacher` pour rejeter la candidature avec une raison.

### 8. Lister Tous les Enseignants

**Requête** : `Get All Teachers`

Listez tous les enseignants (approuvés, en attente, rejetés).

### 9. Rafraîchir le Token

**Requête** : `Refresh Token`

Rafraîchissez l'access token lorsqu'il expire (après 15 minutes).

## Tests Automatiques

Chaque requête contient des scripts de test qui :
- Vérifient le code de statut HTTP
- Extraient et sauvegardent automatiquement les variables (tokens, IDs)
- Facilitent l'enchaînement des requêtes

## Conseils

### Tester le Flux Complet

Exécutez les requêtes dans l'ordre suivant :
1. Health Check
2. Register Teacher
3. Login (Admin)
4. Verify 2FA
5. Get Pending Teachers
6. Approve Teacher
7. Login (Teacher) - Modifiez l'email dans la requête Login
8. Verify 2FA
9. Get Profile

### Tester l'Expiration des Tokens

1. Connectez-vous et récupérez les tokens
2. Attendez 15 minutes (ou modifiez `jwt.expiration` dans application.yml)
3. Essayez d'accéder à un endpoint protégé → Erreur 401
4. Utilisez `Refresh Token` pour obtenir un nouveau token
5. Réessayez l'endpoint protégé → Succès

### Tester le Verrouillage de Compte

1. Essayez de vous connecter avec un mauvais mot de passe 3 fois
2. Le compte sera verrouillé pendant 30 minutes
3. Tentez de vous reconnecter → Erreur "Compte temporairement verrouillé"

### Tester le Code 2FA

1. Connectez-vous
2. Entrez un mauvais code 3 fois
3. Le code sera invalidé
4. Reconnectez-vous pour obtenir un nouveau code

## Variables d'Environnement

Vous pouvez créer différents environnements dans Postman :

### Développement
```json
{
  "baseUrl": "http://localhost:8080/api"
}
```

### Production
```json
{
  "baseUrl": "https://api.iusjc.cm/api"
}
```

## Dépannage

### Erreur 401 Unauthorized
- Vérifiez que vous avez un `accessToken` valide
- Utilisez `Refresh Token` si le token a expiré
- Reconnectez-vous si nécessaire

### Erreur 403 Forbidden
- Vérifiez que vous avez les permissions nécessaires
- Certains endpoints sont réservés aux admins

### Erreur 400 Bad Request
- Vérifiez le format des données envoyées
- Consultez le message d'erreur pour plus de détails

### Code 2FA non reçu
- Vérifiez la configuration email dans application.yml
- Vérifiez les logs du serveur
- Vérifiez votre dossier spam

## 🎉 Bon Test !

Cette collection Postman vous permet de tester rapidement toutes les fonctionnalités de l'API IUSJC Schedule Management.
