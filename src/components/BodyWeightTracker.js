import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUnifiedApp } from '../context/UnifiedAppProvider';
import { SimpleLineChart } from './SimpleCharts';

const { width } = Dimensions.get('window');

const BodyWeightTracker = ({ navigation }) => {
  const { state, addBodyWeight, removeBodyWeight } = useUnifiedApp();
  const { bodyWeights } = state;
  
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  
  const sortedWeights = useMemo(() => {
    return bodyWeights
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30); // Last 30 entries
  }, [bodyWeights]);
  
  const chartData = useMemo(() => {
    if (sortedWeights.length === 0) return { labels: [], datasets: [{ data: [] }] };
    
    return {
      labels: sortedWeights.map(w => {
        const date = new Date(w.date);
        return `${date.getMonth() + 1}/${date.getDate()}`;
      }),
      datasets: [{
        data: sortedWeights.map(w => w.weight),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 2,
      }]
    };
  }, [sortedWeights]);
  
  const handleAddWeight = () => {
    if (!newWeight || isNaN(newWeight)) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight.');
      return;
    }
    
    const weight = parseFloat(newWeight);
    if (weight <= 0 || weight > 1000) {
      Alert.alert('Invalid Weight', 'Please enter a weight between 0 and 1000.');
      return;
    }
    
    addBodyWeight({
      id: Date.now().toString(),
      weight,
      date: newDate,
      createdAt: new Date().toISOString(),
    });
    
    setNewWeight('');
    setNewDate(new Date().toISOString().split('T')[0]);
  };
  
  const handleRemoveWeight = (weightId) => {
    Alert.alert(
      'Remove Weight Entry',
      'Are you sure you want to remove this weight entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeBodyWeight(weightId) },
      ]
    );
  };
  
  const getWeightChange = () => {
    if (sortedWeights.length < 2) return { change: 0, percentage: 0 };
    
    const firstWeight = sortedWeights[0].weight;
    const lastWeight = sortedWeights[sortedWeights.length - 1].weight;
    const change = lastWeight - firstWeight;
    const percentage = ((change / firstWeight) * 100).toFixed(1);
    
    return { change, percentage };
  };
  
  const { change, percentage } = getWeightChange();
  const isWeightGain = change > 0;
  const isWeightLoss = change < 0;
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="scale-outline" size={24} color="white" />
          <Text style={styles.headerTitle}>Body Weight Tracker</Text>
        </View>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weight Change Summary */}
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Weight Change</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Change</Text>
              <Text style={[
                styles.summaryValue,
                isWeightGain && styles.positive,
                isWeightLoss && styles.negative
              ]}>
                {change > 0 ? '+' : ''}{change.toFixed(1)} lbs
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Percentage</Text>
              <Text style={[
                styles.summaryValue,
                isWeightGain && styles.positive,
                isWeightLoss && styles.negative
              ]}>
                {change > 0 ? '+' : ''}{percentage}%
              </Text>
            </View>
          </View>
        </View>
        
        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.chartTitle}>Weight Trend (Last 30 Entries)</Text>
          <View style={styles.chartContainer}>
            <SimpleLineChart
              data={chartData}
              width={width - 40}
              height={200}
              chartConfig={{
                backgroundColor: 'transparent',
                backgroundGradientFrom: 'transparent',
                backgroundGradientTo: 'transparent',
                decimalPlaces: 1,
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '4',
                  strokeWidth: '2',
                  stroke: '#667eea',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        </View>
        
        {/* Add Weight Form */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Add New Weight Entry</Text>
          <View style={styles.formRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Weight (lbs)</Text>
              <TextInput
                style={styles.input}
                value={newWeight}
                onChangeText={setNewWeight}
                placeholder="Enter weight"
                keyboardType="numeric"
                placeholderTextColor="#999"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.input}
                value={newDate}
                onChangeText={setNewDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#999"
              />
            </View>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={handleAddWeight}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add Weight</Text>
          </TouchableOpacity>
        </View>
        
        {/* Weight History */}
        <View style={styles.historyCard}>
          <Text style={styles.historyTitle}>Recent Entries</Text>
          {sortedWeights.length === 0 ? (
            <Text style={styles.emptyText}>No weight entries yet. Add your first entry above!</Text>
          ) : (
            sortedWeights.slice(-10).reverse().map((entry, index) => (
              <View key={entry.id} style={styles.historyItem}>
                <View style={styles.historyInfo}>
                  <Text style={styles.historyDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                  <Text style={styles.historyWeight}>{entry.weight} lbs</Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveWeight(entry.id)}
                >
                  <Ionicons name="trash-outline" size={16} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  positive: {
    color: '#22c55e',
  },
  negative: {
    color: '#ef4444',
  },
  chartCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  chartContainer: {
    alignItems: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  formCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  inputContainer: {
    flex: 1,
    marginRight: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8b5cf6',
    borderRadius: 10,
    paddingVertical: 15,
    marginTop: 10,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  historyCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyInfo: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  removeButton: {
    padding: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

export default BodyWeightTracker;