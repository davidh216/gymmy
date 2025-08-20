// src/components/multi-gymmy-ui/team-management/TeamPresetManager.tsx
// Team preset management with save, load, and organization features

import React, { useState, useEffect } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // Alert,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // GymmyTeam
} from '../../../../context/types/MultiGymmyTypes';
import {
  // TeamPreset
} from './utils/TeamUtils';
import {
  // SavePresetModal,
  // PresetList
} from './components/PresetManagerComponents';

interface TeamPresetManagerProps {
  visible: boolean;
  onClose: () => void;
  currentTeam: GymmyTeam;
  onLoadPreset: (preset: TeamPreset) => void;
  onSavePreset: (preset: TeamPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

const TeamPresetManager: React.FC<TeamPresetManagerProps> = ({
  visible,
  onClose,
  currentTeam,
  onLoadPreset,
  onSavePreset,
  onDeletePreset,
}) => {
  const [presets, setPresets] = useState<TeamPreset[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetDescription, setNewPresetDescription] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<TeamPreset | null>(null);

  useEffect(() => {
    if (visible) {
      loadPresets();
    }
  }, [visible]);

  const loadPresets = async () => {
    try {
      // Load presets from AsyncStorage
      // This would be implemented with actual storage
      const savedPresets = [
        {
          id: 'preset_1',
          name: 'Balanced Team',
          description: 'Well-rounded team for general training',
          formation: 'balanced_core',
          characters: ['char_1', 'char_2', 'char_3', 'char_4'],
          created_at: '2024-01-01T00:00:00Z',
          last_used: '2024-01-15T00:00:00Z',
        },
        {
          id: 'preset_2',
          name: 'Power Team',
          description: 'Strength-focused composition',
          formation: 'power_house',
          characters: ['char_5', 'char_6', 'char_7', 'char_8'],
          created_at: '2024-01-02T00:00:00Z',
          last_used: '2024-01-10T00:00:00Z',
        },
      ];
      setPresets(savedPresets);
    } catch (error) {
      console.error('Error loading presets:', error);
    }
  };

  const handleSavePreset = (name: string, description: string) => {
    const newPreset: TeamPreset = {
      id: `preset_${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      formation: currentTeam.formation,
      characters: currentTeam.characters.map(c => c.id),
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    };

    onSavePreset(newPreset);
    setPresets(prev => [...prev, newPreset]);
    setShowSaveModal(false);
    setNewPresetName('');
    setNewPresetDescription('');
  };

  const handleLoadPreset = (preset: TeamPreset) => {
    Alert.alert(
      'Load Preset',
      `Are you sure you want to load "${preset.name}"? This will replace your current team.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load',
          onPress: () => {
            onLoadPreset(preset);
            setSelectedPreset(preset);
          },
        },
      ]
    );
  };

  const handleDeletePreset = (preset: TeamPreset) => {
    Alert.alert(
      'Delete Preset',
      `Are you sure you want to delete "${preset.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDeletePreset(preset.id);
            setPresets(prev => prev.filter(p => p.id !== preset.id));
          },
        },
      ]
    );
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Team Presets</Text>
        <TouchableOpacity 
          onPress={() => setShowSaveModal(true)} 
          style={styles.saveButton}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <PresetList
        presets={presets}
        onLoadPreset={handleLoadPreset}
        onDeletePreset={handleDeletePreset}
        selectedPreset={selectedPreset}
      />

      <SavePresetModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSavePreset}
        presetName={newPresetName}
        presetDescription={newPresetDescription}
        onNameChange={setNewPresetName}
        onDescriptionChange={setNewPresetDescription}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    padding: 8,
  },
});

export default TeamPresetManager;
