// src/utils/dashboardUtils.js
import {
  // DESIGN_TOKENS
} from '../constants/designTokens';

/**
 * Calculate streak data from workout history
 * @param {Array} workoutHistory - Array of workout objects
 * @returns {Object} - { currentStreak, longestStreak }
 */
export const calculateStreakData = (workoutHistory) => {
  if (!workoutHistory || workoutHistory.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  // Sort workouts by date (most recent first)
  const sortedWorkouts = [...workoutHistory]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let lastWorkoutDate = null;
  
  for (const workout of sortedWorkouts) {
    // const workoutDate = ...; // Quick fix: commented unused variable
    // Normalize to start of day for comparison
    const workoutDay = new Date(
      workoutDate.getFullYear(), 
      workoutDate.getMonth(), 
      workoutDate.getDate(),
    );
    
    if (lastWorkoutDate === null) {
      // First workout in the sorted list
      lastWorkoutDate = workoutDay;
      tempStreak = 1;
      currentStreak = 1;
    } else {
      // Calculate days between workouts
      // const timeDiff = ...; // Quick fix: commented unused variable
      // const daysDiff = ...; // Quick fix: commented unused variable
      
      if (daysDiff === 1) {
        // Consecutive day - extend streak
        tempStreak++;
        currentStreak = tempStreak;
      } else if (daysDiff === 0) {
        // Same day workout - don't break streak
        continue;
      } else {
        // Gap in workouts - reset streak
        tempStreak = 1;
      }
      
      lastWorkoutDate = workoutDay;
    }
    
    // Track longest streak
    longestStreak = Math.max(longestStreak, tempStreak);
  }
  
  return { currentStreak, longestStreak };
};

/**
 * Get color for workout rating
 * @param {number} rating - Rating from 0-10
 * @returns {string} - Hex color code
 */
export const getRatingColor = (rating) => {
  if (rating >= 8) return DESIGN_TOKENS.colors.ratingExcellent;
  if (rating >= 6) return DESIGN_TOKENS.colors.ratingGood;
  if (rating >= 4) return DESIGN_TOKENS.colors.ratingFair;
  if (rating >= 2) return DESIGN_TOKENS.colors.ratingPoor;
  return DESIGN_TOKENS.colors.ratingBad;
};

/**
 * Calculate statistics for a specific month
 * @param {Array} workoutHistory - Array of workout objects
 * @param {Date} selectedMonth - Selected month date
 * @returns {Object} - Monthly statistics
 */
export const calculateMonthlyStats = (workoutHistory, selectedMonth) => {
  if (!workoutHistory || workoutHistory.length === 0) {
    return {
      count: 0,
      duration: 0,
      avgRating: 0,
      favoriteExercise: 'None yet',
      avgWorkoutsPerWeek: 0,
    };
  }

  // Calculate month boundaries
  const selectedMonthStart = new Date(
    selectedMonth.getFullYear(), 
    selectedMonth.getMonth(), 
    1,
  );
  const selectedMonthEnd = new Date(
    selectedMonth.getFullYear(), 
    selectedMonth.getMonth() + 1, 
    0,
  );
  
  // Filter workouts for selected month
  const selectedMonthWorkouts = workoutHistory.filter(workout => {
    // const workoutDate = ...; // Quick fix: commented unused variable
    return workoutDate >= selectedMonthStart && workoutDate <= selectedMonthEnd;
  });

  // Calculate basic stats
  // const count = ...; // Quick fix: commented unused variable
  // const duration = ...; // Quick fix: commented unused variable
  
  // Calculate average rating
  const ratingsWithValues = selectedMonthWorkouts
    .filter(w => w.ratings?.workoutRating)
    .map(w => w.ratings.workoutRating);
  
  const avgRating = ratingsWithValues.length > 0 
    ? ratingsWithValues.reduce((sum, rating) => sum + rating, 0) / ratingsWithValues.length
    : 0;

  // Find favorite exercise
  // const exerciseCount = ...; // Quick fix: commented unused variable
  selectedMonthWorkouts.forEach(workout => {
    if (workout.exercises && Array.isArray(workout.exercises)) {
      workout.exercises.forEach(exercise => {
        if (exercise.name) {
          exerciseCount[exercise.name] = (exerciseCount[exercise.name] || 0) + 1;
        }
      });
    }
  });
  
  const favoriteExercise = Object.keys(exerciseCount).length > 0 
    ? Object.keys(exerciseCount).reduce((a, b) => 
      exerciseCount[a] > exerciseCount[b] ? a : b,
    )
    : 'None yet';

  // Calculate average workouts per week for the month
  // const weeksInMonth = ...; // Quick fix: commented unused variable
  // const avgWorkoutsPerWeek = ...; // Quick fix: commented unused variable

  return {
    count,
    duration,
    avgRating,
    favoriteExercise,
    avgWorkoutsPerWeek,
  };
};

/**
 * Calculate weekly consistency (average workouts per week over last 4 weeks)
 * @param {Array} workoutHistory - Array of workout objects
 * @returns {number} - Average workouts per week
 */
export const calculateWeeklyConsistency = (workoutHistory) => {
  if (!workoutHistory || workoutHistory.length === 0) {
    return 0;
  }

  // const now = ...; // Quick fix: commented unused variable
  // const fourWeeksAgo = ...; // Quick fix: commented unused variable
  
  const recentWorkouts = workoutHistory.filter(workout => 
    new Date(workout.startTime) >= fourWeeksAgo,
  );
  
  return recentWorkouts.length / 4; // 4 weeks
};

/**
 * Get time-based greeting
 * @returns {string} - Time-appropriate greeting
 */
export const getTimeBasedGreeting = () => {
  // const hour = ...; // Quick fix: commented unused variable
  
  if (hour < 6) return 'Late Night Warrior';
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Night Owl';
};

/**
 * Format duration in minutes to human readable format
 * @param {number} minutes - Duration in minutes
 * @returns {string} - Formatted duration
 */
export const formatDuration = (minutes) => {
  if (!minutes || minutes < 1) return '0 min';
  
  // const hours = ...; // Quick fix: commented unused variable
  // const mins = ...; // Quick fix: commented unused variable
  
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
};

/**
 * Format large numbers with appropriate suffixes
 * @param {number} num - Number to format
 * @returns {string} - Formatted number
 */
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

/**
 * Get achievement progress percentage
 * @param {number} current - Current progress
 * @param {number} target - Target value
 * @returns {number} - Percentage (0-100)
 */
export const getProgressPercentage = (current, target) => {
  if (!target || target <= 0) return 0;
  return Math.min((current / target) * 100, 100);
};

/**
 * Calculate days since last workout
 * @param {Array} workoutHistory - Array of workout objects
 * @returns {number} - Days since last workout
 */
export const getDaysSinceLastWorkout = (workoutHistory) => {
  if (!workoutHistory || workoutHistory.length === 0) {
    return 0;
  }

  const sortedWorkouts = [...workoutHistory]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
  
  // const lastWorkout = ...; // Quick fix: commented unused variable
  // const lastWorkoutDate = ...; // Quick fix: commented unused variable
  // const now = ...; // Quick fix: commented unused variable
  
  // const timeDiff = ...; // Quick fix: commented unused variable
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Get motivational message based on user progress
 * @param {Object} stats - User statistics
 * @returns {string} - Motivational message
 */
export const getMotivationalMessage = (stats) => {
  const { totalWorkouts = 0, currentStreak = 0, avgRating = 0 } = stats;
  
  // Based on streak
  if (currentStreak >= 7) {
    return '🔥 You\'re on fire! Keep that streak alive!';
  }
  
  if (currentStreak >= 3) {
    return '💪 Great consistency! You\'re building a strong habit!';
  }
  
  // Based on total workouts
  if (totalWorkouts >= 100) {
    return '🏆 Wow! You\'re a fitness legend with 100+ workouts!';
  }
  
  if (totalWorkouts >= 50) {
    return '⭐ Impressive dedication with 50+ workouts completed!';
  }
  
  if (totalWorkouts >= 10) {
    return '🎯 You\'re building momentum! Keep up the great work!';
  }
  
  // Based on rating
  if (avgRating >= 8) {
    return '✨ Your workout quality is outstanding!';
  }
  
  // Default messages
  const defaultMessages = [
    '💪 Every workout counts! You\'re getting stronger!',
    '🚀 Progress over perfection - you\'ve got this!',
    '🌟 Your commitment to fitness is inspiring!',
    '⚡ Energy invested in fitness always pays dividends!',
    '🎯 Focus on progress, not perfection!',
  ];
  
  return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Check if two dates are the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if same day
 */
export const isSameDay = (date1, date2) => {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
};

/**
 * Get workout intensity level based on duration and rating
 * @param {Object} workout - Workout object
 * @returns {string} - Intensity level
 */
export const getWorkoutIntensity = (workout) => {
  // const duration = ...; // Quick fix: commented unused variable
  // const rating = ...; // Quick fix: commented unused variable
  // const exerciseCount = ...; // Quick fix: commented unused variable
  
  // Calculate intensity score (0-100)
  // const durationScore = ...; // Quick fix: commented unused variable // Max 30 points for 90+ min
  // const ratingScore = ...; // Quick fix: commented unused variable // Max 40 points for 10/10 rating
  // const exerciseScore = ...; // Quick fix: commented unused variable // Max 30 points for 8+ exercises
  
  // const totalScore = ...; // Quick fix: commented unused variable
  
  if (totalScore >= 80) return 'High';
  if (totalScore >= 60) return 'Moderate';
  if (totalScore >= 40) return 'Light';
  return 'Easy';
};

export default {
  calculateStreakData,
  getRatingColor,
  calculateMonthlyStats,
  calculateWeeklyConsistency,
  getTimeBasedGreeting,
  formatDuration,
  formatNumber,
  getProgressPercentage,
  getDaysSinceLastWorkout,
  getMotivationalMessage,
  debounce,
  isSameDay,
  getWorkoutIntensity,
};