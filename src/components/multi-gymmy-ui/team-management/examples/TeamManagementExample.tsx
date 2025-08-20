// src/components/multi-gymmy-ui/team-management/examples/TeamManagementExample.tsx
// Comprehensive example demonstrating Sprint 2 team management functionality

import React, { useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // Modal,
  // Alert,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // GymmyCharacter,
  // GymmyTeam
} from '../../../../../context/types/MultiGymmyTypes';
import TeamBuilder from '../TeamBuilder';
import TeamPresetManager from '../TeamPresetManager';
import TeamSaveLoad from '../TeamSaveLoad';
import TeamAnalyticsDashboard from '../TeamAnalyticsDashboard';
import EffectivenessMetrics from '../EffectivenessMetrics';
import {
  // createEmptyTeam
} from '../utils/TeamUtils';
import {
  // calculateTeamPerformance
} from '../utils/AnalyticsUtils';
import {
  // calculateTeamSynergies
} from '../utils/SynergyUtils';

// Mock character data for demonstration
const mockCharacters: GymmyCharacter[] = [
  {
    id: 'char_1',
    name: 'Power Gymmy',
    emoji: '💪',
    rarity: 'legendary',
    type: 'power',
    specialization: 'strength',
    level: 45,
    experience: 1250,
    evolution_stage: 2,
    current_stats: { strength: 85, cardio: 60, flexibility: 40, focus: 70, motivation: 90, loyalty: 75 },
    base_stats: { strength: 80, cardio: 55, flexibility: 35, focus: 65, motivation: 85, loyalty: 70 },
    created_at: '2024-01-01T00:00:00Z',
    last_updated: '2024-01-15T00:00:00Z',
  },
  {
    id: 'char_2',
    name: 'Blaze Gymmy',
    emoji: '🔥',
    rarity: 'epic',
    type: 'cardio',
    specialization: 'endurance',
    level: 38,
    experience: 980,
    evolution_stage: 2,
    current_stats: { strength: 50, cardio: 90, flexibility: 65, focus: 75, motivation: 85, loyalty: 60 },
    base_stats: { strength: 45, cardio: 85, flexibility: 60, focus: 70, motivation: 80, loyalty: 55 },
    created_at: '2024-01-02T00:00:00Z',
    last_updated: '2024-01-14T00:00:00Z',
  },
  {
    id: 'char_3',
    name: 'Zen Gymmy',
    emoji: '🧘',
    rarity: 'rare',
    type: 'flexibility',
    specialization: 'mindfulness',
    level: 32,
    experience: 720,
    evolution_stage: 1,
    current_stats: { strength: 40, cardio: 55, flexibility: 95, focus: 90, motivation: 75, loyalty: 80 },
    base_stats: { strength: 35, cardio: 50, flexibility: 90, focus: 85, motivation: 70, loyalty: 75 },
    created_at: '2024-01-03T00:00:00Z',
    last_updated: '2024-01-13T00:00:00Z',
  },
  {
    id: 'char_4',
    name: 'Steady Gymmy',
    emoji: '🎯',
    rarity: 'common',
    type: 'consistency',
    specialization: 'routine',
    level: 25,
    experience: 450,
    evolution_stage: 1,
    current_stats: { strength: 60, cardio: 70, flexibility: 55, focus: 80, motivation: 95, loyalty: 90 },
    base_stats: { strength: 55, cardio: 65, flexibility: 50, focus: 75, motivation: 90, loyalty: 85 },
    created_at: '2024-01-04T00:00:00Z',
    last_updated: '2024-01-12T00:00:00Z',
  },
];

const TeamManagementExample: React.FC = () => {
  const [currentTeam, setCurrentTeam] = useState<GymmyTeam>(createEmptyTeam());
  const [showTeamBuilder, setShowTeamBuilder] = useState(false);
  const [showPresetManager, setShowPresetManager] = useState(false);
  const [showSaveLoad, setShowSaveLoad] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showEffectiveness, setShowEffectiveness] = useState(false);

  // Calculate metrics
  // const performanceMetrics = ...; // Quick fix: commented unused variable
  // const synergyAnalysis = ...; // Quick fix: commented unused variable

  const handleSaveTeam = (team: GymmyTeam) => {
    setCurrentTeam(team);
    Alert.alert('Success', 'Team saved successfully!');
  };

  const handleLoadPreset = (preset: any) => {
    // Implementation for loading preset
    Alert.alert('Preset Loaded', `Loaded preset: ${preset.name}`);
  };

  const handleSavePreset = (preset: any) => {
    Alert.alert('Preset Saved', `Saved preset: ${preset.name}`);
  };

  const handleDeletePreset = (presetId: string) => {
    Alert.alert('Preset Deleted', `Deleted preset: ${presetId}`);
  };

  const handleLoadTeam = (team: GymmyTeam) => {
    setCurrentTeam(team);
    Alert.alert('Team Loaded', `Loaded team: ${team.name}`);
  };

  const renderFeatureCard = (
    title: string,
    description: string,
    icon: string,
    onPress: () => void,
    color: string = '#007AFF'
  ) => (
    <TouchableOpacity style={styles.featureCard} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </TouchableOpacity>
  );

  const renderTeamPreview = () => (
    <View style={styles.teamPreview}>
      <Text style={styles.sectionTitle}>Current Team</Text>
      {currentTeam.characters.length > 0 ? (
        <View style={styles.teamGrid}>
          {currentTeam.characters.map((character, index) => (
            <View key={character.id} style={styles.characterCard}>
              <Text style={styles.characterEmoji}>{character.emoji}</Text>
              <Text style={styles.characterName} numberOfLines={1}>
                {character.name}
              </Text>
              <Text style={styles.characterLevel}>Lv.{character.level}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyTeam}>
          <Ionicons name="people" size={32} color="#9ca3af" />
          <Text style={styles.emptyTeamText}>No characters in team</Text>
        </View>
      )}
    </View>
  );

  const renderMetricsPreview = () => (
    <View style={styles.metricsPreview}>
      <Text style={styles.sectionTitle}>Team Performance</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performanceMetrics.overallRating}</Text>
          <Text style={styles.metricLabel}>Overall</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performanceMetrics.synergyScore}</Text>
          <Text style={styles.metricLabel}>Synergy</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performanceMetrics.balanceScore}</Text>
          <Text style={styles.metricLabel}>Balance</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricValue}>{performanceMetrics.potentialScore}</Text>
          <Text style={styles.metricLabel}>Potential</Text>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Team Management Demo</Text>
        <Text style={styles.subtitle}>Sprint 2: Advanced Team Management UI</Text>
      </View>

      {renderTeamPreview()}
      {renderMetricsPreview()}

      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Team Management Features</Text>
        <View style={styles.featuresGrid}>
          {renderFeatureCard(
            'Team Builder',
            'Drag-and-drop team composition with synergy visualization',
            'construct',
            () => setShowTeamBuilder(true),
            '#007AFF'
          )}
          {renderFeatureCard(
            'Preset Manager',
            'Save and load team configurations',
            'folder',
            () => setShowPresetManager(true),
            '#10B981'
          )}
          {renderFeatureCard(
            'Save/Load',
            'Persistent team storage with AsyncStorage',
            'save',
            () => setShowSaveLoad(true),
            '#F59E0B'
          )}
          {renderFeatureCard(
            'Analytics Dashboard',
            'Comprehensive team performance analytics',
            'analytics',
            () => setShowAnalytics(true),
            '#8B5CF6'
          )}
          {renderFeatureCard(
            'Effectiveness Metrics',
            'Detailed effectiveness analysis and insights',
            'trending-up',
            () => setShowEffectiveness(true),
            '#EF4444'
          )}
        </View>
      </View>

      {/* Modals */}
      <Modal
        visible={showTeamBuilder}
        animationType="slide"
        onRequestClose={() => setShowTeamBuilder(false)}
      >
        <TeamBuilder
          availableCharacters={mockCharacters}
          existingTeam={currentTeam}
          onSaveTeam={handleSaveTeam}
          onClose={() => setShowTeamBuilder(false)}
        />
      </Modal>

      <Modal
        visible={showPresetManager}
        animationType="slide"
        onRequestClose={() => setShowPresetManager(false)}
      >
        <TeamPresetManager
          visible={showPresetManager}
          onClose={() => setShowPresetManager(false)}
          currentTeam={currentTeam}
          onLoadPreset={handleLoadPreset}
          onSavePreset={handleSavePreset}
          onDeletePreset={handleDeletePreset}
        />
      </Modal>

      <Modal
        visible={showSaveLoad}
        animationType="slide"
        onRequestClose={() => setShowSaveLoad(false)}
      >
        <TeamSaveLoad
          visible={showSaveLoad}
          onClose={() => setShowSaveLoad(false)}
          currentTeam={currentTeam}
          onLoadTeam={handleLoadTeam}
        />
      </Modal>

      <Modal
        visible={showAnalytics}
        animationType="slide"
        onRequestClose={() => setShowAnalytics(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Team Analytics</Text>
            <TouchableOpacity onPress={() => setShowAnalytics(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <TeamAnalyticsDashboard
            team={currentTeam}
            characters={currentTeam.characters}
            performanceMetrics={performanceMetrics}
            synergyAnalysis={synergyAnalysis}
          />
        </View>
      </Modal>

      <Modal
        visible={showEffectiveness}
        animationType="slide"
        onRequestClose={() => setShowEffectiveness(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Effectiveness Metrics</Text>
            <TouchableOpacity onPress={() => setShowEffectiveness(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          <EffectivenessMetrics
            characters={currentTeam.characters}
            performanceMetrics={performanceMetrics}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  teamPreview: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  characterCard: {
    width: 80,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  characterEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  characterName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 2,
  },
  characterLevel: {
    fontSize: 10,
    color: '#6b7280',
  },
  emptyTeam: {
    alignItems: 'center',
    padding: 20,
  },
  emptyTeamText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
  metricsPreview: {
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'center',
    flex: 1,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#007AFF',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  featuresSection: {
    padding: 20,
    backgroundColor: '#fff',
  },
  featuresGrid: {
    gap: 16,
  },
  featureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default TeamManagementExample;
