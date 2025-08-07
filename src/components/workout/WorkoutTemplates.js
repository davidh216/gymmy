// src/components/workout/WorkoutTemplates.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WorkoutTemplates = ({
  visible,
  onClose,
  workoutTemplates,
  onStartTemplate,
  onRemoveTemplate,
}) => {
  const templatesByCategory = useMemo(() => {
    if (!workoutTemplates || workoutTemplates.length === 0) {
      return {};
    }

    return workoutTemplates.reduce((acc, template) => {
      const category = template.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(template);
      return acc;
    }, {});
  }, [workoutTemplates]);

  const categoryIcons = {
    Strength: 'barbell',
    Cardio: 'heart',
    'Upper Body': 'body',
    'Lower Body': 'walk',
    'Full Body': 'fitness',
    Other: 'library',
  };

  const getTemplateIcon = template => {
    if (template.category && categoryIcons[template.category]) {
      return categoryIcons[template.category];
    }

    // Determine icon based on exercises
    if (template.exercises) {
      const hasCardio = template.exercises.some(ex => ex.isCardio);
      const hasWeights = template.exercises.some(ex => !ex.isCardio);

      if (hasCardio && hasWeights) return 'fitness';
      if (hasCardio) return 'heart';
      if (hasWeights) return 'barbell';
    }

    return 'library';
  };

  const getTemplateDuration = template => {
    if (template.estimatedDuration) {
      return `${template.estimatedDuration} min`;
    }

    // Estimate based on exercises
    const exerciseCount = template.exercises?.length || 0;
    const estimatedMinutes = exerciseCount * 8; // ~8 minutes per exercise
    return `~${estimatedMinutes} min`;
  };

  const getTemplateExerciseCount = template => {
    return template.exercises?.length || 0;
  };

  if (!workoutTemplates || workoutTemplates.length === 0) {
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '50%' }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Workout Templates</Text>
              <TouchableOpacity onClose={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.emptyStateContainer}>
              <Ionicons name="library-outline" size={64} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Templates Yet</Text>
              <Text style={styles.emptyStateText}>
                Create your first workout template by completing a workout and
                saving it as a template.
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '80%' }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Workout Templates</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.templateScrollView}>
            {Object.entries(templatesByCategory).map(
              ([category, templates]) => {
                return (
                  <View key={category} style={styles.templateCategory}>
                    <Text style={styles.templateCategoryTitle}>{category}</Text>
                    {templates.map(template => (
                      <TouchableOpacity
                        key={template.id}
                        style={styles.templateItem}
                        onPress={() => onStartTemplate(template)}
                      >
                        <View style={styles.templateIconContainer}>
                          <Ionicons
                            name={getTemplateIcon(template)}
                            size={24}
                            color="#007AFF"
                          />
                        </View>

                        <View style={styles.templateInfo}>
                          <Text style={styles.templateName}>
                            {template.name}
                          </Text>
                          {template.description && (
                            <Text
                              style={styles.templateDescription}
                              numberOfLines={2}
                            >
                              {template.description}
                            </Text>
                          )}
                          <View style={styles.templateStats}>
                            <View style={styles.templateStat}>
                              <Ionicons name="fitness" size={16} color="#666" />
                              <Text style={styles.templateStatText}>
                                {getTemplateExerciseCount(template)} exercises
                              </Text>
                            </View>
                            <View style={styles.templateStat}>
                              <Ionicons name="time" size={16} color="#666" />
                              <Text style={styles.templateStatText}>
                                {getTemplateDuration(template)}
                              </Text>
                            </View>
                          </View>
                        </View>

                        <TouchableOpacity
                          style={styles.templateDeleteButton}
                          onPress={e => {
                            e.stopPropagation();
                            onRemoveTemplate(template.id);
                          }}
                        >
                          <Ionicons name="trash" size={20} color="#FF4444" />
                        </TouchableOpacity>
                      </TouchableOpacity>
                    ))}
                  </View>
                );
              },
            )}

            {/* Bottom padding */}
            <View style={styles.bottomPadding} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

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
    maxWidth: 500,
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
  templateScrollView: {
    maxHeight: 400,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  templateCategory: {
    padding: 20,
    paddingBottom: 10,
  },
  templateCategoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  templateIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 18,
  },
  templateStats: {
    flexDirection: 'row',
    gap: 16,
  },
  templateStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  templateStatText: {
    fontSize: 12,
    color: '#666',
  },
  templateDeleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  bottomPadding: {
    height: 20,
  },
});

export default WorkoutTemplates;
