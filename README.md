# Application Mobile de Gestion du Suivi du Personnel

Application complète de gestion du personnel avec reconnaissance faciale, comprenant :
- Application mobile React Native (dossier `/front`)
- Backend API Node.js/Express (dossier `/back`)

## Fonctionnalités Principales

### 🔐 Authentification et Sécurité
- Inscription et connexion sécurisées
- Authentification JWT
- Gestion des rôles (employé, manager, admin)
- Support de reconnaissance faciale (infrastructure en place)

### 📱 Pointage et Présences
- Pointage d'entrée/sortie avec horloge en temps réel
- Reconnaissance faciale pour le pointage (à implémenter)
- Historique complet des présences
- Calcul automatique des heures de travail
- Statistiques de présence

### 💰 Gestion des Salaires
- Calcul automatique basé sur les heures travaillées
- Gestion des taux horaires personnalisés
- Support des déductions et bonus
- Historique mensuel des salaires
- Statut de paiement

### 👤 Gestion des Utilisateurs
- Profils personnalisés
- Informations d'employé (département, poste, etc.)
- Gestion des paramètres
- Historique personnel

## Architecture du Projet

```
mobileWip/
├── front/                  # Application mobile React Native
│   ├── src/
│   │   ├── screens/       # Écrans de l'application
│   │   ├── navigation/    # Configuration de navigation
│   │   ├── services/      # Services API
│   │   ├── context/       # Context API (Auth)
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Utilitaires
│   └── README.md
│
└── back/                   # Backend API Node.js
    ├── src/
    │   ├── models/        # Modèles MongoDB (User, Attendance, Salary)
    │   ├── controllers/   # Contrôleurs
    │   ├── routes/        # Routes API
    │   ├── middleware/    # Middlewares (auth, error)
    │   ├── config/        # Configuration DB
    │   └── utils/         # Utilitaires
    └── README.md
```

## Technologies Utilisées

### Frontend (Mobile)
- **React Native** - Framework mobile
- **TypeScript** - Typage statique
- **React Navigation** - Navigation
- **Axios** - Requêtes HTTP
- **AsyncStorage** - Stockage local
- **Context API** - Gestion d'état

### Backend (API)
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de données NoSQL
- **Mongoose** - ODM MongoDB
- **JWT** - Authentification
- **bcryptjs** - Hachage des mots de passe
- **Multer** - Upload de fichiers

## Installation et Démarrage

### Prérequis
- Node.js v18+
- MongoDB (local ou Atlas)
- React Native development environment
- Android Studio ou Xcode

### 1. Backend

```bash
cd back
npm install

# Configurer les variables d'environnement
cp .env.example .env
# Modifier .env avec vos configurations

# Démarrer MongoDB localement ou configurer MongoDB Atlas

# Lancer le serveur
npm start
```

Le backend sera accessible sur `http://localhost:3000`

### 2. Frontend

```bash
cd front
npm install

# Pour iOS
cd ios && pod install && cd ..

# Configurer l'URL du backend dans src/utils/config.ts
# Utiliser l'IP locale (ex: 192.168.1.100:3000) pour tester sur appareil

# Lancer l'application
npm run android  # Pour Android
npm run ios      # Pour iOS
```

## Création d'un Compte Administrateur

Pour créer votre premier compte administrateur :

```bash
cd back
node scripts/createAdmin.js
```

Le script vous guidera à travers la création d'un compte admin de manière sécurisée. Pour plus de détails, consultez le [Guide de Création de Compte Administrateur](ADMIN_ACCOUNT.md).

## Endpoints API Principaux

### Authentication
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Attendance
- `POST /api/attendance/checkin` - Pointage entrée
- `PUT /api/attendance/checkout` - Pointage sortie
- `GET /api/attendance/user/:userId` - Historique utilisateur

### Salary
- `POST /api/salary/calculate` - Calculer salaire
- `GET /api/salary/user/:userId` - Historique salaires
- `GET /api/salary/current/:userId` - Salaire mois actuel

### Users
- `GET /api/users` - Liste utilisateurs
- `PUT /api/users/:id` - Modifier utilisateur
- `PUT /api/users/:id/face` - Mettre à jour descripteur facial

## Modèles de Données

### User
- Informations personnelles (nom, prénom, email)
- Identifiant employé
- Taux horaire
- Département et poste
- Descripteur facial
- Rôle

### Attendance
- Référence utilisateur
- Horodatage entrée/sortie
- Méthode (faciale/manuelle)
- Localisation GPS
- Heures calculées
- Statut

### Salary
- Référence utilisateur
- Période (mois/année)
- Heures totales
- Taux horaire
- Salaire brut/net
- Déductions/bonus
- Statut de paiement

## Reconnaissance Faciale

L'infrastructure pour la reconnaissance faciale est en place :
- Modèles de données prêts
- Endpoints API configurés
- Interface utilisateur préparée

Pour une implémentation complète :
1. Intégrer une bibliothèque ML (ex: react-native-ml-kit, TensorFlow Lite)
2. Capturer et traiter les images faciales
3. Générer et stocker les descripteurs
4. Implémenter la comparaison côté backend

## Sécurité

- ✅ Mots de passe hachés avec bcrypt
- ✅ Authentification JWT
- ✅ Routes protégées par middleware
- ✅ Autorisation basée sur les rôles
- ✅ Validation des données entrantes
- ⏳ Reconnaissance faciale (à venir)

## Documentation Détaillée

- [Documentation Backend](/back/README.md)
- [Documentation Frontend](/front/README.md)

## Développement

### Linting
```bash
# Backend
cd back && npm run lint

# Frontend
cd front && npm run lint
```

### Tests
```bash
# Backend
cd back && npm test

# Frontend
cd front && npm test
```

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## License

MIT

## Support

Pour toute question ou problème, veuillez ouvrir une issue sur GitHub.

