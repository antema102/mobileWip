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
import {salaryService} from '../services/api';
import {Salary} from '../types';

const SalaryScreen = () => {
  const {user} = useAuth();
  const [salaryList, setSalaryList] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSalary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSalary = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await salaryService.getUserSalary(user._id);
      setSalaryList(data);
    } catch (error) {
      console.error('Error fetching salary:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchSalary();
  };

  const getMonthName = (month: number) => {
    const months = [
      'Janvier',
      'Février',
      'Mars',
      'Avril',
      'Mai',
      'Juin',
      'Juillet',
      'Août',
      'Septembre',
      'Octobre',
      'Novembre',
      'Décembre',
    ];
    return months[month - 1];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return '#4CAF50';
      case 'processed':
        return '#FF9800';
      default:
        return '#999';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Payé';
      case 'processed':
        return 'Traité';
      default:
        return 'En attente';
    }
  };

  const renderItem = ({item}: {item: Salary}) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.period}>
          {getMonthName(item.period.month)} {item.period.year}
        </Text>
        <View
          style={[
            styles.statusBadge,
            {backgroundColor: getStatusColor(item.status)},
          ]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.row}>
          <Text style={styles.label}>Heures travaillées:</Text>
          <Text style={styles.value}>{item.totalHours.toFixed(2)}h</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Taux horaire:</Text>
          <Text style={styles.value}>{item.hourlyRate}€/h</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Salaire brut:</Text>
          <Text style={styles.value}>{item.grossSalary.toFixed(2)}€</Text>
        </View>

        {item.deductions > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, styles.deduction]}>Déductions:</Text>
            <Text style={[styles.value, styles.deduction]}>
              -{item.deductions.toFixed(2)}€
            </Text>
          </View>
        )}

        {item.bonuses > 0 && (
          <View style={styles.row}>
            <Text style={[styles.label, styles.bonus]}>Bonus:</Text>
            <Text style={[styles.value, styles.bonus]}>
              +{item.bonuses.toFixed(2)}€
            </Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.netSalaryRow}>
          <Text style={styles.netSalaryLabel}>Salaire net:</Text>
          <Text style={styles.netSalaryValue}>
            {item.netSalary.toFixed(2)}€
          </Text>
        </View>

        {item.paidAt && (
          <Text style={styles.paidDate}>
            Payé le {new Date(item.paidAt).toLocaleDateString('fr-FR')}
          </Text>
        )}
      </View>
    </View>
  );

  const calculateTotalEarnings = () => {
    return salaryList.reduce((sum, item) => sum + item.netSalary, 0);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryContainer}>
        <Text style={styles.summaryLabel}>Total des gains</Text>
        <Text style={styles.summaryValue}>
          {calculateTotalEarnings().toFixed(2)}€
        </Text>
      </View>

      <FlatList
        data={salaryList}
        renderItem={renderItem}
        keyExtractor={item => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Aucun historique de salaire</Text>
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
  summaryContainer: {
    backgroundColor: '#007AFF',
    padding: 25,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#fff',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
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
  },
  period: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 15,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  deduction: {
    color: '#F44336',
  },
  bonus: {
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 8,
  },
  netSalaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  netSalaryLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  netSalaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  paidDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'right',
    marginTop: 5,
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

export default SalaryScreen;
