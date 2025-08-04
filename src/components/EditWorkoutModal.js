import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

const EditWorkoutModal = ({ 
  visible, 
  workout, 
  onSave, 
  onCancel 
}) => {
  const [editedWorkout, setEditedWorkout] = useState(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [duration, setDuration] = useState(0);
  const [exercises, setExercises] = useState([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (workout) {
      console.log('EditWorkoutModal - useEffect - workout:', workout);
      setEditedWorkout({ ...workout });
      setNotes(workout.notes || '');
      setRating(workout.ratings?.workoutRating || 5);
      
      // Use workoutDate if available, otherwise fall back to startTime
      let workoutDate;
      if (workout.workoutDate) {
        console.log('EditWorkoutModal - useEffect - using workoutDate:', workout.workoutDate);
        // Parse workoutDate (format: YYYY-MM-DD) to create a Date object
        const [year, month, day] = workout.workoutDate.split('-').map(Number);
        workoutDate = new Date(year, month - 1, day); // month is 0-indexed
      } else {
        console.log('EditWorkoutModal - useEffect - using startTime fallback');
        workoutDate = new Date(workout.startTime);
      }
      
      console.log('EditWorkoutModal - Setting selectedDate from workout:', workoutDate);
      setSelectedDate(workoutDate);
      
      // Set start and end times from the workout
      setStartTime(new Date(workout.startTime));
      setEndTime(new Date(workout.endTime));
      
      setExercises(workout.exercises || []);
      
      // Calculate duration in minutes
      const startTime = new Date(workout.startTime);
      const endTime = new Date(workout.endTime);
      const durationMinutes = Math.round((endTime - startTime) / 1000 / 60);
      setDuration(durationMinutes);
    }
  }, [workout]);

  const handleSave = () => {
    if (!editedWorkout) return;

    console.log('EditWorkoutModal - handleSave - selectedDate:', selectedDate);
    console.log('EditWorkoutModal - handleSave - startTime:', startTime);
    console.log('EditWorkoutModal - handleSave - endTime:', endTime);
    console.log('EditWorkoutModal - handleSave - duration:', duration);

    // Create workoutDate in local timezone to avoid timezone issues
    const workoutDate = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
    
    console.log('EditWorkoutModal - handleSave - workoutDate (local):', workoutDate);
    
    // Update the workout with new times but keep workoutDate separate
    const updatedWorkout = {
      ...editedWorkout,
      workoutDate: workoutDate, // Use local date to avoid timezone issues
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      exercises: exercises,
      notes: notes.trim(),
      ratings: {
        ...editedWorkout.ratings,
        workoutRating: rating
      },
      lastModified: new Date().toISOString(),
    };

    console.log('EditWorkoutModal - handleSave - updatedWorkout:', updatedWorkout);
    console.log('EditWorkoutModal - handleSave - updatedWorkout.workoutDate:', updatedWorkout.workoutDate);
    console.log('EditWorkoutModal - handleSave - updatedWorkout.startTime:', updatedWorkout.startTime);
    onSave(updatedWorkout);
  };

  const handleCancel = () => {
    setNotes('');
    setRating(5);
    setSelectedDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setDuration(0);
    setExercises([]);
    onCancel();
  };

  const addExercise = () => {
    const newExercise = {
      id: Date.now(),
      name: '',
      sets: [{
        id: Date.now(),
        reps: '',
        weight: '',
        completed: false,
      }],
      notes: '',
      order: exercises.length,
    };
    setExercises([...exercises, newExercise]);
  };

  const removeExercise = (exerciseId) => {
    Alert.alert(
      'Remove Exercise',
      'Are you sure you want to remove this exercise?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setExercises(prev => prev.filter(ex => ex.id !== exerciseId));
          }
        }
      ]
    );
  };

  const updateExercise = (exerciseId, field, value) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        return { ...exercise, [field]: value };
      }
      return exercise;
    }));
  };

  const addSet = (exerciseId) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const newSet = {
          id: Date.now(),
          reps: '',
          weight: '',
          completed: false,
        };
        return {
          ...exercise,
          sets: [...exercise.sets, newSet],
        };
      }
      return exercise;
    }));
  };

  const removeSet = (exerciseId, setId) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.filter(set => set.id !== setId);
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  };

  const updateSet = (exerciseId, setId, field, value) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map(set => {
          if (set.id === setId) {
            const parsedValue = value === '' ? '' : parseInt(value) || 0;
            return { ...set, [field]: parsedValue };
          }
          return set;
        });
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  };

  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 10; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          style={styles.starContainer}
        >
          <Ionicons
            name={i <= rating ? 'star' : 'star-outline'}
            size={24}
            color={i <= rating ? '#FFD700' : '#ccc'}
          />
        </TouchableOpacity>
      );
    }
    return stars;
  };

  const getRatingText = (rating) => {
    if (rating >= 9) return 'Excellent';
    if (rating >= 7) return 'Great';
    if (rating >= 5) return 'Good';
    if (rating >= 3) return 'Poor';
    return 'Terrible';
  };

  const renderExercise = ({ item: exercise }) => (
    <View style={styles.exerciseContainer}>
      <View style={styles.exerciseHeader}>
        <TextInput
          style={styles.exerciseNameInput}
          value={exercise.name}
          onChangeText={(text) => updateExercise(exercise.id, 'name', text)}
          placeholder="Exercise name"
        />
        <TouchableOpacity
          onPress={() => removeExercise(exercise.id)}
          style={styles.removeButton}
        >
          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {exercise.sets.map((set, setIndex) => (
        <View key={set.id} style={styles.setRow}>
          <Text style={styles.setLabel}>Set {setIndex + 1}</Text>
          <TextInput
            style={styles.setInput}
            value={set.weight.toString()}
            onChangeText={(text) => updateSet(exercise.id, set.id, 'weight', text)}
            placeholder="Weight"
            keyboardType="numeric"
          />
          <TextInput
            style={styles.setInput}
            value={set.reps.toString()}
            onChangeText={(text) => updateSet(exercise.id, set.id, 'reps', text)}
            placeholder="Reps"
            keyboardType="numeric"
          />
          <TouchableOpacity
            onPress={() => removeSet(exercise.id, set.id)}
            style={styles.removeSetButton}
          >
            <Ionicons name="close-circle-outline" size={16} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        onPress={() => addSet(exercise.id)}
        style={styles.addSetButton}
      >
        <Ionicons name="add-circle-outline" size={20} color="#007AFF" />
        <Text style={styles.addSetText}>Add Set</Text>
      </TouchableOpacity>
    </View>
  );

  const handleDateChange = (event, selectedDate) => {
    console.log('EditWorkoutModal - handleDateChange called:', { event, selectedDate });
    setShowDatePicker(false);
    if (selectedDate) {
      console.log('EditWorkoutModal - Setting selectedDate to:', selectedDate);
      setSelectedDate(selectedDate);
    }
  };

  const handleStartTimeChange = (event, selectedTime) => {
    console.log('EditWorkoutModal - handleStartTimeChange called:', { event, selectedTime });
    setShowStartTimePicker(false);
    if (selectedTime) {
      console.log('EditWorkoutModal - Setting startTime to:', selectedTime);
      setStartTime(selectedTime);
      
      // Update duration if end time is set
      if (endTime) {
        const durationMinutes = Math.round((endTime - selectedTime) / 1000 / 60);
        setDuration(Math.max(0, durationMinutes));
      }
    }
  };

  const handleEndTimeChange = (event, selectedTime) => {
    console.log('EditWorkoutModal - handleEndTimeChange called:', { event, selectedTime });
    setShowEndTimePicker(false);
    if (selectedTime) {
      console.log('EditWorkoutModal - Setting endTime to:', selectedTime);
      setEndTime(selectedTime);
      
      // Update duration
      const durationMinutes = Math.round((selectedTime - startTime) / 1000 / 60);
      setDuration(Math.max(0, durationMinutes));
    }
  };

  const handleWebDateChange = (event) => {
    console.log('EditWorkoutModal - Web date change - event.target.value:', event.target.value);
    
    // Parse the date string (YYYY-MM-DD) to avoid timezone issues
    const [year, month, day] = event.target.value.split('-').map(Number);
    const newDate = new Date(year, month - 1, day); // month is 0-indexed
    
    console.log('EditWorkoutModal - Web date change - parsed date components:', { year, month, day });
    console.log('EditWorkoutModal - Web date change - newDate:', newDate);
    console.log('EditWorkoutModal - Web date change - newDate.toISOString():', newDate.toISOString());
    setSelectedDate(newDate);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!workout) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Workout</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Workout Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              {Platform.OS === 'web' ? (
                <input
                  type="date"
                  value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`}
                  onChange={handleWebDateChange}
                  style={{
                    padding: 8,
                    fontSize: 16,
                    borderWidth: 1,
                    borderColor: '#e0e0e0',
                    borderRadius: 8,
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    fontWeight: '600',
                  }}
                />
              ) : (
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(true);
                  }}
                  style={styles.dateButton}
                >
                  <Text style={styles.dateButtonText}>
                    {selectedDate.toLocaleDateString()}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Start Time:</Text>
              <TouchableOpacity
                onPress={() => setShowStartTimePicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  {formatTime(startTime)}
                </Text>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>End Time:</Text>
              <TouchableOpacity
                onPress={() => setShowEndTimePicker(true)}
                style={styles.timeButton}
              >
                <Text style={styles.timeButtonText}>
                  {formatTime(endTime)}
                </Text>
                <Ionicons name="time-outline" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration (minutes):</Text>
              <TextInput
                style={styles.durationInput}
                value={duration.toString()}
                onChangeText={(text) => setDuration(parseInt(text) || 0)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Exercises</Text>
              <TouchableOpacity onPress={addExercise} style={styles.addExerciseButton}>
                <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={exercises}
              renderItem={renderExercise}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rating</Text>
            <View style={styles.ratingContainer}>
              {renderRatingStars()}
            </View>
            <Text style={styles.ratingText}>{getRatingText(rating)}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes about this workout..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {showDatePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            style={{ backgroundColor: 'white' }}
          />
        )}

        {showStartTimePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartTimeChange}
            style={{ backgroundColor: 'white' }}
          />
        )}

        {showEndTimePicker && Platform.OS !== 'web' && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndTimeChange}
            style={{ backgroundColor: 'white' }}
          />
        )}
      </SafeAreaView>
    </Modal>
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
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  saveButton: {
    padding: 8,
  },
  saveButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginRight: 8,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    marginRight: 8,
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    fontSize: 16,
    width: 80,
    textAlign: 'center',
  },
  exerciseContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  exerciseNameInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 6,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setLabel: {
    fontSize: 14,
    color: '#666',
    width: 50,
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    padding: 6,
    fontSize: 14,
    marginHorizontal: 4,
    backgroundColor: '#fff',
  },
  removeSetButton: {
    padding: 4,
  },
  addSetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  addSetText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 4,
  },
  addExerciseButton: {
    padding: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 8,
  },
  starContainer: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    backgroundColor: '#fff',
  },
});

export default EditWorkoutModal; 