// src/components/multi-gymmy/EvolutionScreen.js
// Character evolution interface with evolution trees, material requirements, and visual progression

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Modal,
  Alert,
  Animated
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

// Mock evolution data - this would come from EvolutionMaterials system
const mockEvolutionMaterials = {
  basic_crystals: 45,
  training_essence: 23,
  rare_crystals: 12,
  power_essence: 8,
  epic_crystals: 3,
  legendary_crystals: 1,
  bond_token: 15
};

const mockEvolutionStages = {
  0: {
    stage: 0,
    name: 'Base Form',
    level_requirement: 1,
    materials_required: {},
    stat_bonuses: { strength: 0, cardio: 0, flexibility: 0, focus: 0, motivation: 0, loyalty: 0 },
    visual_changes: { effects: [] }
  },
  1: {
    stage: 1,
    name: 'Awakened',
    level_requirement: 20,
    materials_required: { basic_crystals: 5, training_essence: 3, bond_token: 1 },
    stat_bonuses: { strength: 5, cardio: 5, flexibility: 5, focus: 5, motivation: 5, loyalty: 5 },
    visual_changes: { effects: ['sparkle'] }
  },
  2: {
    stage: 2,
    name: 'Enhanced',
    level_requirement: 40,
    materials_required: { rare_crystals: 3, power_essence: 2, bond_token: 2 },
    stat_bonuses: { strength: 10, cardio: 10, flexibility: 10, focus: 10, motivation: 10, loyalty: 10 },
    visual_changes: { effects: ['glow', 'energy_trails'] }
  },
  3: {
    stage: 3,
    name: 'Transcendent',
    level_requirement: 60,
    materials_required: { epic_crystals: 2, legendary_crystals: 1, bond_token: 3 },
    stat_bonuses: { strength: 20, cardio: 20, flexibility: 20, focus: 20, motivation: 20, loyalty: 20 },
    visual_changes: { effects: ['legendary_aura', 'reality_distortion'] }
  }
};

// Mock character for demonstration
const mockCharacter = {
  id: 'titan_forge',
  name: 'Titan Forge',
  rarity: 'legendary',
  emoji: '🔥',
  level: 35,
  evolution_stage: 1,
  current_stats: { strength: 85, cardio: 60, flexibility: 45, focus: 80, motivation: 85, loyalty: 90 },
  bond_points: 1200,
  max_evolution: 3
};

const EvolutionScreen = ({ 
  character = mockCharacter,
  availableMaterials = mockEvolutionMaterials,
  onEvolveCharacter,
  onClose 
}) => {
  const [selectedStage, setSelectedStage] = useState(character.evolution_stage + 1);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showMaterialsModal, setShowMaterialsModal] = useState(false);
  const [animationValues] = useState({
    scale: new Animated.Value(1),
    opacity: new Animated.Value(1)
  });

  const evolutionStages = useMemo(() => {
    const stages = [];
    for (let i = 0; i <= character.max_evolution; i++) {
      stages.push(mockEvolutionStages[i]);
    }
    return stages;
  }, [character.max_evolution]);

  const selectedEvolution = evolutionStages[selectedStage];
  const canEvolve = useMemo(() => {
    if (selectedStage <= character.evolution_stage) return false;
    if (character.level < selectedEvolution.level_requirement) return false;
    
    for (const [material, required] of Object.entries(selectedEvolution.materials_required)) {
      if ((availableMaterials[material] || 0) < required) return false;
    }
    
    return true;
  }, [selectedStage, character, selectedEvolution, availableMaterials]);

  const handleEvolvePress = () => {
    if (!canEvolve) return;
    setShowConfirmModal(true);
  };

  const handleConfirmEvolution = () => {
    setShowConfirmModal(false);
    
    // Animation for evolution
    Animated.sequence([
      Animated.parallel([
        Animated.timing(animationValues.scale, {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(animationValues.opacity, {
          toValue: 0.5,
          duration: 300,
          useNativeDriver: true
        })
      ]),
      Animated.parallel([
        Animated.timing(animationValues.scale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(animationValues.opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ])
    ]).start();
    
    onEvolveCharacter?.(character.id, selectedEvolution.materials_required);
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: '#9E9E9E',
      rare: '#2196F3',
      epic: '#9C27B0',
      legendary: '#FF9800',
      mythical: '#E91E63'
    };
    return colors[rarity] || colors.common;
  };

  const getMaterialColor = (materialId) => {
    const colors = {
      basic_crystals: '#64B5F6',
      training_essence: '#81C784',
      rare_crystals: '#9575CD',
      power_essence: '#FF8A65',
      epic_crystals: '#BA68C8',
      legendary_crystals: '#FFB74D',
      bond_token: '#F06292'
    };
    return colors[materialId] || '#90A4AE';
  };

  const getMaterialIcon = (materialId) => {
    const icons = {
      basic_crystals: 'diamond-outline',
      training_essence: 'flash-outline',
      rare_crystals: 'diamond',
      power_essence: 'thunderstorm-outline',
      epic_crystals: 'diamond-sharp',
      legendary_crystals: 'star',
      bond_token: 'heart'
    };
    return icons[materialId] || 'square-outline';
  };

  const renderEvolutionPath = () => (
    <View style={styles.evolutionPath}>
      {evolutionStages.map((stage, index) => {
        const isCompleted = index <= character.evolution_stage;
        const isSelected = index === selectedStage;
        const isNext = index === character.evolution_stage + 1;
        
        return (
          <View key={stage.stage} style={styles.evolutionStageContainer}>
            <TouchableOpacity
              style={[
                styles.evolutionStage,
                isCompleted && styles.completedStage,
                isSelected && styles.selectedStage,
                isNext && styles.nextStage,
                { borderColor: getRarityColor(character.rarity) }
              ]}
              onPress={() => setSelectedStage(index)}
            >
              <Text style={styles.evolutionStageNumber}>{stage.stage}</Text>
              {isCompleted && (
                <View style={styles.completedIndicator}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </View>
              )}
            </TouchableOpacity>
            
            <Text style={[
              styles.evolutionStageName,
              isSelected && styles.selectedStageName
            ]}>
              {stage.name}
            </Text>
            
            {index < evolutionStages.length - 1 && (
              <View style={[
                styles.evolutionConnector,
                { backgroundColor: isCompleted ? getRarityColor(character.rarity) : '#E0E0E0' }
              ]} />
            )}
          </View>
        );
      })}
    </View>
  );

  const renderCharacterPreview = () => (
    <View style={styles.characterPreview}>
      <Animated.View
        style={[
          styles.characterContainer,
          {
            transform: [{ scale: animationValues.scale }],
            opacity: animationValues.opacity
          }
        ]}
      >
        <View style={[
          styles.characterCard,
          { borderColor: getRarityColor(character.rarity) }
        ]}>
          <Text style={styles.characterEmoji}>{character.emoji}</Text>
          
          {selectedEvolution.visual_changes.effects.includes('sparkle') && (
            <View style={styles.effectOverlay}>
              <Text style={styles.effectText}>✨</Text>
            </View>
          )}
          
          {selectedEvolution.visual_changes.effects.includes('glow') && (
            <View style={[styles.glowEffect, { borderColor: getRarityColor(character.rarity) }]} />
          )}
          
          {selectedEvolution.visual_changes.effects.includes('legendary_aura') && (
            <View style={styles.legendaryAura}>
              <Text style={styles.auraText}>🌟</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.characterName}>{character.name}</Text>
        <Text style={[styles.evolutionName, { color: getRarityColor(character.rarity) }]}>
          {selectedEvolution.name}
        </Text>
      </Animated.View>
    </View>
  );

  const renderStatComparison = () => {
    const currentStats = character.current_stats;
    const bonusStats = selectedEvolution.stat_bonuses;
    
    return (
      <View style={styles.statComparison}>
        <Text style={styles.sectionTitle}>Stat Changes</Text>
        
        {Object.keys(currentStats).map(stat => {
          const current = currentStats[stat];
          const bonus = bonusStats[stat] || 0;
          const newValue = current + bonus;
          
          return (
            <View key={stat} style={styles.statRow}>
              <Text style={styles.statLabel}>
                {stat.replace('_', ' ').toUpperCase()}
              </Text>
              
              <View style={styles.statValues}>
                <Text style={styles.currentStatValue}>{current}</Text>
                
                {bonus > 0 && (
                  <>
                    <Ionicons name="arrow-forward" size={16} color="#4CAF50" />
                    <Text style={styles.newStatValue}>{newValue}</Text>
                    <Text style={styles.statBonus}>+{bonus}</Text>
                  </>
                )}
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  const renderMaterialRequirements = () => (
    <View style={styles.materialRequirements}>
      <View style={styles.requirementHeader}>
        <Text style={styles.sectionTitle}>Requirements</Text>
        <TouchableOpacity onPress={() => setShowMaterialsModal(true)}>
          <Text style={styles.viewAllButton}>View All Materials</Text>
        </TouchableOpacity>
      </View>
      
      {/* Level Requirement */}
      <View style={styles.requirementItem}>
        <View style={styles.requirementInfo}>
          <Ionicons name="trending-up" size={20} color="#9C27B0" />
          <Text style={styles.requirementLabel}>Level {selectedEvolution.level_requirement}</Text>
        </View>
        <View style={[
          styles.requirementStatus,
          character.level >= selectedEvolution.level_requirement ? styles.metStatus : styles.unmetStatus
        ]}>
          <Text style={[
            styles.requirementStatusText,
            character.level >= selectedEvolution.level_requirement ? styles.metStatusText : styles.unmetStatusText
          ]}>
            {character.level >= selectedEvolution.level_requirement ? 'Met' : 'Not Met'}
          </Text>
        </View>
      </View>
      
      {/* Material Requirements */}
      {Object.entries(selectedEvolution.materials_required).map(([materialId, required]) => {
        const available = availableMaterials[materialId] || 0;
        const hasEnough = available >= required;
        
        return (
          <View key={materialId} style={styles.requirementItem}>
            <View style={styles.requirementInfo}>
              <Ionicons 
                name={getMaterialIcon(materialId)} 
                size={20} 
                color={getMaterialColor(materialId)} 
              />
              <Text style={styles.requirementLabel}>
                {materialId.replace('_', ' ').split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ')}
              </Text>
            </View>
            
            <View style={styles.materialCount}>
              <Text style={[
                styles.materialCountText,
                !hasEnough && styles.insufficientMaterial
              ]}>
                {available}/{required}
              </Text>
            </View>
            
            <View style={[
              styles.requirementStatus,
              hasEnough ? styles.metStatus : styles.unmetStatus
            ]}>
              <Text style={[
                styles.requirementStatusText,
                hasEnough ? styles.metStatusText : styles.unmetStatusText
              ]}>
                {hasEnough ? 'Ready' : 'Need More'}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderMaterialsModal = () => (
    <Modal
      visible={showMaterialsModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowMaterialsModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.materialsModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Evolution Materials</Text>
            <TouchableOpacity onPress={() => setShowMaterialsModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.materialsContent}>
            {Object.entries(availableMaterials).map(([materialId, amount]) => (
              <View key={materialId} style={styles.materialItem}>
                <Ionicons 
                  name={getMaterialIcon(materialId)} 
                  size={32} 
                  color={getMaterialColor(materialId)} 
                />
                <View style={styles.materialInfo}>
                  <Text style={styles.materialName}>
                    {materialId.replace('_', ' ').split(' ').map(word => 
                      word.charAt(0).toUpperCase() + word.slice(1)
                    ).join(' ')}
                  </Text>
                  <Text style={styles.materialDescription}>
                    Used for character evolution and enhancement
                  </Text>
                </View>
                <Text style={styles.materialAmount}>{amount}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const renderConfirmModal = () => (
    <Modal
      visible={showConfirmModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowConfirmModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.confirmModal}>
          <View style={styles.confirmHeader}>
            <Text style={styles.confirmTitle}>Confirm Evolution</Text>
          </View>
          
          <View style={styles.confirmContent}>
            <Text style={styles.confirmText}>
              Evolve {character.name} to {selectedEvolution.name}?
            </Text>
            
            <Text style={styles.confirmSubtext}>
              This will consume the required materials and cannot be undone.
            </Text>
            
            <View style={styles.confirmMaterials}>
              {Object.entries(selectedEvolution.materials_required).map(([materialId, required]) => (
                <View key={materialId} style={styles.confirmMaterialItem}>
                  <Ionicons 
                    name={getMaterialIcon(materialId)} 
                    size={16} 
                    color={getMaterialColor(materialId)} 
                  />
                  <Text style={styles.confirmMaterialText}>
                    -{required} {materialId.replace('_', ' ')}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.confirmActions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowConfirmModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.evolveButton, { backgroundColor: getRarityColor(character.rarity) }]}
              onPress={handleConfirmEvolution}
            >
              <Text style={styles.evolveButtonText}>Evolve</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evolution</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.content}>
        {/* Evolution Path */}
        <View style={styles.section}>
          {renderEvolutionPath()}
        </View>
        
        {/* Character Preview */}
        <View style={styles.section}>
          {renderCharacterPreview()}
        </View>
        
        {/* Stat Comparison */}
        <View style={styles.section}>
          {renderStatComparison()}
        </View>
        
        {/* Material Requirements */}
        <View style={styles.section}>
          {renderMaterialRequirements()}
        </View>
        
        {/* Evolution Button */}
        {selectedStage > character.evolution_stage && (
          <View style={styles.actionSection}>
            <TouchableOpacity
              style={[
                styles.evolveActionButton,
                { backgroundColor: canEvolve ? getRarityColor(character.rarity) : '#CCC' },
                !canEvolve && styles.disabledButton
              ]}
              onPress={handleEvolvePress}
              disabled={!canEvolve}
            >
              <Text style={[
                styles.evolveActionButtonText,
                !canEvolve && styles.disabledButtonText
              ]}>
                {canEvolve ? 'Evolve Character' : 'Requirements Not Met'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
      
      {/* Modals */}
      {renderMaterialsModal()}
      {renderConfirmModal()}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  
  // Evolution Path Styles
  evolutionPath: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  evolutionStageContainer: {
    alignItems: 'center',
    flex: 1,
    position: 'relative',
  },
  evolutionStage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  completedStage: {
    backgroundColor: '#4CAF50',
  },
  selectedStage: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
    borderWidth: 3,
  },
  nextStage: {
    borderStyle: 'dashed',
  },
  evolutionStageNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  completedIndicator: {
    position: 'absolute',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    top: -2,
    right: -2,
  },
  evolutionStageName: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedStageName: {
    fontWeight: 'bold',
    color: '#2196F3',
  },
  evolutionConnector: {
    position: 'absolute',
    top: 25,
    right: -20,
    left: 70,
    height: 2,
    zIndex: -1,
  },
  
  // Character Preview Styles
  characterPreview: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  characterContainer: {
    alignItems: 'center',
  },
  characterCard: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginBottom: 16,
    position: 'relative',
  },
  characterEmoji: {
    fontSize: 60,
  },
  effectOverlay: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  effectText: {
    fontSize: 20,
  },
  glowEffect: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    opacity: 0.5,
  },
  legendaryAura: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  auraText: {
    fontSize: 24,
    position: 'absolute',
  },
  characterName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  evolutionName: {
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Stat Comparison Styles
  statComparison: {
    marginBottom: 8,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  newStatValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginLeft: 8,
  },
  statBonus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 4,
  },
  
  // Material Requirements Styles
  materialRequirements: {
    marginBottom: 8,
  },
  requirementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewAllButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  requirementInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requirementLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  materialCount: {
    marginRight: 12,
  },
  materialCountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  insufficientMaterial: {
    color: '#F44336',
  },
  requirementStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  metStatus: {
    backgroundColor: '#E8F5E8',
  },
  unmetStatus: {
    backgroundColor: '#FFEBEE',
  },
  requirementStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metStatusText: {
    color: '#4CAF50',
  },
  unmetStatusText: {
    color: '#F44336',
  },
  
  // Action Section Styles
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  evolveActionButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  evolveActionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#CCC',
  },
  disabledButtonText: {
    color: '#999',
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Materials Modal Styles
  materialsModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.9,
    maxHeight: height * 0.7,
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
  materialsContent: {
    padding: 20,
  },
  materialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  materialInfo: {
    flex: 1,
    marginLeft: 12,
  },
  materialName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  materialDescription: {
    fontSize: 12,
    color: '#666',
  },
  materialAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  
  // Confirm Modal Styles
  confirmModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: width * 0.85,
  },
  confirmHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  confirmContent: {
    padding: 20,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  confirmSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 16,
  },
  confirmMaterials: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    width: '100%',
  },
  confirmMaterialItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  confirmMaterialText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  confirmActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  evolveButton: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  evolveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

export default EvolutionScreen;