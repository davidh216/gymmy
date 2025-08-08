// src/components/multi-gymmy-ui/team-management/SynergyVisualizer.tsx
// Real-time synergy visualization with performance metrics

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GymmyCharacter } from '../../../../context/types/MultiGymmyTypes';
import { SynergyAnalysis } from './utils/SynergyUtils';
import { TeamPerformanceMetrics } from './utils/AnalyticsUtils';
import ConnectionLines from './ConnectionLines';

interface SynergyVisualizerProps {
  characters: GymmyCharacter[];
  synergyAnalysis: SynergyAnalysis;
  performanceMetrics: TeamPerformanceMetrics;
}

const SynergyVisualizer: React.FC<SynergyVisualizerProps> = ({
  characters,
  synergyAnalysis,
  performanceMetrics,
}) => {
  const hasActiveSynergies = synergyAnalysis.activeSynergies.length > 0;
  const hasRecommendations = synergyAnalysis.recommendations.length > 0;

  const renderPerformanceOverview = () => (
    <View style={styles.performanceSection}>
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

  const renderSynergyConnections = () => (
    <View style={styles.synergySection}>
      <Text style={styles.sectionTitle}>Active Synergies</Text>
      {hasActiveSynergies ? (
        <View style={styles.synergiesList}>
          {synergyAnalysis.activeSynergies.map((synergy, index) => (
            <View key={synergy.id} style={styles.synergyItem}>
              <View style={styles.synergyHeader}>
                <View style={[styles.synergyIndicator, { backgroundColor: synergy.color }]} />
                <Text style={styles.synergyType}>{synergy.synergyType}</Text>
                <Text style={styles.synergyStrength}>{synergy.strength}%</Text>
              </View>
              <Text style={styles.synergyDescription}>
                {getSynergyDescription(synergy.synergyType)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptySynergies}>
          <Ionicons name="link" size={24} color="#9ca3af" />
          <Text style={styles.emptySynergiesText}>No active synergies</Text>
          <Text style={styles.emptySynergiesSubtext}>
            Add more characters to unlock synergies
          </Text>
        </View>
      )}
    </View>
  );

  const renderOptimizationSuggestions = () => (
    <View style={styles.suggestionsSection}>
      <Text style={styles.sectionTitle}>Optimization</Text>
      {hasRecommendations ? (
        <View style={styles.suggestionsList}>
          {synergyAnalysis.recommendations.slice(0, 3).map((recommendation, index) => (
            <View key={index} style={styles.suggestionItem}>
              <Ionicons name="bulb" size={16} color="#007AFF" />
              <Text style={styles.suggestionText}>{recommendation}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptySuggestions}>
          <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          <Text style={styles.emptySuggestionsText}>Team is well optimized!</Text>
        </View>
      )}
    </View>
  );

  const renderCharacterGrid = () => (
    <View style={styles.charactersSection}>
      <Text style={styles.sectionTitle}>Team Composition</Text>
      <View style={styles.charactersGrid}>
        {characters.map((character, index) => (
          <View key={character.id} style={styles.characterCard}>
            <Text style={styles.characterEmoji}>{character.emoji}</Text>
            <Text style={styles.characterName} numberOfLines={1}>
              {character.name}
            </Text>
            <Text style={[styles.characterRarity, { color: getRarityColor(character.rarity) }]}>
              {character.rarity}
            </Text>
            <Text style={styles.characterLevel}>Lv.{character.level}</Text>
          </View>
        ))}
        {characters.length === 0 && (
          <View style={styles.emptyTeam}>
            <Ionicons name="people" size={24} color="#9ca3af" />
            <Text style={styles.emptyTeamText}>No characters added</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderPerformanceOverview()}
      {renderSynergyConnections()}
      {renderOptimizationSuggestions()}
      {renderCharacterGrid()}
    </ScrollView>
  );
};

// Helper functions
const getSynergyDescription = (synergyType: string): string => {
  switch (synergyType.toLowerCase()) {
    case 'legendary duo':
      return 'Powerful combination of legendary characters';
    case 'epic pair':
      return 'Strong synergy between epic characters';
    case 'rare trio':
      return 'Effective team of rare characters';
    case 'type diversity':
      return 'Balanced mix of character types';
    case 'specialization mix':
      return 'Complementary specializations';
    case 'complementary strengths':
      return 'Characters with different primary stats';
    default:
      return 'Character synergy bonus';
  }
};

const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'legendary': return '#FFD700';
    case 'epic': return '#9370DB';
    case 'rare': return '#4169E1';
    case 'common': return '#32CD32';
    default: return '#666';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  performanceSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
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
    fontSize: 24,
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
  synergySection: {
    marginBottom: 16,
  },
  synergiesList: {
    gap: 8,
  },
  synergyItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  synergyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  synergyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  synergyType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  synergyStrength: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  synergyDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 20,
  },
  emptySynergies: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  emptySynergiesText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginTop: 8,
  },
  emptySynergiesSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },
  suggestionsSection: {
    marginBottom: 16,
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    padding: 12,
  },
  suggestionText: {
    fontSize: 12,
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  emptySuggestions: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
  },
  emptySuggestionsText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
    marginTop: 8,
  },
  charactersSection: {
    marginBottom: 16,
  },
  charactersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  characterCard: {
    width: (width - 64) / 3 - 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
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
  characterRarity: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  characterLevel: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6b7280',
  },
  emptyTeam: {
    width: (width - 64) / 3 - 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderStyle: 'dashed',
  },
  emptyTeamText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default SynergyVisualizer;
