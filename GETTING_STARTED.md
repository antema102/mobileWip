# Guide de Démarrage Rapide

Ce guide vous aidera à configurer et lancer l'application de suivi du personnel.

## Prérequis

Assurez-vous d'avoir installé :
- **Node.js** v18 ou supérieur
- **MongoDB** (local ou compte MongoDB Atlas)
- **React Native development environment** :
  - Pour Android : Android Studio, SDK Android
  - Pour iOS : Xcode (Mac uniquement)

## Configuration et Lancement

### 1. Backend (API)

```bash
# Naviguer vers le dossier backend
cd back

# Installer les dépendances
npm install

# Créer le fichier de configuration
cp .env.example .env

# Éditer .env avec vos configurations
# Minimum requis :
# - MONGODB_URI : Votre URI MongoDB
# - JWT_SECRET : Une clé secrète forte

# Démarrer le serveur
npm start
```

Le backend sera accessible sur `http://localhost:3000`

**Endpoints disponibles :**
- Health check : `http://localhost:3000/`
- API : `http://localhost:3000/api/...`

### 2. Frontend (Application Mobile)

```bash
# Naviguer vers le dossier frontend
cd front

# Installer les dépendances
npm install

# Pour iOS uniquement
cd ios && pod install && cd ..

# Configurer l'URL de l'API
# Éditer front/src/utils/config.ts
# Remplacer localhost par votre IP locale si vous testez sur un appareil physique
# Exemple : http://192.168.1.100:3000/api

# Lancer l'application
npm run android  # Pour Android
# ou
npm run ios      # Pour iOS
```

## Utilisation de l'Application

### Première Utilisation

1. **Inscription** :
   - Ouvrir l'application
   - Cliquer sur "Pas encore de compte ? S'inscrire"
   - Remplir le formulaire :
     - Prénom et nom
     - Email (unique)
     - Identifiant employé (unique)
     - Taux horaire
     - Département et poste (optionnel)
     - Mot de passe (min 6 caractères)
   - Cliquer sur "S'inscrire"

2. **Connexion** :
   - Entrer email et mot de passe
   - Cliquer sur "Se connecter"

### Fonctionnalités Principales

#### 📱 Écran d'Accueil (Home)
- Vue d'ensemble de votre journée
- Statut de présence du jour
- Résumé du salaire du mois en cours
- Informations personnelles

#### ⏰ Pointage (Check-In/Out)
- **Pointer l'arrivée** : Cliquer sur "Pointer l'arrivée" le matin
- **Pointer le départ** : Cliquer sur "Pointer le départ" en fin de journée
- L'application calcule automatiquement les heures travaillées

#### 📊 Présences (Attendance)
- Voir l'historique complet de vos présences
- Statistiques : jours travaillés, heures totales, moyenne
- Détails par jour : heures d'arrivée, de départ, heures travaillées
- Tirer vers le bas pour actualiser

#### 💰 Salaire (Salary)
- Consulter l'historique de vos salaires par mois
- Détails du calcul :
  - Heures totales
  - Taux horaire
  - Salaire brut
  - Déductions et bonus
  - Salaire net
- Total des gains

#### 👤 Profil (Profile)
- Consulter vos informations personnelles
- Vérifier le statut de reconnaissance faciale
- Se déconnecter

## Fonctionnalités Administrateur

Si vous avez le rôle **admin** ou **manager**, vous avez accès à :

### Via l'API

```bash
# Obtenir tous les utilisateurs
GET http://localhost:3000/api/users
Authorization: Bearer {votre_token}

# Obtenir toutes les présences
GET http://localhost:3000/api/attendance
Authorization: Bearer {votre_token}

# Calculer les salaires
POST http://localhost:3000/api/salary/calculate
Authorization: Bearer {votre_token}
{
  "userId": "...",
  "month": 10,
  "year": 2025,
  "deductions": 100,
  "bonuses": 50
}

# Obtenir tous les salaires
GET http://localhost:3000/api/salary
Authorization: Bearer {votre_token}
```

## Test de l'API avec cURL

### 1. Inscription
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jean",
    "lastName": "Dupont",
    "email": "jean.dupont@example.com",
    "password": "password123",
    "employeeId": "EMP001",
    "hourlyRate": 15,
    "department": "IT",
    "position": "Développeur"
  }'
```

### 2. Connexion
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "password123"
  }'
```

Récupérer le `token` de la réponse.

### 3. Pointer l'arrivée
```bash
curl -X POST http://localhost:3000/api/attendance/checkin \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {votre_token}" \
  -d '{
    "userId": "{user_id}",
    "method": "manual"
  }'
```

### 4. Pointer le départ
```bash
curl -X PUT http://localhost:3000/api/attendance/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {votre_token}" \
  -d '{
    "userId": "{user_id}",
    "method": "manual"
  }'
```

## Dépannage

### Backend

**Le serveur ne démarre pas**
- Vérifier que MongoDB est en cours d'exécution
- Vérifier que le fichier `.env` existe avec les bonnes configurations
- Vérifier que le port 3000 n'est pas déjà utilisé

**Erreur de connexion à MongoDB**
- Vérifier l'URI MongoDB dans `.env`
- Si vous utilisez MongoDB Atlas, vérifier que votre IP est whitelistée

### Frontend

**L'application ne se connecte pas au backend**
- Vérifier que le backend est en cours d'exécution
- Vérifier l'URL dans `front/src/utils/config.ts`
- Sur appareil physique, utiliser l'IP locale au lieu de localhost
- Vérifier le firewall qui pourrait bloquer la connexion

**Metro bundler ne démarre pas**
```bash
cd front
npm start -- --reset-cache
```

**Erreur de build Android**
```bash
cd front/android
./gradlew clean
cd ../..
npm run android
```

**Erreur de build iOS**
```bash
cd front/ios
pod deintegrate
pod install
cd ../..
npm run ios
```

## Prochaines Étapes

### Reconnaissance Faciale
Pour implémenter la reconnaissance faciale complète :
1. Intégrer une bibliothèque de ML (react-native-ml-kit, TensorFlow Lite)
2. Capturer l'image du visage lors de l'inscription
3. Générer et stocker les descripteurs faciaux
4. Comparer les visages lors du pointage

### Notifications Push
Pour recevoir des notifications :
1. Configurer Firebase Cloud Messaging
2. Implémenter les notifications pour :
   - Rappels de pointage
   - Confirmation de salaire
   - Alertes administratives

### Géolocalisation
Pour vérifier la localisation lors du pointage :
1. Demander les permissions de localisation
2. Enregistrer les coordonnées GPS au check-in/out
3. Valider que l'employé est sur site

## Support

Pour toute question ou problème :
- Consulter la documentation dans `/back/README.md` et `/front/README.md`
- Ouvrir une issue sur GitHub
- Vérifier les logs du serveur et de l'application mobile

## License

MIT
