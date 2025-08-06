// src/screens/DashboardScreen.js

import React from 'react';
import { 
  View, 
  StyleSheet, 
  SafeAreaView, 
  Text, 
  TouchableOpacity 
} from 'react-native';
import { useApp } from '../context';
import { AdaptiveDashboard } from '../components/AdaptiveDashboard';

// Import existing dashboard components for fallback
import ClassDashboardWidget from '../components/ClassDashboardWidget';
import GamificationStats from '../components/GamificationStats';
import MotivationalQuote from '../components/MotivationalQuote';
import WorkoutCalendar from '../components/WorkoutCalendar';

const DashboardScreen = ({ navigation }) => {
  const { state, shouldShowOnboarding } = useApp();
  const { userStats, personalizedExperience } = state;

  // If user hasn't completed onboarding, redirect to onboarding
  if (shouldShowOnboarding()) {
    navigation.replace('Onboarding');
    return null;
  }

  // Use adaptive dashboard if personalization is enabled
  if (personalizedExperience && userStats.segmentProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <AdaptiveDashboard navigation={navigation} />
      </SafeAreaView>
    );
  }

  // Fallback to original dashboard for users without segmentation
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fallbackContainer}>
        {/* Original dashboard components */}
        <MotivationalQuote />
        <GamificationStats />
        <ClassDashboardWidget navigation={navigation} />
        <WorkoutCalendar />
        
        {/* Prompt for personalization */}
        <View style={styles.personalizationPrompt}>
          <Text style={styles.promptTitle}>✨ Personalize Your Experience</Text>
          <Text style={styles.promptText}>
            Take our 3-minute survey to get a dashboard designed just for your fitness goals!
          </Text>
          <TouchableOpacity 
            style={styles.promptButton}
            onPress={() => navigation.navigate('Survey')}
          >
            <Text style={styles.promptButtonText}>Get My Personal Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  fallbackContainer: {
    flex: 1,
    padding: 16,
  },
  personalizationPrompt: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    textAlign: 'center',
    marginBottom: 8,
  },
  promptText: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  promptButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  promptButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default DashboardScreen;