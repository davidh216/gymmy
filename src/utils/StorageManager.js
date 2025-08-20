// src/utils/StorageManager.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  WORKOUT_HISTORY: '@workout_history',
  EXERCISE_HISTORY: '@exercise_history',
  ONE_REP_MAXES: '@one_rep_maxes',
  SETTINGS: '@settings',
  USER_STATS: '@user_stats',
  WORKOUT_TEMPLATES: '@workout_templates',
  REST_DAYS: '@rest_days',
  BODY_WEIGHTS: '@body_weights',
  // Gacha and character system keys
  CHARACTER_COLLECTION: '@character_collection',
  SOCIAL_POSTS: '@social_posts',
  USER_CURRENCIES: '@user_currencies',
  DAILY_BONUSES: '@daily_bonuses',
  ENHANCED_GACHA_STATE: '@enhanced_gacha_state',
  // Segmentation system keys
  SEGMENT_PROFILE: '@segment_profile',
  SURVEY_HISTORY: '@survey_history',
  PERSONALIZED_GOALS: '@personalized_goals',
  SEGMENT_PREFERENCES: '@segment_preferences',
  SEGMENT_METRICS: '@segment_metrics',
  ADAPTIVE_SETTINGS: '@adaptive_settings',
  ONBOARDING_STATUS: '@onboarding_status',
  // Achievement and quest system keys
  ACHIEVEMENTS: '@achievements',
  QUESTS: '@quests',
  // Backup keys for demo mode
  BACKUP_WORKOUT_HISTORY: '@backup_workout_history',
  BACKUP_EXERCISE_HISTORY: '@backup_exercise_history',
  BACKUP_ONE_REP_MAXES: '@backup_one_rep_maxes',
  BACKUP_USER_STATS: '@backup_user_stats',
  BACKUP_WORKOUT_TEMPLATES: '@backup_workout_templates',
  BACKUP_REST_DAYS: '@backup_rest_days',
  BACKUP_BODY_WEIGHTS: '@backup_body_weights',
};

class StorageManager {
  // Generic storage methods
  static async saveData(key, data) {
    try {
      // const jsonData = ...; // Quick fix: commented unused variable
      await AsyncStorage.setItem(key, jsonData);
      return true;
    } catch (error) {
      console.error(`Error saving data to ${key}:`, error);
      return false;
    }
  }

  static async loadData(key, defaultValue = null) {
    try {
      // const jsonData = ...; // Quick fix: commented unused variable
      if (jsonData !== null) {
        // const data = ...; // Quick fix: commented unused variable
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
      exportFormat: 'JSON',
      demoMode: false,
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
        lastWorkout: null,
      },
      experience: 0,
      level: 1,
      totalExperience: 0,
      avgWorkoutsPerWeek: 0,
      avgRating: 0,
      // NEW CLASS SYSTEM PROPERTIES
      selectedClass: null,
      classLevel: 1,
      classXP: 0,
      skillPoints: 0,
      unlockedSkills: [],
      classSelectionDate: null,
      classPrestige: 0,
    };
    return await this.loadData(STORAGE_KEYS.USER_STATS, defaultStats);
  }

  // New methods for workout templates
  static async saveWorkoutTemplates(templates) {
    return await this.saveData(STORAGE_KEYS.WORKOUT_TEMPLATES, templates);
  }

  static async loadWorkoutTemplates() {
    return await this.loadData(STORAGE_KEYS.WORKOUT_TEMPLATES, []);
  }

  // New methods for rest days
  static async saveRestDays(restDays) {
    return await this.saveData(STORAGE_KEYS.REST_DAYS, restDays);
  }

  static async loadRestDays() {
    return await this.loadData(STORAGE_KEYS.REST_DAYS, []);
  }

  // New methods for body weights
  static async saveBodyWeights(bodyWeights) {
    return await this.saveData(STORAGE_KEYS.BODY_WEIGHTS, bodyWeights);
  }

  static async loadBodyWeights() {
    return await this.loadData(STORAGE_KEYS.BODY_WEIGHTS, []);
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
        workoutTemplates: await this.loadWorkoutTemplates(),
        restDays: await this.loadRestDays(),
        bodyWeights: await this.loadBodyWeights(),
        exportDate: new Date().toISOString(),
        appVersion: '1.0.0',
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
      // const requiredKeys = ...; // Quick fix: commented unused variable
      // const missingKeys = ...; // Quick fix: commented unused variable
      
      if (missingKeys.length > 0) {
        console.warn('Missing keys in import data:', missingKeys);
      }

      // Import each data type with fallbacks
      await this.saveWorkoutHistory(importData.workoutHistory || []);
      await this.saveExerciseHistory(importData.exerciseHistory || {});
      await this.saveOneRepMaxes(importData.oneRepMaxes || {});
      await this.saveSettings(importData.settings || {});
      await this.saveUserStats(importData.userStats || {});
      await this.saveWorkoutTemplates(importData.workoutTemplates || []);
      await this.saveRestDays(importData.restDays || []);
      await this.saveBodyWeights(importData.bodyWeights || []);

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
        this.removeData(STORAGE_KEYS.USER_STATS),
        this.removeData(STORAGE_KEYS.WORKOUT_TEMPLATES),
        this.removeData(STORAGE_KEYS.REST_DAYS),
        this.removeData(STORAGE_KEYS.BODY_WEIGHTS),
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

      // Base workout templates for new users
      const baseTemplates = [
        {
          id: 'template_beginner_full_body',
          name: 'Beginner Full Body',
          description: 'Complete full body workout for beginners. Focus on form and building strength.',
          exercises: [
            { name: 'Bench Press', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Barbell Squat', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Lat Pulldown (Wide-grip)', sets: 3, targetReps: 10, targetWeight: 0 },
            { name: 'Standing Barbell Shoulder Press', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Standing Barbell Bicep Curl', sets: 3, targetReps: 10, targetWeight: 0 },
            { name: 'Tricep Pushdowns', sets: 3, targetReps: 12, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_push_pull_legs',
          name: 'Push Pull Legs',
          description: 'Classic PPL split for intermediate lifters. 3-day rotation.',
          exercises: [
            { name: 'Bench Press', sets: 4, targetReps: 6, targetWeight: 0 },
            { name: 'Incline Bench Press', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Standing Barbell Shoulder Press', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Lateral Raise', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Tricep Pushdowns', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Skullcrushers', sets: 3, targetReps: 10, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_upper_lower',
          name: 'Upper Lower Split',
          description: '4-day split alternating upper and lower body workouts.',
          exercises: [
            { name: 'Bench Press', sets: 4, targetReps: 6, targetWeight: 0 },
            { name: 'Lat Pulldown (Wide-grip)', sets: 4, targetReps: 8, targetWeight: 0 },
            { name: 'Upright Barbell Row', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Standing Barbell Shoulder Press', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Standing Barbell Bicep Curl', sets: 3, targetReps: 10, targetWeight: 0 },
            { name: 'Tricep Dips', sets: 3, targetReps: 10, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_chest_back',
          name: 'Chest & Back',
          description: 'Focus on major pushing and pulling movements.',
          exercises: [
            { name: 'Bench Press', sets: 4, targetReps: 6, targetWeight: 0 },
            { name: 'Incline Bench Press', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Cable Fly (Middle)', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Lat Pulldown (Wide-grip)', sets: 4, targetReps: 8, targetWeight: 0 },
            { name: 'Bent-Over Rows', sets: 3, targetReps: 8, targetWeight: 0 },
            { name: 'Single Arm Dumbbell Row', sets: 3, targetReps: 10, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_legs_focus',
          name: 'Legs Focus',
          description: 'Comprehensive leg day with squats, presses, and accessories.',
          exercises: [
            { name: 'Barbell Squat', sets: 4, targetReps: 6, targetWeight: 0 },
            { name: 'Seated Leg Press', sets: 3, targetReps: 10, targetWeight: 0 },
            { name: 'Leg Extension', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Seated Calf Raise', sets: 4, targetReps: 15, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_shoulders_arms',
          name: 'Shoulders & Arms',
          description: 'Isolation work for shoulders, biceps, and triceps.',
          exercises: [
            { name: 'Standing Barbell Shoulder Press', sets: 4, targetReps: 8, targetWeight: 0 },
            { name: 'Lateral Raise', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Face Pulls', sets: 3, targetReps: 15, targetWeight: 0 },
            { name: 'Standing Barbell Bicep Curl', sets: 3, targetReps: 10, targetWeight: 0 },
            { name: 'Preacher Curls', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Tricep Pushdowns', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Skullcrushers', sets: 3, targetReps: 10, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_cardio_mix',
          name: 'Cardio Mix',
          description: 'Variety of cardio exercises for endurance and fat burning.',
          exercises: [
            { name: 'Running', isCardio: true, targetDuration: 20, targetCalories: 200 },
            { name: 'Cycling', isCardio: true, targetDuration: 15, targetCalories: 150 },
            { name: 'Rowing', isCardio: true, targetDuration: 10, targetCalories: 100 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_hiit_workout',
          name: 'HIIT Workout',
          description: 'High-intensity interval training for maximum calorie burn.',
          exercises: [
            { name: 'Running', isCardio: true, targetDuration: 30, targetCalories: 300 },
            { name: 'Elliptical', isCardio: true, targetDuration: 20, targetCalories: 200 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_abs_core',
          name: 'Abs & Core',
          description: 'Core strengthening workout with bodyweight and weighted exercises.',
          exercises: [
            { name: 'Hanging Leg Raises', sets: 3, targetReps: 12, targetWeight: 0 },
            { name: 'Upright Ab Pulldowns', sets: 3, targetReps: 15, targetWeight: 0 },
          ],
          createdAt: new Date().toISOString(),
        },
        {
          id: 'template_beginner_cardio',
          name: 'Beginner Cardio',
          description: 'Low-impact cardio for beginners starting their fitness journey.',
          exercises: [
            { name: 'Walking', isCardio: true, targetDuration: 30, targetCalories: 150 },
            { name: 'Cycling', isCardio: true, targetDuration: 20, targetCalories: 120 },
          ],
          createdAt: new Date().toISOString(),
        },
      ];

      // Generate comprehensive dummy data for May, June, July with ~4 workouts per week
      const generateWorkouts = () => {
        // const workouts = ...; // Quick fix: commented unused variable
        let workoutId = 1;
        
        // May 2025 workouts (4 weeks)
        const mayDates = [
          '2025-05-01', '2025-05-03', '2025-05-06', '2025-05-08', '2025-05-10', '2025-05-13', '2025-05-15', '2025-05-17',
          '2025-05-20', '2025-05-22', '2025-05-24', '2025-05-27', '2025-05-29', '2025-05-31',
        ];
        
        // June 2025 workouts (4 weeks)
        const juneDates = [
          '2025-06-03', '2025-06-05', '2025-06-07', '2025-06-10', '2025-06-12', '2025-06-14', '2025-06-17', '2025-06-19',
          '2025-06-21', '2025-06-24', '2025-06-26', '2025-06-28',
        ];
        
        // July 2025 workouts (4 weeks)
        const julyDates = [
          '2025-07-01', '2025-07-03', '2025-07-05', '2025-07-08', '2025-07-10', '2025-07-12', '2025-07-15', '2025-07-17',
          '2025-07-19', '2025-07-22', '2025-07-24', '2025-07-26', '2025-07-29', '2025-07-31',
        ];
        
        // const allDates = ...; // Quick fix: commented unused variable
        
        const exerciseTypes = [
          {
            name: 'Bench Press',
            sets: [{ reps: 8, weight: 135 }, { reps: 8, weight: 135 }, { reps: 6, weight: 145 }],
            isCardio: false,
          },
          {
            name: 'Squats',
            sets: [{ reps: 10, weight: 185 }, { reps: 10, weight: 185 }, { reps: 8, weight: 195 }],
            isCardio: false,
          },
          {
            name: 'Deadlifts',
            sets: [{ reps: 5, weight: 225 }, { reps: 5, weight: 225 }, { reps: 3, weight: 245 }],
            isCardio: false,
          },
          {
            name: 'Pull-ups',
            sets: [{ reps: 8, weight: 0 }, { reps: 6, weight: 0 }, { reps: 5, weight: 0 }],
            isCardio: false,
          },
          {
            name: 'Running',
            cardioData: { duration: 30, pace: '8:30', calories: 320 },
            isCardio: true,
          },
          {
            name: 'Cycling',
            cardioData: { duration: 45, pace: '15mph', calories: 450 },
            isCardio: true,
          },
          {
            name: 'Push-ups',
            sets: [{ reps: 15, weight: 0 }, { reps: 12, weight: 0 }, { reps: 10, weight: 0 }],
            isCardio: false,
          },
          {
            name: 'Overhead Press',
            sets: [{ reps: 8, weight: 95 }, { reps: 8, weight: 95 }, { reps: 6, weight: 105 }],
            isCardio: false,
          },
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
              afterEnergy: 5 + Math.floor(Math.random() * 4), // 5-8
            },
            lastModified: `${date}T13:30:00.000Z`,
          };
          
          // Add 2-4 exercises per workout
          // const numExercises = ...; // Quick fix: commented unused variable
          // const selectedExercises = ...; // Quick fix: commented unused variable
          
          for (let i = 0; i < numExercises; i++) {
            // const exercise = ...; // Quick fix: commented unused variable
            if (!selectedExercises.includes(exercise.name)) {
              selectedExercises.push(exercise.name);
              workout.exercises.push({
                id: `${workoutId}-${i + 1}`,
                name: exercise.name,
                ...(exercise.isCardio ? { cardioData: exercise.cardioData } : { sets: exercise.sets }),
              });
          
              // Add template completion bonus for some workouts
              if (Math.random() < 0.3) { // 30% chance of template completion
                workout.templateId = `template_${['beginner_full_body', 'push_pull_legs', 'upper_lower'][Math.floor(Math.random() * 3)]}`;
              }
            }
          }
          
          workouts.push(workout);
          workoutId++;
        });
        
        return workouts;
      };
      
      // const dummyWorkouts = ...; // Quick fix: commented unused variable
      await this.saveWorkoutHistory(dummyWorkouts);
      
      // Calculate comprehensive stats with new KPIs
      // const totalWorkouts = ...; // Quick fix: commented unused variable
      // const totalDuration = ...; // Quick fix: commented unused variable
      // const averageRating = ...; // Quick fix: commented unused variable
      
      // Calculate average workouts per week
      // const firstWorkoutDate = ...; // Quick fix: commented unused variable
      // const lastWorkoutDate = ...; // Quick fix: commented unused variable
      // const weeksBetween = ...; // Quick fix: commented unused variable
      // const avgWorkoutsPerWeek = ...; // Quick fix: commented unused variable
      
      // Calculate XP using the new gamification system
      const calculateExperience = (workout) => {
        let experience = 0;
        
        // Base experience for completing a workout
        experience += 100;
        
        // Bonus for workout duration (more time = more exp)
        if (workout.duration) {
          experience += Math.floor(workout.duration / 3);
        }
        
        // Bonus for number of exercises
        if (workout.exercises) {
          experience += workout.exercises.length * 15;
        }
        
        // Bonus for high workout rating
        if (workout.ratings && workout.ratings.workoutRating) {
          if (workout.ratings.workoutRating >= 9) experience += 50;
          else if (workout.ratings.workoutRating >= 8) experience += 35;
          else if (workout.ratings.workoutRating >= 7) experience += 25;
          else if (workout.ratings.workoutRating >= 6) experience += 15;
          else if (workout.ratings.workoutRating >= 5) experience += 10;
        }
        
        // Exercise variety bonus
        if (workout.exercises) {
          // const uniqueExercises = ...; // Quick fix: commented unused variable
          if (uniqueExercises >= 5) experience += 25;
        }
        
        return experience;
      };

      // Calculate total XP and level using new system
      const calculateLevelRequirement = (level) => {
        // const baseXP = ...; // Quick fix: commented unused variable
        return Math.floor(baseXP * Math.pow(level - 1, 1.5));
      };

      const calculateTotalXPForLevel = (level) => {
        let totalXP = 0;
        for (let i = 1; i <= level; i++) {
          totalXP += calculateLevelRequirement(i);
        }
        return totalXP;
      };

      const calculateLevel = (totalExperience) => {
        let level = 1;
        let requiredXP = 0;
        
        while (requiredXP <= totalExperience) {
          level++;
          requiredXP = calculateTotalXPForLevel(level);
        }
        
        return Math.max(1, level - 1);
      };

      // Calculate total XP from all workouts
      const totalExperience = dummyWorkouts.reduce((sum, workout) => {
        return sum + calculateExperience(workout);
      }, 0);

      // const currentLevel = ...; // Quick fix: commented unused variable

      const dummyStats = {
        totalWorkouts,
        totalDuration,
        averageRating: Math.round(averageRating * 10) / 10,
        avgWorkoutsPerWeek: Math.round(avgWorkoutsPerWeek * 10) / 10,
        currentStreak: 7,
        longestStreak: 12,
        level: currentLevel,
        totalExperience: totalExperience,
      };
      
      await this.saveUserStats(dummyStats);
      
      // Generate comprehensive exercise history
      // const exerciseHistory = ...; // Quick fix: commented unused variable
      // const exerciseNames = ...; // Quick fix: commented unused variable
      
      exerciseNames.forEach(name => {
        const workoutsWithExercise = dummyWorkouts.filter(w => 
          w.exercises.some(e => e.name === name),
        );
        
        if (workoutsWithExercise.length > 0) {
          // const latestWorkout = ...; // Quick fix: commented unused variable
          // const exercise = ...; // Quick fix: commented unused variable
          
          if (exercise.cardioData) {
            exerciseHistory[name] = [{
              date: latestWorkout.workoutDate,
              duration: exercise.cardioData.duration,
              pace: exercise.cardioData.pace,
              calories: exercise.cardioData.calories,
            }];
          } else {
            // const avgReps = ...; // Quick fix: commented unused variable
            // const avgWeight = ...; // Quick fix: commented unused variable
            exerciseHistory[name] = [{
              date: latestWorkout.workoutDate,
              reps: Math.round(avgReps),
              weight: Math.round(avgWeight),
              sets: exercise.sets.length,
            }];
          }
        }
      });
      
      await this.saveExerciseHistory(exerciseHistory);
      
      // Save base templates for new users
      await this.saveWorkoutTemplates(baseTemplates);
      
      // Generate dummy rest days
      const dummyRestDays = [
        { date: '2025-05-02', notes: 'Active recovery - light walk', planned: true },
        { date: '2025-05-05', notes: 'Complete rest', planned: true },
        { date: '2025-05-09', notes: 'Yoga and stretching', planned: false },
        { date: '2025-06-02', notes: 'Rest day', planned: true },
        { date: '2025-06-08', notes: 'Recovery day', planned: true },
        { date: '2025-07-07', notes: 'Rest - feeling sore', planned: false },
      ];
      
      await this.saveRestDays(dummyRestDays);

      // Generate dummy body weight data (weekly entries showing gradual improvement)
      const dummyBodyWeights = [
        { id: '1', weight: 180.0, date: '2025-05-01', notes: 'Starting weight', createdAt: '2025-05-01T08:00:00.000Z' },
        { id: '2', weight: 179.5, date: '2025-05-08', notes: 'Week 1 - feeling good', createdAt: '2025-05-08T08:00:00.000Z' },
        { id: '3', weight: 179.2, date: '2025-05-15', notes: '', createdAt: '2025-05-15T08:00:00.000Z' },
        { id: '4', weight: 178.8, date: '2025-05-22', notes: 'Consistent progress', createdAt: '2025-05-22T08:00:00.000Z' },
        { id: '5', weight: 178.3, date: '2025-05-29', notes: '', createdAt: '2025-05-29T08:00:00.000Z' },
        { id: '6', weight: 178.0, date: '2025-06-05', notes: 'Month 1 complete', createdAt: '2025-06-05T08:00:00.000Z' },
        { id: '7', weight: 177.5, date: '2025-06-12', notes: '', createdAt: '2025-06-12T08:00:00.000Z' },
        { id: '8', weight: 177.2, date: '2025-06-19', notes: 'Strength gains while losing weight', createdAt: '2025-06-19T08:00:00.000Z' },
        { id: '9', weight: 176.8, date: '2025-06-26', notes: '', createdAt: '2025-06-26T08:00:00.000Z' },
        { id: '10', weight: 176.3, date: '2025-07-03', notes: '', createdAt: '2025-07-03T08:00:00.000Z' },
        { id: '11', weight: 176.0, date: '2025-07-10', notes: 'Halfway to goal!', createdAt: '2025-07-10T08:00:00.000Z' },
        { id: '12', weight: 175.7, date: '2025-07-17', notes: '', createdAt: '2025-07-17T08:00:00.000Z' },
        { id: '13', weight: 175.3, date: '2025-07-24', notes: 'Looking leaner', createdAt: '2025-07-24T08:00:00.000Z' },
        { id: '14', weight: 175.0, date: '2025-07-31', notes: 'Best shape of my life!', createdAt: '2025-07-31T08:00:00.000Z' },
      ];
      
      await this.saveBodyWeights(dummyBodyWeights);
      
      // Generate demo achievements data to showcase the achievement system
      const demoAchievements = {
        unlocked: [
          {
            id: 'first_workout',
            title: 'First Steps',
            description: 'Complete your first workout',
            icon: 'fitness',
            unlockedAt: '2025-05-01T12:00:00.000Z',
            xpReward: 50,
          },
          {
            id: 'workout_5',
            title: 'Getting Started',
            description: 'Complete 5 workouts',
            icon: 'fitness',
            unlockedAt: '2025-05-10T12:00:00.000Z',
            xpReward: 100,
          },
          {
            id: 'workout_25',
            title: 'Dedicated Athlete',
            description: 'Complete 25 workouts',
            icon: 'trophy',
            unlockedAt: '2025-06-15T12:00:00.000Z',
            xpReward: 250,
          },
          {
            id: 'streak_7',
            title: 'Week Warrior',
            description: 'Maintain a 7-day workout streak',
            icon: 'flame',
            unlockedAt: '2025-06-20T12:00:00.000Z',
            xpReward: 300,
          },
          {
            id: 'hours_10',
            title: 'Time Master',
            description: 'Log 10 hours of workouts',
            icon: 'time',
            unlockedAt: '2025-07-01T12:00:00.000Z',
            xpReward: 200,
          },
          {
            id: 'variety_5',
            title: 'Exercise Explorer',
            description: 'Try 5 different exercises',
            icon: 'list-outline',
            unlockedAt: '2025-06-25T12:00:00.000Z',
            xpReward: 100,
          },
          {
            id: 'weight_100',
            title: 'Weight Lifter',
            description: 'Lift 100 total pounds in a workout',
            icon: 'barbell-outline',
            unlockedAt: '2025-07-05T12:00:00.000Z',
            xpReward: 200,
          },
          {
            id: 'cardio_30',
            title: 'Cardio Enthusiast',
            description: 'Complete 30 minutes of cardio',
            icon: 'heart-outline',
            unlockedAt: '2025-06-30T12:00:00.000Z',
            xpReward: 150,
          },
          {
            id: 'template_5',
            title: 'Template User',
            description: 'Use workout templates 5 times',
            icon: 'document-text-outline',
            unlockedAt: '2025-07-10T12:00:00.000Z',
            xpReward: 200,
          },
        ],
        progress: {
          'workout_50': { progress: 40, maxProgress: 50 },
          'workout_100': { progress: 40, maxProgress: 100 },
          'streak_30': { progress: 12, maxProgress: 30 },
          'hours_50': { progress: 25, maxProgress: 50 },
          'variety_10': { progress: 7, maxProgress: 10 },
          'variety_20': { progress: 7, maxProgress: 20 },
          'weight_500': { progress: 0, maxProgress: 1 },
          'cardio_60': { progress: 0, maxProgress: 1 },
          'template_20': { progress: 8, maxProgress: 20 },
        },
      };
      
      await this.saveData('@achievements', demoAchievements);
      
      // Generate demo quests data to showcase the quest system
      const demoQuests = {
        daily: [
          {
            id: 'daily_workout',
            title: 'Daily Workout',
            description: 'Complete a workout today',
            type: 'daily',
            xpReward: 75,
            progress: 1,
            maxProgress: 1,
            completed: true,
            expiresAt: new Date().toISOString(),
          },
          {
            id: 'daily_duration',
            title: 'Endurance Training',
            description: 'Complete a workout lasting at least 45 minutes',
            type: 'daily',
            xpReward: 100,
            progress: 1,
            maxProgress: 1,
            completed: true,
            expiresAt: new Date().toISOString(),
          },
          {
            id: 'daily_rating',
            title: 'Quality Focus',
            description: 'Rate a workout 8 or higher',
            type: 'daily',
            xpReward: 50,
            progress: 1,
            maxProgress: 1,
            completed: true,
            expiresAt: new Date().toISOString(),
          },
        ],
        weekly: [
          {
            id: 'weekly_workouts',
            title: 'Weekly Warrior',
            description: 'Complete 4 workouts this week',
            type: 'weekly',
            xpReward: 200,
            progress: 3,
            maxProgress: 4,
            completed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'weekly_duration',
            title: 'Time Master',
            description: 'Log at least 3 hours of workouts this week',
            type: 'weekly',
            xpReward: 300,
            progress: 120,
            maxProgress: 180,
            completed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: 'weekly_streak',
            title: 'Consistency King',
            description: 'Maintain a 3-day workout streak',
            type: 'weekly',
            xpReward: 250,
            progress: 2,
            maxProgress: 3,
            completed: false,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
      };
      
      await this.saveData('@quests', demoQuests);
      
    } catch (error) {
      console.error('Error resetting to dummy data:', error);
    }
  }

  // Demo mode backup and restore functions
  static async backupUserData() {
    try {
      // const workoutHistory = ...; // Quick fix: commented unused variable
      // const exerciseHistory = ...; // Quick fix: commented unused variable
      // const oneRepMaxes = ...; // Quick fix: commented unused variable
      // const userStats = ...; // Quick fix: commented unused variable
      // const workoutTemplates = ...; // Quick fix: commented unused variable
      // const restDays = ...; // Quick fix: commented unused variable
      // const bodyWeights = ...; // Quick fix: commented unused variable

      await Promise.all([
        this.saveData(STORAGE_KEYS.BACKUP_WORKOUT_HISTORY, workoutHistory),
        this.saveData(STORAGE_KEYS.BACKUP_EXERCISE_HISTORY, exerciseHistory),
        this.saveData(STORAGE_KEYS.BACKUP_ONE_REP_MAXES, oneRepMaxes),
        this.saveData(STORAGE_KEYS.BACKUP_USER_STATS, userStats),
        this.saveData(STORAGE_KEYS.BACKUP_WORKOUT_TEMPLATES, workoutTemplates),
        this.saveData(STORAGE_KEYS.BACKUP_REST_DAYS, restDays),
        this.saveData(STORAGE_KEYS.BACKUP_BODY_WEIGHTS, bodyWeights),
      ]);

      console.log('User data backed up successfully');
      return true;
    } catch (error) {
      console.error('Error backing up user data:', error);
      return false;
    }
  }

  static async restoreUserData() {
    try {
      // const backupWorkoutHistory = ...; // Quick fix: commented unused variable
      // const backupExerciseHistory = ...; // Quick fix: commented unused variable
      // const backupOneRepMaxes = ...; // Quick fix: commented unused variable
      // const backupUserStats = ...; // Quick fix: commented unused variable
      // const backupWorkoutTemplates = ...; // Quick fix: commented unused variable
      // const backupRestDays = ...; // Quick fix: commented unused variable
      // const backupBodyWeights = ...; // Quick fix: commented unused variable

      await Promise.all([
        this.saveWorkoutHistory(backupWorkoutHistory),
        this.saveExerciseHistory(backupExerciseHistory),
        this.saveOneRepMaxes(backupOneRepMaxes),
        this.saveUserStats(backupUserStats),
        this.saveWorkoutTemplates(backupWorkoutTemplates),
        this.saveRestDays(backupRestDays),
        this.saveBodyWeights(backupBodyWeights),
      ]);

      console.log('User data restored successfully');
      return true;
    } catch (error) {
      console.error('Error restoring user data:', error);
      return false;
    }
  }

  static async clearBackupData() {
    try {
      await Promise.all([
        this.removeData(STORAGE_KEYS.BACKUP_WORKOUT_HISTORY),
        this.removeData(STORAGE_KEYS.BACKUP_EXERCISE_HISTORY),
        this.removeData(STORAGE_KEYS.BACKUP_ONE_REP_MAXES),
        this.removeData(STORAGE_KEYS.BACKUP_USER_STATS),
        this.removeData(STORAGE_KEYS.BACKUP_WORKOUT_TEMPLATES),
        this.removeData(STORAGE_KEYS.BACKUP_REST_DAYS),
        this.removeData(STORAGE_KEYS.BACKUP_BODY_WEIGHTS),
      ]);

      console.log('Backup data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing backup data:', error);
      return false;
    }
  }

  // Achievement system methods
  static async saveAchievements(achievements) {
    return await this.saveData(STORAGE_KEYS.ACHIEVEMENTS, achievements);
  }

  static async loadAchievements() {
    return await this.loadData(STORAGE_KEYS.ACHIEVEMENTS, []);
  }

  static async getAchievements() {
    return await this.loadAchievements();
  }

  // Quest system methods
  static async saveQuests(quests) {
    return await this.saveData(STORAGE_KEYS.QUESTS, quests);
  }

  static async loadQuests() {
    return await this.loadData(STORAGE_KEYS.QUESTS, []);
  }

  static async getQuests() {
    return await this.loadQuests();
  }

  // Character collection methods
  static async saveCharacterCollection(characters) {
    return await this.saveData(STORAGE_KEYS.CHARACTER_COLLECTION, characters);
  }

  static async loadCharacterCollection() {
    return await this.loadData(STORAGE_KEYS.CHARACTER_COLLECTION, []);
  }

  static async getCharacterCollection() {
    return await this.loadCharacterCollection();
  }

  // Social posts methods
  static async saveSocialPosts(posts) {
    return await this.saveData(STORAGE_KEYS.SOCIAL_POSTS, posts);
  }

  static async loadSocialPosts() {
    return await this.loadData(STORAGE_KEYS.SOCIAL_POSTS, []);
  }

  static async getSocialPosts() {
    return await this.loadSocialPosts();
  }

  static async saveSocialPost(post) {
    // const posts = ...; // Quick fix: commented unused variable
    posts.push(post);
    return await this.saveSocialPosts(posts);
  }

  // User currencies methods
  static async saveUserCurrencies(currencies) {
    return await this.saveData(STORAGE_KEYS.USER_CURRENCIES, currencies);
  }

  static async loadUserCurrencies() {
    const defaultCurrencies = {
      gems: 0,
      coins: 0,
      tickets: 0,
    };
    return await this.loadData(STORAGE_KEYS.USER_CURRENCIES, defaultCurrencies);
  }

  static async getUserCurrencies() {
    return await this.loadUserCurrencies();
  }

  // Daily bonuses methods
  static async saveDailyBonuses(bonuses) {
    return await this.saveData(STORAGE_KEYS.DAILY_BONUSES, bonuses);
  }

  static async loadDailyBonuses() {
    const defaultBonuses = {
      lastClaimed: null,
      streak: 0,
      available: true,
    };
    return await this.loadData(STORAGE_KEYS.DAILY_BONUSES, defaultBonuses);
  }

  static async getDailyBonuses() {
    return await this.loadDailyBonuses();
  }

  // Enhanced gacha state methods
  static async saveEnhancedGachaState(state) {
    return await this.saveData(STORAGE_KEYS.ENHANCED_GACHA_STATE, state);
  }

  static async loadEnhancedGachaState() {
    return await this.loadData(STORAGE_KEYS.ENHANCED_GACHA_STATE, null);
  }

  static async getEnhancedGachaState() {
    return await this.loadEnhancedGachaState();
  }

  // Segmentation system methods
  static async saveSegmentProfile(profile) {
    return await this.saveData(STORAGE_KEYS.SEGMENT_PROFILE, profile);
  }

  static async loadSegmentProfile() {
    return await this.loadData(STORAGE_KEYS.SEGMENT_PROFILE, null);
  }

  static async getSegmentProfile() {
    return await this.loadSegmentProfile();
  }

  static async saveSurveyHistory(history) {
    return await this.saveData(STORAGE_KEYS.SURVEY_HISTORY, history);
  }

  static async loadSurveyHistory() {
    return await this.loadData(STORAGE_KEYS.SURVEY_HISTORY, []);
  }

  static async getSurveyHistory() {
    return await this.loadSurveyHistory();
  }

  static async savePersonalizedGoals(goals) {
    return await this.saveData(STORAGE_KEYS.PERSONALIZED_GOALS, goals);
  }

  static async loadPersonalizedGoals() {
    return await this.loadData(STORAGE_KEYS.PERSONALIZED_GOALS, []);
  }

  static async getPersonalizedGoals() {
    return await this.loadPersonalizedGoals();
  }

  static async saveSegmentPreferences(preferences) {
    return await this.saveData(STORAGE_KEYS.SEGMENT_PREFERENCES, preferences);
  }

  static async loadSegmentPreferences() {
    return await this.loadData(STORAGE_KEYS.SEGMENT_PREFERENCES, null);
  }

  static async getSegmentPreferences() {
    return await this.loadSegmentPreferences();
  }

  static async saveSegmentMetrics(metrics) {
    return await this.saveData(STORAGE_KEYS.SEGMENT_METRICS, metrics);
  }

  static async loadSegmentMetrics() {
    return await this.loadData(STORAGE_KEYS.SEGMENT_METRICS, null);
  }

  static async getSegmentMetrics() {
    return await this.loadSegmentMetrics();
  }

  static async saveAdaptiveSettings(settings) {
    return await this.saveData(STORAGE_KEYS.ADAPTIVE_SETTINGS, settings);
  }

  static async loadAdaptiveSettings() {
    return await this.loadData(STORAGE_KEYS.ADAPTIVE_SETTINGS, null);
  }

  static async getAdaptiveSettings() {
    return await this.loadAdaptiveSettings();
  }

  static async saveOnboardingStatus(completed) {
    return await this.saveData(STORAGE_KEYS.ONBOARDING_STATUS, completed);
  }

  static async loadOnboardingStatus() {
    return await this.loadData(STORAGE_KEYS.ONBOARDING_STATUS, false);
  }

  static async getOnboardingStatus() {
    return await this.loadOnboardingStatus();
  }

  // Add missing workout-related methods
  static async getWorkoutHistory() {
    return await this.loadWorkoutHistory();
  }

  static async getExerciseHistory() {
    return await this.loadExerciseHistory();
  }

  static async getWorkoutTemplates() {
    return await this.loadWorkoutTemplates();
  }

  static async getRestDays() {
    return await this.loadRestDays();
  }

  static async getUserStats() {
    return await this.loadUserStats();
  }

  static async saveWorkout(workout) {
    // const workoutHistory = ...; // Quick fix: commented unused variable
    workoutHistory.push(workout);
    return await this.saveWorkoutHistory(workoutHistory);
  }

  static async saveWorkoutTemplate(template) {
    // const templates = ...; // Quick fix: commented unused variable
    // const existingIndex = ...; // Quick fix: commented unused variable
    if (existingIndex >= 0) {
      templates[existingIndex] = template;
    } else {
      templates.push(template);
    }
    return await this.saveWorkoutTemplates(templates);
  }

  static async saveRestDay(restDay) {
    // const restDays = ...; // Quick fix: commented unused variable
    restDays.push(restDay);
    return await this.saveRestDays(restDays);
  }

  // Convenience mutation helpers (used by contexts)
  static async removeWorkout(workoutId) {
    // const workouts = ...; // Quick fix: commented unused variable
    // const updated = ...; // Quick fix: commented unused variable
    return await this.saveWorkoutHistory(updated);
  }

  static async removeWorkoutTemplate(templateId) {
    // const templates = ...; // Quick fix: commented unused variable
    // const updated = ...; // Quick fix: commented unused variable
    return await this.saveWorkoutTemplates(updated);
  }

  static async removeRestDay(date) {
    // const restDays = ...; // Quick fix: commented unused variable
    // const updated = ...; // Quick fix: commented unused variable
    return await this.saveRestDays(updated);
  }

  static async clearWorkoutHistory() {
    return await this.removeData(STORAGE_KEYS.WORKOUT_HISTORY);
  }

  static async clearExerciseHistory() {
    return await this.removeData(STORAGE_KEYS.EXERCISE_HISTORY);
  }

  static async clearWorkoutTemplates() {
    return await this.removeData(STORAGE_KEYS.WORKOUT_TEMPLATES);
  }

  static async clearRestDays() {
    return await this.removeData(STORAGE_KEYS.REST_DAYS);
  }
}

export default StorageManager;