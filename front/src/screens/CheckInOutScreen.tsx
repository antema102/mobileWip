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

  // Simplified single-button handler as per cahier des charges
  const handlePointer = async () => {
    if (!user) return;

    const isCheckIn = !todayAttendance || todayAttendance.checkOut;
    const action = isCheckIn ? 'arrivée' : 'départ';
    const actionCapitalized = isCheckIn ? 'Arrivée' : 'Départ';

    Alert.alert(
      `Pointage ${action}`,
      `Voulez-vous pointer votre ${action} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            setLoading(true);
            try {
              if (isCheckIn) {
                await attendanceService.checkIn({
                  userId: user._id,
                  method: 'manual', // Will be 'facial' when camera is integrated
                });
              } else {
                await attendanceService.checkOut({
                  userId: user._id,
                  method: 'manual',
                });
              }
              
              // Personalized confirmation message with employee name and time
              const userName = `${user.firstName} ${user.lastName}`;
              const time = new Date().toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              });
              
              Alert.alert(
                'Pointage réussi',
                `${userName}\nHeure ${action === 'arrivée' ? 'd\'arrivée' : 'de départ'}: ${time}`,
              );
              
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
  const canPoint = !isCheckedOut;

  // Determine button text and action based on current status
  const getButtonText = () => {
    if (!todayAttendance || todayAttendance.checkOut) {
      return 'Pointer'; // Single button for check-in
    }
    return 'Pointer'; // Same button for check-out
  };

  const getButtonColor = () => {
    if (!todayAttendance || todayAttendance.checkOut) {
      return '#4CAF50'; // Green for check-in
    }
    return '#FF5722'; // Red for check-out
  };

  return (
    <View style={styles.container}>
      {/* Real-time clock display */}
      <View style={styles.clockContainer}>
        <Text style={styles.date}>{formatCurrentDate()}</Text>
        <Text style={styles.time}>{formatCurrentTime()}</Text>
      </View>

      {/* Employee info */}
      {user && (
        <View style={styles.userInfoContainer}>
          <Text style={styles.userName}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.userPosition}>
            {user.employeeId} • {user.position || 'Employé'}
          </Text>
        </View>
      )}

      {/* Status display */}
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

      {/* Simplified single button as per cahier des charges */}
      <View style={styles.buttonContainer}>
        {canPoint && (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: getButtonColor() }]}
            onPress={handlePointer}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" size="large" />
            ) : (
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            )}
          </TouchableOpacity>
        )}

        {isCheckedOut && (
          <View style={styles.completedContainer}>
            <Text style={styles.completedText}>
              ✓ Pointage terminé pour aujourd'hui
            </Text>
          </View>
        )}
      </View>

      {/* Information box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>ℹ️ Information</Text>
        <Text style={styles.infoText}>
          Le système détecte automatiquement s'il s'agit d'une arrivée ou d'un départ.
          {'\n'}La reconnaissance faciale sera activée prochainement pour plus de sécurité.
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
    marginBottom: 20,
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
  userInfoContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userPosition: {
    fontSize: 14,
    color: '#666',
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
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  completedContainer: {
    backgroundColor: '#E8F5E9',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
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
    lineHeight: 20,
  },
});

export default CheckInOutScreen;
