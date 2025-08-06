// App.js

import React from 'react';
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
  const appContext = useApp();
  
  // Simple fallback for onboarding logic
  const shouldShowOnboarding = () => {
    // Check if user has completed onboarding by looking at userStats
    // Also check for survey completion flag
    // Prioritize survey completion over total workouts
    const hasCompletedSurvey = appContext.userStats?.surveyCompleted === true;
    const hasWorkouts = appContext.userStats?.totalWorkouts > 0;
    const hasUserStats = !!appContext.userStats;
    
    // If survey is completed, show main app regardless of workout count
    if (hasCompletedSurvey) {
      return false;
    }
    
    // If no user stats, show onboarding
    if (!hasUserStats) {
      return true;
    }
    
    // If no workouts and no survey completion, show onboarding
    if (!hasWorkouts && !hasCompletedSurvey) {
      return true;
    }
    
    // Otherwise show main app
    return false;
  };
  
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
        </>
      )}
    </Stack.Navigator>
  );
};

// Survey Screen Wrapper Component
const OnboardingSurveyScreen = ({ navigation, route }) => {
  const appContext = useApp(); // Changed from destructuring completeSurvey, setOnboardingStep

  const handleSurveyComplete = async (result) => {
    try {
      console.log('OnboardingSurveyScreen: Survey completed with result:', result);
      
      // The survey completion has already updated user stats in the OnboardingSurvey component
      // Now we need to ensure the surveyCompleted flag is set
      if (appContext.updateUserStats) {
        console.log('OnboardingSurveyScreen: Updating user stats with survey completion flag');
        await appContext.updateUserStats({
          ...appContext.userStats,
          surveyCompleted: true,
          lastSurveyCompletion: new Date().toISOString(),
        });
        console.log('OnboardingSurveyScreen: User stats updated successfully');
      } else {
        console.log('OnboardingSurveyScreen: updateUserStats function not available');
      }
      
      // Try to navigate directly to the main app using the parent navigator
      console.log('OnboardingSurveyScreen: Attempting to navigate to main app');
      
      // Since we're in the onboarding flow, we need to update user stats
      // and then let the app re-render to show the main app
      // The shouldShowOnboarding() function should return false after we update user stats
      
      // Wait a moment for the state update to propagate, then navigate back to root
      setTimeout(() => {
        console.log('OnboardingSurveyScreen: Navigating back to root to trigger re-evaluation');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      }, 200);
      
    } catch (error) {
      console.error('Error completing survey:', error);
      // Fallback - try to reset navigation
      try {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      } catch (fallbackError) {
        console.error('Fallback navigation also failed:', fallbackError);
      }
    }
  };

  const handleSkip = () => {
    console.log('OnboardingSurveyScreen: Survey skipped');
    
    // Mark survey as completed even when skipped
    if (appContext.updateUserStats) {
      console.log('OnboardingSurveyScreen: Updating user stats for skipped survey');
      appContext.updateUserStats({
        ...appContext.userStats,
        surveyCompleted: true,
        lastSurveyCompletion: new Date().toISOString(),
        surveySkipped: true, // Add a flag to indicate it was skipped
      }).then(() => {
        console.log('OnboardingSurveyScreen: User stats updated for skipped survey');
        // Navigate back to root to trigger re-evaluation
        setTimeout(() => {
          console.log('OnboardingSurveyScreen: Navigating back to root after skip');
          navigation.reset({
            index: 0,
            routes: [{ name: 'Onboarding' }],
          });
        }, 200);
      }).catch((error) => {
        console.error('OnboardingSurveyScreen: Error updating user stats for skip:', error);
        // Still try to navigate even if update fails
        navigation.reset({
          index: 0,
          routes: [{ name: 'Onboarding' }],
        });
      });
    } else {
      console.log('OnboardingSurveyScreen: updateUserStats not available, using fallback navigation');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Onboarding' }],
      });
    }
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
  const appContext = useApp();
  
  // Check if context is properly initialized
  if (!appContext) {
    return <LoadingScreen />;
  }
  
  // The context structure has state properties directly on the object
  const state = {
    loading: appContext.loading,
    error: appContext.error,
    isDemo: appContext.isDemo,
    workoutHistory: appContext.workoutHistory,
    userStats: appContext.userStats,
    characters: appContext.characters,
    enhancedGacha: appContext.enhancedGacha,
    dailyBonuses: appContext.dailyBonuses,
    currentBanner: appContext.currentBanner,
    segmentationLoaded: appContext.segmentationLoaded || false,
  };
  
  // Show loading screen while app is initializing
  if (state.loading && !state.segmentationLoaded) {
    return <LoadingScreen />;
  }
  
  // Show error screen if there's an error
  if (state.error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Error loading app: {state.error}</Text>
        <Text style={[styles.loadingText, { fontSize: 14, marginTop: 8 }]}>
          Please restart the app
        </Text>
      </View>
    );
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