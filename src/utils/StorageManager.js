// src/utils/StorageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  EXERCISE_HISTORY: '@exercise_history',
  ONE_REP_MAXES: '@one_rep_maxes',
  SETTINGS: '@settings',
  USER_STATS: '@user_stats'
};

class StorageManager {
  // Generic storage methods
  static async saveData(key, data) {
    try {
      const jsonData = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      return false;
    }
  }

  static async loadData(key, defaultValue = null) {
    try {
      const jsonData = await AsyncStorage.getItem(key);
      if (jsonData !== null) {
        const data = JSON.parse(jsonData);
        return data;
      }
      return defaultValue;
    } catch (error) {
      console.error(`Error loading data from ${key}:`, error);
      return defaultValue;
    }
  }

  static async removeData(key) {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing data from ${key}:`, error);
      return false;
    }
  }

  // Specific data methods
  static async saveWorkoutHistory(workoutHistory) {
    return await this.saveData(STORAGE_KEYS.WORKOUT_HISTORY, workoutHistory);
  }

  static async loadWorkoutHistory() {
    return await this.loadData(STORAGE_KEYS.WORKOUT_HISTORY, []);
  }

  static async saveExerciseHistory(exerciseHistory) {
    return await this.saveData(STORAGE_KEYS.EXERCISE_HISTORY, exerciseHistory);
  }

  static async loadExerciseHistory() {
    return await this.loadData(STORAGE_KEYS.EXERCISE_HISTORY, {});
  }

  static async saveOneRepMaxes(oneRepMaxes) {
    return await this.saveData(STORAGE_KEYS.ONE_REP_MAXES, oneRepMaxes);
  }

  static async loadOneRepMaxes() {
    return await this.loadData(STORAGE_KEYS.ONE_REP_MAXES, {});
  }

  static async saveSettings(settings) {
    return await this.saveData(STORAGE_KEYS.SETTINGS, settings);
  }

  static async loadSettings() {
    const defaultSettings = {
      units: 'lbs',
      notifications: true,
      darkMode: false,
      autoTimer: true,
      exportFormat: 'JSON'
    };
    return await this.loadData(STORAGE_KEYS.SETTINGS, defaultSettings);
  }

  static async saveUserStats(stats) {
    return await this.saveData(STORAGE_KEYS.USER_STATS, stats);
  }

  static async loadUserStats() {
    const defaultStats = {
      totalWorkouts: 0,
      totalDuration: 0,
      favoriteExercises: [],
      streaks: {
        current: 0,
        best: 0,
        lastWorkout: null
      },
      experience: 0,
      level: 1,
      totalExperience: 0
    };
    return await this.loadData(STORAGE_KEYS.USER_STATS, defaultStats);
  }

  // Data export/import methods
  static async exportAllData() {
    try {
      const exportData = {
        workoutHistory: await this.loadWorkoutHistory(),
        exerciseHistory: await this.loadExerciseHistory(),
        oneRepMaxes: await this.loadOneRepMaxes(),
        settings: await this.loadSettings(),
        userStats: await this.loadUserStats(),
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0'
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  static async importAllData(importData) {
    try {
      if (!importData || typeof importData !== 'object') {
        throw new Error('Invalid import data format');
      }

      // Validate data structure
      const requiredKeys = ['workoutHistory', 'exerciseHistory', 'oneRepMaxes', 'settings', 'userStats'];
      const missingKeys = requiredKeys.filter(key => !(key in importData));
      
      if (missingKeys.length > 0) {
        console.warn('Missing keys in import data:', missingKeys);
      }

      // Import each data type with fallbacks
      await this.saveWorkoutHistory(importData.workoutHistory || []);
      await this.saveExerciseHistory(importData.exerciseHistory || {});
      await this.saveOneRepMaxes(importData.oneRepMaxes || {});
      await this.saveSettings(importData.settings || {});
      await this.saveUserStats(importData.userStats || {});

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Clear all data (for settings screen)
  static async clearAllData() {
    try {
      await Promise.all([
        this.removeData(STORAGE_KEYS.WORKOUT_HISTORY),
        this.removeData(STORAGE_KEYS.EXERCISE_HISTORY),
        this.removeData(STORAGE_KEYS.ONE_REP_MAXES),
        this.removeData(STORAGE_KEYS.SETTINGS),
        this.removeData(STORAGE_KEYS.USER_STATS)
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  // Reset to dummy data with proper format
  static async resetToDummyData() {
    try {
      // Clear existing data
      await this.clearAllData();

      // Generate comprehensive dummy data for May, June, July with ~4 workouts per week
      const generateWorkouts = () => {
        const workouts = [];
        let workoutId = 1;
        
        // May 2025 workouts (4 weeks)
        const mayDates = [
          '2025-05-01', '2025-05-03', '2025-05-06', '2025-05-08', '2025-05-10', '2025-05-13', '2025-05-15', '2025-05-17',
          '2025-05-20', '2025-05-22', '2025-05-24', '2025-05-27', '2025-05-29', '2025-05-31'
        ];
        
        // June 2025 workouts (4 weeks)
        const juneDates = [
          '2025-06-03', '2025-06-05', '2025-06-07', '2025-06-10', '2025-06-12', '2025-06-14', '2025-06-17', '2025-06-19',
          '2025-06-21', '2025-06-24', '2025-06-26', '2025-06-28'
        ];
        
        // July 2025 workouts (4 weeks)
        const julyDates = [
          '2025-07-01', '2025-07-03', '2025-07-05', '2025-07-08', '2025-07-10', '2025-07-12', '2025-07-15', '2025-07-17',
          '2025-07-19', '2025-07-22', '2025-07-24', '2025-07-26', '2025-07-29', '2025-07-31'
        ];
        
        const allDates = [...mayDates, ...juneDates, ...julyDates];
        
        const exerciseTypes = [
          {
            name: 'Bench Press',
            sets: [{ reps: 8, weight: 135 }, { reps: 8, weight: 135 }, { reps: 6, weight: 145 }],
            isCardio: false
          },
          {
            name: 'Squats',
            sets: [{ reps: 10, weight: 185 }, { reps: 10, weight: 185 }, { reps: 8, weight: 195 }],
            isCardio: false
          },
          {
            name: 'Deadlifts',
            sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: 225 }, { reps: 3, weight: 245 }],
            isCardio: false
          },
          {
            name: 'Pull-ups',
            sets: [{ reps: 8, weight: 0 }, { reps: 6, weight: 0 }, { reps: 5, weight: 0 }],
            isCardio: false
          },
          {
            name: 'Running',
            cardioData: { duration: 30, pace: '8:30', calories: 320 },
            isCardio: true
          },
          {
            name: 'Cycling',
            cardioData: { duration: 45, pace: '15mph', calories: 450 },
            isCardio: true
          },
          {
            name: 'Push-ups',
            sets: [{ reps: 15, weight: 0 }, { reps: 12, weight: 0 }, { reps: 10, weight: 0 }],
            isCardio: false
          },
          {
            name: 'Overhead Press',
            sets: [{ reps: 8, weight: 95 }, { reps: 8, weight: 95 }, { reps: 6, weight: 105 }],
            isCardio: false
          }
        ];
        
        allDates.forEach((date, index) => {
          const workout = {
            id: workoutId.toString(),
            startTime: `${date}T12:00:00.000Z`,
            endTime: `${date}T13:30:00.000Z`,
            workoutDate: date,
            duration: 75 + Math.floor(Math.random() * 30), // 75-105 minutes
            exercises: [],
            notes: `Workout ${workoutId} - ${['Great session!', 'Felt strong today.', 'Good form maintained.', 'Pushed through fatigue.', 'Solid progress.'][Math.floor(Math.random() * 5)]}`,
            ratings: {
              workoutRating: 6 + Math.floor(Math.random() * 4), // 6-9
              beforeMood: 5 + Math.floor(Math.random() * 5), // 5-9
              afterMood: 6 + Math.floor(Math.random() * 4), // 6-9
              beforeEnergy: 4 + Math.floor(Math.random() * 5), // 4-8
              afterEnergy: 5 + Math.floor(Math.random() * 4) // 5-8
            },
            lastModified: `${date}T13:30:00.000Z`
          };
          
          // Add 2-4 exercises per workout
          const numExercises = 2 + Math.floor(Math.random() * 3);
          const selectedExercises = [];
          
          for (let i = 0; i < numExercises; i++) {
            const exercise = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
            if (!selectedExercises.includes(exercise.name)) {
              selectedExercises.push(exercise.name);
              workout.exercises.push({
                id: `${workoutId}-${i + 1}`,
                name: exercise.name,
                ...(exercise.isCardio ? { cardioData: exercise.cardioData } : { sets: exercise.sets })
              });
            }
          }
          
          workouts.push(workout);
          workoutId++;
        });
        
        return workouts;
      };
      
      const dummyWorkouts = generateWorkouts();
      await this.saveWorkoutHistory(dummyWorkouts);
      
      // Calculate comprehensive stats
      const totalWorkouts = dummyWorkouts.length;
      const totalDuration = dummyWorkouts.reduce((sum, w) => sum + w.duration, 0);
      const averageRating = dummyWorkouts.reduce((sum, w) => sum + w.ratings.workoutRating, 0) / totalWorkouts;
      
      const dummyStats = {
        totalWorkouts,
        totalDuration,
        averageRating: Math.round(averageRating * 10) / 10,
        currentStreak: 7,
        longestStreak: 12,
        experience: totalWorkouts * 50,
        level: Math.floor(totalWorkouts / 10) + 1,
        totalExperience: totalWorkouts * 50,
      };
      
      await this.saveUserStats(dummyStats);
      
      // Generate comprehensive exercise history
      const exerciseHistory = {};
      const exerciseNames = ['Bench Press', 'Squats', 'Deadlifts', 'Pull-ups', 'Running', 'Cycling', 'Push-ups', 'Overhead Press'];
      
      exerciseNames.forEach(name => {
        const workoutsWithExercise = dummyWorkouts.filter(w => 
          w.exercises.some(e => e.name === name)
        );
        
        if (workoutsWithExercise.length > 0) {
          const latestWorkout = workoutsWithExercise[workoutsWithExercise.length - 1];
          const exercise = latestWorkout.exercises.find(e => e.name === name);
          
          if (exercise.cardioData) {
            exerciseHistory[name] = [{
              date: latestWorkout.workoutDate,
              duration: exercise.cardioData.duration,
              pace: exercise.cardioData.pace,
              calories: exercise.cardioData.calories
            }];
          } else {
            const avgReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0) / exercise.sets.length;
            const avgWeight = exercise.sets.reduce((sum, set) => sum + set.weight, 0) / exercise.sets.length;
            exerciseHistory[name] = [{
              date: latestWorkout.workoutDate,
              reps: Math.round(avgReps),
              weight: Math.round(avgWeight),
              sets: exercise.sets.length
            }];
          }
        }
      });
      
      await this.saveExerciseHistory(exerciseHistory);
      
    } catch (error) {
      console.error('Error resetting to dummy data:', error);
    }
  }
}

export default StorageManager;
