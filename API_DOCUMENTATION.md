# API Documentation - Système de Pointage par Reconnaissance Faciale

## Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Gestion des Utilisateurs](#gestion-des-utilisateurs)
4. [Gestion des Présences](#gestion-des-présences)
5. [Calcul des Salaires](#calcul-des-salaires)
6. [Tableau de Bord](#tableau-de-bord)
7. [Rapports et Exports](#rapports-et-exports)
8. [Modèles de Données](#modèles-de-données)

---

## Vue d'ensemble

L'API REST du système de gestion des présences permet de gérer les employés, leurs pointages, et le calcul automatique des salaires.

**URL de base**: `http://localhost:3000/api`

**Format**: JSON

**Authentification**: JWT Bearer Token

---

## Authentification

### Inscription
```http
POST /auth/register
```

**Corps de la requête**:
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "password": "motdepasse123",
  "employeeId": "EMP001",
  "address": "123 Rue de la Paix, Paris",
  "age": 30,
  "baseSalary": 3000,
  "hourlyRate": 15,
  "department": "IT",
  "position": "Développeur",
  "role": "employee"
}
```

**Réponse**:
```json
{
  "_id": "...",
  "firstName": "Jean",
  "lastName": "Dupont",
  "email": "jean.dupont@example.com",
  "employeeId": "EMP001",
  "role": "employee",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Connexion
```http
POST /auth/login
```

**Corps de la requête**:
```json
{
  "email": "jean.dupont@example.com",
  "password": "motdepasse123"
}
```

### Profil Utilisateur
```http
GET /auth/me
Authorization: Bearer {token}
```

---

## Gestion des Utilisateurs

### Liste des Employés
```http
GET /users
Authorization: Bearer {token}
```
**Accès**: Admin, Manager

### Importer des Employés (CSV/XLSX)
```http
POST /users/import
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Paramètres**:
- `file`: Fichier CSV ou XLSX

**Format CSV attendu**:
```csv
firstName,lastName,email,employeeId,address,age,position,department,baseSalary,hourlyRate,role,password
Jean,Dupont,jean.dupont@example.com,EMP001,123 Rue de la Paix,30,Développeur,IT,3000,15,employee,changeme123
```

**Réponse**:
```json
{
  "message": "Import completed",
  "summary": {
    "total": 10,
    "success": 8,
    "errors": 2
  },
  "results": {
    "success": [...],
    "errors": [...]
  }
}
```

### Télécharger le Modèle d'Import
```http
GET /users/import/template
Authorization: Bearer {token}
```

Télécharge un fichier CSV template pour l'importation.

### Exporter les Employés
```http
GET /users/export
Authorization: Bearer {token}
```

Exporte tous les employés au format CSV.

### Modifier un Utilisateur
```http
PUT /users/:id
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "firstName": "Jean",
  "lastName": "Dupont",
  "address": "456 Avenue des Champs",
  "age": 31,
  "baseSalary": 3200,
  "hourlyRate": 16,
  "department": "IT",
  "position": "Senior Developer"
}
```

### Mettre à Jour le Descripteur Facial
```http
PUT /users/:id/face
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "faceDescriptor": [0.123, 0.456, 0.789, ...]
}
```

---

## Gestion des Présences

### Pointer l'Arrivée
```http
POST /attendance/checkin
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "userId": "user_id",
  "method": "facial",
  "location": {
    "latitude": 48.8566,
    "longitude": 2.3522
  },
  "faceDescriptor": [0.123, 0.456, ...]
}
```

**Réponse**:
```json
{
  "_id": "...",
  "user": "user_id",
  "checkIn": "2025-10-30T08:00:00.000Z",
  "checkInMethod": "facial",
  "date": "2025-10-30",
  "status": "active"
}
```

### Pointer le Départ
```http
PUT /attendance/checkout
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "userId": "user_id",
  "method": "facial"
}
```

### Historique des Présences
```http
GET /attendance/user/:userId?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}
```

### Pointage du Jour
```http
GET /attendance/today/:userId
Authorization: Bearer {token}
```

### Correction Manuelle (RH/Admin)
```http
PUT /attendance/:id/correct
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "checkIn": "2025-10-30T08:30:00.000Z",
  "checkOut": "2025-10-30T17:30:00.000Z",
  "reason": "Oubli de pointage"
}
```

**Réponse**: Inclut l'enregistrement corrigé et l'audit trail.

### Ajouter un Pointage Manuellement (RH/Admin)
```http
POST /attendance/manual
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "userId": "user_id",
  "date": "2025-10-30",
  "checkIn": "2025-10-30T08:00:00.000Z",
  "checkOut": "2025-10-30T17:00:00.000Z",
  "reason": "Pointage oublié"
}
```

### Historique des Corrections
```http
GET /attendance/:id/audit
Authorization: Bearer {token}
```

Retourne l'historique complet des modifications avec détails (qui, quand, quoi).

---

## Calcul des Salaires

### Calculer le Salaire (Basé sur les Heures)
```http
POST /salary/calculate
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "userId": "user_id",
  "month": 10,
  "year": 2025,
  "deductions": 100,
  "bonuses": 50
}
```

### Calculer le Salaire au Prorata
```http
POST /salary/calculate-prorata
Authorization: Bearer {token}
```

**Corps de la requête**:
```json
{
  "userId": "user_id",
  "month": 10,
  "year": 2025,
  "deductions": 100,
  "bonuses": 50
}
```

**Réponse**:
```json
{
  "salary": {
    "_id": "...",
    "user": {...},
    "period": { "month": 10, "year": 2025 },
    "totalHours": 160,
    "hourlyRate": 15,
    "grossSalary": 2400,
    "deductions": 100,
    "bonuses": 50,
    "netSalary": 2350,
    "status": "pending"
  },
  "calculation": {
    "baseSalary": 3000,
    "workingDays": 22,
    "presentDays": 18,
    "dailyRate": 136.36,
    "proRataSalary": 2454.55,
    "totalHours": 144,
    "formula": "(3000 / 22) * 18 = 2454.55"
  }
}
```

### Historique des Salaires
```http
GET /salary/user/:userId
Authorization: Bearer {token}
```

### Salaire du Mois en Cours
```http
GET /salary/current/:userId
Authorization: Bearer {token}
```

### Tous les Salaires (Admin)
```http
GET /salary?month=10&year=2025
Authorization: Bearer {token}
```

---

## Tableau de Bord

### Statistiques Générales
```http
GET /dashboard/stats?period=today
Authorization: Bearer {token}
```

**Paramètres**:
- `period`: today, week, month

**Réponse**:
```json
{
  "summary": {
    "totalEmployees": 50,
    "presentToday": 42,
    "absentToday": 8,
    "stillPresent": 35,
    "lateToday": 5,
    "attendanceRate": 95.5
  },
  "periodStats": {
    "period": "today",
    "dateRange": { "start": "2025-10-30", "end": "2025-10-30" },
    "totalHoursWorked": 320,
    "averageHoursPerDay": 7.6,
    "totalAttendances": 42
  },
  "departments": [
    { "_id": "IT", "count": 15, "avgSalary": 3500 },
    { "_id": "RH", "count": 5, "avgSalary": 3200 }
  ]
}
```

### Rapport de Présence avec Codes Couleur
```http
GET /dashboard/attendance-report?startDate=2025-10-01&endDate=2025-10-31&department=IT
Authorization: Bearer {token}
```

**Réponse**:
```json
{
  "period": {
    "startDate": "2025-10-01",
    "endDate": "2025-10-31"
  },
  "report": [
    {
      "user": {
        "id": "...",
        "employeeId": "EMP001",
        "name": "Jean Dupont",
        "department": "IT",
        "position": "Développeur"
      },
      "summary": {
        "totalDays": 20,
        "completedDays": 20,
        "fullDays": 18,
        "incompleteDays": 2,
        "totalHours": 158.5,
        "averageHours": 7.93
      },
      "dailyRecords": [
        {
          "date": "2025-10-01",
          "checkIn": "2025-10-01T08:00:00.000Z",
          "checkOut": "2025-10-01T17:00:00.000Z",
          "workHours": 8.5,
          "status": "full",
          "color": "green"
        },
        {
          "date": "2025-10-02",
          "checkIn": "2025-10-02T08:30:00.000Z",
          "checkOut": "2025-10-02T15:00:00.000Z",
          "workHours": 6.5,
          "status": "incomplete",
          "color": "red"
        }
      ]
    }
  ]
}
```

**Codes couleur**:
- 🟢 **VERT** (green): Journée complète (≥ 8 heures)
- 🔴 **ROUGE** (red): Journée incomplète (< 8 heures)
- ⚫ **GRIS** (grey): Absent (aucun pointage)

### Statut en Temps Réel
```http
GET /dashboard/live-status
Authorization: Bearer {token}
```

Retourne le statut en direct de tous les employés.

---

## Rapports et Exports

### Exporter Présences en CSV
```http
GET /reports/attendance/csv?startDate=2025-10-01&endDate=2025-10-31&department=IT
Authorization: Bearer {token}
```

### Exporter Présences en PDF
```http
GET /reports/attendance/pdf?startDate=2025-10-01&endDate=2025-10-31
Authorization: Bearer {token}
```

### Exporter Salaires en CSV
```http
GET /reports/salary/csv?month=10&year=2025
Authorization: Bearer {token}
```

---

## Modèles de Données

### User (Utilisateur)
```javascript
{
  firstName: String,          // Prénom
  lastName: String,           // Nom
  email: String,              // Email (unique)
  password: String,           // Mot de passe (haché)
  employeeId: String,         // ID employé (unique)
  address: String,            // Adresse
  age: Number,                // Âge
  baseSalary: Number,         // Salaire de base
  hourlyRate: Number,         // Taux horaire
  department: String,         // Département
  position: String,           // Poste
  photoUrl: String,           // URL de la photo
  role: String,               // employee, manager, admin
  faceDescriptor: [Number],   // Descripteur facial
  isActive: Boolean,          // Actif/Inactif
  createdAt: Date             // Date de création
}
```

### Attendance (Présence)
```javascript
{
  user: ObjectId,             // Référence utilisateur
  checkIn: Date,              // Heure d'arrivée
  checkOut: Date,             // Heure de départ
  checkInMethod: String,      // facial, manual
  checkOutMethod: String,     // facial, manual
  checkInLocation: {          // Localisation arrivée
    latitude: Number,
    longitude: Number
  },
  checkOutLocation: {         // Localisation départ
    latitude: Number,
    longitude: Number
  },
  workHours: Number,          // Heures travaillées
  status: String,             // active, completed
  date: String,               // Date (YYYY-MM-DD)
  createdAt: Date,
  updatedAt: Date
}
```

### Salary (Salaire)
```javascript
{
  user: ObjectId,             // Référence utilisateur
  period: {
    month: Number,            // 1-12
    year: Number
  },
  totalHours: Number,         // Total heures
  hourlyRate: Number,         // Taux horaire
  grossSalary: Number,        // Salaire brut
  deductions: Number,         // Déductions
  bonuses: Number,            // Bonus
  netSalary: Number,          // Salaire net
  status: String,             // pending, processed, paid
  paidAt: Date,               // Date de paiement
  createdAt: Date,
  updatedAt: Date
}
```

### AuditLog (Journal d'Audit)
```javascript
{
  action: String,             // Type d'action
  performedBy: ObjectId,      // Qui a fait l'action
  targetUser: ObjectId,       // Utilisateur concerné
  targetAttendance: ObjectId, // Présence concernée
  description: String,        // Description
  previousValue: Mixed,       // Valeur précédente
  newValue: Mixed,            // Nouvelle valeur
  ipAddress: String,          // Adresse IP
  userAgent: String,          // User agent
  createdAt: Date
}
```

---

## Codes d'Erreur

| Code | Description |
|------|-------------|
| 200  | Succès |
| 201  | Créé |
| 400  | Mauvaise requête |
| 401  | Non autorisé (token invalide) |
| 403  | Interdit (droits insuffisants) |
| 404  | Non trouvé |
| 500  | Erreur serveur |

---

## Notes de Sécurité

- Tous les mots de passe sont hachés avec bcrypt
- Les tokens JWT expirent après 7 jours
- Les données biométriques doivent être chiffrées
- Audit trail pour toutes les modifications sensibles
- Accès basé sur les rôles (RBAC)

---

## Conformité RGPD

Le système respecte les principes RGPD:
- Consentement explicite pour la collecte de données biométriques
- Droit à l'effacement (suppression des données)
- Droit d'accès (consultation des données personnelles)
- Sécurisation des données (chiffrement)
- Audit trail complet
