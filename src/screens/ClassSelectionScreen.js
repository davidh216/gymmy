// ClassSelectionScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Modal,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';

const { width, height } = Dimensions.get('window');

// Class Data with Street Fighter + RPG aesthetic
const FITNESS_CLASSES = {
  powerlifter: {
    name: 'POWERLIFTER',
    subtitle: 'The Iron Warrior',
    emoji: '🏋️‍♂️',
    quote: 'Strength is earned, not given.',
    description: 'Master of raw strength. Dominates the big three: squat, bench, deadlift.',
    philosophy: 'STRENGTH ABOVE ALL',
    color: '#8B0000', // Dark red
    bgGradient: ['#8B0000', '#4A0000'],
    bonuses: {
      compoundLiftXP: 2.0,
      strengthTrainingXP: 1.5,
      maxWeightBonus: 1.25,
      powerMoveXP: 1.8,
    },
    preferredExercises: ['squat', 'deadlift', 'bench_press', 'overhead_press'],
    skillTree: 'strength_mastery',
    stats: {
      power: 10,
      technique: 6,
      endurance: 4,
      flexibility: 2,
      mental: 8,
    },
  },
  
  bodybuilder: {
    name: 'BODYBUILDER',
    subtitle: 'The Sculptor',
    emoji: '💪',
    quote: 'Perfection through precision.',
    description: 'Artist of aesthetics. Masters isolation and perfect form.',
    philosophy: 'AESTHETICS THROUGH PRECISION',
    color: '#FFD700', // Gold
    bgGradient: ['#FFD700', '#B8860B'],
    bonuses: {
      isolationXP: 1.8,
      volumeBonus: 1.4,
      varietyXP: 1.6,
      aestheticXP: 2.0,
    },
    preferredExercises: ['cable_fly', 'lateral_raise', 'bicep_curl', 'tricep_extension'],
    skillTree: 'aesthetic_mastery',
    stats: {
      power: 6,
      technique: 10,
      endurance: 5,
      flexibility: 4,
      mental: 5,
    },
  },
  
  athlete: {
    name: 'ATHLETE',
    subtitle: 'The Competitor',
    emoji: '🏃‍♂️',
    quote: 'Train like you compete.',
    description: 'Peak performance through functional movement and conditioning.',
    philosophy: 'PERFORMANCE IS EVERYTHING',
    color: '#1E90FF', // Dodger blue
    bgGradient: ['#1E90FF', '#0047AB'],
    bonuses: {
      cardioXP: 2.0,
      functionalXP: 1.7,
      recoveryBonus: 1.3,
      explosiveXP: 1.9,
    },
    preferredExercises: ['burpees', 'box_jumps', 'battle_ropes', 'sprints'],
    skillTree: 'performance_mastery',
    stats: {
      power: 7,
      technique: 7,
      endurance: 10,
      flexibility: 6,
      mental: 7,
    },
  },
  
  yogi: {
    name: 'YOGI',
    subtitle: 'The Harmonizer',
    emoji: '🧘‍♀️',
    quote: 'Strength through serenity.',
    description: 'Balance of mind, body, and spirit through flow and control.',
    philosophy: 'MIND BODY SPIRIT UNITY',
    color: '#9370DB', // Medium purple
    bgGradient: ['#9370DB', '#4B0082'],
    bonuses: {
      flexibilityXP: 2.2,
      mindfulnessXP: 1.8,
      recoveryXP: 1.5,
      balanceXP: 2.0,
    },
    preferredExercises: ['yoga_flow', 'meditation', 'stretching', 'balance_poses'],
    skillTree: 'harmony_mastery',
    stats: {
      power: 3,
      technique: 8,
      endurance: 6,
      flexibility: 10,
      mental: 10,
    },
  },
  
  hybrid: {
    name: 'HYBRID',
    subtitle: 'The Adaptor',
    emoji: '⚡',
    quote: 'Adaptability is the ultimate strength.',
    description: 'Master of all trades. Adapts to any challenge with versatility.',
    philosophy: 'INFINITE POSSIBILITIES',
    color: '#FF6347', // Tomato
    bgGradient: ['#FF6347', '#B22222'],
    bonuses: {
      varietyXP: 1.5,
      adaptabilityXP: 1.4,
      allAroundBonus: 1.2,
      masteryXP: 1.3,
    },
    preferredExercises: [], // All exercises
    skillTree: 'versatility_mastery',
    stats: {
      power: 7,
      technique: 7,
      endurance: 7,
      flexibility: 7,
      mental: 7,
    },
  },
};

// Skill Trees with Street Fighter special move naming
const SKILL_TREES = {
  strength_mastery: {
    name: 'Path of Iron',
    branches: {
      raw_power: {
        name: 'Raw Power',
        color: '#FF0000',
        skills: [
          { id: 'iron_will', name: 'Iron Will', tier: 1, effect: '+10% XP on heavy lifts', icon: '💀' },
          { id: 'compound_devastator', name: 'Compound Devastator', tier: 2, effect: 'Unlock advanced compound moves', icon: '⚡' },
          { id: 'pr_annihilator', name: 'PR Annihilator', tier: 3, effect: 'Double XP for personal records', icon: '🔥' },
          { id: 'strength_demon', name: 'Strength Demon', tier: 4, effect: '+25% faster strength progression', icon: '👹' },
          { id: 'unstoppable_force', name: 'UNSTOPPABLE FORCE', tier: 5, effect: 'Ultimate strength mastery', icon: '👑' },
        ],
      },
      technique_master: {
        name: 'Perfect Form',
        color: '#00FF00',
        skills: [
          { id: 'form_focus', name: 'Form Focus', tier: 1, effect: 'Form tips for all exercises', icon: '🎯' },
          { id: 'movement_analyzer', name: 'Movement Analyzer', tier: 2, effect: 'AI form feedback', icon: '🤖' },
          { id: 'coaching_master', name: 'Coaching Master', tier: 3, effect: 'Help friends with technique', icon: '🧠' },
          { id: 'technique_sage', name: 'Technique Sage', tier: 4, effect: 'Unlock teaching abilities', icon: '🧙‍♂️' },
          { id: 'perfect_execution', name: 'PERFECT EXECUTION', tier: 5, effect: 'Flawless movement mastery', icon: '💎' },
        ],
      },
      mental_fortress: {
        name: 'Mental Fortress',
        color: '#0000FF',
        skills: [
          { id: 'focus_mode', name: 'Focus Mode', tier: 1, effect: 'Zero distraction workouts', icon: '🧘' },
          { id: 'streak_guardian', name: 'Streak Guardian', tier: 2, effect: 'Protect workout streaks', icon: '🛡️' },
          { id: 'motivation_surge', name: 'Motivation Surge', tier: 3, effect: 'Bonus XP on low energy', icon: '⚡' },
          { id: 'iron_mind', name: 'Iron Mind', tier: 4, effect: 'Mental strength bonuses', icon: '🧠' },
          { id: 'unbreakable_will', name: 'UNBREAKABLE WILL', tier: 5, effect: 'Ultimate mental mastery', icon: '🗿' },
        ],
      },
    },
  },
  // Additional skill trees would be defined here
};

// Character Selection Component
const ClassCard = ({ classKey, classData, selected, onSelect, animatedValue }) => {
  const scale = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const shadowOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 0.8],
  });

  return (
    <TouchableOpacity onPress={onSelect} activeOpacity={0.9}>
      <Animated.View 
        style={[
          styles.classCard,
          {
            transform: [{ scale }],
            shadowOpacity,
            borderColor: selected ? classData.color : '#333',
            borderWidth: selected ? 3 : 1,
          },
        ]}
      >
        {/* Background gradient effect */}
        <View style={[styles.cardBackground, { backgroundColor: classData.color }]} />
        
        {/* Class portrait area */}
        <View style={styles.portraitSection}>
          <Text style={styles.classEmoji}>{classData.emoji}</Text>
          <View style={styles.classInfo}>
            <Text style={styles.className}>{classData.name}</Text>
            <Text style={styles.classSubtitle}>{classData.subtitle}</Text>
            <Text style={styles.classQuote}>"{classData.quote}"</Text>
          </View>
        </View>

        {/* Stats display */}
        <View style={styles.statsSection}>
          {Object.entries(classData.stats).map(([stat, value]) => (
            <View key={stat} style={styles.statRow}>
              <Text style={styles.statName}>{stat.toUpperCase()}</Text>
              <View style={styles.statBar}>
                <View 
                  style={[
                    styles.statFill, 
                    { width: `${value * 10}%`, backgroundColor: classData.color },
                  ]} 
                />
              </View>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>

        {/* Philosophy banner */}
        <View style={[styles.philosophyBanner, { backgroundColor: classData.color }]}>
          <Text style={styles.philosophy}>{classData.philosophy}</Text>
        </View>

        {selected && (
          <View style={styles.selectedIndicator}>
            <Text style={styles.selectedText}>SELECTED</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Stats Preview Component
const StatsPreview = ({ classData }) => {
  if (!classData) return null;

  return (
    <View style={styles.previewContainer}>
      <Text style={styles.previewTitle}>CLASS BONUSES</Text>
      {Object.entries(classData.bonuses).map(([bonus, multiplier]) => (
        <View key={bonus} style={styles.bonusRow}>
          <Text style={styles.bonusName}>
            {bonus.replace(/([A-Z])/g, ' $1').toUpperCase()}
          </Text>
          <Text style={[styles.bonusValue, { color: classData.color }]}>
            +{Math.round((multiplier - 1) * 100)}%
          </Text>
        </View>
      ))}
    </View>
  );
};

// Confirmation Modal
const ClassConfirmationModal = ({ visible, classData, onConfirm, onCancel }) => {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.confirmationModal}>
          <Text style={styles.modalTitle}>⚠️ CHOOSE WISELY ⚠️</Text>
          <Text style={styles.modalMessage}>
            You are about to become a{' '}
            <Text style={[styles.modalClass, { color: classData?.color }]}>
              {classData?.name}
            </Text>
          </Text>
          <Text style={styles.modalWarning}>
            This choice is PERMANENT. Changing classes will reset ALL progress.
          </Text>
          <Text style={styles.modalConfirm}>
            Are you ready to begin your journey?
          </Text>
          
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: classData?.color }]} 
              onPress={onConfirm}
            >
              <Text style={styles.confirmText}>LOCK IN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Main Class Selection Screen
const ClassSelectionScreen = ({ navigation }) => {
  const { userStats, updateUserStats } = useApp();
  const [selectedClass, setSelectedClass] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [animatedValues] = useState(
    Object.keys(FITNESS_CLASSES).reduce((acc, key) => {
      acc[key] = new Animated.Value(0);
      return acc;
    }, {}),
  );

  // Handle class selection animation
  useEffect(() => {
    Object.keys(FITNESS_CLASSES).forEach(key => {
      Animated.timing(animatedValues[key], {
        toValue: selectedClass === key ? 1 : 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    });
  }, [selectedClass]);

  const handleClassConfirmation = () => {
    if (!selectedClass) return;

    const classData = FITNESS_CLASSES[selectedClass];
    
    // Update user stats with class selection
    updateUserStats({
      selectedClass,
      classLevel: 1,
      classXP: 0,
      skillPoints: 3, // Starting skill points
      unlockedSkills: [],
      classSelectionDate: new Date().toISOString(),
    });

    // Show success and navigate
    Alert.alert(
      '🎉 CLASS SELECTED! 🎉',
      `Welcome to the path of the ${classData.name}! Your journey begins now.`,
      [{ text: 'BEGIN TRAINING', onPress: () => navigation.goBack() }],
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>SELECT YOUR CLASS</Text>
          <Text style={styles.subtitle}>Choose your fighting style</Text>
        </View>

        {/* Class Cards */}
        {Object.entries(FITNESS_CLASSES).map(([key, classData]) => (
          <ClassCard
            key={key}
            classKey={key}
            classData={classData}
            selected={selectedClass === key}
            onSelect={() => setSelectedClass(key)}
            animatedValue={animatedValues[key]}
          />
        ))}

        {/* Stats Preview */}
        {selectedClass && (
          <StatsPreview classData={FITNESS_CLASSES[selectedClass]} />
        )}

        {/* Confirm Button */}
        {selectedClass && (
          <TouchableOpacity
            style={[
              styles.confirmClassButton,
              { backgroundColor: FITNESS_CLASSES[selectedClass].color },
            ]}
            onPress={() => setShowConfirmation(true)}
          >
            <Text style={styles.confirmClassText}>
              CHOOSE {FITNESS_CLASSES[selectedClass].name}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Confirmation Modal */}
      <ClassConfirmationModal
        visible={showConfirmation}
        classData={FITNESS_CLASSES[selectedClass]}
        onConfirm={handleClassConfirmation}
        onCancel={() => setShowConfirmation(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 5,
    letterSpacing: 1,
  },
  classCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    opacity: 0.8,
  },
  portraitSection: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  classEmoji: {
    fontSize: 60,
    marginRight: 20,
  },
  classInfo: {
    flex: 1,
  },
  className: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 2,
  },
  classSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontStyle: 'italic',
  },
  classQuote: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    fontStyle: 'italic',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    width: 80,
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  statValue: {
    width: 20,
    textAlign: 'center',
    fontSize: 12,
    color: '#1f2937',
    fontWeight: 'bold',
  },
  philosophyBanner: {
    padding: 10,
    alignItems: 'center',
  },
  philosophy: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#22c55e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
  },
  selectedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  previewContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
    textAlign: 'center',
    letterSpacing: 2,
  },
  bonusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bonusName: {
    fontSize: 12,
    color: '#6b7280',
  },
  bonusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  confirmClassButton: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  confirmClassText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmationModal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    margin: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 15,
    letterSpacing: 2,
  },
  modalMessage: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 15,
  },
  modalClass: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalWarning: {
    fontSize: 14,
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: 'bold',
  },
  modalConfirm: {
    fontSize: 16,
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 30,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  cancelButton: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cancelText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confirmButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});

// Export components for use in other files
export default ClassSelectionScreen;
export { FITNESS_CLASSES, SKILL_TREES };

// Usage example for adding to navigation:
/*
// In your navigation setup:
import ClassSelectionScreen from './src/screens/ClassSelectionScreen';

// Add to stack navigator:
<Stack.Screen 
  name="ClassSelection" 
  component={ClassSelectionScreen}
  options={{
    title: 'Choose Your Class',
    headerStyle: { backgroundColor: '#0a0a0a' },
    headerTintColor: '#fff',
  }}
/>
*/