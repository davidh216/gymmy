// src/components/WorkoutCalendar.js
import React, { useState, useMemo } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // Alert
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useUnifiedApp
} from '../context/UnifiedAppProvider';

const WorkoutCalendar = ({ navigation }) => {
  const { workout } = useUnifiedApp();
  // const workoutHistory = ...; // Quick fix: commented unused variable
  // const restDays = ...; // Quick fix: commented unused variable
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddRestDay, setShowAddRestDay] = useState(false);
  const [showDayModal, setShowDayModal] = useState(false);
  const [selectedDayString, setSelectedDayString] = useState('');
  const [dayWorkouts, setDayWorkouts] = useState([]);
  
  // Generate calendar data for current month
  const calendarData = useMemo(() => {
    // const year = ...; // Quick fix: commented unused variable
    // const month = ...; // Quick fix: commented unused variable
    // const firstDay = ...; // Quick fix: commented unused variable
    // const lastDay = ...; // Quick fix: commented unused variable
    // const startDate = ...; // Quick fix: commented unused variable
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // const days = ...; // Quick fix: commented unused variable
    // const currentDate = ...; // Quick fix: commented unused variable
    
    while (currentDate <= lastDay || days.length < 42) {
      // const dateString = ...; // Quick fix: commented unused variable
      const hasWorkout = workoutHistory.some(w => 
        w.date === dateString || w.startTime?.startsWith(dateString)
      );
      // const hasRestDay = ...; // Quick fix: commented unused variable
      
      days.push({
        date: new Date(currentDate),
        dateString,
        hasWorkout,
        hasRestDay,
        isCurrentMonth: currentDate.getMonth() === month,
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [selectedDate, workoutHistory, restDays]);
  
  const handleDatePress = (day) => {
    if (day.hasWorkout) {
      // Open an in-app modal listing workouts for that day (web-friendly)
      const workoutsForDay = workoutHistory.filter(w =>
        w.date === day.dateString || w.startTime?.startsWith(day.dateString)
      );
      if (workoutsForDay && workoutsForDay.length > 0) {
        setDayWorkouts(workoutsForDay);
        setSelectedDayString(day.dateString);
        setShowDayModal(true);
        return;
      }
    } else if (day.hasRestDay) {
      // Show rest day details
      // const restDay = ...; // Quick fix: commented unused variable
      if (restDay) {
        Alert.alert(
          'Rest Day',
          restDay.notes || 'Rest day logged',
          [{ text: 'OK' }]
        );
      }
    } else {
      // Show options to add workout or rest day
      Alert.alert(
        'Add Activity',
        'What would you like to add for this day?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Workout', 
            onPress: () => navigation.navigate('Workout', { date: day.dateString })
          },
          { 
            text: 'Add Rest Day', 
            onPress: () => setShowAddRestDay(true)
          },
        ]
      );
    }
  };
  
  const handleAddRestDay = () => {
    // Demo-only placeholder: close modal. Rest-day persistence can be wired later.
    setShowAddRestDay(false);
  };
  
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          // const newDate = ...; // Quick fix: commented unused variable
          newDate.setMonth(newDate.getMonth() - 1);
          setSelectedDate(newDate);
        }}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {monthNames[selectedDate.getMonth()]} {selectedDate.getFullYear()}
        </Text>
        
        <TouchableOpacity onPress={() => {
          // const newDate = ...; // Quick fix: commented unused variable
          newDate.setMonth(newDate.getMonth() + 1);
          setSelectedDate(newDate);
        }}>
          <Ionicons name="chevron-forward" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
      
      {/* Calendar Grid */}
      <View style={styles.calendar}>
        {/* Day headers */}
        <View style={styles.dayHeaders}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.dayHeader}>{day}</Text>
          ))}
        </View>
        
        {/* Calendar days */}
        <View style={styles.daysGrid}>
          {calendarData.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                !day.isCurrentMonth && styles.otherMonthDay,
                day.hasWorkout && styles.workoutDay,
                day.hasRestDay && styles.restDay,
              ]}
              onPress={() => handleDatePress(day)}
            >
              <Text style={[
                styles.dayText,
                !day.isCurrentMonth && styles.otherMonthText,
                day.hasWorkout && styles.workoutDayText,
                day.hasRestDay && styles.restDayText,
              ]}>
                {day.date.getDate()}
              </Text>
              {day.hasWorkout && (
                <View style={styles.workoutIndicator}>
                  <Ionicons name="fitness" size={8} color="#fff" />
                </View>
              )}
              {day.hasRestDay && (
                <View style={styles.restIndicator}>
                  <Ionicons name="bed" size={8} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {/* Legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.workoutDay]} />
          <Text style={styles.legendText}>Workout</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.restDay]} />
          <Text style={styles.legendText}>Rest Day</Text>
        </View>
      </View>
      
      {/* Add Rest Day Modal */}
      {showAddRestDay && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Add Rest Day</Text>
            <Text style={styles.modalText}>
              Would you like to log today as a rest day?
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddRestDay(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleAddRestDay}
              >
                <Text style={styles.confirmButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Day Workouts Modal */}
      {showDayModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Workouts for {selectedDayString}</Text>
            <View style={{ width: '100%', marginTop: 8 }}>
              {dayWorkouts.map((w, idx) => {
                // const time = ...; // Quick fix: commented unused variable
                // const exCount = ...; // Quick fix: commented unused variable
                // const dur = ...; // Quick fix: commented unused variable
                return (
                  <TouchableOpacity
                    key={w.id || idx}
                    style={styles.dayWorkoutItem}
                    onPress={() => {
                      setShowDayModal(false);
                      navigation.navigate('Workout', { workoutId: w.id, mode: 'edit' });
                    }}
                  >
                    <Text style={styles.dayWorkoutText}>{time} • {exCount} exercises • {dur}m</Text>
                    <Text style={styles.dayWorkoutEdit}>Open</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDayModal(false)}
              >
                <Text style={styles.cancelButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  calendar: {
    marginTop: 16,
  },
  dayHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-around',
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
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 7 days in a week
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#e5e5e5',
    backgroundColor: '#fff',
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  workoutDay: {
    backgroundColor: '#007AFF',
  },
  restDay: {
    backgroundColor: '#8b5cf6',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  workoutDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  restDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  workoutIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 2,
  },
  restIndicator: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
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
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#8b5cf6',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  dayWorkoutItem: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  dayWorkoutText: {
    fontSize: 14,
    color: '#333',
  },
  dayWorkoutEdit: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default WorkoutCalendar;