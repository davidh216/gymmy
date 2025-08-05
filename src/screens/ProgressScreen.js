import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import AnalyticsCharts from '../components/AnalyticsCharts';
import BodyWeightTracker from '../components/BodyWeightTracker';
import GamificationStats from '../components/GamificationStats';
import QuestDisplay from '../components/QuestDisplay';

const ProgressScreen = ({ navigation, route }) => {
  const { workoutHistory, exerciseHistory, userStats, bodyWeights, isDemo } = useApp();
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(null);
  const [showAddMax, setShowAddMax] = useState(false);
  const [newMax, setNewMax] = useState({ weight: '', date: '' });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [activeTab, setActiveTab] = useState(route?.params?.initialTab || 'analytics'); // 'analytics', 'weight', 'levels', or 'quests'
  const [quests, setQuests] = useState(null);
  const [achievements, setAchievements] = useState(null);

  // Load quest and achievement data in demo mode
  useEffect(() => {
    if (isDemo) {
      const loadDemoData = async () => {
        try {
          const questsData = await StorageManager.loadData('@quests');
          const achievementsData = await StorageManager.loadData('@achievements');
          setQuests(questsData);
          setAchievements(achievementsData);
        } catch (error) {
          console.error('Error loading demo quest/achievement data:', error);
        }
      };
      loadDemoData();
    }
  }, [isDemo]);

  // Muscle groups with their exercises and level calculations
  const muscleGroups = useMemo(() => ({
    Chest: {
      exercises: ['Bench Press', 'Incline Bench Press', 'Decline Bench Press', 'Dumbbell Bench Press', 'Cable Fly'],
      icon: 'body',
      color: '#ff6b6b',
      level: 0,
      experience: 0,
    },
    Back: {
      exercises: ['Deadlift', 'Pull-Ups', 'Lat Pulldown', 'Bent-Over Rows', 'Single Arm Dumbbell Row'],
      icon: 'fitness',
      color: '#4ecdc4',
      level: 0,
      experience: 0,
    },
    Legs: {
      exercises: ['Squats', 'Leg Press', 'Leg Extension', 'Seated Calf Raise'],
      icon: 'walk',
      color: '#45b7d1',
      level: 0,
      experience: 0,
    },
    Shoulders: {
      exercises: ['Overhead Press', 'Arnold Press', 'Lateral Raise', 'Face Pulls'],
      icon: 'body',
      color: '#96ceb4',
      level: 0,
      experience: 0,
    },
    Arms: {
      exercises: ['Bicep Curls', 'Tricep Pushdowns', 'Hammer Curls', 'Skullcrushers'],
      icon: 'fitness',
      color: '#feca57',
      level: 0,
      experience: 0,
    },
    Cardio: {
      exercises: ['Running', 'Cycling', 'Rowing', 'Elliptical'],
      icon: 'flash',
      color: '#ff9ff3',
      level: 0,
      experience: 0,
    },
  }), []);

  // Calculate muscle group levels and experience
  const muscleGroupStats = useMemo(() => {
    const stats = {};
    
    Object.keys(muscleGroups).forEach(groupName => {
      const group = muscleGroups[groupName];
      let totalExperience = 0;
      let totalWorkouts = 0;
      
      // Calculate experience from workout history
      workoutHistory.forEach(workout => {
        const exercisesInGroup = workout.exercises.filter(exercise => 
          group.exercises.some(groupExercise => 
            exercise.name.toLowerCase().includes(groupExercise.toLowerCase())
          )
        );
        
        if (exercisesInGroup.length > 0) {
          totalWorkouts++;
          // Base experience per workout
          totalExperience += 50;
          
          // Bonus experience for good ratings
          if (workout.ratings?.workoutRating >= 7) {
            totalExperience += 25;
          }
          
          // Experience for each exercise
          exercisesInGroup.forEach(exercise => {
            if (exercise.cardioData) {
              // Cardio experience based on duration and calories
              totalExperience += Math.floor(exercise.cardioData.duration / 5);
              totalExperience += Math.floor(exercise.cardioData.calories / 50);
            } else if (exercise.sets) {
              // Strength experience based on total weight lifted
              const totalWeight = exercise.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
              totalExperience += Math.floor(totalWeight / 100);
            }
          });
        }
      });
      
      // Make muscle group mastery more difficult - require 200 XP per level
      const level = Math.floor(totalExperience / 200) + 1;
      
      stats[groupName] = {
        ...group,
        level,
        experience: totalExperience,
        totalWorkouts,
        nextLevelExp: (level * 200),
        progressToNext: (totalExperience % 200) / 200,
      };
    });
    
    return stats;
  }, [workoutHistory, muscleGroups]);

  // Calculate exercise levels within muscle groups
  const exerciseStats = useMemo(() => {
    const stats = {};
    
    Object.keys(muscleGroups).forEach(groupName => {
      const group = muscleGroups[groupName];
      stats[groupName] = {};
      
      group.exercises.forEach(exerciseName => {
        let totalExperience = 0;
        let totalWorkouts = 0;
        let bestWeight = 0;
        let bestReps = 0;
        let lastWorkout = null;
        
        // Find workouts with this exercise
        workoutHistory.forEach(workout => {
          const exercise = workout.exercises.find(ex => 
            ex.name.toLowerCase().includes(exerciseName.toLowerCase())
          );
          
          if (exercise) {
            totalWorkouts++;
            lastWorkout = workout;
            
            if (exercise.cardioData) {
              // Cardio exercise
              totalExperience += Math.floor(exercise.cardioData.duration / 5);
              totalExperience += Math.floor(exercise.cardioData.calories / 50);
            } else if (exercise.sets) {
              // Strength exercise
              exercise.sets.forEach(set => {
                totalExperience += Math.floor((set.weight * set.reps) / 50);
                if (set.weight > bestWeight) {
                  bestWeight = set.weight;
                  bestReps = set.reps;
                }
              });
            }
          }
        });
        
        const level = Math.floor(totalExperience / 50) + 1;
        
        stats[groupName][exerciseName] = {
          level,
          experience: totalExperience,
          totalWorkouts,
          bestWeight,
          bestReps,
          lastWorkout,
          nextLevelExp: (level * 50),
          progressToNext: (totalExperience % 50) / 50,
        };
      });
    });
    
    return stats;
  }, [workoutHistory, muscleGroups]);

  const getLevelColor = (level) => {
    if (level >= 10) return '#ff6b6b'; // Red for high levels
    if (level >= 7) return '#ffa726'; // Orange
    if (level >= 4) return '#66bb6a'; // Green
    if (level >= 2) return '#42a5f5'; // Blue
    return '#9e9e9e'; // Grey for low levels
  };

  const getLevelTitle = (level) => {
    if (level >= 10) return 'Master';
    if (level >= 7) return 'Expert';
    if (level >= 4) return 'Advanced';
    if (level >= 2) return 'Intermediate';
    return 'Beginner';
  };

  const renderMuscleGroupCard = (groupName, stats) => (
    <TouchableOpacity
      key={groupName}
      style={[styles.muscleGroupCard, { borderLeftColor: stats.color }]}
      onPress={() => setSelectedMuscleGroup(selectedMuscleGroup === groupName ? null : groupName)}
    >
      <View style={styles.muscleGroupHeader}>
        <View style={styles.muscleGroupInfo}>
          <Ionicons name={stats.icon} size={24} color={stats.color} />
          <View style={styles.muscleGroupText}>
            <Text style={styles.muscleGroupName}>{groupName}</Text>
            <Text style={styles.muscleGroupSubtitle}>
              Level {stats.level} • {stats.totalWorkouts} workouts
            </Text>
          </View>
        </View>
        <View style={styles.levelBadge}>
          <Text style={[styles.levelText, { color: getLevelColor(stats.level) }]}>
            {getLevelTitle(stats.level)}
          </Text>
        </View>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${stats.progressToNext * 100}%`,
                backgroundColor: stats.color 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {stats.experience} / {stats.nextLevelExp} XP
        </Text>
      </View>

      {/* Exercise List (when expanded) */}
      {selectedMuscleGroup === groupName && (
        <View style={styles.exerciseList}>
          {stats.exercises.map(exerciseName => {
            const exerciseStat = exerciseStats[groupName][exerciseName];
            return (
              <View key={exerciseName} style={styles.exerciseItem}>
                <View style={styles.exerciseHeader}>
                  <Text style={styles.exerciseName}>{exerciseName}</Text>
                  <View style={styles.exerciseLevel}>
                    <Text style={[styles.exerciseLevelText, { color: getLevelColor(exerciseStat.level) }]}>
                      Lv.{exerciseStat.level}
                    </Text>
                  </View>
                </View>
                <View style={styles.exerciseStats}>
                  <Text style={styles.exerciseStatText}>
                    {exerciseStat.totalWorkouts} workouts • {exerciseStat.experience} XP
                  </Text>
                  {exerciseStat.bestWeight > 0 && (
                    <Text style={styles.exerciseStatText}>
                      Best: {exerciseStat.bestWeight} lbs × {exerciseStat.bestReps} reps
                    </Text>
                  )}
                  {exerciseStat.lastWorkout && (
                    <Text style={styles.exerciseStatText}>
                      Last: {new Date(exerciseStat.lastWorkout.startTime).toLocaleDateString()}
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </TouchableOpacity>
  );

  const renderTabContent = () => {
    if (activeTab === 'analytics') {
      return <AnalyticsCharts workoutHistory={workoutHistory} exerciseHistory={exerciseHistory} userStats={userStats} bodyWeights={bodyWeights} />;
    }
    
    if (activeTab === 'weight') {
      return <BodyWeightTracker />;
    }
    
    if (activeTab === 'quests' && isDemo) {
      return <QuestDisplay quests={quests} achievements={achievements} />;
    }
    
    return (
      <ScrollView style={styles.scrollView}>
        {/* Level Progress Section */}
        {workoutHistory.length > 0 && (
          <View style={styles.section}>
            <GamificationStats userStats={userStats} />
          </View>
        )}

        {/* Overall Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Progress</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.level || 1}</Text>
              <Text style={styles.statLabel}>Overall Level</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.totalWorkouts || 0}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{userStats?.currentStreak || 0}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Muscle Groups */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Muscle Group Progress</Text>
          {Object.entries(muscleGroupStats).map(([groupName, stats]) =>
            renderMuscleGroupCard(groupName, stats)
          )}
        </View>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Progress & Analytics</Text>
        <Text style={styles.subtitle}>Track your progression and performance</Text>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
          onPress={() => setActiveTab('analytics')}
        >
          <Ionicons 
            name="analytics" 
            size={18} 
            color={activeTab === 'analytics' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}>
            Analytics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'weight' && styles.activeTab]}
          onPress={() => setActiveTab('weight')}
        >
          <Ionicons 
            name="scale" 
            size={18} 
            color={activeTab === 'weight' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'weight' && styles.activeTabText]}>
            Weight
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'levels' && styles.activeTab]}
          onPress={() => setActiveTab('levels')}
        >
          <Ionicons 
            name="trophy" 
            size={18} 
            color={activeTab === 'levels' ? '#007AFF' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'levels' && styles.activeTabText]}>
            Levels
          </Text>
        </TouchableOpacity>
        
        {isDemo && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'quests' && styles.activeTab]}
            onPress={() => setActiveTab('quests')}
          >
            <Ionicons 
              name="star" 
              size={18} 
              color={activeTab === 'quests' ? '#007AFF' : '#666'} 
            />
            <Text style={[styles.tabText, activeTab === 'quests' && styles.activeTabText]}>
              Quests
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Content */}
      {renderTabContent()}
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
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  muscleGroupCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  muscleGroupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  muscleGroupInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  muscleGroupText: {
    marginLeft: 12,
    flex: 1,
  },
  muscleGroupName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  muscleGroupSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
  },
  levelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  exerciseList: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
  },
  exerciseItem: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f8f8',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  exerciseLevel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  exerciseLevelText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  exerciseStats: {
    gap: 2,
  },
  exerciseStatText: {
    fontSize: 12,
    color: '#666',
  },
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 4,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  activeTab: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});

export default ProgressScreen; 