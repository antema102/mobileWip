# Exemples d'Utilisation

Ce dossier contient des exemples pour faciliter l'utilisation du système de pointage.

## Import d'Employés

### Fichier: `employees_import_example.csv`

Ce fichier contient 10 employés exemples que vous pouvez utiliser pour tester l'import en masse.

### Comment utiliser:

1. **Télécharger le modèle officiel** (optionnel):
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/users/import/template \
  -o template.csv
```

2. **Préparer votre fichier CSV**:
   - Utilisez `employees_import_example.csv` comme exemple
   - Modifiez les données selon vos besoins
   - Assurez-vous que les emails et employeeId sont uniques

3. **Importer les employés**:

**Option A: Avec cURL**
```bash
curl -X POST http://localhost:3000/api/users/import \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@employees_import_example.csv"
```

**Option B: Avec Postman**
- Méthode: POST
- URL: `http://localhost:3000/api/users/import`
- Headers: `Authorization: Bearer YOUR_TOKEN`
- Body: form-data
  - Key: `file`
  - Type: File
  - Value: Sélectionnez votre fichier CSV

**Option C: Avec JavaScript/Node.js**
```javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const form = new FormData();
form.append('file', fs.createReadStream('employees_import_example.csv'));

axios.post('http://localhost:3000/api/users/import', form, {
  headers: {
    ...form.getHeaders(),
    'Authorization': 'Bearer YOUR_TOKEN'
  }
})
.then(response => {
  console.log('Import réussi:', response.data);
})
.catch(error => {
  console.error('Erreur:', error.response?.data || error.message);
});
```

### Format du Fichier CSV

| Colonne | Description | Obligatoire | Exemple |
|---------|-------------|-------------|---------|
| firstName | Prénom | Oui | Jean |
| lastName | Nom | Oui | Dupont |
| email | Email | Oui | jean.dupont@example.com |
| employeeId | ID employé unique | Oui | EMP001 |
| address | Adresse complète | Non | 123 Rue de la Paix, Paris |
| age | Âge | Non | 30 |
| position | Poste | Non | Développeur |
| department | Département | Non | IT |
| baseSalary | Salaire de base mensuel | Non | 3000 |
| hourlyRate | Taux horaire | Non | 15 |
| role | Rôle (employee/manager/admin) | Non | employee |
| password | Mot de passe initial | Non | changeme123 |

### Notes Importantes

1. **Emails et EmployeeId Uniques**: Chaque email et employeeId doit être unique dans la base de données.

2. **Format des Données**:
   - Adresses avec virgules doivent être entre guillemets: `"123 Rue, Paris"`
   - Les nombres peuvent avoir des décimales: `15.5`
   - Rôles valides: `employee`, `manager`, `admin`

3. **Mot de Passe**:
   - Si non fourni, le mot de passe par défaut sera `TempPass2025!`
   - Les employés **doivent** changer leur mot de passe à la première connexion
   - Assurez-vous d'avoir une politique de sécurité pour forcer le changement

4. **Résultat de l'Import**:
```json
{
  "message": "Import completed",
  "summary": {
    "total": 10,
    "success": 8,
    "errors": 2
  },
  "results": {
    "success": [
      {
        "employeeId": "EMP001",
        "name": "Jean Dupont",
        "email": "jean.dupont@example.com"
      },
      ...
    ],
    "errors": [
      {
        "row": {...},
        "error": "User already exists with email..."
      }
    ]
  }
}
```

## Autres Exemples

### Calculer le Salaire au Prorata

```bash
curl -X POST http://localhost:3000/api/salary/calculate-prorata \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "month": 10,
    "year": 2025,
    "deductions": 100,
    "bonuses": 50
  }'
```

### Ajouter un Pointage Manuellement

```bash
curl -X POST http://localhost:3000/api/attendance/manual \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "date": "2025-10-30",
    "checkIn": "2025-10-30T08:00:00.000Z",
    "checkOut": "2025-10-30T17:00:00.000Z",
    "reason": "Oubli de pointage"
  }'
```

### Exporter le Rapport de Présence en PDF

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/reports/attendance/pdf?startDate=2025-10-01&endDate=2025-10-31" \
  -o attendance_report.pdf
```

### Obtenir les Statistiques du Tableau de Bord

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/dashboard/stats?period=month" \
  | json_pp
```

## Support

Pour plus d'informations, consultez:
- [API Documentation](/API_DOCUMENTATION.md)
- [User Guide](/USER_GUIDE.md)
- [README Principal](/README.md)
