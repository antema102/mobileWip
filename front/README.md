# Personnel Tracking Mobile App

Application mobile React Native pour la gestion du suivi du personnel avec reconnaissance faciale.

## Technologies Utilisées

- React Native 0.82
- TypeScript
- React Navigation (Stack & Bottom Tabs)
- Axios pour les requêtes HTTP
- AsyncStorage pour le stockage local
- Context API pour la gestion d'état

## Fonctionnalités

### Authentification
- Inscription des utilisateurs
- Connexion avec email/mot de passe
- Gestion de session avec JWT
- Déconnexion

### Écran d'Accueil
- Résumé de la présence du jour
- Informations sur le salaire du mois en cours
- Statistiques personnelles

### Pointage
- Pointage d'entrée et de sortie
- Affichage de l'heure en temps réel
- Statut de présence en direct
- Support pour reconnaissance faciale (à venir)

### Historique des Présences
- Liste de toutes les présences
- Statistiques (jours travaillés, heures totales, moyenne)
- Filtrage par date
- Statut de chaque pointage

### Salaire
- Historique des salaires
- Détails par mois (heures, taux, brut, net)
- Déductions et bonus
- Statut de paiement
- Total des gains

### Profil
- Informations personnelles
- Paramètres de sécurité
- Gestion du compte

## Installation

### Prérequis

- Node.js (v18+)
- npm ou yarn
- React Native development environment
- Android Studio (pour Android) ou Xcode (pour iOS)

### Étapes d'installation

1. Installer les dépendances :
```bash
npm install
```

2. Pour iOS, installer les pods :
```bash
cd ios
pod install
cd ..
```

3. Configurer l'URL de l'API :
Modifier `src/utils/config.ts` pour pointer vers votre backend :
```typescript
export const API_URL = 'http://votre-ip:3000/api';
```

**Note**: N'utilisez pas `localhost` pour tester sur un appareil physique. Utilisez l'adresse IP locale de votre machine (ex: `http://192.168.1.100:3000/api`)

## Lancement de l'application

### Mode développement

#### Android
```bash
npm run android
```

#### iOS
```bash
npm run ios
```

### Metro Bundler
```bash
npm start
```

## Structure du Projet

```
front/
├── src/
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── CheckInOutScreen.tsx
│   │   ├── AttendanceScreen.tsx
│   │   ├── SalaryScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/
│   │   └── api.ts
│   ├── types/
│   │   └── index.ts
│   └── utils/
│       ├── config.ts
│       └── storage.ts
├── App.tsx
└── package.json
```

## API Integration

L'application communique avec le backend via les services dans `src/services/api.ts`:

- `authService`: Gestion de l'authentification
- `userService`: Gestion des utilisateurs
- `attendanceService`: Gestion des présences
- `salaryService`: Gestion des salaires

## Reconnaissance Faciale

La reconnaissance faciale est prévue pour une future version. L'infrastructure de base est en place :
- Support dans le modèle de données
- API endpoints configurés
- Interface utilisateur préparée

## License

MIT
