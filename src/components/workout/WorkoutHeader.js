// src/components/workout/WorkoutHeader.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MotivationalQuote from '../MotivationalQuote';
import GamificationStats from '../GamificationStats';

const WorkoutHeader = ({
  userStats,
  onStartWorkout,
  onShowTemplates,
  onResetData,
}) => {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.quoteContainer}>
        <MotivationalQuote />
      </View>
      <TouchableOpacity style={styles.resetButton} onPress={onResetData}>
        <Ionicons name="refresh" size={16} color="#FF4444" />
        <Text style={styles.resetButtonText}>Reset Data</Text>
      </TouchableOpacity>

      <View style={styles.gamificationContainer}>
        <GamificationStats userStats={userStats} showDetailed={false} />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={onStartWorkout}>
          <Ionicons name="fitness" size={20} color="#fff" />
          <Text style={styles.primaryButtonText}>Start New Workout</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onShowTemplates}
        >
          <Ionicons name="library" size={20} color="#007AFF" />
          <Text style={styles.secondaryButtonText}>Use Template</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  quoteContainer: {
    marginBottom: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginBottom: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  resetButtonText: {
    color: '#FF4444',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  gamificationContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  secondaryButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default WorkoutHeader;
