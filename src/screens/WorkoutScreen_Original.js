import React, { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // SafeAreaView,
  // TextInput,
  // Alert,
  // Modal,
  // ActivityIndicator,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useApp
} from '../context/AppContext';
import MotivationalQuote from '../components/MotivationalQuote';
import GamificationStats from '../components/GamificationStats';

// Lazy load the heavy GachaComponents
// const GachaComponents = ...; // Quick fix: commented unused variable

// Loading component for lazy-loaded gacha components
const GachaLoadingFallback = () => (
  <View style={styles.gachaLoadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.gachaLoadingText}>Loading verification...</Text>
  </View>
);

const WorkoutScreen = ({ navigation, route }) => {
  // Get global state and actions from context
  const { 
    workoutHistory, 
    exerciseHistory, 
    addWorkout, 
    updateExerciseHistory,
    removeWorkout,
    userStats,
    updateUserStats,
    resetToDummyData,
    workoutTemplates,
    addTemplate,
    removeTemplate,
  } = useApp();

  // Check if we should show templates or start with a template
  const { showTemplates, templateId } = route.params || {};

  // Local state for current workout session
  const [currentWorkout, setCurrentWorkout] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [workoutRatings, setWorkoutRatings] = useState({
    beforeMood: 5,
    beforeEnergy: 5,
    afterMood: 5,
    afterEnergy: 5,
    workoutRating: 5,
  });
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingType, setRatingType] = useState('pre'); // 'pre' or 'post'
  const [expandedWorkouts, setExpandedWorkouts] = useState(new Set());
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState(null);

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId && workoutTemplates) {
      // const template = ...; // Quick fix: commented unused variable
      if (template) {
        startWorkoutFromTemplate(template);
      }
    }
  }, [templateId, workoutTemplates]);

  // Show templates modal if requested
  useEffect(() => {
    if (showTemplates) {
      setShowTemplateModal(true);
    }
  }, [showTemplates]);

  // Memoized exercise categories to prevent unnecessary re-renders
  const exerciseCategories = useMemo(() => ({
    Chest: [
      'Incline Bench Press (Smith)', 'Bench Press', 'Cable Fly (Low)', 
      'Cable Fly (Middle)', 'Cable Fly (High)', 'Bench Press (Smith)', 
      'Incline Bench Press', 'Incline Dumbbell Bench Press', 
      'Dumbbell Bench Press', 'Decline Bench Press',
    ],
    Back: [
      'Lat Pulldown (Wide-grip)', 'Lat Pulldown (Close-grip)', 'Deadlift', 
      'Deadlift (Smith)', 'Upright Barbell Row (Smith)', 'Upright Barbell Row', 
      'Single Arm Dumbbell Row', 'Bent-Over Rows (Smith)', 'Bent-Over Rows', 
      'Pull-Ups', 'Pull-Ups (Weighted)',
    ],
    Legs: [
      'Barbell Squat', 'Barbell Squat (Smith)', 'Seated Leg Press', 
      'Seated Calf Raise', 'Leg Extension',
    ],
    Shoulders: [
      'Standing Barbell Shoulder Press', 'Seated Barbell Shoulder Press (Smith)', 
      'Seated Dumbbell Shoulder Press', 'Face Pulls', 'Bent Over Reverse Fly', 
      'Lateral Raise', 'Arnold Press',
    ],
    Bicep: [
      'Standing Barbell Bicep Curl', 'Preacher Curls', 'Hammer Curls', 
      'Concentration Curls', 'Incline Dumbbell Curls', 'Cable Curls',
    ],
    Tricep: [
      'Tricep Dips', 'Tricep Pushdowns', 'Skull Crushers', 'Overhead Tricep Extension',
      'Close-Grip Bench Press', 'Diamond Push-Ups',
    ],
    Core: [
      'Planks', 'Crunches', 'Russian Twists', 'Leg Raises', 'Bicycle Crunches',
      'Mountain Climbers', 'Dead Bug', 'Bird Dog',
    ],
    Cardio: [
      'Running', 'Cycling', 'Rowing', 'Elliptical', 'StairMaster', 'Jump Rope',
      'Swimming', 'Walking', 'HIIT', 'Circuit Training',
    ],
  }), []);

  const isCardioExercise = (exerciseName) => {
    return exerciseCategories.Cardio.includes(exerciseName);
  };

  const startNewWorkout = useCallback(() => {
    // const now = ...; // Quick fix: commented unused variable
    const workout = {
      id: Date.now(),
      startTime: now,
      workoutDate: now.toISOString().split('T')[0], // Store date-only (YYYY-MM-DD)
      type: 'Weightlifting',
      exercises: [],
      ratings: { ...workoutRatings },
    };
    
    console.log('Starting workout at:', now.toLocaleString());
    console.log('Workout date:', workout.workoutDate);
    console.log('Workout ID:', workout.id);
    
    setCurrentWorkout(workout);
    setSelectedCategory('Chest'); // Auto-select first tab
    
    // Show pre-workout ratings
    setRatingType('pre');
    setShowRatingModal(true);
  }, [workoutRatings]);

  const startWorkoutFromTemplate = useCallback((template) => {
    // const now = ...; // Quick fix: commented unused variable
    const workout = {
      id: Date.now(),
      startTime: now,
      workoutDate: now.toISOString().split('T')[0],
      type: 'Weightlifting',
      exercises: [],
      ratings: { ...workoutRatings },
      templateUsed: template.id,
    };
    
    setCurrentWorkout(workout);
    
    // Add exercises from template
    const templateExercises = template.exercises.map((templateExercise, index) => {
      if (templateExercise.isCardio) {
        return {
          id: Date.now() + index,
          name: templateExercise.name,
          sets: [],
          cardioData: {
            totalTime: templateExercise.targetDuration || 0,
            pace: '',
            calories: templateExercise.targetCalories || 0,
            distance: 0,
          },
          notes: '',
          order: index,
        };
      } else {
        // Create sets based on template
        // const sets = ...; // Quick fix: commented unused variable
        for (let i = 0; i < (templateExercise.sets || 3); i++) {
          sets.push({
            id: Date.now() + index + i,
            reps: templateExercise.targetReps || '',
            weight: templateExercise.targetWeight || '',
            completed: false,
          });
        }
        
        return {
          id: Date.now() + index,
          name: templateExercise.name,
          sets,
          cardioData: null,
          notes: '',
          order: index,
        };
      }
    });
    
    setExercises(templateExercises);
    setShowTemplateModal(false);
    
    // Show pre-workout ratings
    setRatingType('pre');
    setShowRatingModal(true);
  }, [workoutRatings]);

  const saveAsTemplate = useCallback(async () => {
    if (!templateName.trim()) {
      Alert.alert('Template Name Required', 'Please enter a name for your template.');
      return;
    }
    
    if (exercises.length === 0) {
      Alert.alert('No Exercises', 'Add at least one exercise before saving as a template.');
      return;
    }
    
    const templateExercises = exercises.map(exercise => {
      if (isCardioExercise(exercise.name)) {
        return {
          name: exercise.name,
          isCardio: true,
          targetDuration: exercise.cardioData?.totalTime || 30,
          targetCalories: exercise.cardioData?.calories || 0,
        };
      } else {
        // Get average weight and reps from sets
        // const completedSets = ...; // Quick fix: commented unused variable
        const avgWeight = completedSets.length > 0
          ? Math.round(completedSets.reduce((sum, set) => sum + set.weight, 0) / completedSets.length)
          : 0;
        const avgReps = completedSets.length > 0
          ? Math.round(completedSets.reduce((sum, set) => sum + set.reps, 0) / completedSets.length)
          : 0;
        
        return {
          name: exercise.name,
          sets: exercise.sets.length,
          targetReps: avgReps,
          targetWeight: avgWeight,
        };
      }
    });
    
    const template = {
      name: templateName,
      description: templateDescription,
      exercises: templateExercises,
    };
    
    await addTemplate(template);
    
    setShowSaveTemplateModal(false);
    setTemplateName('');
    setTemplateDescription('');
    
    Alert.alert('Template Saved', 'Your workout has been saved as a template!');
  }, [templateName, templateDescription, exercises, addTemplate, isCardioExercise]);

  const addExercise = useCallback((exerciseName) => {
    // Check if exercise already exists in current workout
    // const existingExercise = ...; // Quick fix: commented unused variable
    if (existingExercise) {
      Alert.alert(
        'Exercise Already Added', 
        `${exerciseName} is already in your current workout. Add more sets instead?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Add Set', 
            onPress: () => addSet(existingExercise.id),
          },
        ],
      );
      return;
    }

    // const isCardio = ...; // Quick fix: commented unused variable
    const newExercise = {
      id: Date.now(),
      name: exerciseName,
      sets: isCardio ? [] : [{
        id: Date.now(),
        reps: '',
        weight: '',
        completed: false,
      }],
      cardioData: isCardio ? {
        totalTime: 0, // in minutes
        pace: '', // pace per mile/km
        calories: 0,
        distance: 0, // in miles/km
      } : null,
      notes: '',
      order: exercises.length, // Maintain order
    };
    
    setExercises(prev => [...prev, newExercise]);
    setSelectedCategory(null); // Close category selection after adding
  }, [exercises]);

  const addSet = useCallback((exerciseId) => {
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
  }, []);

  const removeExercise = useCallback((exerciseId) => {
    console.log('removeExercise called with exerciseId:', exerciseId);
    console.log('Current exercises before removal:', exercises);
    
    // Use window.confirm for web compatibility
    // const confirmed = ...; // Quick fix: commented unused variable
    
    if (confirmed) {
      console.log('Removing exercise with ID:', exerciseId);
      setExercises(prev => {
        // const updatedExercises = ...; // Quick fix: commented unused variable
        console.log('Exercises after removal:', updatedExercises);
        return updatedExercises;
      });
    }
  }, [exercises]);

  const removeSet = useCallback((exerciseId, setId) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        // const updatedSets = ...; // Quick fix: commented unused variable
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  }, []);

  const updateSet = useCallback((exerciseId, setId, field, value) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        const updatedSets = exercise.sets.map(set => {
          if (set.id === setId) {
            // Convert empty string to empty string, otherwise parse as integer
            // const parsedValue = ...; // Quick fix: commented unused variable
            return { ...set, [field]: parsedValue };
          }
          return set;
        });
        return { ...exercise, sets: updatedSets };
      }
      return exercise;
    }));
  }, []);

  const updateCardioData = useCallback((exerciseId, field, value) => {
    setExercises(prev => prev.map(exercise => {
      if (exercise.id === exerciseId) {
        // const parsedValue = ...; // Quick fix: commented unused variable
        return {
          ...exercise,
          cardioData: {
            ...exercise.cardioData,
            [field]: parsedValue,
          },
        };
      }
      return exercise;
    }));
  }, []);

  const getExerciseHistory = useCallback((exerciseName) => {
    console.log('getExerciseHistory called for:', exerciseName);
    console.log('exerciseHistory:', exerciseHistory);
    // const history = ...; // Quick fix: commented unused variable
    console.log('Found history for', exerciseName, ':', history);
    if (history && history.length > 0) {
      // const lastWorkout = ...; // Quick fix: commented unused variable
      console.log('Last workout for', exerciseName, ':', lastWorkout);
      
      // Check if it's a cardio exercise
      if (isCardioExercise(exerciseName)) {
        return {
          date: new Date(lastWorkout.date).toLocaleDateString(),
          duration: lastWorkout.duration || 0,
          calories: lastWorkout.calories || 0,
        };
      } else {
        return {
          date: new Date(lastWorkout.date).toLocaleDateString(),
          sets: lastWorkout.sets,
          reps: lastWorkout.reps,
          weight: lastWorkout.weight,
        };
      }
    }
    return null;
  }, [exerciseHistory, isCardioExercise]);

  const finishWorkout = useCallback(() => {
    setRatingType('post');
    setShowRatingModal(true);
  }, []);

  const completeWorkout = useCallback(async () => {
    try {
      // const sortedExercises = ...; // Quick fix: commented unused variable
      // const endTime = ...; // Quick fix: commented unused variable
      // const duration = ...; // Quick fix: commented unused variable
      
      const finishedWorkout = {
        ...currentWorkout,
        endTime: endTime,
        duration: duration,
        exercises: sortedExercises,
        ratings: workoutRatings,
      };
      
      await addWorkout(finishedWorkout);
      
      // Update exercise history
      // const exerciseHistoryUpdates = ...; // Quick fix: commented unused variable
      sortedExercises.forEach(exercise => {
        if (isCardioExercise(exercise.name)) {
          // Handle cardio exercises
          if (exercise.cardioData && (exercise.cardioData.totalTime || exercise.cardioData.calories)) {
            // const exerciseName = ...; // Quick fix: commented unused variable
            if (!exerciseHistoryUpdates[exerciseName]) {
              exerciseHistoryUpdates[exerciseName] = [];
            }
            exerciseHistoryUpdates[exerciseName].push({
              date: endTime,
              duration: exercise.cardioData.totalTime || 0,
              calories: exercise.cardioData.calories || 0,
            });
          }
        } else {
          // Handle weight exercises
          exercise.sets.forEach(set => {
            if (set.reps && set.weight) {
              // const exerciseName = ...; // Quick fix: commented unused variable
              if (!exerciseHistoryUpdates[exerciseName]) {
                exerciseHistoryUpdates[exerciseName] = [];
              }
              exerciseHistoryUpdates[exerciseName].push({
                date: endTime,
                sets: exercise.sets.length,
                reps: set.reps,
                weight: set.weight,
              });
            }
          });
        }
      });
      
      if (Object.keys(exerciseHistoryUpdates).length > 0) {
        await updateExerciseHistory(exerciseHistoryUpdates);
      }
      
      // Show verification widget
      setCompletedWorkout(finishedWorkout);
      setShowVerification(true);
      
      // Reset state
      setCurrentWorkout(null);
      setExercises([]);
      setSelectedCategory(null);
      setWorkoutRatings({
        beforeMood: 5,
        beforeEnergy: 5,
        afterMood: 5,
        afterEnergy: 5,
        workoutRating: 5,
      });
      
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Save Error', 'There was an issue saving your workout. Please try again.');
    }
  }, [currentWorkout, exercises, workoutRatings, addWorkout, updateExerciseHistory]);

  const handleRemoveWorkout = useCallback(async (workoutId) => {
    console.log('handleRemoveWorkout called with workoutId:', workoutId);
    
    // Use window.confirm for web compatibility
    // const confirmed = ...; // Quick fix: commented unused variable
    
    if (confirmed) {
      try {
        console.log('Attempting to remove workout with ID:', workoutId);
        await removeWorkout(workoutId);
        console.log('Workout removed successfully');
        alert('Workout deleted successfully.');
      } catch (error) {
        console.error('Error removing workout:', error);
        alert('Failed to delete workout. Please try again.');
      }
    }
  }, [removeWorkout]);

  const handleVerificationComplete = useCallback((pointsEarned) => {
    setShowVerification(false);
    setCompletedWorkout(null);
    
    if (pointsEarned > 0) {
      Alert.alert(
        'Workout Complete! 🎉', 
        `Great job! You completed ${completedWorkout?.exercises?.length || 0} exercises and earned ${pointsEarned} gacha points!`,
        [{ text: 'Awesome!', style: 'default' }],
      );
    } else {
      Alert.alert(
        'Workout Complete!', 
        `Great job! You completed ${completedWorkout?.exercises?.length || 0} exercises in ${completedWorkout?.duration || 0} minutes.`,
        [{ text: 'Awesome!', style: 'default' }],
      );
    }
  }, [completedWorkout]);

  const toggleWorkoutExpansion = useCallback((workoutId) => {
    setExpandedWorkouts(prev => {
      // const newSet = ...; // Quick fix: commented unused variable
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }, []);

  const renderRatingModal = () => (
    <Modal
      visible={showRatingModal}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {ratingType === 'pre' ? 'Pre-Workout Check-in' : 'Post-Workout Rating'}
            </Text>
            <TouchableOpacity 
              onPress={() => setShowRatingModal(false)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.ratingGrid}>
            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Mood</Text>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      workoutRatings[ratingType === 'pre' ? 'beforeMood' : 'afterMood'] === rating && styles.selectedRating,
                    ]}
                    onPress={() => setWorkoutRatings({
                      ...workoutRatings,
                      [ratingType === 'pre' ? 'beforeMood' : 'afterMood']: rating,
                    })}
                  >
                    <Text style={[
                      styles.ratingText,
                      workoutRatings[ratingType === 'pre' ? 'beforeMood' : 'afterMood'] === rating && styles.selectedRatingText,
                    ]}>{rating}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.ratingItem}>
              <Text style={styles.ratingLabel}>Energy</Text>
              <View style={styles.ratingButtons}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    style={[
                      styles.ratingButton,
                      workoutRatings[ratingType === 'pre' ? 'beforeEnergy' : 'afterEnergy'] === rating && styles.selectedRating,
                    ]}
                    onPress={() => setWorkoutRatings({
                      ...workoutRatings,
                      [ratingType === 'pre' ? 'beforeEnergy' : 'afterEnergy']: rating,
                    })}
                  >
                    <Text style={[
                      styles.ratingText,
                      workoutRatings[ratingType === 'pre' ? 'beforeEnergy' : 'afterEnergy'] === rating && styles.selectedRatingText,
                    ]}>{rating}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {ratingType === 'post' && (
              <View style={styles.ratingItem}>
                <Text style={styles.ratingLabel}>Workout</Text>
                <View style={styles.ratingButtons}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      style={[
                        styles.ratingButton,
                        workoutRatings.workoutRating === rating && styles.selectedRating,
                      ]}
                      onPress={() => setWorkoutRatings({
                        ...workoutRatings,
                        workoutRating: rating,
                      })}
                    >
                      <Text style={[
                        styles.ratingText,
                        workoutRatings.workoutRating === rating && styles.selectedRatingText,
                      ]}>{rating}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.modalButton}
            onPress={() => {
              setShowRatingModal(false);
              if (ratingType === 'post') {
                completeWorkout();
              }
            }}
          >
            <Text style={styles.modalButtonText}>
              {ratingType === 'pre' ? 'Start Workout' : 'Complete Workout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderTemplateModal = () => {
    // Categorize templates
    const categorizedTemplates = {
      'Strength Training': workoutTemplates.filter(t => 
        !t.exercises.some(e => e.isCardio) && 
        !t.name.toLowerCase().includes('cardio') &&
        !t.name.toLowerCase().includes('abs'),
      ),
      'Cardio & HIIT': workoutTemplates.filter(t => 
        t.exercises.some(e => e.isCardio) || 
        t.name.toLowerCase().includes('cardio') ||
        t.name.toLowerCase().includes('hiit'),
      ),
      'Core & Abs': workoutTemplates.filter(t => 
        t.name.toLowerCase().includes('abs') || 
        t.name.toLowerCase().includes('core'),
      ),
    };

    const getTemplateIcon = (template) => {
      if (template.exercises.some(e => e.isCardio)) return 'fitness-outline';
      if (template.name.toLowerCase().includes('abs') || template.name.toLowerCase().includes('core')) return 'body-outline';
      return 'barbell-outline';
    };

    const getTemplateColor = (template) => {
      if (template.exercises.some(e => e.isCardio)) return '#ff6b35';
      if (template.name.toLowerCase().includes('abs') || template.name.toLowerCase().includes('core')) return '#8b5cf6';
      return '#007AFF';
    };

    return (
      <Modal
        visible={showTemplateModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Workout Templates</Text>
              <TouchableOpacity 
                onPress={() => setShowTemplateModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.templatesList}>
              {workoutTemplates.length === 0 ? (
                <View style={styles.emptyTemplates}>
                  <Ionicons name="document-text-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyTemplatesText}>No templates yet</Text>
                  <Text style={styles.emptyTemplatesSubtext}>
                    Complete a workout and save it as a template for quick access
                  </Text>
                </View>
              ) : (
                Object.entries(categorizedTemplates).map(([category, templates]) => {
                  if (templates.length === 0) return null;
                  
                  return (
                    <View key={category} style={styles.templateCategory}>
                      <Text style={styles.templateCategoryTitle}>{category}</Text>
                      {templates.map(template => (
                        <TouchableOpacity
                          key={template.id}
                          style={styles.templateItem}
                          onPress={() => startWorkoutFromTemplate(template)}
                        >
                          <View style={styles.templateIconContainer}>
                            <Ionicons 
                              name={getTemplateIcon(template)} 
                              size={24} 
                              color={getTemplateColor(template)} 
                            />
                          </View>
                          <View style={styles.templateInfo}>
                            <Text style={styles.templateTitle}>{template.name}</Text>
                            {template.description && (
                              <Text style={styles.templateDescription}>{template.description}</Text>
                            )}
                            <Text style={styles.templateExerciseCount}>
                              {template.exercises.length} exercises
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert(
                                'Delete Template',
                                'Are you sure you want to delete this template?',
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  {
                                    text: 'Delete',
                                    style: 'destructive',
                                    onPress: () => removeTemplate(template.id),
                                  },
                                ],
                              );
                            }}
                            style={styles.deleteTemplateButton}
                          >
                            <Ionicons name="trash-outline" size={20} color="#ff4444" />
                          </TouchableOpacity>
                        </TouchableOpacity>
                      ))}
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  const renderSaveTemplateModal = () => (
    <Modal
      visible={showSaveTemplateModal}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save as Template</Text>
            <TouchableOpacity 
              onPress={() => {
                setShowSaveTemplateModal(false);
                setTemplateName('');
                setTemplateDescription('');
              }}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.templateForm}>
            <Text style={styles.inputLabel}>Template Name</Text>
            <TextInput
              style={styles.templateInput}
              value={templateName}
              onChangeText={setTemplateName}
              placeholder="e.g., Upper Body Day"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.templateInput, styles.templateTextArea]}
              value={templateDescription}
              onChangeText={setTemplateDescription}
              placeholder="Describe this workout..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={3}
            />
          </View>
          
          <TouchableOpacity
            style={[styles.modalButton, !templateName.trim() && styles.disabledButton]}
            onPress={saveAsTemplate}
            disabled={!templateName.trim()}
          >
            <Text style={styles.modalButtonText}>Save Template</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  // Memoized recent workouts to prevent unnecessary re-renders
  const recentWorkouts = useMemo(() => {
    console.log('Workout history length:', workoutHistory.length);
    console.log('Workout history:', workoutHistory);
    // Sort by date (most recent first) and take the last 5
    return workoutHistory
      .sort((a, b) => {
        // const dateA = ...; // Quick fix: commented unused variable
        // const dateB = ...; // Quick fix: commented unused variable
        return new Date(dateB) - new Date(dateA);
      })
      .slice(0, 5);
  }, [workoutHistory]);

  // Helper function to get color based on rating
  const getRatingColor = (rating) => {
    if (rating >= 7) return '#28a745'; // Green
    if (rating >= 4) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  };

  // Helper function to get gradient color for mood/energy shift
  const getShiftColor = (pre, post) => {
    // const shift = ...; // Quick fix: commented unused variable
    if (shift >= 2) return '#28a745'; // Green - significant improvement
    if (shift >= 0) return '#17a2b8'; // Blue - slight improvement
    if (shift >= -1) return '#ffc107'; // Yellow - slight decline
    return '#dc3545'; // Red - significant decline
  };

  const renderCardioExercise = (exercise, exerciseIndex) => {
    // const history = ...; // Quick fix: commented unused variable
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
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color="#ff4444" />
          </TouchableOpacity>
        </View>
        
        {history && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyText}>
              Last: {history.date} - {history.duration} min, {history.calories} calories
            </Text>
          </View>
        )}

        <View style={styles.cardioContainer}>
          <View style={styles.cardioRow}>
            <View style={styles.cardioField}>
              <Text style={styles.cardioLabel}>Time (min)</Text>
              <TextInput
                style={styles.cardioInput}
                value={exercise.cardioData?.totalTime?.toString() || ''}
                onChangeText={(value) => updateCardioData(exercise.id, 'totalTime', value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.cardioField}>
              <Text style={styles.cardioLabel}>Pace</Text>
              <TextInput
                style={styles.cardioInput}
                value={exercise.cardioData?.pace || ''}
                onChangeText={(value) => updateCardioData(exercise.id, 'pace', value)}
                placeholder="8:30/mi"
              />
            </View>
          </View>
          <View style={styles.cardioRow}>
            <View style={styles.cardioField}>
              <Text style={styles.cardioLabel}>Calories</Text>
              <TextInput
                style={styles.cardioInput}
                value={exercise.cardioData?.calories?.toString() || ''}
                onChangeText={(value) => updateCardioData(exercise.id, 'calories', value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.cardioField}>
              <Text style={styles.cardioLabel}>Distance</Text>
              <TextInput
                style={styles.cardioInput}
                value={exercise.cardioData?.distance?.toString() || ''}
                onChangeText={(value) => updateCardioData(exercise.id, 'distance', value)}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderWeightExercise = (exercise, exerciseIndex) => {
    // const history = ...; // Quick fix: commented unused variable
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
              onPress={() => {
                console.log('Trashcan pressed for weight exercise:', exercise.name);
                removeExercise(exercise.id);
              }}
              style={styles.actionButton}
            >
              <Ionicons name="trash" size={20} color="#ff4444" />
            </TouchableOpacity>
          </View>
        </View>
        
        {history && (
          <View style={styles.historyContainer}>
            <Text style={styles.historyText}>
              Last: {history.date} - {history.sets} sets, {history.reps} reps @ {history.weight} lbs
            </Text>
          </View>
        )}
                     
        {exercise.sets.map((set, index) => (
          <View key={set.id}>
            <View style={styles.setRow}>
              <Text style={styles.setNumber}>Set {index + 1}</Text>
              <TextInput
                style={styles.input}
                placeholder="Reps"
                keyboardType="numeric"
                value={set.reps === '' ? '' : set.reps.toString()}
                onChangeText={(value) => updateSet(exercise.id, set.id, 'reps', value)}
                onFocus={() => {
                  if (set.reps === '') {
                    updateSet(exercise.id, set.id, 'reps', '');
                  }
                }}
              />
              <TextInput
                style={styles.input}
                placeholder="lbs"
                keyboardType="numeric"
                value={set.weight === '' ? '' : set.weight.toString()}
                onChangeText={(value) => updateSet(exercise.id, set.id, 'weight', value)}
                onFocus={() => {
                  if (set.weight === '') {
                    updateSet(exercise.id, set.id, 'weight', '');
                  }
                }}
              />
              {exercise.sets.length > 1 && (
                <TouchableOpacity 
                  onPress={() => removeSet(exercise.id, set.id)}
                  style={styles.removeSetButton}
                >
                  <Ionicons name="close-circle" size={20} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
            {/* Ghost line for next set */}
            {index === exercise.sets.length - 1 && (
              <View style={styles.ghostSetRow}>
                <Text style={styles.ghostSetNumber}>Set {index + 2}</Text>
                <TextInput
                  style={styles.ghostInput}
                  placeholder="Reps"
                  keyboardType="numeric"
                  onFocus={() => {
                    // Add a new set when user starts typing in ghost set
                    addSet(exercise.id);
                  }}
                />
                <TextInput
                  style={styles.ghostInput}
                  placeholder="lbs"
                  keyboardType="numeric"
                  onFocus={() => {
                    // Add a new set when user starts typing in ghost set
                    addSet(exercise.id);
                  }}
                />
              </View>
            )}
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {!currentWorkout ? (
          // Workout not started
          <View>
            <View style={styles.headerContainer}>
              <View style={styles.quoteContainer}>
                <MotivationalQuote />
              </View>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowTemplateModal(true)}
              >
                <Ionicons name="add-circle" size={48} color="#007AFF" />
              </TouchableOpacity>
            </View>
              
            {/* Recent Workouts - Simplified and more spacious */}
            {recentWorkouts.length > 0 && (
              <View style={styles.historySection}>
                <Text style={styles.historyTitle}>Recent Workouts</Text>
                {recentWorkouts.map((workout, index) => {
                  // const isExpanded = ...; // Quick fix: commented unused variable
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
                            { backgroundColor: getRatingColor(workout.ratings?.workoutRating || 5) },
                          ]} />
                          <Text style={styles.workoutDetailName}>
                            {new Date(workout.startTime).toLocaleDateString()}
                          </Text>
                        </View>
                        
                        <View style={styles.workoutSummaryRow}>
                          <View style={styles.workoutSummaryItem}>
                            <Ionicons name="time" size={14} color="#666" />
                            <Text style={styles.workoutSummaryText}>{workout.duration}min</Text>
                          </View>
                          <View style={styles.workoutSummaryItem}>
                            <Ionicons name="fitness" size={14} color="#666" />
                            <Text style={styles.workoutSummaryText}>{workout.exercises.length}ex</Text>
                          </View>
                          <View style={styles.workoutSummaryItem}>
                            <Ionicons name="star" size={14} color="#666" />
                            <Text style={[
                              styles.workoutSummaryText,
                              { color: getRatingColor(workout.ratings?.workoutRating || 5) },
                            ]}>
                              {workout.ratings?.workoutRating || 5}/10
                            </Text>
                          </View>
                        </View>
                        
                        <View style={styles.workoutHeaderActions}>
                          <TouchableOpacity
                            onPress={(e) => {
                              e.stopPropagation();
                              handleRemoveWorkout(workout.id);
                            }}
                            style={styles.deleteWorkoutButton}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="trash" size={18} color="#ff4444" />
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
                          {/* Exercises Section - Simplified */}
                          <View style={styles.detailSection}>
                            <Text style={styles.detailSectionTitle}>Exercises</Text>
                            {workout.exercises.map((exercise, exerciseIndex) => (
                              <View key={exercise.id} style={styles.exerciseDetail}>
                                <Text style={styles.exerciseDetailName}>{exercise.name}</Text>
                                {exercise.cardioData ? (
                                  <View style={styles.cardioDetail}>
                                    <Text style={styles.cardioDetailText}>
                                      {exercise.cardioData.duration} min • {exercise.cardioData.pace} • {exercise.cardioData.calories} cal
                                    </Text>
                                  </View>
                                ) : (
                                  <View style={styles.setsDetail}>
                                    <Text style={styles.setDetailText}>
                                      {exercise.sets.length} sets • {exercise.sets.reduce((sum, set) => sum + set.reps, 0)} total reps • {Math.round(exercise.sets.reduce((sum, set) => sum + set.weight, 0) / exercise.sets.length)} avg lbs
                                    </Text>
                                  </View>
                                )}
                              </View>
                            ))}
                          </View>

                          {/* Notes Section */}
                          {workout.notes && (
                            <View style={styles.detailSection}>
                              <Text style={styles.detailSectionTitle}>Notes</Text>
                              <Text style={styles.notesText}>{workout.notes}</Text>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        ) : (
          // Workout in progress
          <View style={styles.workoutContainer}>
            <View style={styles.workoutHeader}>
              <Text style={styles.workoutTitle}>Workout in Progress</Text>
              <View style={styles.workoutTimeContainer}>
                <Text style={styles.workoutTime}>
                  {Math.round((new Date() - currentWorkout.startTime) / 60000)} min
                </Text>
                <Text style={styles.workoutStartTime}>
                  Started: {currentWorkout.startTime.toLocaleTimeString()}
                </Text>
              </View>
            </View>

            {/* Exercise Categories */}
            <View style={styles.categoriesContainer}>
              <Text style={styles.sectionTitle}>Add Exercise</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {Object.keys(exerciseCategories).map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category && styles.selectedCategory,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText,
                    ]}>
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Exercise List */}
            {selectedCategory && (
              <View style={styles.exercisesContainer}>
                <Text style={styles.sectionTitle}>{selectedCategory} Exercises</Text>
                {exerciseCategories[selectedCategory].map((exercise) => (
                  <TouchableOpacity
                    key={exercise}
                    style={styles.exerciseButton}
                    onPress={() => addExercise(exercise)}
                  >
                    <View style={styles.exerciseButtonContent}>
                      <Text style={styles.exerciseText}>{exercise}</Text>
                      <Text style={styles.autoSetText}>
                        {(() => {
                          // const history = ...; // Quick fix: commented unused variable
                          console.log('Exercise history for', exercise, ':', history);
                          if (history) {
                            return `Last: ${history.date} - ${history.reps} reps @ ${history.weight} lbs`;
                          } else {
                            return 'No data available.';
                          }
                        })()}
                      </Text>
                    </View>
                    <Ionicons name="add" size={20} color="#007AFF" />
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Current Exercises */}
            {exercises.length > 0 && (
              <View style={styles.currentExercises}>
                <View style={styles.exercisesSummaryHeader}>
                  <Text style={styles.sectionTitle}>Current Exercises ({exercises.length})</Text>
                  <Text style={styles.exercisesSummary}>
                    {exercises.filter(ex => !isCardioExercise(ex.name)).reduce((total, ex) => total + ex.sets.length, 0)} sets
                  </Text>
                </View>
                {exercises
                  .sort((a, b) => a.order - b.order) // Maintain order
                  .map((exercise, exerciseIndex) => {
                    if (isCardioExercise(exercise.name)) {
                      return renderCardioExercise(exercise, exerciseIndex);
                    } else {
                      return renderWeightExercise(exercise, exerciseIndex);
                    }
                  })}
              </View>
            )}

            {/* Add Exercise Prompt */}
            {exercises.length === 0 && (
              <View style={styles.emptyExercisesContainer}>
                <Ionicons name="fitness-outline" size={48} color="#ccc" />
                <Text style={styles.emptyExercisesText}>No exercises added yet</Text>
                <Text style={styles.emptyExercisesSubtext}>Select a category above to add your first exercise</Text>
              </View>
            )}

            {/* Continue Adding or Finish Workout */}
            <View style={styles.workoutActions}>
              {exercises.length > 0 && (
                <>
                  <TouchableOpacity 
                    style={styles.saveTemplateButton} 
                    onPress={() => setShowSaveTemplateModal(true)}
                  >
                    <Ionicons name="save" size={20} color="#8b5cf6" />
                    <Text style={styles.saveTemplateButtonText}>Save as Template</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.addMoreButton} 
                    onPress={() => setSelectedCategory('Chest')}
                  >
                    <Ionicons name="add" size={20} color="#007AFF" />
                    <Text style={styles.addMoreButtonText}>Add More Exercises</Text>
                  </TouchableOpacity>
                </>
              )}
              
              <TouchableOpacity 
                style={[
                  styles.finishButton,
                  exercises.length === 0 && styles.finishButtonDisabled,
                ]} 
                onPress={finishWorkout}
                disabled={exercises.length === 0}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
                <Text style={styles.finishButtonText}>Finish Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
      {renderRatingModal()}
      {renderTemplateModal()}
      {renderSaveTemplateModal()}
      
      {/* Workout Verification Widget */}
      {showVerification && (
        <Suspense fallback={<GachaLoadingFallback />}>
          <GachaComponents.WorkoutVerificationWidget 
            workout={completedWorkout}
            onVerificationComplete={handleVerificationComplete}
          />
        </Suspense>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 20,
  },
  quoteContainer: {
    alignItems: 'center',
    width: '100%',
  },
  addButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: 10,
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
  },
  startOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  templateButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  templateButtonText: {
    color: '#007AFF',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  workoutContainer: {
    padding: 0,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  workoutTime: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  workoutTimeContainer: {
    alignItems: 'flex-end',
  },
  workoutStartTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  categoriesContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedCategory: {
    backgroundColor: '#007AFF',
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  selectedCategoryText: {
    color: '#fff',
  },
  exercisesContainer: {
    marginBottom: 20,
  },
  exerciseButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseText: {
    fontSize: 16,
    color: '#333',
  },
  exerciseButtonContent: {
    flex: 1,
  },
  autoSetText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
    marginTop: 2,
  },
  currentExercises: {
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  exerciseNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
    minWidth: 24,
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
  },
  actionButton: {
    marginLeft: 8,
  },
  exercisesSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  exercisesSummary: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  removeSetButton: {
    marginLeft: 8,
  },
  emptyExercisesContainer: {
    alignItems: 'center',
    padding: 40,
    marginVertical: 20,
  },
  emptyExercisesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyExercisesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  workoutActions: {
    gap: 12,
  },
  saveTemplateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    gap: 8,
  },
  saveTemplateButtonText: {
    color: '#8b5cf6',
    fontSize: 16,
    fontWeight: '600',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    gap: 8,
  },
  addMoreButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  finishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#28a745',
    paddingVertical: 15,
    borderRadius: 25,
    gap: 10,
  },
  finishButtonDisabled: {
    backgroundColor: '#ccc',
  },
  historyContainer: {
    backgroundColor: '#f0f8ff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
  },
  historyText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  setNumber: {
    fontSize: 14,
    color: '#666',
    width: 50,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  finishButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  ratingGrid: {
    marginBottom: 16,
  },
  ratingItem: {
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 2,
  },
  ratingButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  selectedRating: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  selectedRatingText: {
    color: '#fff',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  // Templates modal
  templatesList: {
    maxHeight: 400,
  },
  emptyTemplates: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTemplatesText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 12,
  },
  emptyTemplatesSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  templateCategory: {
    marginBottom: 20,
  },
  templateCategoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  templateItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  templateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  templateInfo: {
    flex: 1,
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  templateExerciseCount: {
    fontSize: 12,
    color: '#999',
  },
  deleteTemplateButton: {
    padding: 8,
  },
  // Save template modal
  templateForm: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  templateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  templateTextArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  // History Styles
  historySection: {
    marginTop: 40,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  historyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  historyCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  historyHeaderLeft: {
    flex: 1,
  },
  deleteWorkoutButton: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  historyDuration: {
    fontSize: 14,
    color: '#666',
  },
  historyExercises: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  historyRatings: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  ratingCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  exerciseCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  shiftContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  shiftGradient: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  shiftLabel: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  shiftValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  // New styles for cardio data
  cardioContainer: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cardioRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardioField: {
    flex: 1,
    marginHorizontal: 5,
  },
  cardioLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  cardioInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
  },
  ghostSetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
    gap: 8,
  },
  ghostSetNumber: {
    fontSize: 14,
    color: '#999',
    width: 50,
  },
  ghostInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    textAlign: 'center',
    backgroundColor: '#f8f9fa',
  },
  // Workout detail styles (matching WorkoutCalendar modal style)
  workoutDetailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  workoutDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  workoutDetailTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  workoutDetailDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  workoutDetailName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  workoutDetailTime: {
    fontSize: 14,
    color: '#666',
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
    flex: 1,
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
  workoutDetailExpanded: {
    padding: 20,
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
  },
  gachaLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gachaLoadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 16,
  },
});

export default WorkoutScreen;