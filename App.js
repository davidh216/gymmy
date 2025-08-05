// App.js

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

// Existing screens
import DashboardScreen from './src/screens/DashboardScreen';
import WorkoutScreen from './src/screens/WorkoutScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ClassSelectionScreen from './src/screens/ClassSelectionScreen';
import GachaScreen from './src/screens/GachaScreen';
import CharacterCollectionScreen from './src/screens/CharacterCollectionScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';

// NEW: Onboarding and segmentation screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import { OnboardingSurvey } from './src/components/OnboardingSurvey';
import { SegmentResultsScreen } from './src/screens/SegmentResultsScreen';

// Context
import { AppProvider, useApp } from './src/context';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Main Tab Navigator (for authenticated/onboarded users)
const MainTabNavigator = () => {
  const { state } = useApp();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Workout') {
            iconName = focused ? 'fitness' : 'fitness-outline';
          } else if (route.name === 'Progress') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen 
        name="Workout" 
        component={WorkoutScreen}
        options={{
          tabBarLabel: 'Workout',
        }}
      />
      <Tab.Screen 
        name="Progress" 
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progress',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

// Onboarding Stack Navigator
const OnboardingStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false, // Prevent going back during onboarding
      }}
    >
      <Stack.Screen 
        name="Welcome" 
        component={WelcomeScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Survey" 
        component={OnboardingSurveyScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen 
        name="Results" 
        component={SegmentResultsScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

// Main App Stack Navigator (includes both onboarding and main app)
const AppStackNavigator = () => {
  const { shouldShowOnboarding, isOnboardingComplete } = useApp();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {shouldShowOnboarding() ? (
        // Onboarding flow
        <Stack.Screen 
          name="Onboarding" 
          component={OnboardingStackNavigator}
          options={{
            animationTypeForReplace: 'push',
          }}
        />
      ) : (
        // Main app flow
        <>
          <Stack.Screen 
            name="MainTabs" 
            component={MainTabNavigator}
          />
          
          {/* Additional stack screens available from main app */}
          <Stack.Screen 
            name="ClassSelection" 
            component={ClassSelectionScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Choose Your Class',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
          
          <Stack.Screen 
            name="Gacha" 
            component={GachaScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Gymmy Collection',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
          
          <Stack.Screen 
            name="CharacterCollection" 
            component={CharacterCollectionScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'My Gymmys',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
          
          <Stack.Screen 
            name="Achievements" 
            component={AchievementsScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Achievements',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
          
          {/* NEW: Allow retaking survey from settings */}
          <Stack.Screen 
            name="RetakeSurvey" 
            component={OnboardingSurveyScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              title: 'Retake Fitness Survey',
              headerStyle: {
                backgroundColor: '#007AFF',
              },
              headerTintColor: '#fff',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Survey Screen Wrapper Component
const OnboardingSurveyScreen = ({ navigation, route }) => {
  const { completeSurvey, setOnboardingStep } = useApp();
  
  const handleSurveyComplete = async (result) => {
    try {
      // The survey component handles the actual completion logic
      setOnboardingStep('results');
      navigation.navigate('Results', { 
        segment: result.segment,
        confidence: result.confidence,
        secondarySegment: result.secondarySegment,
        goals: result.goals
      });
    } catch (error) {
      console.error('Error completing survey:', error);
    }
  };

  const handleSkip = () => {
    // Allow skipping for now, but mark as incomplete
    navigation.navigate('MainTabs');
  };

  return (
    <OnboardingSurvey
      onComplete={handleSurveyComplete}
      onSkip={handleSkip}
    />
  );
};

// Loading Screen Component
const LoadingScreen = () => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>Loading Gymmy...</Text>
    </View>
  );
};

// Main App Component with Context
const AppContent = () => {
  const { state } = useApp();
  
  // Show loading screen while app is initializing
  if (state.loading && !state.segmentationLoaded) {
    return <LoadingScreen />;
  }
  
  return (
    <NavigationContainer>
      <AppStackNavigator />
    </NavigationContainer>
  );
};

// Root App Component
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#6c757d',
    fontWeight: '500',
  },
});