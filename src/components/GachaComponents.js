import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';

// WorkoutVerificationWidget component for gacha system
export const WorkoutVerificationWidget = ({ workout, onVerificationComplete }) => {
  const { addGachaPoints, userStats } = useApp();
  const [showModal, setShowModal] = useState(true);
  const [verificationStep, setVerificationStep] = useState(0);

  const handleVerification = async () => {
    try {
      // Calculate points based on workout duration and intensity
      const basePoints = Math.floor(workout.duration / 60) * 10; // 10 points per minute
      const intensityBonus = workout.exercises.length * 5; // 5 points per exercise
      const totalPoints = basePoints + intensityBonus;

      // Add points to user's gacha currency
      await addGachaPoints(totalPoints);

      // Show success message
      Alert.alert(
        'Workout Verified! 🎉',
        `You earned ${totalPoints} gacha points for completing your workout!`,
        [
          {
            text: 'Claim Rewards',
            onPress: () => {
              setShowModal(false);
              onVerificationComplete && onVerificationComplete(totalPoints);
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to verify workout. Please try again.');
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    onVerificationComplete && onVerificationComplete(0);
  };

  return (
    <Modal
      visible={showModal}
      transparent={true}
      animationType="slide"
      onRequestClose={handleSkip}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Ionicons name="trophy" size={32} color="#FFD700" />
            <Text style={styles.title}>Workout Verification</Text>
          </View>

          <View style={styles.workoutInfo}>
            <Text style={styles.workoutTitle}>Completed Workout</Text>
            <Text style={styles.workoutDetails}>
              Duration: {Math.floor(workout.duration / 60)}m {workout.duration % 60}s
            </Text>
            <Text style={styles.workoutDetails}>
              Exercises: {workout.exercises.length}
            </Text>
          </View>

          <View style={styles.pointsPreview}>
            <Text style={styles.pointsTitle}>Potential Rewards:</Text>
            <Text style={styles.pointsAmount}>
              +{Math.floor(workout.duration / 60) * 10 + workout.exercises.length * 5} Gacha Points
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.verifyButton]}
              onPress={handleVerification}
            >
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.buttonText}>Verify Workout</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.skipButton]}
              onPress={handleSkip}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
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
    borderRadius: 20,
    padding: 24,
    margin: 20,
    width: '90%',
    maxWidth: 400,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#333',
  },
  workoutInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  workoutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  workoutDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pointsPreview: {
    alignItems: 'center',
    marginBottom: 24,
  },
  pointsTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  pointsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  verifyButton: {
    backgroundColor: '#22c55e',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});

// Export other gacha components as needed
export { WorkoutVerificationWidget as default }; 