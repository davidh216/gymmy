// src/components/workout/WorkoutHistoryList.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WorkoutHistoryList = ({
  workoutHistory,
  expandedWorkouts,
  onToggleWorkoutExpansion,
  onRemoveWorkout,
}) => {
  const recentWorkouts = useMemo(() => {
    return [...workoutHistory]
      .sort(
        (a, b) =>
          new Date(b.date || b.startTime) - new Date(a.date || a.startTime),
      )
      .slice(0, 10);
  }, [workoutHistory]);

  const getRatingColor = rating => {
    if (rating >= 8) return '#4CAF50';
    if (rating >= 6) return '#FFC107';
    if (rating >= 4) return '#FF9800';
    return '#F44336';
  };

  const getShiftColor = (pre, post) => {
    const shift = post - pre;
    if (shift > 0) return '#4CAF50';
    if (shift < 0) return '#F44336';
    return '#666';
  };

  const formatWorkoutDate = workout => {
    const date = new Date(workout.date || workout.startTime);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatWorkoutTime = workout => {
    if (!workout.startTime || !workout.endTime) return '';
    const start = new Date(workout.startTime);
    const end = new Date(workout.endTime);
    const duration = Math.floor((end - start) / 1000 / 60);
    return `${duration} min`;
  };

  const getWorkoutSummary = workout => {
    const totalSets =
      workout.exercises?.reduce((sum, ex) => sum + (ex.sets?.length || 0), 0) ||
      0;

    const totalExercises = workout.exercises?.length || 0;

    return {
      exercises: totalExercises,
      sets: totalSets,
    };
  };

  if (recentWorkouts.length === 0) {
    return (
      <View style={styles.emptyHistoryContainer}>
        <Ionicons name="calendar-outline" size={48} color="#ccc" />
        <Text style={styles.emptyHistoryText}>
          Your workout history will appear here
        </Text>
        <Text style={styles.emptyHistorySubtext}>
          Complete your first workout to get started!
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Recent Workouts</Text>

      <ScrollView style={styles.historyScrollView}>
        {recentWorkouts.map(workout => {
          const isExpanded = expandedWorkouts.has(workout.id);
          const summary = getWorkoutSummary(workout);

          return (
            <View key={workout.id} style={styles.workoutDetailCard}>
              <TouchableOpacity
                style={styles.workoutDetailHeader}
                onPress={() => onToggleWorkoutExpansion(workout.id)}
                activeOpacity={0.7}
              >
                <View style={styles.workoutDetailTitle}>
                  <View
                    style={[
                      styles.workoutDetailDot,
                      {
                        backgroundColor: getRatingColor(
                          workout.ratings?.workoutRating || 5,
                        ),
                      },
                    ]}
                  />
                  <View style={styles.workoutDetailInfo}>
                    <Text style={styles.workoutDetailDate}>
                      {formatWorkoutDate(workout)}
                    </Text>
                    <Text style={styles.workoutDetailTime}>
                      {formatWorkoutTime(workout)}
                    </Text>
                  </View>
                </View>

                <View style={styles.workoutHeaderActions}>
                  <View style={styles.workoutSummaryRow}>
                    <View style={styles.workoutSummaryItem}>
                      <Ionicons name="fitness" size={16} color="#666" />
                      <Text style={styles.workoutSummaryText}>
                        {summary.exercises}
                      </Text>
                    </View>
                    <View style={styles.workoutSummaryItem}>
                      <Ionicons name="list" size={16} color="#666" />
                      <Text style={styles.workoutSummaryText}>
                        {summary.sets}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={e => {
                      e.stopPropagation();
                      onRemoveWorkout(workout.id);
                    }}
                    style={styles.removeWorkoutButton}
                  >
                    <Ionicons name="trash" size={16} color="#FF4444" />
                  </TouchableOpacity>

                  <Ionicons
                    name={isExpanded ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </View>
              </TouchableOpacity>

              {isExpanded && (
                <View style={styles.workoutDetailExpanded}>
                  {/* Ratings */}
                  {workout.ratings && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Ratings</Text>
                      <View style={styles.ratingsGrid}>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>Mood Before</Text>
                          <Text style={styles.ratingValue}>
                            {workout.ratings.beforeMood}/10
                          </Text>
                        </View>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>Mood After</Text>
                          <Text
                            style={[
                              styles.ratingValue,
                              {
                                color: getShiftColor(
                                  workout.ratings.beforeMood,
                                  workout.ratings.afterMood,
                                ),
                              },
                            ]}
                          >
                            {workout.ratings.afterMood}/10
                          </Text>
                        </View>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>Energy Before</Text>
                          <Text style={styles.ratingValue}>
                            {workout.ratings.beforeEnergy}/10
                          </Text>
                        </View>
                        <View style={styles.ratingItem}>
                          <Text style={styles.ratingLabel}>Energy After</Text>
                          <Text
                            style={[
                              styles.ratingValue,
                              {
                                color: getShiftColor(
                                  workout.ratings.beforeEnergy,
                                  workout.ratings.afterEnergy,
                                ),
                              },
                            ]}
                          >
                            {workout.ratings.afterEnergy}/10
                          </Text>
                        </View>
                      </View>
                      <View
                        style={[
                          styles.overallRating,
                          {
                            backgroundColor: getRatingColor(
                              workout.ratings.workoutRating,
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.overallRatingText}>
                          Overall: {workout.ratings.workoutRating}/10
                        </Text>
                      </View>
                    </View>
                  )}

                  {/* Exercises */}
                  {workout.exercises && workout.exercises.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailSectionTitle}>Exercises</Text>
                      {workout.exercises.map((exercise, index) => (
                        <View key={index} style={styles.exerciseDetail}>
                          <Text style={styles.exerciseDetailName}>
                            {exercise.name}
                          </Text>
                          {exercise.cardioData ? (
                            <View style={styles.cardioDetail}>
                              <Text style={styles.cardioDetailText}>
                                Duration: {exercise.cardioData.totalTime} min
                              </Text>
                              <Text style={styles.cardioDetailText}>
                                Distance: {exercise.cardioData.distance} mi
                              </Text>
                              {exercise.cardioData.calories > 0 && (
                                <Text style={styles.cardioDetailText}>
                                  Calories: {exercise.cardioData.calories}
                                </Text>
                              )}
                            </View>
                          ) : (
                            <View style={styles.setsDetail}>
                              {exercise.sets?.map((set, setIndex) => (
                                <Text
                                  key={setIndex}
                                  style={styles.setDetailText}
                                >
                                  Set {setIndex + 1}: {set.weight}lbs x{' '}
                                  {set.reps} reps
                                  {set.completed && ' ✓'}
                                </Text>
                              ))}
                            </View>
                          )}
                          {exercise.notes && (
                            <Text style={styles.notesText}>
                              {exercise.notes}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>
          );
        })}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  historyContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyHistoryText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  emptyHistorySubtext: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  historyScrollView: {
    flex: 1,
  },
  workoutDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  workoutDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  workoutDetailTitle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  workoutDetailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  workoutDetailInfo: {
    flex: 1,
  },
  workoutDetailDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  workoutDetailTime: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  workoutHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 10,
  },
  workoutSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    gap: 16,
    marginHorizontal: 10,
  },
  workoutSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutSummaryText: {
    fontSize: 14,
    color: '#666',
  },
  removeWorkoutButton: {
    padding: 4,
  },
  workoutDetailExpanded: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  ratingItem: {
    flex: 1,
    minWidth: '45%',
  },
  ratingLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  overallRating: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  overallRatingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  exerciseDetail: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  exerciseDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  cardioDetail: {
    gap: 4,
  },
  cardioDetailText: {
    fontSize: 14,
    color: '#666',
  },
  setsDetail: {
    gap: 4,
  },
  setDetailText: {
    fontSize: 14,
    color: '#666',
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 20,
  },
});

export default WorkoutHistoryList;
