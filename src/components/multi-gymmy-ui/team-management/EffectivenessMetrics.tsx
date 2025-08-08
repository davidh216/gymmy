// src/components/multi-gymmy-ui/team-management/EffectivenessMetrics.tsx
// Team effectiveness metrics and performance analytics

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GymmyCharacter } from '../../../../context/types/MultiGymmyTypes';
import { TeamPerformanceMetrics } from './utils/AnalyticsUtils';
import { 
  getStatColor, 
  getRoleColor, 
  getRoleIcon, 
  getSuggestionIcon,
  getStatEffectiveness,
  getRoleEffectiveness,
  getPriorityStyle,
  getPriorityBadgeStyle,
} from './utils/ComponentUtils';

interface EffectivenessMetricsProps {
  characters: GymmyCharacter[];
  performanceMetrics: TeamPerformanceMetrics;
}

const EffectivenessMetrics: React.FC<EffectivenessMetricsProps> = ({
  characters,
  performanceMetrics,
}) => {
  const renderOverallEffectiveness = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Overall Effectiveness</Text>
      <View style={styles.effectivenessScore}>
        <Text style={styles.scoreValue}>{performanceMetrics.effectivenessScore}</Text>
        <Text style={styles.scoreLabel}>/ 100</Text>
      </View>
      <View style={styles.scoreBreakdown}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemValue}>{performanceMetrics.synergyScore}</Text>
          <Text style={styles.scoreItemLabel}>Synergy</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemValue}>{performanceMetrics.balanceScore}</Text>
          <Text style={styles.scoreItemLabel}>Balance</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemValue}>{performanceMetrics.potentialScore}</Text>
          <Text style={styles.scoreItemLabel}>Potential</Text>
        </View>
      </View>
    </View>
  );

  const renderStatEffectiveness = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Stat Effectiveness</Text>
      <View style={styles.statGrid}>
        {Object.entries(performanceMetrics.statDistribution.average).map(([stat, value]) => (
          <View key={stat} style={styles.statItem}>
            <View style={styles.statHeader}>
              <Text style={styles.statName}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
              <Text style={styles.statValue}>{value}</Text>
            </View>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statFill, 
                  { 
                    width: `${value}%`,
                    backgroundColor: getStatColor(stat),
                  }
                ]} 
              />
            </View>
            <Text style={styles.statEffectiveness}>
              {getStatEffectiveness(value)} effectiveness
            </Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderRoleEffectiveness = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Role Effectiveness</Text>
      <View style={styles.roleGrid}>
        {Object.entries(performanceMetrics.roleCoverage.roleRedundancy).map(([role, count]) => (
          <View key={role} style={styles.roleItem}>
            <View style={styles.roleHeader}>
              <Ionicons name={getRoleIcon(role) as any} size={16} color={getRoleColor(role)} />
              <Text style={[styles.roleName, { color: getRoleColor(role) }]}>{role}</Text>
            </View>
            <Text style={styles.roleCount}>{count} characters</Text>
            <Text style={styles.roleEffectiveness}>
              {getRoleEffectiveness(count)} coverage
            </Text>
          </View>
        ))}
      </View>
      <View style={styles.coverageSummary}>
        <Text style={styles.coverageText}>
          Overall Coverage: {performanceMetrics.roleCoverage.coverageScore}%
        </Text>
        {performanceMetrics.roleCoverage.missingRoles.length > 0 && (
          <Text style={styles.missingRolesText}>
            Missing: {performanceMetrics.roleCoverage.missingRoles.join(', ')}
          </Text>
        )}
      </View>
    </View>
  );

  const renderOptimizationInsights = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Optimization Insights</Text>
      <View style={styles.insightsList}>
        {performanceMetrics.optimizationSuggestions.map((suggestion, index) => (
          <View key={index} style={[styles.insightItem, getPriorityStyle(suggestion.priority)]}>
            <View style={styles.insightHeader}>
              <Ionicons name={getSuggestionIcon(suggestion.type) as any} size={16} color="#007AFF" />
              <Text style={styles.insightTitle}>{suggestion.title}</Text>
              <View style={[styles.priorityBadge, getPriorityBadgeStyle(suggestion.priority)]}>
                <Text style={styles.priorityText}>{suggestion.priority}</Text>
              </View>
            </View>
            <Text style={styles.insightDescription}>{suggestion.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderCharacterContributions = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Character Contributions</Text>
      <View style={styles.contributionsList}>
        {characters.map((character) => {
          const contribution = calculateCharacterContribution(character);
          return (
            <View key={character.id} style={styles.contributionItem}>
              <View style={styles.characterInfo}>
                <Text style={styles.characterEmoji}>{character.emoji}</Text>
                <View style={styles.characterDetails}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.characterRole}>{getCharacterRole(character)}</Text>
                </View>
              </View>
              <View style={styles.contributionScore}>
                <Text style={styles.contributionValue}>{contribution}</Text>
                <Text style={styles.contributionLabel}>contribution</Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOverallEffectiveness()}
      {renderStatEffectiveness()}
      {renderRoleEffectiveness()}
      {renderOptimizationInsights()}
      {renderCharacterContributions()}
    </ScrollView>
  );
};

// Helper functions
const calculateCharacterContribution = (character: GymmyCharacter): number => {
  const baseStats = character.stats || {};
  const totalStats = Object.values(baseStats).reduce((sum, stat) => sum + (stat || 0), 0);
  return Math.round((totalStats / 500) * 100); // Normalize to 0-100 scale
};

const getCharacterRole = (character: GymmyCharacter): string => {
  return character.role || 'Unknown';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  effectivenessScore: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#007AFF',
  },
  scoreLabel: {
    fontSize: 18,
    color: '#8E8E93',
    marginLeft: 4,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreItemValue: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statGrid: {
    gap: 12,
  },
  statItem: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statBar: {
    height: 8,
    backgroundColor: '#E5E5EA',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  statFill: {
    height: '100%',
    borderRadius: 4,
  },
  statEffectiveness: {
    fontSize: 12,
    color: '#8E8E93',
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  roleItem: {
    flex: 1,
    minWidth: 120,
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  roleCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  roleEffectiveness: {
    fontSize: 12,
    color: '#8E8E93',
  },
  coverageSummary: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  coverageText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  missingRolesText: {
    fontSize: 12,
    color: '#FF3B30',
    marginTop: 4,
  },
  insightsList: {
    gap: 8,
  },
  insightItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginLeft: 8,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '500',
  },
  insightDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 24,
  },
  contributionsList: {
    gap: 8,
  },
  contributionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  characterEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  characterDetails: {
    flex: 1,
  },
  characterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  characterRole: {
    fontSize: 12,
    color: '#8E8E93',
  },
  contributionScore: {
    alignItems: 'center',
  },
  contributionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  contributionLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
});

export default EffectivenessMetrics;
