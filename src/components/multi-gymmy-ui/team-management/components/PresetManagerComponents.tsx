// src/components/multi-gymmy-ui/team-management/components/PresetManagerComponents.tsx
// Components for TeamPresetManager

import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // Modal,
  // TouchableOpacity,
  // TextInput,
  // ScrollView,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // TeamPreset
} from '../utils/TeamUtils';
import {
  // validatePresetName
} from '../utils/ComponentUtils';

interface SavePresetModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  presetName: string;
  presetDescription: string;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const SavePresetModal: React.FC<SavePresetModalProps> = ({
  visible,
  onClose,
  onSave,
  presetName,
  presetDescription,
  onNameChange,
  onDescriptionChange,
}) => {
  const handleSave = () => {
    // const validation = ...; // Quick fix: commented unused variable
    if (!validation.isValid) {
      // This would show an alert in the parent component
      return;
    }
    onSave(presetName, presetDescription);
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
            <Text style={styles.modalTitle}>Save Team Preset</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.modalBody}>
            <Text style={styles.inputLabel}>Preset Name</Text>
            <TextInput
              style={styles.nameInput}
              value={presetName}
              onChangeText={onNameChange}
              placeholder="Enter preset name"
              maxLength={30}
            />
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={styles.descriptionInput}
              value={presetDescription}
              onChangeText={onDescriptionChange}
              placeholder="Enter description"
              multiline
              maxLength={200}
            />
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save Preset</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

interface PresetItemProps {
  preset: TeamPreset;
  onLoad: (preset: TeamPreset) => void;
  onDelete: (preset: TeamPreset) => void;
  isSelected?: boolean;
}

export const PresetItem: React.FC<PresetItemProps> = ({
  preset,
  onLoad,
  onDelete,
  isSelected = false,
}) => (
  <View style={[styles.presetItem, isSelected && styles.selectedPreset]}>
    <View style={styles.presetInfo}>
      <Text style={styles.presetName}>{preset.name}</Text>
      <Text style={styles.presetDescription}>{preset.description}</Text>
      <View style={styles.presetMeta}>
        <Text style={styles.presetMetaText}>
          Formation: {preset.formation.replace('_', ' ')}
        </Text>
        <Text style={styles.presetMetaText}>
          Characters: {preset.characters.length}
        </Text>
      </View>
      <Text style={styles.presetDate}>
        Created: {new Date(preset.created_at).toLocaleDateString()}
      </Text>
    </View>
    <View style={styles.presetActions}>
      <TouchableOpacity
        style={styles.actionButton}
        onPress={() => onLoad(preset)}
      >
        <Ionicons name="download" size={20} color="#007AFF" />
        <Text style={styles.actionText}>Load</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.actionButton, styles.deleteButton]}
        onPress={() => onDelete(preset)}
      >
        <Ionicons name="trash" size={20} color="#FF3B30" />
        <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
      </TouchableOpacity>
    </View>
  </View>
);

interface PresetListProps {
  presets: TeamPreset[];
  onLoadPreset: (preset: TeamPreset) => void;
  onDeletePreset: (preset: TeamPreset) => void;
  selectedPreset?: TeamPreset | null;
}

export const PresetList: React.FC<PresetListProps> = ({
  presets,
  onLoadPreset,
  onDeletePreset,
  selectedPreset,
}) => (
  <ScrollView style={styles.presetList}>
    {presets.length === 0 ? (
      <View style={styles.emptyState}>
        <Ionicons name="folder-open" size={48} color="#8E8E93" />
        <Text style={styles.emptyStateText}>No presets saved yet</Text>
        <Text style={styles.emptyStateSubtext}>
          Save your first team preset to get started
        </Text>
      </View>
    ) : (
      presets.map((preset) => (
        <PresetItem
          key={preset.id}
          preset={preset}
          onLoad={onLoadPreset}
          onDelete={onDeletePreset}
          isSelected={selectedPreset?.id === preset.id}
        />
      ))
    )}
  </ScrollView>
);

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
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    height: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
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
  presetList: {
    flex: 1,
  },
  presetItem: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  selectedPreset: {
    backgroundColor: '#E5F9FF',
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  presetInfo: {
    flex: 1,
  },
  presetName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  presetDescription: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  presetMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 4,
  },
  presetMetaText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  presetDate: {
    fontSize: 12,
    color: '#8E8E93',
  },
  presetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#fff',
  },
  actionText: {
    fontSize: 12,
    color: '#007AFF',
    marginLeft: 4,
  },
  deleteButton: {
    backgroundColor: '#FFE5E5',
  },
  deleteText: {
    color: '#FF3B30',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
});
