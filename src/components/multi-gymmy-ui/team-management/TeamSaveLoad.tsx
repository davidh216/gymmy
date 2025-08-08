// src/components/multi-gymmy-ui/team-management/TeamSaveLoad.tsx
// Team save and load functionality with AsyncStorage integration

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GymmyTeam } from '../../../../context/types/MultiGymmyTypes';

interface TeamSaveLoadProps {
  visible: boolean;
  onClose: () => void;
  currentTeam: GymmyTeam;
  onLoadTeam: (team: GymmyTeam) => void;
}

const TeamSaveLoad: React.FC<TeamSaveLoadProps> = ({
  visible,
  onClose,
  currentTeam,
  onLoadTeam,
}) => {
  const [savedTeams, setSavedTeams] = useState<GymmyTeam[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');

  useEffect(() => {
    if (visible) {
      loadSavedTeams();
    }
  }, [visible]);

  const loadSavedTeams = async () => {
    try {
      const savedTeamsData = await AsyncStorage.getItem('@saved_teams');
      if (savedTeamsData) {
        const teams = JSON.parse(savedTeamsData);
        setSavedTeams(teams);
      }
    } catch (error) {
      console.error('Error loading saved teams:', error);
    }
  };

  const saveCurrentTeam = async () => {
    if (!newTeamName.trim()) {
      Alert.alert('Error', 'Please enter a team name');
      return;
    }

    try {
      const teamToSave = {
        ...currentTeam,
        name: newTeamName.trim(),
        last_updated: new Date().toISOString(),
      };

      const updatedTeams = [...savedTeams, teamToSave];
      await AsyncStorage.setItem('@saved_teams', JSON.stringify(updatedTeams));
      
      setSavedTeams(updatedTeams);
      setShowSaveModal(false);
      setNewTeamName('');
      
      Alert.alert('Success', 'Team saved successfully!');
    } catch (error) {
      console.error('Error saving team:', error);
      Alert.alert('Error', 'Failed to save team');
    }
  };

  const loadTeam = async (team: GymmyTeam) => {
    Alert.alert(
      'Load Team',
      `Are you sure you want to load "${team.name}"? This will replace your current team.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          style: 'destructive',
          onPress: () => {
            onLoadTeam(team);
            onClose();
          },
        },
      ]
    );
  };

  const deleteTeam = async (teamId: string) => {
    Alert.alert(
      'Delete Team',
      'Are you sure you want to delete this team?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedTeams = savedTeams.filter(team => team.id !== teamId);
              await AsyncStorage.setItem('@saved_teams', JSON.stringify(updatedTeams));
              setSavedTeams(updatedTeams);
            } catch (error) {
              console.error('Error deleting team:', error);
              Alert.alert('Error', 'Failed to delete team');
            }
          },
        },
      ]
    );
  };

  const renderTeamItem = (team: GymmyTeam) => (
    <View key={team.id} style={styles.teamItem}>
      <View style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamDetails}>
            {team.characters.length} characters • {team.formation}
          </Text>
          <Text style={styles.teamDate}>
            Last updated: {new Date(team.last_updated).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.teamActions}>
          <TouchableOpacity
            onPress={() => loadTeam(team)}
            style={styles.actionButton}
          >
            <Ionicons name="download" size={20} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => deleteTeam(team.id)}
            style={styles.actionButton}
          >
            <Ionicons name="trash" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderSaveModal = () => (
    <Modal
      visible={showSaveModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowSaveModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Save Team</Text>
            <TouchableOpacity onPress={() => setShowSaveModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Team Name</Text>
            <TextInput
              style={styles.textInput}
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder="Enter team name"
              placeholderTextColor="#999"
            />
          </View>
          
          <View style={styles.modalActions}>
            <TouchableOpacity
              onPress={() => setShowSaveModal(false)}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={saveCurrentTeam}
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>Save Team</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

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
            <Text style={styles.modalTitle}>Saved Teams</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setShowSaveModal(true)}
              style={styles.saveCurrentButton}
            >
              <Ionicons name="save" size={16} color="#007AFF" />
              <Text style={styles.saveCurrentButtonText}>Save Current Team</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.teamsList}>
            {savedTeams.length > 0 ? (
              savedTeams.map(renderTeamItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open" size={48} color="#9ca3af" />
                <Text style={styles.emptyStateTitle}>No Saved Teams</Text>
                <Text style={styles.emptyStateText}>
                  Save your current team to load it later
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      {renderSaveModal()}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
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
  headerActions: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  saveCurrentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
  },
  saveCurrentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#007AFF',
    marginLeft: 8,
  },
  teamsList: {
    padding: 16,
  },
  teamItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  teamDetails: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  teamDate: {
    fontSize: 12,
    color: '#9ca3af',
  },
  teamActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    marginLeft: 8,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
});

export default TeamSaveLoad;
