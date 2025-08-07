// src/components/workout/WorkoutCategorySelector.js
import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const WorkoutCategorySelector = ({
  selectedCategory,
  onSelectCategory,
  exerciseCategories,
}) => {
  const categoryIcons = useMemo(
    () => ({
      Chest: 'fitness',
      Back: 'body',
      Legs: 'walk',
      Shoulders: 'person',
      Bicep: 'barbell',
      Tricep: 'barbell',
      Core: 'diamond',
      Cardio: 'heart',
    }),
    [],
  );

  const categories = useMemo(
    () => Object.keys(exerciseCategories),
    [exerciseCategories],
  );

  return (
    <View style={styles.categoryContainer}>
      <Text style={styles.sectionTitle}>Select Exercise Category</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryScrollContent}
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonActive,
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Ionicons
              name={categoryIcons[category] || 'fitness'}
              size={24}
              color={selectedCategory === category ? '#fff' : '#007AFF'}
            />
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === category &&
                  styles.categoryButtonTextActive,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  categoryContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e9ecef',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  categoryScrollView: {
    marginHorizontal: -20,
  },
  categoryScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  categoryButton: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryButtonText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
});

export default WorkoutCategorySelector;
