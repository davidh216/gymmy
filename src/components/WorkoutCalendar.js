// src/components/WorkoutCalendar.js
import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EditWorkoutModal from './EditWorkoutModal';
import { useApp } from '../context/AppContext';

const WorkoutCalendar = ({ workoutHistory, onWorkoutPress, navigation, onMonthChange, selectedMonth }) => {
  const { restDays, addRestDay, removeRestDay, updateRestDay } = useApp();
  const [currentDate, setCurrentDate] = useState(selectedMonth || new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [showDateModal, setShowDateModal] = useState(false);
  const [expandedWorkouts, setExpandedWorkouts] = useState(new Set());
  const [showRestDayModal, setShowRestDayModal] = useState(false);
  const [restDayNotes, setRestDayNotes] = useState('');
  const [selectedRestDay, setSelectedRestDay] = useState(null);
  
  // Edit workout states
  const [showEditModal, setShowEditModal] = useState(false);
  const [workoutToEdit, setWorkoutToEdit] = useState(null);

  // Update currentDate when selectedMonth prop changes
  React.useEffect(() => {
    if (selectedMonth) {
      setCurrentDate(selectedMonth);
    }
  }, [selectedMonth]);

  // Get workout rating colors
  const getRatingColor = (rating) => {
    if (rating >= 9) return '#22c55e'; // Bright green - Excellent
    if (rating >= 7) return '#84cc16'; // Light green - Great
    if (rating >= 5) return '#eab308'; // Yellow - Good
    if (rating >= 3) return '#f97316'; // Orange - Poor
    return '#ef4444'; // Red - Terrible
  };

  // Get workout rating text
  const getRatingText = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Great';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Poor';
    return 'Terrible';
  };

  // Helper function to create date key from workout date
  const createDateKey = (workout) => {
    // Use workoutDate if available, otherwise fall back to startTime
    if (workout.workoutDate) {
      console.log('WorkoutCalendar - createDateKey - using workoutDate:', workout.workoutDate, 'for workout:', workout.id);
      return workout.workoutDate;
    }
    
    // Fallback for old workouts without workoutDate
    // Use UTC components to avoid timezone issues with UTC midnight timestamps
    const date = new Date(workout.startTime);
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Add 1 and pad with 0
    const day = String(date.getUTCDate()).padStart(2, '0'); // Pad with 0
    const dateKey = `${year}-${month}-${day}`;
    
    console.log('WorkoutCalendar - createDateKey - using startTime fallback:', dateKey, 'for workout:', workout.id);
    return dateKey;
  };

  // Generate workouts by date map
  const workoutsByDate = useMemo(() => {
    console.log('WorkoutCalendar - workoutsByDate useMemo - workoutHistory length:', workoutHistory.length);
    console.log('WorkoutCalendar - workoutsByDate useMemo - workoutHistory:', workoutHistory);
    
    const map = {};
    workoutHistory.forEach(workout => {
      const dateKey = createDateKey(workout);
      
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(workout);
    });
    
    console.log('WorkoutCalendar - workoutsByDate useMemo - map:', map);
    return map;
  }, [workoutHistory]);

  // Generate rest days by date map
  const restDaysByDate = useMemo(() => {
    const map = {};
    restDays.forEach(restDay => {
      map[restDay.date] = restDay;
    });
    return map;
  }, [restDays]);

  // Calendar generation
  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay())); // End on Saturday
    
    const weeks = [];
    const currentWeekDate = new Date(startDate);
    
    while (currentWeekDate <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekDate);
        const dateKey = date.toISOString().split('T')[0]; // Use YYYY-MM-DD format
        const dayWorkouts = workoutsByDate[dateKey] || [];
        const restDay = restDaysByDate[dateKey];
        
        week.push({
          date: new Date(date),
          workouts: dayWorkouts,
          restDay: restDay,
          isCurrentMonth: date.getMonth() === month,
          isToday: 
            date.getDate() === new Date().getDate() &&
            date.getMonth() === new Date().getMonth() &&
            date.getFullYear() === new Date().getFullYear(),
        });
        
        currentWeekDate.setDate(currentWeekDate.getDate() + 1);
      }
      weeks.push(week);
    }
    
    return weeks;
  };

  const calendar = generateCalendar();

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(newDate);
    // Notify parent component about month change
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(newDate);
    // Notify parent component about month change
    if (onMonthChange) {
      onMonthChange(newDate);
    }
  };

  const openDateDetail = (date, workouts, restDay) => {
    setSelectedDate(date);
    setSelectedWorkouts(workouts);
    setSelectedRestDay(restDay);
    setShowDateModal(true);
    
    // Auto-expand if only one workout, collapse if multiple
    if (workouts.length === 1) {
      setExpandedWorkouts(new Set([workouts[0].id]));
    } else {
      setExpandedWorkouts(new Set()); // Start collapsed for multiple workouts
    }
  };

  const toggleWorkoutExpansion = (workoutId) => {
    const newExpanded = new Set(expandedWorkouts);
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId);
    } else {
      newExpanded.add(workoutId);
    }
    setExpandedWorkouts(newExpanded);
  };

  const openEditModal = (workout) => {
    setWorkoutToEdit(workout);
    setShowEditModal(true);
    setShowDateModal(false); // Close date modal if open
  };

  const handleSaveWorkout = async (editedWorkout) => {
    // This will be handled by the parent component (Dashboard)
    if (onWorkoutPress) {
      await onWorkoutPress(editedWorkout, 'update');
    }
    setShowEditModal(false);
    setWorkoutToEdit(null);
  };

  const handleAddRestDay = async () => {
    if (selectedDate) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      await addRestDay(dateKey, restDayNotes, false);
      setRestDayNotes('');
      setShowRestDayModal(false);
      setShowDateModal(false);
    }
  };

  const handleRemoveRestDay = async (date) => {
    Alert.alert(
      'Remove Rest Day',
      'Are you sure you want to remove this rest day?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeRestDay(date);
            setSelectedRestDay(null);
          }
        }
      ]
    );
  };

  const formatDateForDisplay = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderRestDayModal = () => (
    <Modal
      visible={showRestDayModal}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Rest Day</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowRestDayModal(false);
                setRestDayNotes('');
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.restDayDate}>
            {selectedDate && formatDateForDisplay(selectedDate)}
          </Text>
          
          <Text style={styles.inputLabel}>Notes (Optional)</Text>
          <TextInput
            style={styles.restDayInput}
            value={restDayNotes}
            onChangeText={setRestDayNotes}
            placeholder="e.g., Active recovery, yoga, stretching..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
          
          <TouchableOpacity
            style={styles.modalButton}
            onPress={handleAddRestDay}
          >
            <Text style={styles.modalButtonText}>Add Rest Day</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderDateModal = () => (
    <Modal
      visible={showDateModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedDate && formatDateForDisplay(selectedDate)}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowDateModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {selectedRestDay && (
                <View style={styles.restDayCard}>
                  <View style={styles.restDayHeader}>
                    <View style={styles.restDayInfo}>
                      <Ionicons name="bed" size={24} color="#8b5cf6" />
                      <Text style={styles.restDayTitle}>Rest Day</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleRemoveRestDay(selectedRestDay.date)}
                      style={styles.removeRestDayButton}
                    >
                      <Ionicons name="trash-outline" size={18} color="#ff4444" />
                    </TouchableOpacity>
                  </View>
                  {selectedRestDay.notes && (
                    <Text style={styles.restDayNotes}>{selectedRestDay.notes}</Text>
                  )}
                </View>
              )}
              
              {selectedWorkouts.length > 0 ? (
                <>
                  <Text style={styles.workoutsCount}>
                    {selectedWorkouts.length} workout{selectedWorkouts.length !== 1 ? 's' : ''} on this day
                  </Text>
                  {selectedWorkouts.map((workout, index) => {
                    const isExpanded = expandedWorkouts.has(workout.id);
                    return (
                      <View key={workout.id} style={styles.workoutDetailCard}>
                        <TouchableOpacity
                          style={styles.workoutDetailHeader}
                          onPress={() => toggleWorkoutExpansion(workout.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.workoutDetailTitle}>
                            <View style={[
                              styles.workoutDetailDot,
                              { backgroundColor: getRatingColor(workout.ratings?.workoutRating || 5) }
                            ]} />
                            <Text style={styles.workoutDetailName}>
                              Workout #{index + 1}
                            </Text>
                            <Text style={styles.workoutDetailTime}>
                              {new Date(workout.startTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })} - {new Date(workout.endTime).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </Text>
                          </View>
                          <View style={styles.workoutHeaderActions}>
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation();
                                openEditModal(workout);
                              }}
                              style={styles.editButton}
                            >
                              <Ionicons name="create" size={18} color="#007AFF" />
                            </TouchableOpacity>
                            <Ionicons 
                              name={isExpanded ? "chevron-up" : "chevron-down"} 
                              size={20} 
                              color="#666" 
                            />
                          </View>
                        </TouchableOpacity>

                        <View style={styles.workoutSummaryRow}>
                          <View style={styles.workoutSummaryItem}>
                            <Ionicons name="time" size={16} color="#666" />
                            <Text style={styles.workoutSummaryText}>{workout.duration} min</Text>
                          </View>
                          <View style={styles.workoutSummaryItem}>
                            <Ionicons name="fitness" size={16} color="#666" />
                            <Text style={styles.workoutSummaryText}>
                              {workout.exercises.length} exercises
                            </Text>
                          </View>
                          <View style={styles.workoutSummaryItem}>
                            <Ionicons name="star" size={16} color="#666" />
                            <Text style={[
                              styles.workoutSummaryText,
                              { color: getRatingColor(workout.ratings?.workoutRating || 5) }
                            ]}>
                              {workout.ratings?.workoutRating || 5}/10
                            </Text>
                          </View>
                        </View>

                        {isExpanded && (
                          <View style={styles.workoutDetailExpanded}>
                            {/* Ratings Section */}
                            <View style={styles.detailSection}>
                              <Text style={styles.detailSectionTitle}>Ratings</Text>
                              <View style={styles.ratingsGrid}>
                                <View style={styles.ratingItem}>
                                  <Text style={styles.ratingLabel}>Pre-Mood</Text>
                                  <Text style={styles.ratingValue}>{workout.ratings?.beforeMood || 5}/10</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                  <Text style={styles.ratingLabel}>Pre-Energy</Text>
                                  <Text style={styles.ratingValue}>{workout.ratings?.beforeEnergy || 5}/10</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                  <Text style={styles.ratingLabel}>Post-Mood</Text>
                                  <Text style={styles.ratingValue}>{workout.ratings?.afterMood || 5}/10</Text>
                                </View>
                                <View style={styles.ratingItem}>
                                  <Text style={styles.ratingLabel}>Post-Energy</Text>
                                  <Text style={styles.ratingValue}>{workout.ratings?.afterEnergy || 5}/10</Text>
                                </View>
                              </View>
                              <View style={[styles.overallRating, { backgroundColor: getRatingColor(workout.ratings?.workoutRating || 5) }]}>
                                <Text style={styles.overallRatingText}>
                                  Overall: {workout.ratings?.workoutRating || 5}/10 - {getRatingText(workout.ratings?.workoutRating || 5)}
                                </Text>
                              </View>
                            </View>

                            {/* Exercises Section */}
                            <View style={styles.detailSection}>
                              <Text style={styles.detailSectionTitle}>Exercises ({workout.exercises.length})</Text>
                              {workout.exercises.map((exercise, exerciseIndex) => (
                                <View key={exercise.id} style={styles.exerciseDetailItem}>
                                  <Text style={styles.exerciseDetailName}>
                                    {exerciseIndex + 1}. {exercise.name}
                                  </Text>
                                  <Text style={styles.exerciseDetailSets}>
                                    {exercise.sets.filter(set => set.reps && set.weight).length} sets
                                  </Text>
                                  <View style={styles.setsDetailContainer}>
                                    {exercise.sets
                                      .filter(set => set.reps && set.weight)
                                      .map((set, setIndex) => (
                                        <Text key={setIndex} style={styles.setDetailText}>
                                          {set.reps} reps × {set.weight} lbs
                                        </Text>
                                      ))}
                                  </View>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    );
                  })}
                </>
              ) : !selectedRestDay ? (
                <View style={styles.noWorkoutsContainer}>
                  <Ionicons name="calendar-outline" size={48} color="#ccc" />
                  <Text style={styles.noWorkoutsTitle}>No workouts on this day</Text>
                  <Text style={styles.noWorkoutsSubtitle}>
                    {selectedDate && selectedDate.toDateString() === new Date().toDateString() 
                      ? "Ready to start your workout for today?"
                      : "This was a rest day or you hadn't started tracking yet."
                    }
                  </Text>
                  {selectedDate && selectedDate.toDateString() === new Date().toDateString() && (
                    <TouchableOpacity 
                      style={styles.startTodayButton}
                      onPress={() => {
                        setShowDateModal(false);
                        if (navigation) {
                          navigation.navigate('Workout');
                        }
                      }}
                    >
                      <Ionicons name="add" size={20} color="#fff" />
                      <Text style={styles.startTodayButtonText}>Start Today's Workout</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.addRestDayButton}
                    onPress={() => setShowRestDayModal(true)}
                  >
                    <Ionicons name="bed" size={20} color="#8b5cf6" />
                    <Text style={styles.addRestDayButtonText}>Mark as Rest Day</Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.navButton}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        
        <TouchableOpacity onPress={goToNextMonth} style={styles.navButton}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Days of Week Header */}
      <View style={styles.daysHeader}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Text key={day} style={styles.dayHeader}>{day}</Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarContainer}>
        {calendar.map((week, weekIndex) => (
          <View key={weekIndex} style={styles.week}>
            {week.map((day, dayIndex) => (
              <TouchableOpacity 
                key={dayIndex} 
                style={[
                  styles.day,
                  !day.isCurrentMonth && styles.otherMonth,
                  day.isToday && styles.today,
                  day.restDay && styles.restDayCell
                ]}
                onPress={() => openDateDetail(day.date, day.workouts, day.restDay)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayNumber,
                  !day.isCurrentMonth && styles.otherMonthText,
                  day.isToday && styles.todayText
                ]}>
                  {day.date.getDate()}
                </Text>
                
                {/* Rest Day Indicator */}
                {day.restDay && (
                  <View style={styles.restDayIndicator}>
                    <Ionicons name="bed" size={12} color="#8b5cf6" />
                  </View>
                )}
                
                {/* Workout Indicators */}
                {day.workouts.length > 0 && (
                  <View style={styles.workoutIndicators}>
                    {day.workouts.slice(0, 3).map((workout, workoutIndex) => (
                      <View
                        key={workout.id}
                        style={[
                          styles.workoutDot,
                          { backgroundColor: getRatingColor(workout.ratings?.workoutRating || 5) }
                        ]}
                      />
                    ))}
                    {day.workouts.length > 3 && (
                      <Text style={styles.moreWorkouts}>+{day.workouts.length - 3}</Text>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Legend:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <Ionicons name="bed" size={16} color="#8b5cf6" />
            <Text style={styles.legendText}>Rest Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#22c55e' }]} />
            <Text style={styles.legendText}>Great (7+)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#eab308' }]} />
            <Text style={styles.legendText}>Good (5-6)</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>Poor (&lt;5)</Text>
          </View>
        </View>
      </View>

      {renderDateModal()}
      {renderRestDayModal()}
      
      <EditWorkoutModal
        visible={showEditModal}
        workout={workoutToEdit}
        onCancel={() => {
          setShowEditModal(false);
          setWorkoutToEdit(null);
        }}
        onSave={handleSaveWorkout}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    paddingBottom: 8,
  },
  calendarContainer: {
    maxHeight: 400,
  },
  week: {
    flexDirection: 'row',
  },
  day: {
    flex: 1,
    minHeight: 60,
    padding: 4,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  otherMonth: {
    opacity: 0.3,
  },
  today: {
    backgroundColor: '#e3f2fd',
  },
  restDayCell: {
    backgroundColor: '#f3e8ff',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  otherMonthText: {
    color: '#999',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  restDayIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  workoutIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 4,
  },
  workoutDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 1,
  },
  moreWorkouts: {
    fontSize: 10,
    color: '#666',
    marginLeft: 2,
  },
  legend: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: '#666',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingTop: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalButton: {
    backgroundColor: '#8b5cf6',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Rest Day Styles
  restDayCard: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  restDayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  restDayInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  restDayTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8b5cf6',
  },
  restDayNotes: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  removeRestDayButton: {
    padding: 4,
  },
  restDayDate: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  restDayInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  addRestDayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3e8ff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    marginTop: 16,
  },
  addRestDayButtonText: {
    color: '#8b5cf6',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Date Modal Styles
  workoutsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  workoutDetailCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    overflow: 'hidden',
  },
  workoutDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  workoutDetailTitle: {
    flex: 1,
  },
  workoutHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 4,
  },
  workoutDetailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  workoutDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  workoutDetailTime: {
    fontSize: 14,
    color: '#666',
  },
  workoutSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#fff',
  },
  workoutSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  workoutSummaryText: {
    fontSize: 12,
    color: '#666',
  },
  workoutDetailExpanded: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
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
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  ratingValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  overallRating: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  overallRatingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  exerciseDetailItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  exerciseDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  exerciseDetailSets: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  setsDetailContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  setDetailText: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  noWorkoutsContainer: {
    alignItems: 'center',
    padding: 40,
  },
  noWorkoutsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noWorkoutsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startTodayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  startTodayButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutCalendar;