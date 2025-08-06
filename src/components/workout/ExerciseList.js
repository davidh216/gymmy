// src/components/workout/ExerciseList.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ExerciseList = ({
  selectedCategory,
  exerciseCategories,
  onAddExercise,
  isCardioExercise,
}) => {
  const availableExercises = useMemo(() => {
    return selectedCategory ? exerciseCategories[selectedCategory] || [] : [];
  }, [selectedCategory, exerciseCategories]);

  if (!selectedCategory) {
    return (
      <View style={styles.noSelectionContainer}>
        <Text style={styles.noSelectionText}>
          Select a category to view exercises
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.exerciseListContainer}>
      <Text style={styles.sectionTitle}>
        {selectedCategory} Exercises ({availableExercises.length})
      </Text>

      <ScrollView style={styles.exerciseScrollView}>
        <View style={styles.exerciseGrid}>
          {availableExercises.map((exerciseName, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.exerciseButton,
                isCardioExercise(exerciseName) && styles.cardioExerciseButton,
              ]}
              onPress={() => onAddExercise(exerciseName)}
            >
              <Ionicons
                name={isCardioExercise(exerciseName) ? 'heart' : 'barbell'}
                size={20}
                color={isCardioExercise(exerciseName) ? '#FF6B6B' : '#007AFF'}
              />
              <Text
                style={[
                  styles.exerciseButtonText,
                  isCardioExercise(exerciseName) && styles.cardioExerciseText,
                ]}
              >
                {exerciseName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  exerciseListContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  noSelectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSelectionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  exerciseScrollView: {
    flex: 1,
  },
  exerciseGrid: {
    gap: 12,
  },
  exerciseButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardioExerciseButton: {
    borderColor: '#FFE0E0',
    backgroundColor: '#FFFAFA',
  },
  exerciseButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  cardioExerciseText: {
    color: '#CC5500',
  },
});

export default ExerciseList;
