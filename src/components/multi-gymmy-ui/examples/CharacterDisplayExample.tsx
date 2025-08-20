// src/components/multi-gymmy-ui/examples/CharacterDisplayExample.tsx
// Comprehensive example demonstrating Sprint 1 visual character capabilities

import React, { useState, useRef } from 'react';
import {
  // View,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // Alert
} from 'react-native';
import {
  // Text
} from 'react-native';
import {
  // GymmyCharacter,
  // EvolutionResult
} from '../../../context/types/MultiGymmyTypes';

// Import all Sprint 1 components
import {
  // CharacterSprite
} from '../character-visual/CharacterSprite';
import {
  // CharacterMoodDisplay
} from '../character-visual/CharacterMoodDisplay';
import {
  // ExperienceVisualizer
} from '../character-visual/ExperienceVisualizer';
import {
  // EvolutionAnimation
} from '../character-visual/EvolutionAnimation';
import {
  // AnimationController,
  // AnimationControllerRef
} from '../character-visual/AnimationController';
import {
  // AnimationState
} from '../shared/AnimationUtils';

// ==============================================================================
// EXAMPLE COMPONENT
// ==============================================================================

interface CharacterDisplayExampleProps {
  character?: GymmyCharacter;
  onCharacterUpdate?: (character: GymmyCharacter) => void;
}

// Mock character data for demonstration
const createMockCharacter = (): GymmyCharacter => ({
  id: 'example-character-001',
  instance_id: 'inst-example-001',
  template_id: 'template-power-001',
  display_name: 'Mighty Mike',
  type: 'power',
  rarity: 'epic',
  specialization: 'strength_training',
  personality: {
    type: 'competitive',
    traits: ['determined', 'energetic', 'focused'],
    description: 'A competitive spirit who loves to push limits',
  },
  level: 25,
  current_exp: 2750,
  evolution_stage: 1,
  max_evolution: 3,
  bond_points: 850,
  base_stats: {
    strength: 95,
    cardio: 65,
    flexibility: 45,
    focus: 80,
    motivation: 90,
    loyalty: 75,
  },
  current_stats: {
    strength: 95,
    cardio: 65,
    flexibility: 45,
    focus: 80,
    motivation: 90,
    loyalty: 75,
  },
  acquired_date: new Date().toISOString(),
  last_interaction: new Date().toISOString(),
});

const mockEvolutionData: EvolutionResult = {
  character_id: 'example-character-001',
  old_stage: 1,
  new_stage: 2,
  stat_bonuses: {
    strength: 15,
    focus: 10,
    motivation: 12,
    loyalty: 8,
  },
  new_abilities: ['power_surge', 'determination_boost'],
  visual_changes: {
    stage: 2,
    visual_effects: [
      {
        id: 'evolution_aura',
        name: 'Power Aura',
        type: 'glow',
        intensity: 0.8,
        color_scheme: ['#FF6B35', '#FF9500'],
        trigger_conditions: ['always'],
      },
    ],
    appearance_changes: [
      {
        element: 'border',
        change_type: 'upgrade',
        description: 'Glowing power border effect',
      },
    ],
    animation_unlocks: ['power_flex', 'strength_celebration'],
  },
  materials_consumed: {
    rare_crystals: 5,
    power_essence: 3,
    bond_token: 2,
  },
};

export const CharacterDisplayExample: React.FC<CharacterDisplayExampleProps> = ({
  character: propCharacter,
  onCharacterUpdate,
}) => {
  // ==============================================================================
  // STATE AND REFS
  // ==============================================================================
  
  const [character, setCharacter] = useState<GymmyCharacter>(propCharacter || createMockCharacter());
  const [currentState, setCurrentState] = useState<AnimationState>('idle');
  const [recentWorkout, setRecentWorkout] = useState(false);
  const [experienceGained, setExperienceGained] = useState(0);
  const [showEvolution, setShowEvolution] = useState(false);
  
  // const animationControllerRef = ...; // Quick fix: commented unused variable
  
  // Experience table for level calculations
  const experienceTable: Record<number, number> = {};
  for (let level = 1; level <= 100; level++) {
    experienceTable[level] = Math.floor(100 * Math.pow(level, 1.8));
  }
  
  // ==============================================================================
  // HANDLERS
  // ==============================================================================
  
  const handleCharacterPress = () => {
    Alert.alert(
      character.display_name,
      `Level ${character.level} ${character.rarity} ${character.type}\\n` +
      `Specialization: ${character.specialization}\\n` +
      `Bond Points: ${character.bond_points}`,
      [
        { text: 'OK' }
      ]
    );
  };
  
  const handleMoodPress = (mood: any) => {
    Alert.alert(
      'Character Mood',
      `${character.display_name} is feeling ${mood.key}!\\n\\n${mood.description}`,
      [{ text: 'OK' }]
    );
  };
  
  const simulateWorkout = () => {
    // Simulate workout completion
    setRecentWorkout(true);
    setExperienceGained(125);
    
    // Update character experience
    // const newExp = ...; // Quick fix: commented unused variable
    const updatedCharacter = {
      ...character,
      current_exp: newExp,
      last_interaction: new Date().toISOString(),
    };
    
    setCharacter(updatedCharacter);
    
    // Trigger excited animation
    animationControllerRef.current?.playState('excited');
    setCurrentState('excited');
    
    // Clear recent workout after a delay
    setTimeout(() => {
      setRecentWorkout(false);
      setExperienceGained(0);
      animationControllerRef.current?.playState('idle');
      setCurrentState('idle');
    }, 5000);
    
    if (onCharacterUpdate) {
      onCharacterUpdate(updatedCharacter);
    }
  };
  
  const simulateEvolution = () => {
    if (character.evolution_stage >= character.max_evolution) {
      Alert.alert('Evolution', 'This character is already at maximum evolution!');
      return;
    }
    
    setShowEvolution(true);
    
    // Update character after evolution animation
    setTimeout(() => {
      const evolvedCharacter = {
        ...character,
        evolution_stage: character.evolution_stage + 1,
        current_stats: {
          ...character.current_stats,
          strength: character.current_stats.strength + 15,
          focus: character.current_stats.focus + 10,
          motivation: character.current_stats.motivation + 12,
          loyalty: character.current_stats.loyalty + 8,
        },
      };
      setCharacter(evolvedCharacter);
      
      if (onCharacterUpdate) {
        onCharacterUpdate(evolvedCharacter);
      }
    }, 3000);
  };
  
  const playAnimationState = (state: AnimationState) => {
    animationControllerRef.current?.playState(state);
    setCurrentState(state);
  };
  
  const playAnimationSequence = (sequenceName: string) => {
    animationControllerRef.current?.playSequence(sequenceName);
  };
  
  // ==============================================================================
  // RENDER
  // ==============================================================================
  
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Multi-Gymmy Visual Character System</Text>
        <Text style={styles.subtitle}>Sprint 1: Visual Foundation Demo</Text>
      </View>
      
      {/* Main Character Display */}
      <View style={styles.characterSection}>
        <Text style={styles.sectionTitle}>Character Display</Text>
        
        <AnimationController
          ref={animationControllerRef}
          character={character}
          initialState="idle"
          onStateChange={(state) => console.log('Animation state changed to:', state)}
        >
          {(animatedValues, controls) => (
            <View style={styles.characterContainer}>
              <CharacterSprite
                character={character}
                size="xl"
                state={currentState}
                onPress={handleCharacterPress}
                showMood={true}
                showLevel={true}
                showRarity={true}
                interactive={true}
                autoAnimate={true}
              />
            </View>
          )}
        </AnimationController>
        
        {/* Character Info */}
        <View style={styles.characterInfo}>
          <Text style={styles.characterName}>{character.display_name}</Text>
          <Text style={styles.characterDetails}>
            Level {character.level} • {character.rarity} • {character.type}
          </Text>
          <Text style={styles.characterSpec}>
            {character.specialization.replace('_', ' ')}
          </Text>
        </View>
      </View>
      
      {/* Experience Visualizer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Experience Progress</Text>
        <ExperienceVisualizer
          character={character}
          experienceTable={experienceTable}
          showNumbers={true}
          showLevel={true}
          animated={true}
          recentExperienceGain={experienceGained}
          animateExperienceGain={experienceGained > 0}
          onLevelUp={(newLevel) => {
            Alert.alert('Level Up!', `${character.display_name} reached level ${newLevel}!`);
          }}
          onExperienceGain={(exp) => {
            console.log(`${character.display_name} gained ${exp} experience!`);
          }}
        />
      </View>
      
      {/* Mood Display */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Character Mood</Text>
        <CharacterMoodDisplay
          character={character}
          recentWorkout={recentWorkout}
          experienceGained={experienceGained}
          size="large"
          showText={true}
          showIcon={true}
          interactive={true}
          onMoodPress={handleMoodPress}
        />
      </View>
      
      {/* Control Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Animation Controls</Text>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => playAnimationState('excited')}
          >
            <Text style={styles.buttonText}>Excited</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => playAnimationState('training')}
          >
            <Text style={styles.buttonText}>Training</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.successButton]}
            onPress={() => playAnimationState('celebrating')}
          >
            <Text style={styles.buttonText}>Celebrate</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.warningButton]}
            onPress={() => playAnimationState('tired')}
          >
            <Text style={styles.buttonText}>Tired</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => playAnimationState('idle')}
          >
            <Text style={styles.buttonText}>Idle</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.workoutButton]}
          onPress={simulateWorkout}
        >
          <Text style={styles.actionButtonText}>Complete Workout (+125 XP)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.evolutionButton]}
          onPress={simulateEvolution}
          disabled={character.evolution_stage >= character.max_evolution}
        >
          <Text style={styles.actionButtonText}>
            {character.evolution_stage >= character.max_evolution 
              ? 'Maximum Evolution Reached' 
              : `Evolve to Stage ${character.evolution_stage + 1}`
            }
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.sequenceButton]}
          onPress={() => playAnimationSequence('level_up_celebration')}
        >
          <Text style={styles.actionButtonText}>Play Level Up Sequence</Text>
        </TouchableOpacity>
      </View>
      
      {/* Character Stats Preview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Character Stats</Text>
        <View style={styles.statsContainer}>
          {Object.entries(character.current_stats).map(([stat, value]) => (
            <View key={stat} style={styles.statRow}>
              <Text style={styles.statLabel}>{stat.toUpperCase()}</Text>
              <View style={styles.statBar}>
                <View 
                  style={[
                    styles.statFill, 
                    { 
                      width: `${value}%`,
                      backgroundColor: value >= 80 ? '#34C759' : value >= 60 ? '#FF9500' : '#FF3B30'
                    }
                  ]} 
                />
              </View>
              <Text style={styles.statValue}>{value}</Text>
            </View>
          ))}
        </View>
      </View>
      
      {/* Evolution Animation Overlay */}
      {showEvolution && (
        <EvolutionAnimation
          character={character}
          evolutionData={mockEvolutionData}
          isPlaying={showEvolution}
          showBackground={true}
          onComplete={() => setShowEvolution(false)}
          onPhaseChange={(phase) => console.log('Evolution phase:', phase)}
        />
      )}
    </ScrollView>
  );
};

// ==============================================================================
// STYLES
// ==============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  
  section: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  characterSection: {
    backgroundColor: '#FFFFFF',
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
    textAlign: 'center',
  },
  
  characterContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  characterInfo: {
    alignItems: 'center',
  },
  
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  
  characterDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  
  characterSpec: {
    fontSize: 14,
    color: '#007AFF',
    textTransform: 'capitalize',
  },
  
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  
  primaryButton: {
    backgroundColor: '#007AFF',
  },
  
  secondaryButton: {
    backgroundColor: '#8E8E93',
  },
  
  successButton: {
    backgroundColor: '#34C759',
  },
  
  warningButton: {
    backgroundColor: '#FF9500',
  },
  
  buttonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  
  workoutButton: {
    backgroundColor: '#34C759',
  },
  
  evolutionButton: {
    backgroundColor: '#AF52DE',
  },
  
  sequenceButton: {
    backgroundColor: '#FF9500',
  },
  
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  
  statsContainer: {
    gap: 12,
  },
  
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    width: 80,
    textAlign: 'right',
  },
  
  statBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  
  statValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1C1C1E',
    width: 30,
    textAlign: 'left',
  },
});

export default CharacterDisplayExample;