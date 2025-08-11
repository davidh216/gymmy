import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Character } from '../../context/types/MultiGymmyTypes';
import { EnhancedCharacter } from './utils/CollectionUtils';
import {
  getRarityColor,
  getClassIcon,
  formatCharacterLevel,
} from './utils/CollectionUtils';
import {
  getAvailableEvolutionPaths,
  calculateEvolutionPathProgress,
  getMaterialsNeeded,
  generateDailyTasks,
  getEvolutionDifficultyColor,
  getEvolutionDifficultyIcon,
  formatEvolutionTime,
  calculateEvolutionEfficiency,
} from './utils/EvolutionUtils';

interface EvolutionPlannerProps {
  character: EnhancedCharacter;
  onClose: () => void;
  onEvolve?: (character: Character, evolutionPath: any) => void;
}

export const EvolutionPlanner: React.FC<EvolutionPlannerProps> = ({
  character,
  onClose,
  onEvolve,
}) => {
  const [selectedPathIndex, setSelectedPathIndex] = useState(0);

  const evolutionPaths = useMemo(() => {
    return getAvailableEvolutionPaths(character);
  }, [character]);

  const selectedPath = evolutionPaths[selectedPathIndex];
  const evolutionProgress = selectedPath ? calculateEvolutionPathProgress(character, selectedPath) : 0;
  const materialsNeeded = selectedPath ? getMaterialsNeeded(character, selectedPath) : [];
  const dailyTasks = selectedPath ? generateDailyTasks(character, selectedPath) : [];
  const evolutionEfficiency = selectedPath ? calculateEvolutionEfficiency(character, selectedPath) : 0;

  const handleEvolve = () => {
    if (!selectedPath) return;

    Alert.alert(
      'Confirm Evolution',
      `Are you sure you want to evolve ${character.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Evolve',
          style: 'destructive',
          onPress: () => {
            onEvolve?.(character, selectedPath);
            onClose();
          },
        },
      ]
    );
  };

  const renderEvolutionPath = (path: any, index: number) => {
    const isSelected = index === selectedPathIndex;
    const progress = calculateEvolutionPathProgress(character, path);
    const difficultyColor = getEvolutionDifficultyColor(path.difficulty);
    const difficultyIcon = getEvolutionDifficultyIcon(path.difficulty);

    return (
      <TouchableOpacity
        key={index}
        style={[styles.evolutionPathCard, isSelected && styles.selectedPathCard]}
        onPress={() => setSelectedPathIndex(index)}
      >
        <View style={styles.pathHeader}>
          <View style={styles.pathInfo}>
            <Text style={styles.pathName}>{path.name}</Text>
            <Text style={styles.pathDescription}>{path.description}</Text>
          </View>
          <View style={styles.pathMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: difficultyColor }]}>
              <Ionicons name={difficultyIcon} size={16} color="#FFF" />
              <Text style={styles.difficultyText}>{path.difficulty}</Text>
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>

        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: difficultyColor },
            ]}
          />
        </View>

        <View style={styles.pathBenefits}>
          <Text style={styles.benefitsTitle}>Benefits:</Text>
          {path.benefits.map((benefit: any, benefitIndex: number) => (
            <View key={benefitIndex} style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#26DE81" />
              <Text style={styles.benefitText}>{benefit.description}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderMaterialsSection = () => {
    if (!selectedPath || materialsNeeded.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Required Materials</Text>
        <View style={styles.materialsCard}>
          {materialsNeeded.map((material, index) => (
            <View key={index} style={styles.materialItem}>
              <View style={styles.materialInfo}>
                <Text style={styles.materialName}>{material.name}</Text>
                <Text style={styles.materialDescription}>{material.description}</Text>
              </View>
              <View style={styles.materialCount}>
                <Text style={styles.currentCount}>{material.current}</Text>
                <Text style={styles.separator}>/</Text>
                <Text style={styles.requiredCount}>{material.required}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderDailyTasksSection = () => {
    if (!selectedPath || dailyTasks.length === 0) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Tasks</Text>
        <View style={styles.tasksCard}>
          {dailyTasks.map((task, index) => (
            <View key={index} style={styles.taskItem}>
              <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{task.name}</Text>
                <Text style={styles.taskDescription}>{task.description}</Text>
              </View>
              <View style={styles.taskProgress}>
                <Text style={styles.taskProgressText}>
                  {task.progress}/{task.target}
                </Text>
                <View style={styles.taskProgressBar}>
                  <View
                    style={[
                      styles.taskProgressFill,
                      { width: `${(task.progress / task.target) * 100}%` },
                    ]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderEfficiencySection = () => {
    if (!selectedPath) return null;

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolution Efficiency</Text>
        <View style={styles.efficiencyCard}>
          <View style={styles.efficiencyItem}>
            <Ionicons name="speedometer" size={20} color="#4ECDC4" />
            <Text style={styles.efficiencyLabel}>Efficiency Score</Text>
            <Text style={styles.efficiencyValue}>{Math.round(evolutionEfficiency)}%</Text>
          </View>
          <View style={styles.efficiencyItem}>
            <Ionicons name="time" size={20} color="#4ECDC4" />
            <Text style={styles.efficiencyLabel}>Estimated Time</Text>
            <Text style={styles.efficiencyValue}>
              {formatEvolutionTime(selectedPath.estimatedTime)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evolution Planner</Text>
        <TouchableOpacity
          style={styles.evolveButton}
          onPress={handleEvolve}
          disabled={evolutionProgress < 100}
        >
          <Ionicons name="trending-up" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Character Info */}
        <View style={styles.characterSection}>
          <View style={styles.characterInfo}>
            <Text style={styles.characterEmoji}>{character.emoji}</Text>
            <View style={styles.characterDetails}>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterLevel}>
                {formatCharacterLevel(character.level)}
              </Text>
            </View>
          </View>
          <View style={styles.characterStats}>
            <Text style={[styles.rarityText, { color: getRarityColor(character.rarity) }]}>
              {character.rarity.toUpperCase()}
            </Text>
            <Text style={styles.classText}>{character.class}</Text>
          </View>
        </View>

        {/* Evolution Paths */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Evolution Paths</Text>
          {evolutionPaths.map((path, index) => renderEvolutionPath(path, index))}
        </View>

        {/* Materials Section */}
        {renderMaterialsSection()}

        {/* Daily Tasks Section */}
        {renderDailyTasksSection()}

        {/* Efficiency Section */}
        {renderEfficiencySection()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
  },
  evolveButton: {
    padding: 8,
    opacity: 0.7,
  },
  content: {
    flex: 1,
  },
  characterSection: {
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  characterDetails: {
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  characterLevel: {
    fontSize: 14,
    color: '#666',
  },
  characterStats: {
    alignItems: 'flex-end',
  },
  rarityText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  classText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  evolutionPathCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedPathCard: {
    borderColor: '#4ECDC4',
    borderWidth: 2,
  },
  pathHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  pathInfo: {
    flex: 1,
  },
  pathName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  pathDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 18,
  },
  pathMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#F0F0F0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  pathBenefits: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  materialsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  materialItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  materialInfo: {
    flex: 1,
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  materialDescription: {
    fontSize: 14,
    color: '#666',
  },
  materialCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#26DE81',
  },
  separator: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 4,
  },
  requiredCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  tasksCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskItem: {
    marginBottom: 16,
  },
  taskInfo: {
    marginBottom: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
  },
  taskProgress: {
    alignItems: 'flex-end',
  },
  taskProgressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  taskProgressBar: {
    height: 6,
    backgroundColor: '#F0F0F0',
    borderRadius: 3,
    width: 100,
  },
  taskProgressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
    borderRadius: 3,
  },
  efficiencyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  efficiencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  efficiencyLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    marginLeft: 12,
  },
  efficiencyValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
}); 