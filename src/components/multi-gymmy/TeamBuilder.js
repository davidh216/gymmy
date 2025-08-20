// src/components/multi-gymmy/TeamBuilder.js
// Advanced team builder with formation selection, synergy calculation, and performance analysis

import React, { useState, useEffect, useMemo } from 'react';
import {
  // View,
  // Text,
  // ScrollView,
  // TouchableOpacity,
  // StyleSheet,
  // Dimensions,
  // Modal,
  // Alert,
  // TextInput,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import CharacterGallery from './CharacterGallery';

const { width, height } = Dimensions.get('window');

// Mock formations from TeamManagementSystem
const FORMATIONS = {
  balanced_core: {
    name: 'Balanced Core',
    description: 'A well-rounded formation providing balanced coverage',
    positions: ['Leader', 'Motivator', 'Specialist', 'Support'],
    bonuses: { balance: 20, synergy: 15 },
  },
  power_house: {
    name: 'Power House',
    description: 'Maximize strength training potential',
    positions: ['Powerhouse Leader', 'Strength Alpha', 'Strength Beta', 'Power Support'],
    bonuses: { strength: 30, power: 25 },
  },
  cardio_squad: {
    name: 'Cardio Squadron',
    description: 'Optimized for cardiovascular training',
    positions: ['Pace Leader', 'Endurance Specialist', 'Cardio Motivator', 'Recovery Support'],
    bonuses: { cardio: 30, endurance: 25 },
  },
  zen_circle: {
    name: 'Zen Circle',
    description: 'Centered on mindfulness and flexibility',
    positions: ['Zen Master', 'Flexibility Guide', 'Mindfulness Coach', 'Balance Keeper'],
    bonuses: { flexibility: 30, focus: 25 },
  },
};

// Mock team performance calculation
const calculateTeamPerformance = (characters, formation) => {
  if (characters.length === 0) {
    return {
      overall_rating: 0,
      synergy_score: 0,
      balance_score: 0,
      potential_score: 0,
      synergies: [],
      optimization_suggestions: [],
    };
  }

  // Calculate basic metrics
  const totalStats = characters.reduce((sum, char) => ({
    strength: sum.strength + char.current_stats.strength,
    cardio: sum.cardio + char.current_stats.cardio,
    flexibility: sum.flexibility + char.current_stats.flexibility,
    focus: sum.focus + char.current_stats.focus,
    motivation: sum.motivation + char.current_stats.motivation,
    loyalty: sum.loyalty + char.current_stats.loyalty,
  }), { strength: 0, cardio: 0, flexibility: 0, focus: 0, motivation: 0, loyalty: 0 });

  const averageStats = Object.keys(totalStats).reduce((avg, key) => ({
    ...avg,
    [key]: Math.round(totalStats[key] / characters.length),
  }), {});

  // Calculate balance score
  // const statValues = ...; // Quick fix: commented unused variable
  // const maxStat = ...; // Quick fix: commented unused variable
  // const minStat = ...; // Quick fix: commented unused variable
  // const balanceScore = ...; // Quick fix: commented unused variable

  // Calculate synergy score based on character combinations
  let synergyScore = 50; // Base score
  // const rarities = ...; // Quick fix: commented unused variable
  // const types = ...; // Quick fix: commented unused variable
  // const specializations = ...; // Quick fix: commented unused variable

  // Rarity synergies
  // const legendaryCount = ...; // Quick fix: commented unused variable
  // const epicCount = ...; // Quick fix: commented unused variable
  if (legendaryCount >= 2) synergyScore += 20;
  if (epicCount >= 2) synergyScore += 15;

  // Type synergies
  // const uniqueTypes = ...; // Quick fix: commented unused variable
  if (uniqueTypes >= 3) synergyScore += 15;

  // Specialization synergies
  // const uniqueSpecs = ...; // Quick fix: commented unused variable
  if (uniqueSpecs >= 3) synergyScore += 10;

  // Calculate potential score
  // const averageLevel = ...; // Quick fix: commented unused variable
  // const averageEvolution = ...; // Quick fix: commented unused variable
  // const potentialScore = ...; // Quick fix: commented unused variable

  // Overall rating
  // const overallRating = ...; // Quick fix: commented unused variable

  // Mock synergies
  // const synergies = ...; // Quick fix: commented unused variable
  if (legendaryCount >= 2) {
    synergies.push({
      name: 'Legendary Duo',
      description: '+50% XP from all activities',
      active: true,
      bonus: 50,
    });
  }
  if (uniqueSpecs >= 4) {
    synergies.push({
      name: 'Balanced Mastery',
      description: '+25% XP from diverse training',
      active: true,
      bonus: 25,
    });
  }

  // Mock optimization suggestions
  // const suggestions = ...; // Quick fix: commented unused variable
  if (balanceScore < 70) {
    suggestions.push({
      type: 'balance',
      priority: 'medium',
      title: 'Improve Stat Balance',
      description: 'Consider adding characters with different stat focuses',
    });
  }
  if (synergyScore < 60) {
    suggestions.push({
      type: 'synergy',
      priority: 'high',
      title: 'Activate More Synergies',
      description: 'Try combinations with similar rarities or complementary types',
    });
  }

  return {
    overall_rating: Math.round(overallRating),
    synergy_score: Math.round(synergyScore),
    balance_score: Math.round(balanceScore),
    potential_score: Math.round(potentialScore),
    synergies,
    optimization_suggestions: suggestions,
    average_stats: averageStats,
  };
};

const TeamBuilder = ({ 
  availableCharacters = [], 
  existingTeam = null,
  onSaveTeam,
  onClose, 
}) => {
  const [teamName, setTeamName] = useState(existingTeam?.name || '');
  const [selectedFormation, setSelectedFormation] = useState(existingTeam?.formation || 'balanced_core');
  const [teamCharacters, setTeamCharacters] = useState(existingTeam?.characters || []);
  const [showCharacterGallery, setShowCharacterGallery] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(0);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showPerformanceModal, setShowPerformanceModal] = useState(false);

  // const formation = ...; // Quick fix: commented unused variable
  const teamPerformance = useMemo(() => 
    calculateTeamPerformance(teamCharacters, formation), 
  [teamCharacters, formation],
  );

  const handleCharacterSelect = (character) => {
    if (teamCharacters.length < 5 && !teamCharacters.find(c => c.id === character.id)) {
      setTeamCharacters([...teamCharacters, character]);
    }
    setShowCharacterGallery(false);
  };

  const handleCharacterRemove = (characterId) => {
    setTeamCharacters(teamCharacters.filter(c => c.id !== characterId));
  };

  const handlePositionPress = (index) => {
    setSelectedPosition(index);
    setShowCharacterGallery(true);
  };

  const handleSaveTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }
    if (teamCharacters.length === 0) {
      Alert.alert('Error', 'Please add at least one character to the team');
      return;
    }

    const team = {
      name: teamName,
      formation: selectedFormation,
      characters: teamCharacters,
      performance: teamPerformance,
    };

    onSaveTeam?.(team);
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythical: '#E91E63',
    };
    return colors[rarity] || colors.common;
  };

  const renderTeamPosition = (position, index) => {
    // const character = ...; // Quick fix: commented unused variable
    // const isEmpty = ...; // Quick fix: commented unused variable

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.positionSlot,
          isEmpty && styles.emptyPositionSlot,
          character && { borderColor: getRarityColor(character.rarity) },
        ]}
        onPress={() => handlePositionPress(index)}
      >
        {character ? (
          <>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleCharacterRemove(character.id)}
            >
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
            </TouchableOpacity>
            
            <Text style={styles.positionCharacterEmoji}>{character.emoji}</Text>
            <Text style={styles.positionCharacterName} numberOfLines={1}>
              {character.name}
            </Text>
            <Text style={[styles.positionCharacterLevel, { color: getRarityColor(character.rarity) }]}>
              LV.{character.level}
            </Text>
            
            <View style={styles.evolutionIndicator}>
              {Array.from({ length: 3 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.evolutionDot,
                    { 
                      backgroundColor: i < character.evolution_stage 
                        ? getRarityColor(character.rarity) 
                        : '#E0E0E0', 
                    },
                  ]}
                />
              ))}
            </View>
          </>
        ) : (
          <>
            <Ionicons name="add-circle-outline" size={32} color="#CCC" />
            <Text style={styles.emptyPositionText}>Add Character</Text>
          </>
        )}
        
        <Text style={styles.positionLabel}>{formation.positions[index]}</Text>
      </TouchableOpacity>
    );
  };

  const renderFormationModal = () => (
    <Modal
      visible={showFormationModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowFormationModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.formationModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Choose Formation</Text>
            <TouchableOpacity onPress={() => setShowFormationModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.formationList}>
            {Object.entries(FORMATIONS).map(([key, formation]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.formationOption,
                  selectedFormation === key && styles.selectedFormationOption,
                ]}
                onPress={() => {
                  setSelectedFormation(key);
                  setShowFormationModal(false);
                }}
              >
                <View style={styles.formationOptionContent}>
                  <Text style={styles.formationOptionName}>{formation.name}</Text>
                  <Text style={styles.formationOptionDescription}>
                    {formation.description}
                  </Text>
                  
                  <View style={styles.formationBonuses}>
                    {Object.entries(formation.bonuses).map(([bonus, value]) => (
                      <View key={bonus} style={styles.bonusTag}>
                        <Text style={styles.bonusTagText}>
                          {bonus.toUpperCase()} +{value}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                <Ionicons
                  name={selectedFormation === key ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color="#007AFF"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderPerformanceModal = () => (
    <Modal
      visible={showPerformanceModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPerformanceModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.performanceModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Team Performance</Text>
            <TouchableOpacity onPress={() => setShowPerformanceModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.performanceContent}>
            {/* Overall Metrics */}
            <View style={styles.performanceSection}>
              <Text style={styles.performanceSectionTitle}>Overall Rating</Text>
              <View style={styles.overallRating}>
                <Text style={styles.overallRatingText}>{teamPerformance.overall_rating}</Text>
                <Text style={styles.overallRatingLabel}>/ 100</Text>
              </View>
            </View>
            
            {/* Detailed Scores */}
            <View style={styles.performanceSection}>
              <Text style={styles.performanceSectionTitle}>Detailed Scores</Text>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Synergy Score</Text>
                <View style={styles.scoreBarContainer}>
                  <View style={styles.scoreBarBg}>
                    <View 
                      style={[
                        styles.scoreBarFill, 
                        { width: `${teamPerformance.synergy_score}%`, backgroundColor: '#4CAF50' },
                      ]} 
                    />
                  </View>
                  <Text style={styles.scoreValue}>{teamPerformance.synergy_score}</Text>
                </View>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Balance Score</Text>
                <View style={styles.scoreBarContainer}>
                  <View style={styles.scoreBarBg}>
                    <View 
                      style={[
                        styles.scoreBarFill, 
                        { width: `${teamPerformance.balance_score}%`, backgroundColor: '#2196F3' },
                      ]} 
                    />
                  </View>
                  <Text style={styles.scoreValue}>{teamPerformance.balance_score}</Text>
                </View>
              </View>
              
              <View style={styles.scoreRow}>
                <Text style={styles.scoreLabel}>Potential Score</Text>
                <View style={styles.scoreBarContainer}>
                  <View style={styles.scoreBarBg}>
                    <View 
                      style={[
                        styles.scoreBarFill, 
                        { width: `${teamPerformance.potential_score}%`, backgroundColor: '#FF9800' },
                      ]} 
                    />
                  </View>
                  <Text style={styles.scoreValue}>{teamPerformance.potential_score}</Text>
                </View>
              </View>
            </View>
            
            {/* Active Synergies */}
            {teamPerformance.synergies.length > 0 && (
              <View style={styles.performanceSection}>
                <Text style={styles.performanceSectionTitle}>Active Synergies</Text>
                {teamPerformance.synergies.map((synergy, index) => (
                  <View key={index} style={styles.synergyItem}>
                    <View style={styles.synergyHeader}>
                      <Text style={styles.synergyName}>{synergy.name}</Text>
                      <Text style={styles.synergyBonus}>+{synergy.bonus}%</Text>
                    </View>
                    <Text style={styles.synergyDescription}>{synergy.description}</Text>
                  </View>
                ))}
              </View>
            )}
            
            {/* Average Stats */}
            {teamPerformance.average_stats && (
              <View style={styles.performanceSection}>
                <Text style={styles.performanceSectionTitle}>Average Team Stats</Text>
                {Object.entries(teamPerformance.average_stats).map(([stat, value]) => (
                  <View key={stat} style={styles.statRow}>
                    <Text style={styles.statLabel}>
                      {stat.replace('_', ' ').toUpperCase()}
                    </Text>
                    <View style={styles.statBarContainer}>
                      <View style={styles.statBarBg}>
                        <View 
                          style={[
                            styles.statBarFill, 
                            { width: `${value}%`, backgroundColor: '#9C27B0' },
                          ]} 
                        />
                      </View>
                      <Text style={styles.statValue}>{value}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Optimization Suggestions */}
            {teamPerformance.optimization_suggestions.length > 0 && (
              <View style={styles.performanceSection}>
                <Text style={styles.performanceSectionTitle}>Optimization Suggestions</Text>
                {teamPerformance.optimization_suggestions.map((suggestion, index) => (
                  <View key={index} style={styles.suggestionItem}>
                    <View style={styles.suggestionHeader}>
                      <Ionicons 
                        name="bulb-outline" 
                        size={20} 
                        color="#FF9800" 
                      />
                      <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
                    </View>
                    <Text style={styles.suggestionDescription}>
                      {suggestion.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Builder</Text>
        <TouchableOpacity onPress={handleSaveTeam}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        {/* Team Name Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team Name</Text>
          <TextInput
            style={styles.teamNameInput}
            placeholder="Enter team name..."
            value={teamName}
            onChangeText={setTeamName}
            maxLength={30}
          />
        </View>
        
        {/* Formation Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Formation</Text>
            <TouchableOpacity onPress={() => setShowFormationModal(true)}>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.selectedFormation}>
            <Text style={styles.formationName}>{formation.name}</Text>
            <Text style={styles.formationDescription}>{formation.description}</Text>
            
            <View style={styles.formationBonuses}>
              {Object.entries(formation.bonuses).map(([bonus, value]) => (
                <View key={bonus} style={styles.bonusTag}>
                  <Text style={styles.bonusTagText}>
                    {bonus.toUpperCase()} +{value}%
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        
        {/* Team Composition */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Team Composition ({teamCharacters.length}/5)
          </Text>
          
          <View style={styles.teamGrid}>
            {Array.from({ length: 5 }, (_, index) => renderTeamPosition(index, index))}
          </View>
        </View>
        
        {/* Team Performance Summary */}
        {teamCharacters.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Performance Overview</Text>
              <TouchableOpacity onPress={() => setShowPerformanceModal(true)}>
                <Text style={styles.detailsButton}>Details</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.performanceSummary}>
              <View style={styles.performanceMetric}>
                <Text style={styles.metricValue}>{teamPerformance.overall_rating}</Text>
                <Text style={styles.metricLabel}>Overall</Text>
              </View>
              
              <View style={styles.performanceMetric}>
                <Text style={styles.metricValue}>{teamPerformance.synergy_score}</Text>
                <Text style={styles.metricLabel}>Synergy</Text>
              </View>
              
              <View style={styles.performanceMetric}>
                <Text style={styles.metricValue}>{teamPerformance.balance_score}</Text>
                <Text style={styles.metricLabel}>Balance</Text>
              </View>
              
              <View style={styles.performanceMetric}>
                <Text style={styles.metricValue}>{teamPerformance.potential_score}</Text>
                <Text style={styles.metricLabel}>Potential</Text>
              </View>
            </View>
            
            {teamPerformance.synergies.length > 0 && (
              <View style={styles.activeSynergies}>
                <Text style={styles.synergiesTitle}>Active Synergies</Text>
                {teamPerformance.synergies.slice(0, 2).map((synergy, index) => (
                  <View key={index} style={styles.synergyPreview}>
                    <Text style={styles.synergyPreviewName}>{synergy.name}</Text>
                    <Text style={styles.synergyPreviewBonus}>+{synergy.bonus}%</Text>
                  </View>
                ))}
                {teamPerformance.synergies.length > 2 && (
                  <Text style={styles.moreSynergies}>
                    +{teamPerformance.synergies.length - 2} more
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      </ScrollView>
      
      {/* Character Gallery Modal */}
      <Modal
        visible={showCharacterGallery}
        animationType="slide"
        onRequestClose={() => setShowCharacterGallery(false)}
      >
        <CharacterGallery
          characters={availableCharacters.filter(char => 
            !teamCharacters.find(tc => tc.id === char.id),
          )}
          onCharacterSelect={handleCharacterSelect}
          showTeamBuilder={true}
        />
        <TouchableOpacity
          style={styles.closeGalleryButton}
          onPress={() => setShowCharacterGallery(false)}
        >
          <Text style={styles.closeGalleryText}>Cancel</Text>
        </TouchableOpacity>
      </Modal>
      
      {/* Modals */}
      {renderFormationModal()}
      {renderPerformanceModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  // Content Styles
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  detailsButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  
  // Team Name Styles
  teamNameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  
  // Formation Styles
  selectedFormation: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  formationName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formationDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  formationBonuses: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bonusTag: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
    marginBottom: 4,
  },
  bonusTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976D2',
  },
  
  // Team Grid Styles
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  positionSlot: {
    width: (width - 64) / 3,
    aspectRatio: 0.8,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    padding: 8,
    position: 'relative',
  },
  emptyPositionSlot: {
    borderStyle: 'dashed',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    zIndex: 1,
  },
  positionCharacterEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  positionCharacterName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 2,
  },
  positionCharacterLevel: {
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  evolutionIndicator: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  evolutionDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  positionLabel: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
  },
  emptyPositionText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
  },
  
  // Performance Summary Styles
  performanceSummary: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  performanceMetric: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  activeSynergies: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
  },
  synergiesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 8,
  },
  synergyPreview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  synergyPreviewName: {
    fontSize: 12,
    color: '#2E7D32',
    flex: 1,
  },
  synergyPreviewBonus: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  moreSynergies: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  
  // Gallery Button Styles
  closeGalleryButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  closeGalleryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  formationModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.8,
  },
  performanceModal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: height * 0.9,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Formation Modal Styles
  formationList: {
    padding: 20,
  },
  formationOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedFormationOption: {
    borderColor: '#007AFF',
    backgroundColor: '#E3F2FD',
  },
  formationOptionContent: {
    flex: 1,
  },
  formationOptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  formationOptionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  
  // Performance Modal Styles
  performanceContent: {
    padding: 20,
  },
  performanceSection: {
    marginBottom: 24,
  },
  performanceSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  overallRatingText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  overallRatingLabel: {
    fontSize: 18,
    color: '#666',
    marginLeft: 4,
  },
  scoreRow: {
    marginBottom: 12,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  scoreBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginRight: 12,
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 30,
  },
  synergyItem: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  synergyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  synergyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  synergyBonus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  synergyDescription: {
    fontSize: 12,
    color: '#4CAF50',
  },
  statRow: {
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
    marginRight: 8,
  },
  statBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  statValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 25,
  },
  suggestionItem: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E65100',
    marginLeft: 8,
  },
  suggestionDescription: {
    fontSize: 12,
    color: '#F57C00',
  },
});

export default TeamBuilder;