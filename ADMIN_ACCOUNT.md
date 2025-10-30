# Guide de Création d'un Compte Administrateur

Ce guide explique comment créer un compte administrateur (admin) pour l'application de gestion du suivi du personnel.

## Pourquoi un Script Dédié ?

Pour des raisons de sécurité, les comptes administrateurs ne peuvent **pas** être créés via l'endpoint public de registration (`/api/auth/register`). Ce dernier ne permet de créer que des comptes de type "employee" (employé).

Les comptes administrateurs doivent être créés de manière sécurisée en utilisant le script dédié fourni.

## Prérequis

Avant de créer un compte administrateur, assurez-vous que :

1. **MongoDB est en cours d'exécution**
   - Localement : `mongod` doit être démarré
   - MongoDB Atlas : Votre cluster doit être actif

2. **Les variables d'environnement sont configurées**
   - Le fichier `.env` existe dans le dossier `/back`
   - La variable `MONGODB_URI` est correctement définie

3. **Les dépendances sont installées**
   ```bash
   cd back
   npm install
   ```

## Méthode 1 : Utiliser le Script Interactif (Recommandé)

### Étape 1 : Lancer le Script

Depuis le dossier `back`, exécutez :

```bash
node scripts/createAdmin.js
```

### Étape 2 : Remplir les Informations

Le script vous demandera les informations suivantes :

```
=== Create Admin Account ===

First Name: Jean
Last Name: Dupont
Email: admin@example.com
Employee ID: ADM001
Password (min 6 characters): ********
Hourly Rate (optional, press Enter to skip): 25
Department (optional): Administration
Position (optional): Administrateur Système
```

### Étape 3 : Confirmation

Si tout se passe bien, vous verrez :

```
✓ Connected to MongoDB
✓ Admin account created successfully!

Admin Details:
  ID: 6543210abcdef...
  Name: Jean Dupont
  Email: admin@example.com
  Employee ID: ADM001
  Role: admin
  Created: 2025-10-30T10:00:00.000Z

✓ Database connection closed
```

## Méthode 2 : Utiliser MongoDB Directement

Si vous préférez créer manuellement un compte admin via MongoDB, voici les étapes :

### Étape 1 : Se Connecter à MongoDB

```bash
# MongoDB local
mongosh

# MongoDB Atlas
mongosh "mongodb+srv://cluster.mongodb.net/personnel_tracking" --username <username>
```

### Étape 2 : Sélectionner la Base de Données

```javascript
use personnel_tracking
```

### Étape 3 : Créer l'Utilisateur Admin

**⚠️ Important** : Le mot de passe doit être haché avec bcrypt avant d'être inséré.

```javascript
// Exemple avec un mot de passe déjà haché (ne fonctionne qu'avec bcrypt)
// Pour générer un hash bcrypt, utilisez plutôt le script createAdmin.js
db.users.insertOne({
  firstName: "Jean",
  lastName: "Dupont",
  email: "admin@example.com",
  password: "$2a$10$...", // Hash bcrypt du mot de passe
  employeeId: "ADM001",
  hourlyRate: 25,
  department: "Administration",
  position: "Administrateur Système",
  role: "admin",
  faceDescriptor: [],
  isActive: true,
  createdAt: new Date()
})
```

**Note** : Cette méthode n'est pas recommandée car le hachage manuel du mot de passe est complexe. Utilisez plutôt le script `createAdmin.js`.

## Méthode 3 : Promouvoir un Utilisateur Existant

Si vous avez déjà un compte employee et souhaitez le promouvoir en admin :

### Via MongoDB

```bash
mongosh
use personnel_tracking

# Trouver l'utilisateur
db.users.findOne({ email: "user@example.com" })

# Mettre à jour le rôle
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin" } }
)
```

### Via l'API (nécessite un admin existant)

Si vous avez déjà un compte admin, vous pouvez utiliser l'endpoint de mise à jour :

```bash
curl -X PUT http://localhost:3000/api/users/{userId} \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {admin_token}" \
  -d '{
    "role": "admin"
  }'
```

## Connexion avec le Compte Admin

Une fois le compte admin créé, vous pouvez vous connecter via :

### L'Application Mobile

1. Ouvrir l'application
2. Se connecter avec l'email et le mot de passe admin
3. Vous aurez accès à toutes les fonctionnalités administrateur

### L'API

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "votre_mot_de_passe"
  }'
```

Récupérez le `token` dans la réponse pour les requêtes authentifiées.

## Différences entre les Rôles

### Employee (Employé)
- Voir ses propres présences
- Pointer arrivée/départ
- Consulter ses salaires
- Modifier son profil

### Manager (Responsable)
- Toutes les permissions d'un employé
- Voir les présences de son équipe
- Calculer les salaires de son équipe
- Consulter les utilisateurs

### Admin (Administrateur)
- Toutes les permissions d'un manager
- Gérer tous les utilisateurs (créer, modifier, supprimer)
- Accéder à toutes les données
- Gérer les salaires de tous les employés
- Configurer le système

## Sécurité

### Bonnes Pratiques

1. **Mot de passe fort** : Utilisez un mot de passe complexe (lettres, chiffres, symboles)
2. **Email unique** : Utilisez une adresse email dédiée pour l'admin
3. **Limitation** : Ne créez que le nombre minimum d'admins nécessaires
4. **Audit** : Gardez une trace de qui a les droits admin
5. **Rotation** : Changez régulièrement les mots de passe admin

### Protection du Compte Admin

- Ne partagez jamais les identifiants admin
- Utilisez l'authentification à deux facteurs si disponible
- Surveillez les activités admin dans les logs
- Révoquez immédiatement l'accès des anciens admins

## Dépannage

### Erreur : "User with this email already exists"

L'email est déjà utilisé. Utilisez un autre email ou supprimez le compte existant :

```bash
mongosh
use personnel_tracking
db.users.deleteOne({ email: "admin@example.com" })
```

### Erreur : "Employee ID already exists"

L'identifiant employé existe déjà. Choisissez un autre ID unique.

### Erreur : "Cannot connect to MongoDB"

- Vérifiez que MongoDB est en cours d'exécution
- Vérifiez la variable `MONGODB_URI` dans `.env`
- Testez la connexion avec `mongosh`

### Le mot de passe ne fonctionne pas

- Assurez-vous de saisir exactement le même mot de passe
- Vérifiez qu'il contient au moins 6 caractères
- Si nécessaire, réinitialisez-le en recréant le compte

## Exemple Complet

Voici un exemple complet de création d'un compte admin :

```bash
# 1. Naviguer vers le backend
cd /chemin/vers/mobileWip/back

# 2. Vérifier que .env est configuré
cat .env

# 3. Lancer le script
node scripts/createAdmin.js

# 4. Remplir les informations
First Name: Sophie
Last Name: Martin
Email: sophie.martin@company.com
Employee ID: ADM001
Password (min 6 characters): SecurePass123!
Hourly Rate (optional, press Enter to skip): 30
Department (optional): Direction
Position (optional): Directrice RH

# 5. Vérifier la création
# Le script affichera les détails du compte créé

# 6. Tester la connexion
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "sophie.martin@company.com",
    "password": "SecurePass123!"
  }'
```

## Support

Si vous rencontrez des problèmes :

1. Vérifiez les prérequis
2. Consultez la section Dépannage
3. Vérifiez les logs du serveur backend
4. Ouvrez une issue sur GitHub avec les détails de l'erreur

## Ressources Additionnelles

- [Documentation Backend](/back/README.md)
- [Guide de Démarrage](/GETTING_STARTED.md)
- [Architecture de l'Application](/ARCHITECTURE.md)
