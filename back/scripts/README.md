# Scripts d'Administration

Ce dossier contient des scripts utilitaires pour l'administration du backend.

## createAdmin.js

Script pour créer un compte administrateur de manière sécurisée.

### Utilisation

```bash
# Depuis le dossier /back
node scripts/createAdmin.js

# Ou avec npm
npm run create-admin
```

### Prérequis

- MongoDB doit être en cours d'exécution
- Le fichier `.env` doit être configuré avec `MONGODB_URI`
- Les dépendances npm doivent être installées

### Exemple

```bash
$ npm run create-admin

> back@1.0.0 create-admin
> node scripts/createAdmin.js

✓ Connected to MongoDB

=== Create Admin Account ===

First Name: Sophie
Last Name: Martin
Email: admin@company.com
Employee ID: ADM001
Password (min 6 characters): ********
Hourly Rate (optional, press Enter to skip): 30
Department (optional): Direction
Position (optional): Directrice

✓ Admin account created successfully!

Admin Details:
  ID: 654abc123...
  Name: Sophie Martin
  Email: admin@company.com
  Employee ID: ADM001
  Role: admin
  Created: 2025-10-30T10:30:00.000Z

✓ Database connection closed
```

Pour plus d'informations, consultez le [Guide de Création de Compte Administrateur](../../ADMIN_ACCOUNT.md).
