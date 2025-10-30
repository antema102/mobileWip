# Carte de Référence Rapide - Compte Administrateur

## 🚀 Création d'un Compte Admin

```bash
cd back
npm run create-admin
```

## 📋 Commandes Essentielles

### Créer un Admin
```bash
# Méthode 1 - Recommandée
cd back && npm run create-admin

# Méthode 2
cd back && node scripts/createAdmin.js
```

### Se Connecter comme Admin
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "votre_mot_de_passe"
  }'
```

### Lister tous les Utilisateurs (Admin seulement)
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer {TOKEN}"
```

## 🔐 Rôles Disponibles

| Rôle | Création | Permissions |
|------|----------|-------------|
| **employee** | Via API `/register` | Accès personnel uniquement |
| **manager** | Via script ou promotion | Accès équipe + personnel |
| **admin** | Via script uniquement | Accès complet |

## ⚠️ Important

- ❌ **NE PAS** créer d'admin via l'API `/register` (sera converti en employee)
- ✅ **TOUJOURS** utiliser le script `createAdmin.js`
- 🔒 Mot de passe minimum 6 caractères
- 📧 Email doit être unique
- 🆔 Employee ID doit être unique

## 📚 Documentation Complète

- **Guide complet** : [ADMIN_ACCOUNT.md](ADMIN_ACCOUNT.md)
- **Tests** : [TESTING_ADMIN.md](TESTING_ADMIN.md)
- **Résumé** : [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## 🐛 Dépannage Rapide

**Erreur : "User already exists"**
→ Email déjà utilisé, choisir un autre

**Erreur : "Employee ID already exists"**
→ ID déjà utilisé, choisir un autre

**Erreur : "Cannot connect to MongoDB"**
→ Vérifier que MongoDB est démarré et MONGODB_URI dans .env

**Script ne démarre pas**
→ `cd back && npm install`

## 💡 Exemples

### Exemple Complet de Création
```bash
$ cd back
$ npm run create-admin

First Name: Sophie
Last Name: Martin
Email: sophie@company.com
Employee ID: ADM001
Password (min 6 characters): SecurePass123!
Hourly Rate (optional): 30
Department (optional): Direction
Position (optional): Directrice

✓ Admin account created successfully!
```

### Exemple de Test de Sécurité
```bash
# Tenter de créer un admin via API (sera converti en employee)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Test","lastName":"User","email":"test@test.com","password":"pass123","employeeId":"EMP999","hourlyRate":15,"role":"admin"}'

# Résultat : role sera "employee" et non "admin" ✓
```

## 🔗 Liens Utiles

- [README Principal](README.md)
- [Guide de Démarrage](GETTING_STARTED.md)
- [Documentation Backend](back/README.md)
- [Architecture](ARCHITECTURE.md)
