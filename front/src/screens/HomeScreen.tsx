import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {attendanceService, salaryService} from '../services/api';
import {Attendance, Salary} from '../types';

const HomeScreen = () => {
  const {user} = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null,
  );
  const [currentSalary, setCurrentSalary] = useState<Salary | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (user) {
        const [attendance, salary] = await Promise.all([
          attendanceService.getTodayAttendance(user._id),
          salaryService.getCurrentMonthSalary(user._id),
        ]);
        setTodayAttendance(attendance);
        setCurrentSalary(salary);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}min`;
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={fetchData} />
      }>
      <View style={styles.header}>
        <Text style={styles.greeting}>Bonjour,</Text>
        <Text style={styles.name}>
          {user?.firstName} {user?.lastName}
        </Text>
        <Text style={styles.employeeId}>ID: {user?.employeeId}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Présence du jour</Text>
        {todayAttendance ? (
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Arrivée:</Text>
              <Text style={styles.value}>
                {formatTime(todayAttendance.checkIn)}
              </Text>
            </View>
            {todayAttendance.checkOut ? (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Départ:</Text>
                  <Text style={styles.value}>
                    {formatTime(todayAttendance.checkOut)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Heures travaillées:</Text>
                  <Text style={styles.value}>
                    {formatHours(todayAttendance.workHours)}
                  </Text>
                </View>
              </>
            ) : (
              <Text style={styles.statusText}>
                Vous êtes actuellement au travail
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>
            Aucun pointage enregistré aujourd'hui
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Salaire du mois</Text>
        {currentSalary ? (
          <View>
            <View style={styles.row}>
              <Text style={styles.label}>Heures totales:</Text>
              <Text style={styles.value}>
                {formatHours(currentSalary.totalHours)}
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Taux horaire:</Text>
              <Text style={styles.value}>{currentSalary.hourlyRate}€/h</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Salaire brut:</Text>
              <Text style={styles.value}>
                {currentSalary.grossSalary.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Salaire net:</Text>
              <Text style={[styles.value, styles.netSalary]}>
                {currentSalary.netSalary.toFixed(2)}€
              </Text>
            </View>
          </View>
        ) : (
          <Text style={styles.noDataText}>
            Aucune donnée de salaire pour ce mois
          </Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Informations</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Département:</Text>
          <Text style={styles.value}>{user?.department || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Poste:</Text>
          <Text style={styles.value}>{user?.position || 'N/A'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Rôle:</Text>
          <Text style={styles.value}>{user?.role}</Text>
        </View>
      </View>
    </ScrollView>
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
    paddingTop: 30,
  },
  greeting: {
    color: '#fff',
    fontSize: 18,
  },
  name: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 5,
  },
  employeeId: {
    color: '#fff',
    fontSize: 14,
    marginTop: 5,
    opacity: 0.9,
  },
  card: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  netSalary: {
    color: '#007AFF',
    fontSize: 18,
  },
  statusText: {
    fontSize: 16,
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default HomeScreen;
