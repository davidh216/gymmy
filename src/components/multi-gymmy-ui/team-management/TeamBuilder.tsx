// src/components/multi-gymmy-ui/team-management/TeamBuilder.tsx
// Sprint 2: Advanced team builder with drag-and-drop interface and synergy visualization

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import { GymmyCharacter, GymmyTeam } from '../../../../context/types/MultiGymmyTypes';
import { 
  createEmptyTeam, 
  getTeamFormation, 
  validateTeamComposition,
  calculateTeamStats,
  TeamFormation,
  TeamPosition,
  DEFAULT_FORMATIONS,
} from './utils/TeamUtils';
import { calculateTeamSynergies, SynergyAnalysis } from './utils/SynergyUtils';
import { calculateTeamPerformance, TeamPerformanceMetrics } from './utils/AnalyticsUtils';
import { createScaleAnimation, createFadeAnimation } from './utils/ComponentUtils';
import DragDropArea from './DragDropArea';
import SynergyVisualizer from './SynergyVisualizer';
import TeamAnalyticsDashboard from './TeamAnalyticsDashboard';
import { FormationModal, AnalyticsModal, TeamNameModal } from './components/TeamBuilderModals';
import { 
  TeamHeader, 
  TeamNameInput, 
  FormationSelector, 
  TeamPositions, 
  AvailableCharacters 
} from './components/TeamBuilderRenders';

const { width, height } = Dimensions.get('window');

interface TeamBuilderProps {
  availableCharacters: GymmyCharacter[];
  existingTeam?: GymmyTeam | null;
  onSaveTeam: (team: GymmyTeam) => void;
  onClose: () => void;
}

const TeamBuilder: React.FC<TeamBuilderProps> = ({
  availableCharacters,
  existingTeam,
  onSaveTeam,
  onClose,
}) => {
  // State management
  const [currentTeam, setCurrentTeam] = useState<GymmyTeam>(
    existingTeam || createEmptyTeam()
  );
  const [selectedFormation, setSelectedFormation] = useState<string>(currentTeam.formation);
  const [draggedCharacter, setDraggedCharacter] = useState<GymmyCharacter | null>(null);
  const [showFormationModal, setShowFormationModal] = useState(false);
  const [showAnalyticsModal, setShowAnalyticsModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [teamName, setTeamName] = useState(currentTeam.name);

  // Animated values for drag and drop
  const dragAnimation = useMemo(() => new Animated.Value(0), []);
  const scaleAnimation = useMemo(() => new Animated.Value(1), []);

  // Calculate derived data
  const formation = useMemo(() => getTeamFormation(selectedFormation), [selectedFormation]);
  const validation = useMemo(() => validateTeamComposition(currentTeam, currentTeam.characters), [currentTeam]);
  const teamStats = useMemo(() => calculateTeamStats(currentTeam.characters), [currentTeam.characters]);
  const synergyAnalysis = useMemo(() => calculateTeamSynergies(currentTeam.characters), [currentTeam.characters]);
  const performanceMetrics = useMemo(() => calculateTeamPerformance(currentTeam, currentTeam.characters), [currentTeam]);

  // Pan responder for drag and drop
  const panResponder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt, gestureState) => {
      if (draggedCharacter) {
        Animated.parallel([
          Animated.timing(dragAnimation, createFadeAnimation(1)),
          Animated.timing(scaleAnimation, createScaleAnimation(1.1)),
        ]).start();
      }
    },
    onPanResponderMove: (evt, gestureState) => {
      if (draggedCharacter) {
        dragAnimation.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (evt, gestureState) => {
      if (draggedCharacter) {
        handleCharacterDrop(draggedCharacter);
        Animated.parallel([
          Animated.timing(dragAnimation, createFadeAnimation(0)),
          Animated.timing(scaleAnimation, createScaleAnimation(1)),
        ]).start();
        setDraggedCharacter(null);
      }
    },
  }), [draggedCharacter]);

  // Event handlers
  const handleCharacterDrop = useCallback((character: GymmyCharacter) => {
    // Implementation for character drop logic
    console.log('Character dropped:', character.name);
  }, []);

  const handleCharacterRemove = useCallback((position: TeamPosition) => {
    setCurrentTeam(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.position !== position.id),
    }));
  }, []);

  const handleCharacterSelect = useCallback((character: GymmyCharacter) => {
    setDraggedCharacter(character);
  }, []);

  const handleFormationSelect = useCallback((formationId: string) => {
    setSelectedFormation(formationId);
    setCurrentTeam(prev => ({
      ...prev,
      formation: formationId,
    }));
  }, []);

  const handleSaveTeam = useCallback(() => {
    if (!validation.isValid) {
      Alert.alert('Invalid Team', validation.error || 'Please fix team composition issues');
      return;
    }

    const updatedTeam: GymmyTeam = {
      ...currentTeam,
      name: teamName,
      formation: selectedFormation,
    };

    onSaveTeam(updatedTeam);
    onClose();
  }, [currentTeam, teamName, selectedFormation, validation, onSaveTeam, onClose]);

  const handleSaveName = useCallback((name: string) => {
    setTeamName(name);
    setCurrentTeam(prev => ({ ...prev, name }));
  }, []);

  const canSave = validation.isValid && teamName.trim().length > 0;

  return (
    <View style={styles.container}>
      <TeamHeader 
        onClose={onClose} 
        onSave={handleSaveTeam} 
        canSave={canSave} 
      />
      
      <ScrollView style={styles.content}>
        <TeamNameInput 
          teamName={teamName}
          onNameChange={setTeamName}
          onShowNameModal={() => setShowNameModal(true)}
        />
        
        <FormationSelector 
          selectedFormation={selectedFormation}
          formations={DEFAULT_FORMATIONS}
          onFormationSelect={handleFormationSelect}
          onShowFormationModal={() => setShowFormationModal(true)}
        />
        
        <TeamPositions 
          formation={formation}
          currentTeam={currentTeam}
          onCharacterDrop={handleCharacterDrop}
          onCharacterRemove={handleCharacterRemove}
        />
        
        <AvailableCharacters 
          characters={availableCharacters}
          onCharacterSelect={handleCharacterSelect}
          selectedCharacter={draggedCharacter}
        />
        
        <SynergyVisualizer 
          performanceMetrics={performanceMetrics}
          activeSynergies={synergyAnalysis.activeSynergies}
          recommendations={synergyAnalysis.recommendations}
        />
      </ScrollView>

      {/* Modals */}
      <FormationModal
        visible={showFormationModal}
        onClose={() => setShowFormationModal(false)}
        selectedFormation={selectedFormation}
        onSelectFormation={handleFormationSelect}
        formations={DEFAULT_FORMATIONS}
      />
      
      <AnalyticsModal
        visible={showAnalyticsModal}
        onClose={() => setShowAnalyticsModal(false)}
        team={currentTeam}
        performanceMetrics={performanceMetrics}
        synergyAnalysis={synergyAnalysis}
      />
      
      <TeamNameModal
        visible={showNameModal}
        onClose={() => setShowNameModal(false)}
        teamName={teamName}
        onSaveName={handleSaveName}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default TeamBuilder;
