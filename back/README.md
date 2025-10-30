# Personnel Tracking Backend

Backend API pour l'application mobile de gestion du suivi du personnel avec reconnaissance faciale.

## Technologies Utilisées

- Node.js
- Express.js
- MongoDB avec Mongoose
- JWT pour l'authentification
- bcryptjs pour le hachage des mots de passe
- Multer pour la gestion des fichiers

## Fonctionnalités

### Authentification
- Inscription des utilisateurs
- Connexion avec email/mot de passe
- Gestion des rôles (employee, manager, admin)
- Authentification JWT

### Gestion des Utilisateurs
- CRUD complet des utilisateurs
- Mise à jour des descripteurs faciaux
- Gestion des profils

### Suivi des Présences
- Pointage d'entrée (check-in)
- Pointage de sortie (check-out)
- Reconnaissance faciale pour le pointage
- Historique des présences
- Calcul automatique des heures de travail

### Gestion des Salaires
- Calcul automatique des salaires basé sur les heures travaillées
- Gestion des déductions et bonus
- Historique des salaires
- Suivi du statut de paiement

## Installation

1. Installer les dépendances :
```bash
npm install
```

2. Configurer les variables d'environnement :
```bash
cp .env.example .env
```

Puis modifier le fichier `.env` avec vos configurations :
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/personnel_tracking
JWT_SECRET=votre-clé-secrète
JWT_EXPIRE=7d
NODE_ENV=development
```

3. Démarrer MongoDB localement ou utiliser MongoDB Atlas

4. Lancer le serveur :
```bash
# Mode développement
npm run dev

# Mode production
npm start
```

## Endpoints API

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Obtenir le profil utilisateur connecté

### Users
- `GET /api/users` - Obtenir tous les utilisateurs (Admin/Manager)
- `GET /api/users/:id` - Obtenir un utilisateur
- `PUT /api/users/:id` - Mettre à jour un utilisateur
- `PUT /api/users/:id/face` - Mettre à jour le descripteur facial
- `DELETE /api/users/:id` - Supprimer un utilisateur (Admin)

### Attendance
- `POST /api/attendance/checkin` - Pointer l'entrée
- `PUT /api/attendance/checkout` - Pointer la sortie
- `GET /api/attendance/user/:userId` - Historique des présences d'un utilisateur
- `GET /api/attendance/today/:userId` - Présence du jour
- `GET /api/attendance` - Toutes les présences (Admin/Manager)

### Salary
- `POST /api/salary/calculate` - Calculer le salaire (Admin/Manager)
- `GET /api/salary/user/:userId` - Historique des salaires d'un utilisateur
- `GET /api/salary/current/:userId` - Salaire du mois en cours
- `GET /api/salary` - Tous les salaires (Admin/Manager)
- `PUT /api/salary/:id` - Mettre à jour le statut de paiement

## Structure du Projet

```
back/
├── src/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── attendanceController.js
│   │   └── salaryController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   └── Salary.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── salaryRoutes.js
│   └── utils/
│       ├── generateToken.js
│       └── upload.js
├── uploads/
├── .env
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

## Modèles de Données

### User
- Informations personnelles (nom, prénom, email)
- Identifiant employé unique
- Taux horaire
- Département et poste
- Descripteur facial pour la reconnaissance
- Rôle (employee/manager/admin)

### Attendance
- Référence utilisateur
- Heure d'entrée et de sortie
- Méthode de pointage (facial/manuel)
- Localisation GPS
- Heures de travail calculées automatiquement
- Date et statut

### Salary
- Référence utilisateur
- Période (mois/année)
- Total des heures travaillées
- Taux horaire
- Salaire brut/net
- Déductions et bonus
- Statut de paiement

## Sécurité

- Tous les mots de passe sont hachés avec bcrypt
- Authentification par JWT
- Protection des routes par middleware
- Autorisation basée sur les rôles
- Validation des données entrantes

## Notes de Développement

- La reconnaissance faciale nécessite l'intégration côté mobile
- Les descripteurs faciaux sont stockés comme tableaux de nombres
- Le calcul des heures est automatique lors de la sauvegarde
- Le calcul des salaires est basé sur les heures et le taux horaire
