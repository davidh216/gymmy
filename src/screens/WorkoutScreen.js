// src/screens/WorkoutScreenRefactored.js
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  Suspense,
} from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '../context';

// Import new workout components
import { 
  WorkoutHeader,
  WorkoutCategorySelector,
  ExerciseList,
  ActiveWorkout,
  WorkoutHistoryList,
  WorkoutTemplates,
  WorkoutRatingModal,
  SaveTemplateModal,
} from '../components/workout';

// Lazy load the heavy GachaComponents
const GachaComponents = React.lazy(
  () => import('../components/GachaComponents'),
);

// Loading component for lazy-loaded gacha components
const GachaLoadingFallback = () => (
  <View style={styles.gachaLoadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
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

  // Memoized exercise categories
  const exerciseCategories = useMemo(
    () => ({
      Chest: [
        'Incline Bench Press (Smith)',
        'Bench Press',
        'Cable Fly (Low)',
        'Cable Fly (Middle)',
        'Cable Fly (High)',
        'Bench Press (Smith)',
        'Incline Bench Press',
        'Incline Dumbbell Bench Press',
        'Dumbbell Bench Press',
        'Decline Bench Press',
      ],
      Back: [
        'Lat Pulldown (Wide-grip)',
        'Lat Pulldown (Close-grip)',
        'Deadlift',
        'Deadlift (Smith)',
        'Upright Barbell Row (Smith)',
        'Upright Barbell Row',
        'Single Arm Dumbbell Row',
        'Bent-Over Rows (Smith)',
        'Bent-Over Rows',
        'Pull-Ups',
        'Pull-Ups (Weighted)',
      ],
      Legs: [
        'Barbell Squat',
        'Barbell Squat (Smith)',
        'Seated Leg Press',
        'Seated Calf Raise',
        'Leg Extension',
      ],
      Shoulders: [
        'Standing Barbell Shoulder Press',
        'Seated Barbell Shoulder Press (Smith)',
        'Seated Dumbbell Shoulder Press',
        'Face Pulls',
        'Bent Over Reverse Fly',
        'Lateral Raise',
        'Arnold Press',
      ],
      Bicep: [
        'Standing Barbell Bicep Curl',
        'Preacher Curls',
        'Hammer Curls',
        'Concentration Curls',
        'Incline Dumbbell Curls',
        'Cable Curls',
      ],
      Tricep: [
        'Tricep Dips',
        'Tricep Pushdowns',
        'Skull Crushers',
        'Overhead Tricep Extension',
        'Close-Grip Bench Press',
        'Diamond Push-Ups',
      ],
      Core: [
        'Planks',
        'Crunches',
        'Russian Twists',
        'Leg Raises',
        'Bicycle Crunches',
        'Mountain Climbers',
        'Dead Bug',
        'Bird Dog',
      ],
      Cardio: [
        'Running',
        'Cycling',
        'Rowing',
        'Elliptical',
        'StairMaster',
        'Jump Rope',
        'Swimming',
        'Walking',
        'HIIT',
        'Circuit Training',
      ],
    }),
    [],
  );

  // Load template if templateId is provided
  useEffect(() => {
    if (templateId && workoutTemplates) {
      const template = workoutTemplates.find(t => t.id === templateId);
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

  const isCardioExercise = exerciseName => {
    return exerciseCategories.Cardio.includes(exerciseName);
  };

  const startNewWorkout = useCallback(() => {
    const now = new Date();
    const workout = {
      id: Date.now(),
      startTime: now,
      workoutDate: now.toISOString().split('T')[0],
      type: 'Weightlifting',
      exercises: [],
      ratings: { ...workoutRatings },
    };

    setCurrentWorkout(workout);
    setSelectedCategory('Chest');
    setRatingType('pre');
    setShowRatingModal(true);
  }, [workoutRatings]);

  const startWorkoutFromTemplate = useCallback(
    template => {
      const now = new Date();
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
      const templateExercises = template.exercises.map(
        (templateExercise, index) => {
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
            const sets = [];
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
              sets: sets,
              notes: '',
              order: index,
            };
          }
        },
      );

      setExercises(templateExercises);
      setShowTemplateModal(false);
      setSelectedCategory('Chest');
      setRatingType('pre');
      setShowRatingModal(true);
    },
    [workoutRatings],
  );

  const saveAsTemplate = useCallback(async () => {
    if (!templateName.trim() || exercises.length === 0) {
      Alert.alert(
        'Error',
        'Please enter a template name and add some exercises',
      );
      return;
    }

    const template = {
      id: Date.now(),
      name: templateName.trim(),
      description: templateDescription.trim(),
      exercises: exercises.map(exercise => ({
        name: exercise.name,
        isCardio: isCardioExercise(exercise.name),
        sets: exercise.sets?.length || 3,
        targetReps: exercise.sets?.[0]?.reps || '',
        targetWeight: exercise.sets?.[0]?.weight || '',
        targetDuration: exercise.cardioData?.totalTime || 0,
        targetCalories: exercise.cardioData?.calories || 0,
      })),
      category: 'Custom',
      createdAt: new Date(),
    };

    try {
      await addTemplate(template);
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');
      Alert.alert('Success', 'Template saved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save template');
    }
  }, [
    templateName,
    templateDescription,
    exercises,
    addTemplate,
    isCardioExercise,
  ]);

  const addExercise = useCallback(
    exerciseName => {
      const newExercise = {
        id: Date.now(),
        name: exerciseName,
        sets: isCardioExercise(exerciseName)
          ? []
          : [
            {
              id: Date.now() + 1,
              reps: '',
              weight: '',
              completed: false,
            },
          ],
        cardioData: isCardioExercise(exerciseName)
          ? {
            totalTime: 0,
            pace: '',
            calories: 0,
            distance: 0,
          }
          : null,
        notes: '',
        order: exercises.length,
      };

      setExercises(prev => [...prev, newExercise]);
    },
    [exercises.length, isCardioExercise],
  );

  const addSet = useCallback(exerciseId => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId) {
          const newSet = {
            id: Date.now(),
            reps: '',
            weight: '',
            completed: false,
          };
          return { ...exercise, sets: [...exercise.sets, newSet] };
        }
        return exercise;
      }),
    );
  }, []);

  const removeExercise = useCallback(exerciseId => {
    setExercises(prev => prev.filter(exercise => exercise.id !== exerciseId));
  }, []);

  const removeSet = useCallback((exerciseId, setId) => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.filter(set => set.id !== setId),
          };
        }
        return exercise;
      }),
    );
  }, []);

  const updateSet = useCallback((exerciseId, setId, field, value) => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map(set =>
              set.id === setId ? { ...set, [field]: value } : set,
            ),
          };
        }
        return exercise;
      }),
    );
  }, []);

  const updateCardioData = useCallback((exerciseId, field, value) => {
    setExercises(prev =>
      prev.map(exercise => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            cardioData: { ...exercise.cardioData, [field]: value },
          };
        }
        return exercise;
      }),
    );
  }, []);

  const getExerciseHistory = useCallback(
    exerciseName => {
      return exerciseHistory[exerciseName] || [];
    },
    [exerciseHistory],
  );

  const finishWorkout = useCallback(() => {
    setRatingType('post');
    setShowRatingModal(true);
  }, []);

  const completeWorkout = useCallback(async () => {
    if (!currentWorkout) return;

    const now = new Date();
    const completedWorkout = {
      ...currentWorkout,
      endTime: now,
      exercises: exercises,
      ratings: workoutRatings,
    };

    setCompletedWorkout(completedWorkout);
    setShowVerification(true);
  }, [currentWorkout, exercises, workoutRatings]);

  const handleRemoveWorkout = useCallback(
    async workoutId => {
      Alert.alert(
        'Delete Workout',
        'Are you sure you want to delete this workout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await removeWorkout(workoutId);
            },
          },
        ],
      );
    },
    [removeWorkout],
  );

  const handleVerificationComplete = useCallback(
    pointsEarned => {
      console.log('Verification complete, points earned:', pointsEarned);

      if (completedWorkout) {
        addWorkout(completedWorkout);
        updateExerciseHistory(completedWorkout.exercises);

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
        setCompletedWorkout(null);
      }

      setShowVerification(false);
    },
    [completedWorkout, addWorkout, updateExerciseHistory],
  );

  const toggleWorkoutExpansion = useCallback(workoutId => {
    setExpandedWorkouts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(workoutId)) {
        newSet.delete(workoutId);
      } else {
        newSet.add(workoutId);
      }
      return newSet;
    });
  }, []);

  const updateRating = useCallback((key, value) => {
    setWorkoutRatings(prev => ({ ...prev, [key]: value }));
  }, []);

  const submitRating = useCallback(() => {
    setShowRatingModal(false);
    if (ratingType === 'post') {
      completeWorkout();
    }
  }, [ratingType, completeWorkout]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {!currentWorkout ? (
          // Workout not started - Show header and history
          <View>
            <WorkoutHeader
              userStats={userStats}
              onStartWorkout={startNewWorkout}
              onShowTemplates={() => setShowTemplateModal(true)}
              onResetData={resetToDummyData}
            />
            <WorkoutHistoryList
              workoutHistory={workoutHistory}
              expandedWorkouts={expandedWorkouts}
              onToggleWorkoutExpansion={toggleWorkoutExpansion}
              onRemoveWorkout={handleRemoveWorkout}
            />
          </View>
        ) : (
          // Workout in progress
          <View style={styles.workoutInProgress}>
            <WorkoutCategorySelector
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              exerciseCategories={exerciseCategories}
            />

            <View style={styles.workoutContent}>
              <View style={styles.exerciseListSection}>
                <ExerciseList
                  selectedCategory={selectedCategory}
                  exerciseCategories={exerciseCategories}
                  onAddExercise={addExercise}
                  isCardioExercise={isCardioExercise}
                />
              </View>

              <View style={styles.activeWorkoutSection}>
                <ActiveWorkout
                  currentWorkout={currentWorkout}
                  exercises={exercises}
                  onFinishWorkout={finishWorkout}
                  onSaveAsTemplate={() => setShowSaveTemplateModal(true)}
                  isCardioExercise={isCardioExercise}
                  updateCardioData={updateCardioData}
                  removeExercise={removeExercise}
                  getExerciseHistory={getExerciseHistory}
                  addSet={addSet}
                  removeSet={removeSet}
                  updateSet={updateSet}
                />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modals */}
      <WorkoutRatingModal
        visible={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        ratingType={ratingType}
        workoutRatings={workoutRatings}
        onUpdateRating={updateRating}
        onSubmit={submitRating}
      />

      <WorkoutTemplates
        visible={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        workoutTemplates={workoutTemplates}
        onStartTemplate={startWorkoutFromTemplate}
        onRemoveTemplate={removeTemplate}
      />

      <SaveTemplateModal
        visible={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        templateName={templateName}
        templateDescription={templateDescription}
        onUpdateTemplateName={setTemplateName}
        onUpdateTemplateDescription={setTemplateDescription}
        onSave={saveAsTemplate}
      />

      {/* Gacha Verification Modal */}
      {showVerification && completedWorkout && (
        <Suspense fallback={<GachaLoadingFallback />}>
          <GachaComponents
            visible={showVerification}
            onClose={() => setShowVerification(false)}
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
  },
  workoutInProgress: {
    flex: 1,
  },
  workoutContent: {
    flex: 1,
    flexDirection: 'row',
  },
  exerciseListSection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
  },
  activeWorkoutSection: {
    flex: 1,
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
});

export default WorkoutScreen;
