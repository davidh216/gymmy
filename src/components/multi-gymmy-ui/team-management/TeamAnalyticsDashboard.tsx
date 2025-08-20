// src/components/multi-gymmy-ui/team-management/TeamAnalyticsDashboard.tsx
// Comprehensive team performance analytics dashboard

import React, { useMemo } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // GymmyCharacter,
  // GymmyTeam
} from '../../../../context/types/MultiGymmyTypes';
import {
  // SynergyAnalysis
} from './utils/SynergyUtils';
import {
  // TeamPerformanceMetrics
} from './utils/AnalyticsUtils';
import {
  // getStatColor,
  // getRoleColor,
  // getRoleIcon,
  // getSuggestionIcon,
  // getPriorityStyle,
  // getPriorityBadgeStyle,
  // 
} from './utils/ComponentUtils';

interface TeamAnalyticsDashboardProps {
  team: GymmyTeam;
  characters: GymmyCharacter[];
  performanceMetrics: TeamPerformanceMetrics;
  synergyAnalysis: SynergyAnalysis;
}

const TeamAnalyticsDashboard: React.FC<TeamAnalyticsDashboardProps> = ({
  team,
  characters,
  performanceMetrics,
  synergyAnalysis,
}) => {
  const renderOverallScore = () => (
    <View style={styles.scoreSection}>
      <Text style={styles.scoreTitle}>Overall Team Score</Text>
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreValue}>{performanceMetrics.overallRating}</Text>
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
        <View style={styles.scoreItem}>
          <Text style={styles.scoreItemValue}>{performanceMetrics.effectivenessScore}</Text>
          <Text style={styles.scoreItemLabel}>Effectiveness</Text>
        </View>
      </View>
    </View>
  );

  const renderStatDistribution = () => (
    <View style={styles.statSection}>
      <Text style={styles.sectionTitle}>Stat Distribution</Text>
      <View style={styles.statGrid}>
        {Object.entries(performanceMetrics.statDistribution.average).map(([stat, value]) => (
          <View key={stat} style={styles.statItem}>
            <Text style={styles.statName}>{stat.charAt(0).toUpperCase() + stat.slice(1)}</Text>
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
            <Text style={styles.statValue}>{value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.statSummary}>
        <Text style={styles.statSummaryText}>
          Balance: {performanceMetrics.statDistribution.balance}%
        </Text>
        <Text style={styles.statSummaryText}>
          Strongest: {performanceMetrics.statDistribution.strongestAreas.join(', ')}
        </Text>
        <Text style={styles.statSummaryText}>
          Weakest: {performanceMetrics.statDistribution.weakestAreas.join(', ')}
        </Text>
      </View>
    </View>
  );

  const renderRoleCoverage = () => (
    <View style={styles.roleSection}>
      <Text style={styles.sectionTitle}>Role Coverage</Text>
      <View style={styles.roleGrid}>
        {Object.entries(performanceMetrics.roleCoverage.roleRedundancy).map(([role, count]) => (
          <View key={role} style={styles.roleItem}>
            <Ionicons name={getRoleIcon(role) as any} size={16} color={getRoleColor(role)} />
            <Text style={[styles.roleName, { color: getRoleColor(role) }]}>{role}</Text>
            <Text style={styles.roleCount}>{count} characters</Text>
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

  const renderOptimizationSuggestions = () => (
    <View style={styles.suggestionsSection}>
      <Text style={styles.sectionTitle}>Optimization Suggestions</Text>
      <View style={styles.suggestionsList}>
        {performanceMetrics.optimizationSuggestions.slice(0, 3).map((suggestion, index) => (
          <View key={index} style={[styles.suggestionItem, getPriorityStyle(suggestion.priority)]}>
            <View style={styles.suggestionHeader}>
              <Ionicons name={getSuggestionIcon(suggestion.type) as any} size={16} color="#007AFF" />
              <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
              <View style={[styles.priorityBadge, getPriorityBadgeStyle(suggestion.priority)]}>
                <Text style={styles.priorityText}>{suggestion.priority}</Text>
              </View>
            </View>
            <Text style={styles.suggestionDescription}>{suggestion.description}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderSynergyAnalysis = () => (
    <View style={styles.synergySection}>
      <Text style={styles.sectionTitle}>Synergy Analysis</Text>
      <View style={styles.synergyList}>
        {synergyAnalysis.activeSynergies.slice(0, 5).map((synergy, index) => (
          <View key={index} style={styles.synergyItem}>
            <View style={styles.synergyHeader}>
              <Text style={styles.synergyName}>{synergy.name}</Text>
              <Text style={styles.synergyStrength}>{synergy.strength}</Text>
            </View>
            <Text style={styles.synergyDescription}>{synergy.description}</Text>
            <View style={styles.synergyCharacters}>
              {synergy.characters.map((charId) => {
                // const character = ...; // Quick fix: commented unused variable
                return character ? (
                  <Text key={charId} style={styles.synergyCharacter}>
                    {character.emoji} {character.name}
                  </Text>
                ) : null;
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderOverallScore()}
      {renderStatDistribution()}
      {renderRoleCoverage()}
      {renderOptimizationSuggestions()}
      {renderSynergyAnalysis()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scoreSection: {
    padding: 16,
    backgroundColor: '#F2F2F7',
    marginBottom: 16,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  scoreContainer: {
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
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  scoreItemLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  statSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  statGrid: {
    gap: 12,
    marginBottom: 12,
  },
  statItem: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  statName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
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
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  statSummary: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  statSummaryText: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 2,
  },
  roleSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
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
  roleName: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  roleCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginTop: 4,
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
  suggestionsSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  suggestionsList: {
    gap: 8,
  },
  suggestionItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
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
  suggestionDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 24,
  },
  synergySection: {
    padding: 16,
  },
  synergyList: {
    gap: 8,
  },
  synergyItem: {
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
  },
  synergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  synergyName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
  },
  synergyStrength: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
  },
  synergyDescription: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 8,
  },
  synergyCharacters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  synergyCharacter: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E5F9FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
});

export default TeamAnalyticsDashboard;
