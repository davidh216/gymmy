// src/components/multi-gymmy-ui/team-management/components/TeamBuilderModals.tsx
// Modal components for TeamBuilder

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GymmyTeam } from '../../../../../context/types/MultiGymmyTypes';
import { TeamFormation } from '../utils/TeamUtils';
import { validateTeamName } from '../utils/ComponentUtils';

interface FormationModalProps {
  visible: boolean;
  onClose: () => void;
  selectedFormation: string;
  onSelectFormation: (formation: string) => void;
  formations: TeamFormation[];
}

export const FormationModal: React.FC<FormationModalProps> = ({
  visible,
  onClose,
  selectedFormation,
  onSelectFormation,
  formations,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Select Formation</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          {formations.map((formation) => (
            <TouchableOpacity
              key={formation.id}
              style={[
                styles.formationItem,
                selectedFormation === formation.id && styles.selectedFormation,
              ]}
              onPress={() => {
                onSelectFormation(formation.id);
                onClose();
              }}
            >
              <View style={styles.formationInfo}>
                <Text style={styles.formationName}>{formation.name}</Text>
                <Text style={styles.formationDescription}>{formation.description}</Text>
              </View>
              <Ionicons
                name={selectedFormation === formation.id ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={selectedFormation === formation.id ? "#007AFF" : "#8E8E93"}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  </Modal>
);

interface AnalyticsModalProps {
  visible: boolean;
  onClose: () => void;
  team: GymmyTeam;
  performanceMetrics: any;
  synergyAnalysis: any;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  visible,
  onClose,
  team,
  performanceMetrics,
  synergyAnalysis,
}) => (
  <Modal
    visible={visible}
    animationType="slide"
    transparent={true}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Team Analytics</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.modalBody}>
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Overall Performance</Text>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreValue}>{performanceMetrics?.overallRating || 0}</Text>
              <Text style={styles.scoreLabel}>/ 100</Text>
            </View>
          </View>
          
          <View style={styles.analyticsSection}>
            <Text style={styles.sectionTitle}>Synergy Analysis</Text>
            <Text style={styles.synergyText}>
              {synergyAnalysis?.activeSynergies?.length || 0} active synergies
            </Text>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

interface TeamNameModalProps {
  visible: boolean;
  onClose: () => void;
  teamName: string;
  onSaveName: (name: string) => void;
}

export const TeamNameModal: React.FC<TeamNameModalProps> = ({
  visible,
  onClose,
  teamName,
  onSaveName,
}) => {
  const [name, setName] = React.useState(teamName);
  const [error, setError] = React.useState<string | null>(null);

  const handleSave = () => {
    const validation = validateTeamName(name);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }
    onSaveName(name);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Team Name</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={(text) => {
                setName(text);
                setError(null);
              }}
              placeholder="Enter team name"
              maxLength={50}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  formationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  selectedFormation: {
    backgroundColor: '#F2F2F7',
  },
  formationInfo: {
    flex: 1,
  },
  formationName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  formationDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  analyticsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#007AFF',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#8E8E93',
    marginLeft: 4,
  },
  synergyText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 8,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
