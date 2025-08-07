// src/components/workout/ExerciseComponents.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const CardioExercise = ({
  exercise,
  exerciseIndex,
  updateCardioData,
  removeExercise,
  getExerciseHistory,
}) => {
  return (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseNumber}>#{exerciseIndex + 1}</Text>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            console.log('Trashcan pressed for cardio exercise:', exercise.name);
            removeExercise(exercise.id);
          }}
          style={styles.removeButton}
        >
          <Ionicons name="trash" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardioContainer}>
        <View style={styles.cardioRow}>
          <View style={styles.cardioField}>
            <Text style={styles.cardioLabel}>Duration (min)</Text>
            <TextInput
              style={styles.cardioInput}
              value={exercise.cardioData?.totalTime?.toString() || ''}
              onChangeText={value =>
                updateCardioData(exercise.id, 'totalTime', parseInt(value) || 0)
              }
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
          <View style={styles.cardioField}>
            <Text style={styles.cardioLabel}>Distance</Text>
            <TextInput
              style={styles.cardioInput}
              value={exercise.cardioData?.distance?.toString() || ''}
              onChangeText={value =>
                updateCardioData(
                  exercise.id,
                  'distance',
                  parseFloat(value) || 0,
                )
              }
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.cardioRow}>
          <View style={styles.cardioField}>
            <Text style={styles.cardioLabel}>Pace</Text>
            <TextInput
              style={styles.cardioInput}
              value={exercise.cardioData?.pace || ''}
              onChangeText={value =>
                updateCardioData(exercise.id, 'pace', value)
              }
              placeholder="e.g. 8:30/mile"
            />
          </View>
          <View style={styles.cardioField}>
            <Text style={styles.cardioLabel}>Calories</Text>
            <TextInput
              style={styles.cardioInput}
              value={exercise.cardioData?.calories?.toString() || ''}
              onChangeText={value =>
                updateCardioData(exercise.id, 'calories', parseInt(value) || 0)
              }
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Exercise History */}
      {getExerciseHistory(exercise.name).length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Previous Sessions:</Text>
          {getExerciseHistory(exercise.name)
            .slice(0, 3)
            .map((session, index) => (
              <Text key={index} style={styles.historyText}>
                {new Date(session.date).toLocaleDateString()}:{' '}
                {session.totalTime}min, {session.distance}mi
              </Text>
            ))}
        </View>
      )}
    </View>
  );
};

export const WeightExercise = ({
  exercise,
  exerciseIndex,
  addSet,
  removeExercise,
  removeSet,
  updateSet,
  getExerciseHistory,
}) => {
  return (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <View style={styles.exerciseInfo}>
          <Text style={styles.exerciseNumber}>#{exerciseIndex + 1}</Text>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
        </View>
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            onPress={() => addSet(exercise.id)}
            style={styles.actionButton}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => removeExercise(exercise.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color="#FF4444" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Sets */}
      <View style={styles.setsContainer}>
        <View style={styles.setHeader}>
          <Text style={styles.setHeaderText}>Set</Text>
          <Text style={styles.setHeaderText}>Weight (lbs)</Text>
          <Text style={styles.setHeaderText}>Reps</Text>
          <Text style={styles.setHeaderText}>✓</Text>
        </View>

        {exercise.sets.map((set, setIndex) => (
          <View key={set.id} style={styles.setRow}>
            <Text style={styles.setNumber}>{setIndex + 1}</Text>
            <TextInput
              style={styles.setInput}
              value={set.weight}
              onChangeText={value =>
                updateSet(exercise.id, set.id, 'weight', value)
              }
              placeholder="0"
              keyboardType="numeric"
            />
            <TextInput
              style={styles.setInput}
              value={set.reps}
              onChangeText={value =>
                updateSet(exercise.id, set.id, 'reps', value)
              }
              placeholder="0"
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={[
                styles.completedButton,
                set.completed && styles.completedButtonActive,
              ]}
              onPress={() =>
                updateSet(exercise.id, set.id, 'completed', !set.completed)
              }
            >
              <Ionicons
                name={set.completed ? 'checkmark' : 'checkmark'}
                size={16}
                color={set.completed ? '#fff' : '#ccc'}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => removeSet(exercise.id, set.id)}
              style={styles.removeSetButton}
            >
              <Ionicons name="close" size={16} color="#FF4444" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Exercise History */}
      {getExerciseHistory(exercise.name).length > 0 && (
        <View style={styles.historyContainer}>
          <Text style={styles.historyTitle}>Previous Sessions:</Text>
          {getExerciseHistory(exercise.name)
            .slice(0, 3)
            .map((session, index) => (
              <Text key={index} style={styles.historyText}>
                {new Date(session.date).toLocaleDateString()}:{' '}
                {session.bestSet?.weight || 0}lbs x {session.bestSet?.reps || 0}
              </Text>
            ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginRight: 8,
    minWidth: 30,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  removeButton: {
    padding: 4,
  },
  // Cardio specific styles
  cardioContainer: {
    gap: 12,
  },
  cardioRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cardioField: {
    flex: 1,
  },
  cardioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  cardioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  // Weight exercise specific styles
  setsContainer: {
    marginTop: 8,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    marginBottom: 8,
  },
  setHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    gap: 8,
  },
  setNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    width: 30,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 8,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  completedButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedButtonActive: {
    backgroundColor: '#4CAF50',
  },
  removeSetButton: {
    padding: 4,
    marginLeft: 4,
  },
  // History styles
  historyContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  historyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});
