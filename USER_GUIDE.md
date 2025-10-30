# Guide Utilisateur - Système de Pointage par Reconnaissance Faciale

## Table des Matières

1. [Introduction](#introduction)
2. [Pour les Employés](#pour-les-employés)
3. [Pour les Responsables RH](#pour-les-responsables-rh)
4. [Pour les Administrateurs](#pour-les-administrateurs)
5. [FAQ](#faq)

---

## Introduction

Bienvenue dans le système de gestion des présences par reconnaissance faciale. Ce guide vous aidera à utiliser l'application selon votre rôle.

### Rôles Utilisateurs

- **Employé**: Pointage quotidien, consultation des présences et salaires
- **Manager/RH**: Toutes les fonctions employé + gestion des employés, corrections manuelles
- **Administrateur**: Accès complet au système

---

## Pour les Employés

### 1. Première Connexion

1. Téléchargez l'application mobile
2. Cliquez sur "S'inscrire" ou contactez votre RH pour créer votre compte
3. Renseignez vos informations:
   - Nom et prénom
   - Email professionnel
   - Identifiant employé (fourni par la RH)
   - Mot de passe sécurisé (minimum 6 caractères)

### 2. Pointage Quotidien

#### Comment pointer?

1. Ouvrez l'application
2. Allez dans l'onglet **"Pointage"**
3. Vous verrez:
   - L'heure actuelle en grand
   - La date du jour
   - Vos informations (nom, ID employé)
   - Un bouton **"Pointer"**

4. Appuyez sur le bouton "Pointer"
   - **Le matin**: Le système enregistre automatiquement votre arrivée
   - **Le soir**: Le système enregistre automatiquement votre départ

5. Confirmez l'action
6. Un message personnalisé s'affiche avec votre nom et l'heure

#### Exemple de Message de Confirmation

```
Pointage réussi

Jean Dupont
Heure d'arrivée: 08:15
```

#### Points Importants

- ✅ Un seul bouton pour tout: le système sait automatiquement si c'est une arrivée ou un départ
- ✅ Le bouton devient vert pour l'arrivée, rouge pour le départ
- ✅ Une fois le départ pointé, vous ne pouvez plus pointer pour la journée
- ⚠️ N'oubliez pas de pointer le matin ET le soir

### 3. Consulter Vos Présences

1. Allez dans l'onglet **"Présences"**
2. Vous verrez:
   - L'historique complet de vos pointages
   - Statistiques: jours travaillés, total d'heures
   - Pour chaque jour:
     - Heure d'arrivée
     - Heure de départ
     - Heures travaillées

3. Tirez vers le bas pour actualiser

### 4. Consulter Votre Salaire

1. Allez dans l'onglet **"Salaire"**
2. Vous verrez:
   - Historique mensuel de vos salaires
   - Détails du calcul:
     - Heures totales travaillées
     - Taux horaire
     - Salaire brut
     - Déductions
     - Bonus éventuels
     - **Salaire net**

### 5. Profil

1. Allez dans l'onglet **"Profil"**
2. Consultez vos informations personnelles
3. Mettez à jour votre mot de passe si nécessaire
4. Déconnectez-vous en toute sécurité

---

## Pour les Responsables RH

En tant que Responsable RH, vous avez accès à des fonctionnalités supplémentaires.

### 1. Enregistrer les Visages des Employés

1. Allez dans l'onglet **"RH"** (visible uniquement pour vous)
2. Vous verrez la liste de tous les employés
3. Utilisez la barre de recherche pour trouver un employé
4. Cliquez sur **"Enregistrer"** ou **"Mettre à jour"**
5. Prenez une photo claire du visage de l'employé
6. Le système enregistre automatiquement

#### Conseils pour une Bonne Photo

- ✅ Éclairage naturel ou lumineux
- ✅ Visage de face, regard vers la caméra
- ✅ Pas de lunettes de soleil ni chapeau
- ✅ Expression neutre
- ❌ Éviter les contre-jours

### 2. Gérer les Employés

#### Importer des Employés en Masse

1. Utilisez l'API Web ou contactez l'administrateur
2. Téléchargez le modèle CSV:
   ```
   GET /api/users/import/template
   ```
3. Remplissez le fichier avec les données des employés
4. Importez via:
   ```
   POST /api/users/import
   ```

#### Format du Fichier CSV

```csv
firstName,lastName,email,employeeId,address,age,position,department,baseSalary,hourlyRate
Jean,Dupont,jean@example.com,EMP001,123 Rue de Paris,30,Développeur,IT,3000,15
Marie,Martin,marie@example.com,EMP002,456 Avenue Lyon,28,Designer,Marketing,2800,14
```

### 3. Corriger un Pointage

Si un employé a oublié de pointer:

1. Utilisez l'API:
   ```
   POST /api/attendance/manual
   ```

2. Fournissez:
   - ID de l'employé
   - Date
   - Heure d'arrivée
   - Heure de départ (optionnel)
   - Raison de la correction

3. La correction sera enregistrée dans l'audit trail

#### Exemple

```json
{
  "userId": "user_id_123",
  "date": "2025-10-30",
  "checkIn": "2025-10-30T08:00:00.000Z",
  "checkOut": "2025-10-30T17:00:00.000Z",
  "reason": "Employé a oublié de pointer"
}
```

### 4. Consulter les Rapports

#### Rapport de Présence Mensuel

```
GET /api/dashboard/attendance-report?startDate=2025-10-01&endDate=2025-10-31
```

Vous obtenez un rapport avec codes couleur:
- 🟢 **VERT**: Journée complète (≥ 8h)
- 🔴 **ROUGE**: Journée incomplète (< 8h)
- ⚫ **GRIS**: Absent

#### Exporter en PDF

```
GET /api/reports/attendance/pdf?startDate=2025-10-01&endDate=2025-10-31
```

### 5. Calculer les Salaires

#### Calcul au Prorata (comme spécifié dans le cahier des charges)

```
POST /api/salary/calculate-prorata
```

**Formule**: `(Salaire de base / Jours ouvrés) × Jours présents`

**Exemple**:
- Salaire de base: 3000 €
- Jours ouvrés en octobre: 22 jours
- Jours présents: 18 jours
- Calcul: (3000 / 22) × 18 = **2454.55 €**

---

## Pour les Administrateurs

### 1. Tableau de Bord en Temps Réel

Accédez aux statistiques en direct:

```
GET /api/dashboard/stats?period=today
```

Vous obtenez:
- Nombre d'employés présents/absents
- Employés en retard
- Taux de présence
- Heures totales travaillées

### 2. Gérer les Utilisateurs

- Créer, modifier, supprimer des employés
- Attribuer des rôles (employee, manager, admin)
- Importer/exporter en masse
- Gérer les départements

### 3. Consulter l'Audit Trail

Toutes les modifications sont tracées:

```
GET /api/attendance/:id/audit
```

Vous verrez:
- Qui a fait la modification
- Quand
- Quelle valeur a été changée
- Raison de la modification
- Adresse IP

### 4. Exports et Rapports

#### Export CSV des Employés
```
GET /api/users/export
```

#### Export CSV des Salaires
```
GET /api/reports/salary/csv?month=10&year=2025
```

#### Export PDF des Présences
```
GET /api/reports/attendance/pdf?startDate=2025-10-01&endDate=2025-10-31
```

### 5. Configuration du Système

Modifiez le fichier `.env`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/personnel_tracking
JWT_SECRET=votre-clé-secrète
JWT_EXPIRE=7d
NODE_ENV=production
```

---

## FAQ

### Questions Générales

**Q: Que faire si j'oublie de pointer?**  
A: Contactez votre responsable RH qui pourra ajouter votre pointage manuellement.

**Q: Puis-je pointer depuis n'importe où?**  
A: Oui, mais le système peut enregistrer votre localisation GPS si configuré.

**Q: Combien de fois puis-je pointer par jour?**  
A: Deux fois : une arrivée le matin et un départ le soir.

**Q: Comment changer mon mot de passe?**  
A: Dans l'onglet "Profil", accédez aux paramètres.

### Questions Techniques

**Q: La reconnaissance faciale est-elle obligatoire?**  
A: Non, le pointage manuel est également disponible en attendant l'activation complète.

**Q: Mes données biométriques sont-elles sécurisées?**  
A: Oui, toutes les données sont chiffrées et conformes au RGPD.

**Q: Que faire si l'application ne fonctionne pas?**  
A: Vérifiez votre connexion internet, redémarrez l'application, ou contactez le support IT.

### Questions RH

**Q: Comment calculer les salaires pour un employé qui arrive en cours de mois?**  
A: Utilisez le calcul au prorata qui ajuste automatiquement selon les jours présents.

**Q: Puis-je modifier un pointage après coup?**  
A: Oui, avec les droits RH/Admin. Toutes les modifications sont tracées.

**Q: Comment gérer les heures supplémentaires?**  
A: Le système calcule automatiquement les heures. Vous pouvez ajouter des bonus lors du calcul du salaire.

---

## Support

Pour toute question ou problème:

- 📧 Email: support@votre-entreprise.com
- 📞 Téléphone: 01 23 45 67 89
- 💬 Chat en ligne: [lien]

---

## Conformité et Sécurité

### RGPD

Le système respecte le Règlement Général sur la Protection des Données:

- ✅ Consentement explicite pour les données biométriques
- ✅ Droit à l'effacement
- ✅ Droit d'accès à vos données
- ✅ Chiffrement des données sensibles
- ✅ Audit trail complet

### Sécurité

- 🔒 Tous les mots de passe sont hachés
- 🔒 Connexions sécurisées (HTTPS)
- 🔒 Tokens d'authentification avec expiration
- 🔒 Accès basé sur les rôles
- 🔒 Logs d'activité

---

## Mises à Jour

Le système est régulièrement mis à jour avec de nouvelles fonctionnalités.

**Version actuelle**: 1.0.0

**Prochaines fonctionnalités**:
- ✨ Reconnaissance faciale complète
- ✨ Dashboard web pour l'administration
- ✨ Notifications push
- ✨ Application web responsive
- ✨ Graphiques et statistiques avancées

---

*Dernière mise à jour: 30 octobre 2025*
