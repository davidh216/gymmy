// src/components/workout/ActiveWorkout.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CardioExercise, WeightExercise } from './ExerciseComponents';

const ActiveWorkout = ({
  currentWorkout,
  exercises,
  onFinishWorkout,
  onSaveAsTemplate,
  isCardioExercise,
  // Exercise component props
  updateCardioData,
  removeExercise,
  getExerciseHistory,
  addSet,
  removeSet,
  updateSet,
}) => {
  const getWorkoutDuration = () => {
    if (!currentWorkout?.startTime) return '0:00';
    const now = new Date();
    const duration = Math.floor(
      (now - new Date(currentWorkout.startTime)) / 1000 / 60,
    );
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    return hours > 0
      ? `${hours}:${minutes.toString().padStart(2, '0')}`
      : `${minutes}:00`;
  };

  const getTotalSetsCompleted = () => {
    return exercises.reduce((total, exercise) => {
      if (exercise.sets) {
        return total + exercise.sets.filter(set => set.completed).length;
      }
      return total;
    }, 0);
  };

  const getTotalExercises = () => exercises.length;

  return (
    <View style={styles.activeWorkoutContainer}>
      {/* Workout Header */}
      <View style={styles.workoutHeader}>
        <View style={styles.workoutInfo}>
          <Text style={styles.workoutTitle}>Active Workout</Text>
          <Text style={styles.workoutDuration}>
            Duration: {getWorkoutDuration()}
          </Text>
          <View style={styles.workoutStats}>
            <Text style={styles.workoutStat}>
              {getTotalExercises()} exercises
            </Text>
            <Text style={styles.workoutStat}>
              {getTotalSetsCompleted()} sets completed
            </Text>
          </View>
        </View>

        <View style={styles.workoutActions}>
          <TouchableOpacity
            style={styles.saveTemplateButton}
            onPress={onSaveAsTemplate}
          >
            <Ionicons name="bookmark" size={20} color="#666" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.finishButton}
            onPress={onFinishWorkout}
          >
            <Ionicons name="checkmark" size={20} color="#fff" />
            <Text style={styles.finishButtonText}>Finish</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Exercises */}
      <ScrollView style={styles.exercisesContainer}>
        {exercises.length === 0 ? (
          <View style={styles.noExercisesContainer}>
            <Ionicons name="fitness-outline" size={48} color="#ccc" />
            <Text style={styles.noExercisesText}>
              Add exercises to your workout using the categories above
            </Text>
          </View>
        ) : (
          exercises.map((exercise, index) => {
            if (isCardioExercise(exercise.name)) {
              return (
                <CardioExercise
                  key={exercise.id}
                  exercise={exercise}
                  exerciseIndex={index}
                  updateCardioData={updateCardioData}
                  removeExercise={removeExercise}
                  getExerciseHistory={getExerciseHistory}
                />
              );
            } else {
              return (
                <WeightExercise
                  key={exercise.id}
                  exercise={exercise}
                  exerciseIndex={index}
                  addSet={addSet}
                  removeExercise={removeExercise}
                  removeSet={removeSet}
                  updateSet={updateSet}
                  getExerciseHistory={getExerciseHistory}
                />
              );
            }
          })
        )}

        {/* Bottom padding for scroll */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activeWorkoutContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  workoutHeader: {
    backgroundColor: '#fff',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  workoutDuration: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  workoutStats: {
    flexDirection: 'row',
    gap: 16,
  },
  workoutStat: {
    fontSize: 14,
    color: '#666',
  },
  workoutActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  saveTemplateButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  finishButton: {
    backgroundColor: '#28A745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exercisesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  noExercisesContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noExercisesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 40,
  },
  bottomPadding: {
    height: 100,
  },
});

export default ActiveWorkout;
