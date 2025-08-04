import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SimpleLineChart } from './SimpleCharts';
import { useApp } from '../context/AppContext';

const { width: screenWidth } = Dimensions.get('window');
const chartWidth = screenWidth - 32;

const BodyWeightTracker = () => {
  const { bodyWeights, addBodyWeight, updateBodyWeight, removeBodyWeight, settings } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [editingEntry, setEditingEntry] = useState(null);

  // Prepare chart data (last 12 entries for better visualization)
  const chartData = useMemo(() => {
    if (bodyWeights.length === 0) {
      return [];
    }

    const recentEntries = bodyWeights.slice(-12).reverse(); // Get last 12 entries, oldest first
    return recentEntries.map(entry => entry.weight);
  }, [bodyWeights]);

  // Calculate stats
  const stats = useMemo(() => {
    if (bodyWeights.length === 0) {
      return {
        current: 0,
        change: 0,
        changePercent: 0,
        trend: 'stable',
        min: 0,
        max: 0,
        average: 0
      };
    }

    const current = bodyWeights[0]?.weight || 0; // Most recent (first in sorted array)
    const previous = bodyWeights[1]?.weight || current;
    const change = current - previous;
    const changePercent = previous > 0 ? ((change / previous) * 100) : 0;
    
    // Determine trend based on last 3 entries
    let trend = 'stable';
    if (bodyWeights.length >= 3) {
      const recent3 = bodyWeights.slice(0, 3).map(e => e.weight);
      const avgFirst2 = (recent3[0] + recent3[1]) / 2;
      const difference = avgFirst2 - recent3[2];
      
      if (difference > 0.5) trend = 'increasing';
      else if (difference < -0.5) trend = 'decreasing';
    }

    const weights = bodyWeights.map(e => e.weight);
    const min = Math.min(...weights);
    const max = Math.max(...weights);
    const average = weights.reduce((sum, w) => sum + w, 0) / weights.length;

    return {
      current,
      change,
      changePercent,
      trend,
      min,
      max,
      average
    };
  }, [bodyWeights]);

  const handleSave = async () => {
    if (!weight.trim()) {
      Alert.alert('Weight Required', 'Please enter your weight.');
      return;
    }

    const weightValue = parseFloat(weight);
    if (isNaN(weightValue) || weightValue <= 0 || weightValue > 1000) {
      Alert.alert('Invalid Weight', 'Please enter a valid weight between 1 and 1000.');
      return;
    }

    try {
      if (editingEntry) {
        await updateBodyWeight(editingEntry.id, {
          weight: weightValue,
          date,
          notes: notes.trim()
        });
      } else {
        await addBodyWeight(weightValue, date, notes.trim());
      }
      
      setShowAddModal(false);
      setWeight('');
      setNotes('');
      setDate(new Date().toISOString().split('T')[0]);
      setEditingEntry(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save body weight entry.');
    }
  };

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setWeight(entry.weight.toString());
    setDate(entry.date);
    setNotes(entry.notes || '');
    setShowAddModal(true);
  };

  const handleDelete = (entry) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this weight entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => removeBodyWeight(entry.id)
        }
      ]
    );
  };

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'increasing': return 'trending-up';
      case 'decreasing': return 'trending-down';
      default: return 'remove';
    }
  };

  const getTrendColor = () => {
    switch (stats.trend) {
      case 'increasing': return '#ef4444';
      case 'decreasing': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const formatWeight = (weight) => {
    const unit = settings?.units === 'kg' ? 'kg' : 'lbs';
    return `${weight.toFixed(1)} ${unit}`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Body Weight Tracking</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatWeight(stats.current)}</Text>
          <Text style={styles.statLabel}>Current Weight</Text>
        </View>
        
        <View style={styles.statCard}>
          <View style={styles.changeContainer}>
            <Ionicons 
              name={getTrendIcon()} 
              size={18} 
              color={getTrendColor()} 
            />
            <Text style={[styles.statValue, { color: getTrendColor(), fontSize: 16 }]}>
              {stats.change >= 0 ? '+' : ''}{formatWeight(Math.abs(stats.change))}
            </Text>
          </View>
          <Text style={styles.statLabel}>Recent Change</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatWeight(stats.average)}</Text>
          <Text style={styles.statLabel}>Average</Text>
        </View>
      </View>

      {/* Chart */}
      {bodyWeights.length > 1 && (
        <SimpleLineChart
          data={chartData}
          title="Weight Trend"
          subtitle={`Last ${Math.min(12, bodyWeights.length)} entries`}
          color="#8b5cf6"
          height={200}
        />
      )}

      {/* Weight History */}
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Weight History</Text>
        {bodyWeights.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="scale-outline" size={48} color="#ccc" />
            <Text style={styles.emptyStateText}>No weight entries yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap the + button to add your first entry</Text>
          </View>
        ) : (
          bodyWeights.map(entry => (
            <View key={entry.id} style={styles.historyItem}>
              <View style={styles.historyContent}>
                <View style={styles.historyMain}>
                  <Text style={styles.historyWeight}>{formatWeight(entry.weight)}</Text>
                  <Text style={styles.historyDate}>
                    {new Date(entry.date).toLocaleDateString()}
                  </Text>
                </View>
                {entry.notes && (
                  <Text style={styles.historyNotes}>{entry.notes}</Text>
                )}
              </View>
              <View style={styles.historyActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleEdit(entry)}
                >
                  <Ionicons name="create-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleDelete(entry)}
                >
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Add/Edit Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowAddModal(false);
          setEditingEntry(null);
          setWeight('');
          setNotes('');
          setDate(new Date().toISOString().split('T')[0]);
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingEntry ? 'Edit Weight Entry' : 'Add Weight Entry'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowAddModal(false);
                setEditingEntry(null);
                setWeight('');
                setNotes('');
                setDate(new Date().toISOString().split('T')[0]);
              }}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>
                Weight ({settings?.units === 'kg' ? 'kg' : 'lbs'})
              </Text>
              <TextInput
                style={styles.weightInput}
                value={weight}
                onChangeText={setWeight}
                placeholder="Enter weight"
                keyboardType="decimal-pad"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date</Text>
              <TextInput
                style={styles.dateInput}
                value={date}
                onChangeText={setDate}
                placeholder="YYYY-MM-DD"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.notesInput}
                value={notes}
                onChangeText={setNotes}
                placeholder="Add any notes about this weigh-in..."
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, !weight.trim() && styles.disabledButton]}
              onPress={handleSave}
              disabled={!weight.trim()}
            >
              <Text style={styles.saveButtonText}>
                {editingEntry ? 'Update Entry' : 'Save Entry'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#8b5cf6',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyContent: {
    flex: 1,
  },
  historyMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyWeight: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDate: {
    fontSize: 14,
    color: '#666',
  },
  historyNotes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  historyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  weightInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    textAlign: 'center',
  },
  dateInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default BodyWeightTracker;