// src/components/workout/WorkoutModals.js
import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // Modal,
  // TextInput,
  // ScrollView,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';

export const WorkoutRatingModal = ({
  visible,
  onClose,
  ratingType,
  workoutRatings,
  onUpdateRating,
  onSubmit,
}) => {
  const getRatingEmoji = rating => {
    if (rating >= 9) return '😊';
    if (rating >= 7) return '🙂';
    if (rating >= 5) return '😐';
    if (rating >= 3) return '🙁';
    return '😞';
  };

  const renderRatingSection = (key, label, value) => (
    <View key={key} style={styles.ratingSection}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.ratingSlider}>
        <Text style={styles.ratingValue}>
          {value}/10 {getRatingEmoji(value)}
        </Text>
        <View style={styles.ratingButtons}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(rating => (
            <TouchableOpacity
              key={rating}
              style={[
                styles.ratingButton,
                value === rating && styles.ratingButtonActive,
              ]}
              onPress={() => onUpdateRating(key, rating)}
            >
              <Text
                style={[
                  styles.ratingButtonText,
                  value === rating && styles.ratingButtonTextActive,
                ]}
              >
                {rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // const isPreWorkout = ...; // Quick fix: commented unused variable

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {isPreWorkout
                ? 'Pre-Workout Check-in'
                : 'Post-Workout Reflection'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {isPreWorkout ? (
              <>
                {renderRatingSection(
                  'beforeMood',
                  'How is your mood?',
                  workoutRatings.beforeMood,
                )}
                {renderRatingSection(
                  'beforeEnergy',
                  'How is your energy level?',
                  workoutRatings.beforeEnergy,
                )}
                <Text style={styles.modalDescription}>
                  Take a moment to check in with yourself before starting your
                  workout.
                </Text>
              </>
            ) : (
              <>
                {renderRatingSection(
                  'afterMood',
                  'How is your mood now?',
                  workoutRatings.afterMood,
                )}
                {renderRatingSection(
                  'afterEnergy',
                  'How is your energy level now?',
                  workoutRatings.afterEnergy,
                )}
                {renderRatingSection(
                  'workoutRating',
                  'How would you rate this workout?',
                  workoutRatings.workoutRating,
                )}
                <Text style={styles.modalDescription}>
                  Reflect on how you feel after your workout. This helps track
                  your progress!
                </Text>
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>
                {isPreWorkout ? 'Start Workout' : 'Complete Workout'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const SaveTemplateModal = ({
  visible,
  onClose,
  templateName,
  templateDescription,
  onUpdateTemplateName,
  onUpdateTemplateDescription,
  onSave,
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Save as Template</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Template Name</Text>
            <TextInput
              style={styles.textInput}
              value={templateName}
              onChangeText={onUpdateTemplateName}
              placeholder="e.g., Upper Body Strength"
              maxLength={50}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Description (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textAreaInput]}
              value={templateDescription}
              onChangeText={onUpdateTemplateDescription}
              placeholder="Brief description of this workout template"
              multiline
              numberOfLines={3}
              maxLength={200}
            />
          </View>
        </View>

        <View style={styles.modalFooter}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.submitButton, styles.saveButton]}
            onPress={onSave}
            disabled={!templateName.trim()}
          >
            <Text style={styles.submitButtonText}>Save Template</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  ratingSection: {
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  ratingSlider: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 12,
  },
  ratingButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  ratingButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  ratingButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  ratingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  ratingButtonTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textAreaInput: {
    height: 80,
    textAlignVertical: 'top',
  },
});
