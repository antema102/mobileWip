# Guide de Test - Création de Compte Administrateur

Ce document explique comment tester la fonctionnalité de création de compte administrateur.

## Vue d'Ensemble

Les modifications apportées incluent :

1. **Script de création d'admin** (`back/scripts/createAdmin.js`) - Script interactif sécurisé
2. **Protection de l'API** - Empêche la création de comptes admin/manager via l'endpoint public
3. **Documentation complète** - Guide détaillé dans `ADMIN_ACCOUNT.md`

## Test 1 : Utiliser le Script de Création d'Admin

### Prérequis
```bash
# 1. Démarrer MongoDB (si local)
mongod

# 2. Configurer l'environnement
cd back
cp .env.example .env
# Éditer .env avec vos paramètres MongoDB

# 3. Installer les dépendances
npm install
```

### Exécution du Script

**Option 1 : Via npm** (depuis le dossier `back`)
```bash
cd back
npm run create-admin
```

**Option 2 : Directement avec Node** (depuis le dossier `back`)
```bash
cd back
node scripts/createAdmin.js
```

### Exemple d'Interaction

```
✓ Connected to MongoDB

=== Create Admin Account ===

First Name: Admin
Last Name: Test
Email: admin@test.com
Employee ID: ADM001
Password (min 6 characters): admin123
Hourly Rate (optional, press Enter to skip): 25
Department (optional): IT
Position (optional): System Administrator

✓ Admin account created successfully!

Admin Details:
  ID: 654abc...
  Name: Admin Test
  Email: admin@test.com
  Employee ID: ADM001
  Role: admin
  Created: 2025-10-30T...
```

## Test 2 : Vérifier la Protection de l'API

### Test 2.1 : Tentative de création d'admin via API (doit échouer)

**Ce qui devrait arriver** : L'utilisateur sera créé avec le rôle "employee" au lieu de "admin"

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Malicious",
    "lastName": "User",
    "email": "hacker@test.com",
    "password": "password123",
    "employeeId": "EMP999",
    "hourlyRate": 15,
    "role": "admin"
  }'
```

**Résultat attendu** :
```json
{
  "_id": "...",
  "firstName": "Malicious",
  "lastName": "User",
  "email": "hacker@test.com",
  "employeeId": "EMP999",
  "role": "employee",  // ← Remarquez que c'est "employee" et non "admin"
  "token": "..."
}
```

### Test 2.2 : Vérifier le rôle dans la base de données

```bash
mongosh
use personnel_tracking

db.users.findOne({ email: "hacker@test.com" })
```

**Résultat attendu** :
```javascript
{
  _id: ObjectId("..."),
  firstName: "Malicious",
  lastName: "User",
  email: "hacker@test.com",
  employeeId: "EMP999",
  role: "employee",  // ← Doit être "employee"
  ...
}
```

## Test 3 : Se Connecter avec le Compte Admin

### Connexion via API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "admin123"
  }'
```

**Résultat attendu** :
```json
{
  "_id": "...",
  "firstName": "Admin",
  "lastName": "Test",
  "email": "admin@test.com",
  "employeeId": "ADM001",
  "role": "admin",  // ← Vérifier que c'est bien "admin"
  "token": "eyJhbG..."
}
```

### Utiliser le Token Admin

Avec le token obtenu, vous pouvez accéder aux endpoints protégés :

```bash
# Remplacer {TOKEN} par le token reçu lors de la connexion
TOKEN="eyJhbG..."

# Lister tous les utilisateurs (nécessite admin/manager)
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"

# Lister toutes les présences (nécessite admin/manager)
curl -X GET http://localhost:3000/api/attendance \
  -H "Authorization: Bearer $TOKEN"
```

## Test 4 : Cas d'Erreur du Script

### Test 4.1 : Email déjà utilisé

```bash
# Lancer le script deux fois avec le même email
node scripts/createAdmin.js
# Entrer : admin@test.com

# Relancer
node scripts/createAdmin.js
# Entrer à nouveau : admin@test.com
```

**Résultat attendu** :
```
✗ Error: User with this email already exists
```

### Test 4.2 : Mot de passe trop court

```bash
node scripts/createAdmin.js
# Entrer un mot de passe de moins de 6 caractères
Password (min 6 characters): 123
```

**Résultat attendu** :
```
✗ Error: Password must be at least 6 characters
```

### Test 4.3 : MongoDB non disponible

```bash
# Arrêter MongoDB si vous l'avez démarré localement
# Ou modifier MONGODB_URI dans .env pour pointer vers un serveur inexistant

node scripts/createAdmin.js
```

**Résultat attendu** :
```
✗ Error: [Message d'erreur de connexion MongoDB]
```

## Test 5 : Validation de la Sécurité

### Vérifier le Hachage du Mot de Passe

```bash
mongosh
use personnel_tracking

db.users.findOne({ email: "admin@test.com" }, { password: 1 })
```

**Résultat attendu** :
- Le mot de passe doit être haché avec bcrypt
- Il doit commencer par `$2a$10$` ou `$2b$10$`
- Il ne doit **jamais** être en clair

Exemple :
```javascript
{
  _id: ObjectId("..."),
  password: "$2a$10$XYZ..." // ← Hash bcrypt
}
```

## Test 6 : Scripts npm

### Vérifier que les scripts npm fonctionnent

```bash
cd back

# Vérifier que le script est dans package.json
npm run

# Devrait afficher :
# create-admin
#   node scripts/createAdmin.js
```

## Résumé des Comportements Attendus

| Scénario | Résultat Attendu |
|----------|------------------|
| Créer admin via script | ✓ Compte créé avec role="admin" |
| Créer admin via API `/register` | ✓ Compte créé avec role="employee" (converti) |
| Créer manager via API `/register` | ✓ Compte créé avec role="employee" (converti) |
| Créer employee via API `/register` | ✓ Compte créé avec role="employee" |
| Email déjà existant | ✗ Erreur "User already exists" |
| Mot de passe < 6 caractères | ✗ Erreur de validation |
| MongoDB déconnecté | ✗ Erreur de connexion |

## Nettoyage après Tests

Pour supprimer les comptes de test :

```bash
mongosh
use personnel_tracking

# Supprimer tous les comptes de test (attention au pattern)
db.users.deleteMany({ email: { $regex: '@test\\.com$' } })

# Ou supprimer un compte spécifique
db.users.deleteOne({ email: "admin@test.com" })
```

## Validation Finale

✅ **Liste de contrôle finale** :

- [ ] Le script `createAdmin.js` crée bien un compte avec role="admin"
- [ ] L'API `/register` ne permet plus de créer des comptes admin/manager
- [ ] Les mots de passe sont bien hachés dans la base de données
- [ ] La documentation est claire et complète
- [ ] Les scripts npm fonctionnent correctement
- [ ] Les erreurs sont gérées proprement

## Prochaines Étapes (Optionnelles)

Pour renforcer la sécurité :

1. **Audit Log** : Enregistrer les tentatives de création d'admin
2. **2FA** : Ajouter l'authentification à deux facteurs pour les admins
3. **IP Whitelist** : Limiter l'accès admin à certaines IPs
4. **Session Management** : Limiter la durée des sessions admin
5. **Password Policy** : Imposer des règles strictes (majuscules, symboles, etc.)
