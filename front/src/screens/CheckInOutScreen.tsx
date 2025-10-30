import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { attendanceService } from '../services/api';
import { Attendance } from '../types';

const CheckInOutScreen = () => {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodayAttendance();
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTodayAttendance = async () => {
    if (!user) return;
    try {
      const attendance = await attendanceService.getTodayAttendance(user._id);
      setTodayAttendance(attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  const handleCheckIn = async () => {
    if (!user) return;

    Alert.alert(
      'Pointage d\'entrée',
      'Voulez-vous pointer votre arrivée ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setLoading(true);
            try {
              await attendanceService.checkIn({
                userId: user._id,
                method: 'manual',
              });
              Alert.alert('Succès', 'Pointage d\'entrée enregistré');
              await fetchTodayAttendance();
            } catch (error: any) {
              Alert.alert(
                'Erreur',
                error.response?.data?.message || 'Erreur lors du pointage',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleCheckOut = async () => {
    if (!user) return;

    Alert.alert(
      'Pointage de sortie',
      'Voulez-vous pointer votre départ ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setLoading(true);
            try {
              await attendanceService.checkOut({
                userId: user._id,
                method: 'manual',
              });
              Alert.alert('Succès', 'Pointage de sortie enregistré');
              await fetchTodayAttendance();
            } catch (error: any) {
              Alert.alert(
                'Erreur',
                error.response?.data?.message || 'Erreur lors du pointage',
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('fr-FR');
  };

  const formatCurrentDate = () => {
    return currentTime.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const isCheckedIn = todayAttendance && !todayAttendance.checkOut;
  const isCheckedOut = todayAttendance && todayAttendance.checkOut;

  return (
    <View style={styles.container}>
      <View style={styles.clockContainer}>
        <Text style={styles.date}>{formatCurrentDate()}</Text>
        <Text style={styles.time}>{formatCurrentTime()}</Text>
      </View>

      <View style={styles.statusContainer}>
        {!todayAttendance && (
          <Text style={styles.statusText}>Aucun pointage aujourd'hui</Text>
        )}
        {isCheckedIn && (
          <>
            <Text style={styles.statusText}>Vous êtes au travail depuis:</Text>
            <Text style={styles.statusTime}>
              {formatTime(todayAttendance.checkIn)}
            </Text>
          </>
        )}
        {isCheckedOut && (
          <>
            <Text style={styles.statusText}>Journée terminée</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Arrivée:</Text>
              <Text style={styles.summaryValue}>
                {formatTime(todayAttendance.checkIn)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Départ:</Text>
              <Text style={styles.summaryValue}>
                {formatTime(todayAttendance.checkOut)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Heures:</Text>
              <Text style={styles.summaryValue}>
                {todayAttendance.workHours.toFixed(2)}h
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.buttonContainer}>
        {!todayAttendance && (
          <TouchableOpacity
            style={[styles.button, styles.checkInButton]}
            onPress={handleCheckIn}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Pointer l'arrivée</Text>
            )}
          </TouchableOpacity>
        )}

        {isCheckedIn && (
          <TouchableOpacity
            style={[styles.button, styles.checkOutButton]}
            onPress={handleCheckOut}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Pointer le départ</Text>
            )}
          </TouchableOpacity>
        )}

        {isCheckedOut && (
          <Text style={styles.completedText}>
            Pointage terminé pour aujourd'hui
          </Text>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>Information</Text>
        <Text style={styles.infoText}>
          Utilisez la reconnaissance faciale pour un pointage plus sécurisé
          (fonctionnalité à venir).
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  clockContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  date: {
    fontSize: 16,
    color: '#666',
    textTransform: 'capitalize',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
    marginTop: 10,
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 30,
    minHeight: 120,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 18,
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  statusTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  button: {
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  checkInButton: {
    backgroundColor: '#4CAF50',
  },
  checkOutButton: {
    backgroundColor: '#FF5722',
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  completedText: {
    fontSize: 18,
    color: '#4CAF50',
    textAlign: 'center',
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: '#E3F2FD',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
  },
});

export default CheckInOutScreen;
