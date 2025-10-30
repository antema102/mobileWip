import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useAuth} from '../context/AuthContext';

const RegisterScreen = ({navigation}: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    employeeId: '',
    hourlyRate: '',
    department: '',
    position: '',
  });
  const [loading, setLoading] = useState(false);
  const {register} = useAuth();

  const handleRegister = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.password ||
      !formData.employeeId ||
      !formData.hourlyRate
    ) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert(
        'Erreur',
        'Le mot de passe doit contenir au moins 6 caractères',
      );
      return;
    }

    setLoading(true);
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        employeeId: formData.employeeId,
        hourlyRate: parseFloat(formData.hourlyRate),
        department: formData.department,
        position: formData.position,
      });
    } catch (error: any) {
      Alert.alert(
        "Erreur d'inscription",
        error.response?.data?.message || "Une erreur s'est produite",
      );
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData({...formData, [field]: value});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Inscription</Text>

        <TextInput
          style={styles.input}
          placeholder="Prénom *"
          value={formData.firstName}
          onChangeText={value => updateField('firstName', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Nom *"
          value={formData.lastName}
          onChangeText={value => updateField('lastName', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={formData.email}
          onChangeText={value => updateField('email', value)}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Identifiant employé *"
          value={formData.employeeId}
          onChangeText={value => updateField('employeeId', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Taux horaire (€) *"
          value={formData.hourlyRate}
          onChangeText={value => updateField('hourlyRate', value)}
          keyboardType="decimal-pad"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Département"
          value={formData.department}
          onChangeText={value => updateField('department', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Poste"
          value={formData.position}
          onChangeText={value => updateField('position', value)}
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Mot de passe *"
          value={formData.password}
          onChangeText={value => updateField('password', value)}
          secureTextEntry
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Confirmer le mot de passe *"
          value={formData.confirmPassword}
          onChangeText={value => updateField('confirmPassword', value)}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          disabled={loading}>
          <Text style={styles.linkText}>Déjà un compte ? Se connecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  linkText: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default RegisterScreen;
