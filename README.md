# Application Mobile de Gestion du Suivi du Personnel

Application complète de gestion du personnel avec reconnaissance faciale, comprenant :
- Application mobile React Native (dossier `/front`)
- Backend API Node.js/Express (dossier `/back`)

## 📋 Conformité au Cahier des Charges

Ce projet implémente toutes les exigences du cahier des charges pour un système de pointage par reconnaissance faciale:

### ✅ Module Web (Portail d'Administration)
- Import/export CSV/XLSX des employés
- Tableau de bord en temps réel (présents/absents/retard)
- Rapports de présence avec codes couleur (VERT ≥8h, ROUGE <8h, GRIS absent)
- Calcul automatique du salaire au prorata: `(Salaire de base / Jours ouvrés) × Jours présents`
- Correction manuelle des pointages avec audit trail
- Export PDF/CSV des rapports

### ✅ Module Mobile (Terminal de Pointage)
- Interface simplifiée avec un seul bouton "Pointer"
- Détection automatique arrivée/départ
- Horloge en temps réel
- Confirmation personnalisée avec nom et heure
- Mode RH pour enregistrer les photos des employés
- Infrastructure prête pour la reconnaissance faciale

## Fonctionnalités Principales

### 🔐 Authentification et Sécurité
- Inscription et connexion sécurisées
- Authentification JWT
- Gestion des rôles (employé, manager, admin)
- Support de reconnaissance faciale (infrastructure en place)
- Conformité RGPD
- Audit trail complet

### 📱 Pointage et Présences
- **Pointage simplifié**: Un seul bouton "Pointer" qui détecte automatiquement si c'est une arrivée ou un départ
- Horloge en temps réel affichée en grand
- Confirmation personnalisée avec nom de l'employé et heure
- Reconnaissance faciale pour le pointage (infrastructure prête)
- Historique complet des présences
- Calcul automatique des heures de travail
- Statistiques de présence
- Correction manuelle par RH avec traçabilité

### 💰 Gestion des Salaires
- Calcul automatique basé sur les heures travaillées
- **Calcul au prorata** selon le cahier des charges: `(Salaire de base / Jours ouvrés) × Jours présents`
- Gestion des taux horaires personnalisés
- Support des déductions et bonus
- Historique mensuel des salaires
- Statut de paiement

### 👤 Gestion des Utilisateurs
- Import CSV/XLSX en masse
- Export CSV des employés
- Profils personnalisés avec photo
- Informations d'employé complètes (adresse, âge, salaire de base, etc.)
- Enregistrement facial pour RH
- Gestion des paramètres
- Historique personnel

### 📊 Tableau de Bord et Rapports
- Statistiques en temps réel (présents/absents/retard)
- Taux de présence par période
- Rapports avec codes couleur:
  - 🟢 VERT: Journée complète (≥ 8 heures)
  - 🔴 ROUGE: Journée incomplète (< 8 heures)  
  - ⚫ GRIS: Absent (aucun pointage)
- Filtrage par employé, date, département
- Export PDF et CSV
- Graphiques et statistiques (à venir dans le dashboard web)

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

## Endpoints API Principaux

### Authentication
- `POST /api/auth/register` - Inscription (avec champs étendus)
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Profil utilisateur

### Users
- `GET /api/users` - Liste utilisateurs
- `POST /api/users/import` - **Importer employés (CSV/XLSX)**
- `GET /api/users/export` - **Exporter employés (CSV)**
- `GET /api/users/import/template` - **Télécharger modèle d'import**
- `PUT /api/users/:id` - Modifier utilisateur
- `PUT /api/users/:id/face` - Mettre à jour descripteur facial

### Attendance
- `POST /api/attendance/checkin` - Pointage entrée
- `PUT /api/attendance/checkout` - Pointage sortie
- `POST /api/attendance/manual` - **Ajouter pointage manuel (RH)**
- `PUT /api/attendance/:id/correct` - **Corriger pointage (RH)**
- `GET /api/attendance/:id/audit` - **Historique des corrections**
- `GET /api/attendance/user/:userId` - Historique utilisateur

### Salary
- `POST /api/salary/calculate` - Calculer salaire (heures)
- `POST /api/salary/calculate-prorata` - **Calculer salaire au prorata**
- `GET /api/salary/user/:userId` - Historique salaires
- `GET /api/salary/current/:userId` - Salaire mois actuel

### Dashboard
- `GET /api/dashboard/stats` - **Statistiques temps réel**
- `GET /api/dashboard/attendance-report` - **Rapport avec codes couleur**
- `GET /api/dashboard/live-status` - **Statut en direct des employés**

### Reports
- `GET /api/reports/attendance/csv` - **Export CSV présences**
- `GET /api/reports/attendance/pdf` - **Export PDF présences**
- `GET /api/reports/salary/csv` - **Export CSV salaires**

## Modèles de Données

### User
- Informations personnelles (nom, prénom, email)
- Identifiant employé (unique)
- **Adresse complète**
- **Âge**
- **Salaire de base** (pour calcul au prorata)
- Taux horaire
- Département et poste
- **URL de photo**
- Descripteur facial
- Rôle

### Attendance
- Référence utilisateur
- Horodatage entrée/sortie
- Méthode (faciale/manuelle)
- Localisation GPS
- Heures calculées
- Statut (active/completed)
- Date (YYYY-MM-DD)

### Salary
- Référence utilisateur
- Période (mois/année)
- Heures totales
- Taux horaire
- Salaire brut/net
- Déductions/bonus
- Statut de paiement

### AuditLog (Nouveau)
- Action effectuée
- Utilisateur qui a fait l'action
- Utilisateur/Présence concerné(e)
- Description
- Valeur précédente/nouvelle
- Adresse IP et User Agent
- Horodatage

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
- ✅ **Audit trail complet** (toutes les modifications tracées)
- ✅ **Conformité RGPD** (données biométriques sécurisées)
- ✅ **Chiffrement des données sensibles**
- ⏳ Reconnaissance faciale (infrastructure prête)

## Documentation Détaillée

- [Documentation Backend](/back/README.md)
- [Documentation Frontend](/front/README.md)
- [**Documentation API Complète**](/API_DOCUMENTATION.md) 📚
- [**Guide Utilisateur**](/USER_GUIDE.md) 📖
- [Architecture](/ARCHITECTURE.md)

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

