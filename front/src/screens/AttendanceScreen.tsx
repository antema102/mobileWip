import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useAuth} from '../context/AuthContext';
import {attendanceService} from '../services/api';
import {Attendance} from '../types';

const AttendanceScreen = () => {
  const {user} = useAuth();
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await attendanceService.getUserAttendance(user._id);
      setAttendanceList(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({item}: {item: Attendance}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.date}>{formatDate(item.checkIn)}</Text>
        <Text
          style={[
            styles.status,
            item.status === 'completed' ? styles.completed : styles.active,
          ]}>
          {item.status === 'completed' ? 'Complété' : 'En cours'}
        </Text>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.timeRow}>
          <View style={styles.timeItem}>
            <Text style={styles.timeLabel}>Arrivée</Text>
            <Text style={styles.timeValue}>{formatTime(item.checkIn)}</Text>
          </View>

          {item.checkOut && (
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>Départ</Text>
              <Text style={styles.timeValue}>{formatTime(item.checkOut)}</Text>
            </View>
          )}
        </View>

        {item.workHours > 0 && (
          <View style={styles.hoursContainer}>
            <Text style={styles.hoursLabel}>Heures travaillées:</Text>
            <Text style={styles.hoursValue}>
              {item.workHours.toFixed(2)}h
            </Text>
          </View>
        )}

        <View style={styles.methodContainer}>
          <Text style={styles.methodText}>
            Méthode: {item.checkInMethod === 'facial' ? 'Faciale' : 'Manuelle'}
          </Text>
        </View>
      </View>
    </View>
  );

  const calculateStats = () => {
    const totalHours = attendanceList.reduce(
      (sum, item) => sum + item.workHours,
      0,
    );
    const completedDays = attendanceList.filter(
      item => item.status === 'completed',
    ).length;
    const avgHours = completedDays > 0 ? totalHours / completedDays : 0;

    return {totalHours, completedDays, avgHours};
  };

  const stats = calculateStats();

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.completedDays}</Text>
          <Text style={styles.statLabel}>Jours</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.totalHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.avgHours.toFixed(1)}h</Text>
          <Text style={styles.statLabel}>Moyenne</Text>
        </View>
      </View>

      <FlatList
        data={attendanceList}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Aucun historique de présence
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  listContent: {
    padding: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  date: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completed: {
    backgroundColor: '#E8F5E9',
    color: '#4CAF50',
  },
  active: {
    backgroundColor: '#FFF3E0',
    color: '#FF9800',
  },
  cardBody: {
    gap: 10,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  timeItem: {
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  timeValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  hoursContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  hoursLabel: {
    fontSize: 14,
    color: '#666',
  },
  hoursValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  methodContainer: {
    marginTop: 5,
  },
  methodText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

export default AttendanceScreen;
