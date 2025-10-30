# Architecture de l'Application

## Vue d'Ensemble

L'application est composée de deux parties principales :
1. **Backend API** (Node.js/Express) - Dossier `/back`
2. **Frontend Mobile** (React Native) - Dossier `/front`

## Flux de Données

```
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION MOBILE (React Native)           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Login/     │  │    Home      │  │  Check In/   │         │
│  │   Register   │  │   Screen     │  │     Out      │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Attendance  │  │   Salary     │  │   Profile    │         │
│  │   History    │  │   Screen     │  │   Screen     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│                    ▼ API Services (Axios)                      │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP/REST API
                               │ JWT Authentication
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND API (Express)                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Routes & Controllers                    │  │
│  │                                                           │  │
│  │  /auth          /users         /attendance    /salary    │  │
│  │  - register     - list         - checkin      - calculate│  │
│  │  - login        - update       - checkout     - list     │  │
│  │  - me           - delete       - history      - current  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    Middleware                             │  │
│  │  - Authentication (JWT)                                   │  │
│  │  - Authorization (Roles)                                  │  │
│  │  - Error Handling                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                               │                                  │
│                               ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  Models (Mongoose)                        │  │
│  │                                                           │  │
│  │  User Model      Attendance Model      Salary Model      │  │
│  │  - Personal info - Check in/out       - Period           │  │
│  │  - Credentials   - Work hours         - Calculations     │  │
│  │  - Face data     - Location           - Status           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
                        ┌─────────────┐
                        │   MongoDB   │
                        │  Database   │
                        └─────────────┘
```

## Modèles de Données

### User (Utilisateur)
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  employeeId: String (unique),
  hourlyRate: Number,
  department: String,
  position: String,
  role: "employee" | "manager" | "admin",
  faceDescriptor: [Number], // Pour reconnaissance faciale
  isActive: Boolean,
  createdAt: Date
}
```

### Attendance (Présence)
```javascript
{
  user: ObjectId -> User,
  checkIn: Date,
  checkOut: Date,
  checkInMethod: "facial" | "manual",
  checkOutMethod: "facial" | "manual",
  checkInLocation: { latitude, longitude },
  checkOutLocation: { latitude, longitude },
  workHours: Number, // Calculé automatiquement
  status: "active" | "completed",
  date: String (YYYY-MM-DD),
  createdAt: Date,
  updatedAt: Date
}
```

### Salary (Salaire)
```javascript
{
  user: ObjectId -> User,
  period: {
    month: Number (1-12),
    year: Number
  },
  totalHours: Number,
  hourlyRate: Number,
  grossSalary: Number, // Calculé : totalHours * hourlyRate
  deductions: Number,
  bonuses: Number,
  netSalary: Number, // Calculé : grossSalary - deductions + bonuses
  status: "pending" | "processed" | "paid",
  paidAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Flux d'Authentification

```
1. Utilisateur s'inscrit
   └─> POST /api/auth/register
       └─> Backend crée l'utilisateur (mot de passe haché)
           └─> Retourne token JWT + données utilisateur
               └─> Frontend stocke token dans AsyncStorage

2. Utilisateur se connecte
   └─> POST /api/auth/login
       └─> Backend vérifie credentials
           └─> Retourne token JWT + données utilisateur
               └─> Frontend stocke token dans AsyncStorage

3. Requêtes authentifiées
   └─> Frontend ajoute "Authorization: Bearer {token}" dans headers
       └─> Backend middleware vérifie le token
           └─> Si valide : continue vers le controller
           └─> Si invalide : retourne 401 Unauthorized
```

## Flux de Pointage

```
ARRIVÉE (Check-In)
1. Employé ouvre l'écran de pointage
2. Clique sur "Pointer l'arrivée"
3. POST /api/attendance/checkin
   - userId
   - method: "manual" (ou "facial" si reconnaissance faciale)
   - location (GPS optionnel)
4. Backend crée un enregistrement Attendance
   - checkIn: Date actuelle
   - status: "active"
5. Frontend affiche confirmation

DÉPART (Check-Out)
1. Employé clique sur "Pointer le départ"
2. PUT /api/attendance/checkout
   - userId
   - method: "manual" (ou "facial")
   - location (GPS optionnel)
3. Backend met à jour l'enregistrement
   - checkOut: Date actuelle
   - workHours: Calcul automatique (checkOut - checkIn)
   - status: "completed"
4. Frontend affiche résumé de la journée
```

## Calcul des Salaires

```
CALCUL MENSUEL
1. Admin/Manager demande le calcul
2. POST /api/salary/calculate
   - userId
   - month, year
   - deductions (optionnel)
   - bonuses (optionnel)

3. Backend :
   a) Récupère toutes les présences complètes du mois
   b) Somme les workHours : totalHours
   c) Récupère le hourlyRate de l'utilisateur
   d) Calcule :
      - grossSalary = totalHours * hourlyRate
      - netSalary = grossSalary - deductions + bonuses
   e) Sauvegarde dans Salary

4. Frontend affiche le détail du salaire

CONSULTATION
1. Employé consulte ses salaires
2. GET /api/salary/user/:userId
3. Backend retourne l'historique trié par période
4. Frontend affiche la liste avec détails
```

## Sécurité

### Authentification
- Mots de passe hachés avec bcryptjs (salt rounds: 10)
- Tokens JWT avec expiration (7 jours par défaut)
- Tokens stockés de manière sécurisée (AsyncStorage)

### Autorisation
- Routes protégées par middleware `protect`
- Rôles vérifiés par middleware `authorize`
- Contrôle d'accès :
  - `employee` : Accès à ses propres données
  - `manager` : Accès aux données de son équipe
  - `admin` : Accès complet

### Validation
- Validation des données d'entrée
- Sanitization des inputs
- Gestion des erreurs centralisée

## Extension Future : Reconnaissance Faciale

```
INSCRIPTION DU VISAGE
1. Utilisateur prend une photo
2. Frontend :
   - Détecte le visage avec ML Kit / TensorFlow
   - Génère un descripteur facial (tableau de nombres)
3. PUT /api/users/:id/face
   - faceDescriptor: [...]
4. Backend stocke le descripteur dans User

POINTAGE PAR RECONNAISSANCE
1. Utilisateur prend une photo au pointage
2. Frontend :
   - Détecte le visage
   - Génère le descripteur
3. POST /api/attendance/checkin
   - faceDescriptor: [...]
4. Backend :
   - Compare avec le descripteur stocké
   - Si correspondance > seuil : valide le pointage
   - Sinon : rejette
```

## Technologies Utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **MongoDB** : Base de données NoSQL
- **Mongoose** : ODM pour MongoDB
- **JWT** : Tokens d'authentification
- **bcryptjs** : Hachage de mots de passe
- **dotenv** : Variables d'environnement
- **cors** : Cross-Origin Resource Sharing
- **multer** : Upload de fichiers

### Frontend
- **React Native** : Framework mobile cross-platform
- **TypeScript** : Typage statique
- **React Navigation** : Navigation entre écrans
- **Axios** : Client HTTP
- **AsyncStorage** : Stockage local
- **Context API** : Gestion d'état globale

## Performance et Scalabilité

### Optimisations Actuelles
- Indexation MongoDB sur champs fréquemment recherchés
- Pagination pour les listes
- Caching côté client (AsyncStorage)
- Compression des réponses HTTP

### Améliorations Futures
- Redis pour le cache
- WebSockets pour les mises à jour en temps réel
- CDN pour les assets statiques
- Load balancing pour l'API
- Database sharding pour la scalabilité
- Monitoring et logging (ELK stack)

## Environnements

### Développement
- Backend : localhost:3000
- MongoDB : localhost:27017
- Frontend : Émulateur/Simulateur

### Production
- Backend : Serveur cloud (AWS, Heroku, etc.)
- MongoDB : MongoDB Atlas
- Frontend : App Stores (Google Play, App Store)
