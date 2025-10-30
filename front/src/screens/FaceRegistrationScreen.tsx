import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  employeeId: string;
  email: string;
  department?: string;
  position?: string;
  faceDescriptor?: number[];
}

const FaceRegistrationScreen = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        emp =>
          emp.firstName.toLowerCase().includes(query) ||
          emp.lastName.toLowerCase().includes(query) ||
          emp.employeeId.toLowerCase().includes(query) ||
          emp.email.toLowerCase().includes(query),
      );
      setFilteredEmployees(filtered);
    }
  }, [searchQuery, employees]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setEmployees(data);
      setFilteredEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      Alert.alert('Erreur', 'Impossible de charger la liste des employés');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterFace = async (employee: Employee) => {
    Alert.alert(
      'Enregistrer le visage',
      `Enregistrer le visage de ${employee.firstName} ${employee.lastName} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Prendre une photo',
          onPress: async () => {
            // This will be implemented with camera
            Alert.alert(
              'Fonctionnalité à venir',
              'L\'intégration de la caméra pour capturer le visage sera disponible prochainement.\n\n' +
                'Pour le moment, vous pouvez utiliser l\'API pour mettre à jour le descripteur facial manuellement.',
            );
            
            // TODO: Implement camera capture
            // 1. Request camera permissions
            // 2. Open camera (using react-native-vision-camera)
            // 3. Capture photo
            // 4. Detect face and generate descriptor
            // 5. Upload to server using userService.updateFaceDescriptor()
          },
        },
      ],
    );
  };

  const renderEmployee = ({ item }: { item: Employee }) => {
    const hasFaceRegistered = item.faceDescriptor && item.faceDescriptor.length > 0;

    return (
      <View style={styles.employeeCard}>
        <View style={styles.employeeInfo}>
          <Text style={styles.employeeName}>
            {item.firstName} {item.lastName}
          </Text>
          <Text style={styles.employeeDetails}>
            {item.employeeId} • {item.position || 'Employé'}
          </Text>
          <Text style={styles.employeeEmail}>{item.email}</Text>
          {item.department && (
            <Text style={styles.employeeDepartment}>
              Département: {item.department}
            </Text>
          )}
        </View>

        <View style={styles.actionContainer}>
          {hasFaceRegistered ? (
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>✓ Enregistré</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.statusBadgeWarning]}>
              <Text style={[styles.statusText, styles.statusTextWarning]}>
                ⚠ Non enregistré
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => handleRegisterFace(item)}>
            <Text style={styles.registerButtonText}>
              {hasFaceRegistered ? 'Mettre à jour' : 'Enregistrer'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Check if user has permission (HR or Admin)
  if (!user || (user.role !== 'admin' && user.role !== 'manager')) {
    return (
      <View style={styles.container}>
        <View style={styles.unauthorizedContainer}>
          <Text style={styles.unauthorizedText}>
            Accès non autorisé
          </Text>
          <Text style={styles.unauthorizedSubtext}>
            Cette fonctionnalité est réservée aux responsables RH et administrateurs.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Enregistrement Facial</Text>
        <Text style={styles.subtitle}>
          Enregistrez ou mettez à jour les photos des employés
        </Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un employé..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={item => item._id}
          renderItem={renderEmployee}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun employé trouvé</Text>
            </View>
          }
        />
      )}

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Instructions</Text>
        <Text style={styles.infoText}>
          1. Sélectionnez un employé dans la liste{'\n'}
          2. Cliquez sur "Enregistrer" ou "Mettre à jour"{'\n'}
          3. Prenez une photo claire du visage de l'employé{'\n'}
          4. Le système analysera et enregistrera le visage automatiquement
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  searchContainer: {
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  listContainer: {
    padding: 15,
  },
  employeeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeInfo: {
    marginBottom: 12,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  employeeEmail: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 2,
  },
  employeeDepartment: {
    fontSize: 12,
    color: '#999',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusBadgeWarning: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
  },
  statusTextWarning: {
    color: '#FF9800',
  },
  registerButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    margin: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
  },
  unauthorizedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  unauthorizedText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  unauthorizedSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default FaceRegistrationScreen;
