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

// Context - Updated to use new unified architecture
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
  const [navigationKey, setNavigationKey] = React.useState(0);
  const [isOnboarding, setIsOnboarding] = React.useState(true);
  
  // Track survey completion more aggressively
  const surveyCompleted = appContext.userStats?.surveyCompleted;
  const hasWorkouts = appContext.userStats?.totalWorkouts > 0;
  const hasUserStats = !!appContext.userStats;
  
  // Determine onboarding state with immediate updates
  React.useEffect(() => {
    const shouldShow = (() => {
      // If survey is completed, show main app
      if (surveyCompleted === true) {
        console.log('AppStackNavigator: Survey completed - showing main app');
        return false;
      }
      
      // If no user stats, show onboarding
      if (!hasUserStats) {
        return true;
      }
      
      // If no workouts and no survey completion, show onboarding
      if (!hasWorkouts && !surveyCompleted) {
        return true;
      }
      
      // Otherwise show main app
      return false;
    })();
    
    console.log('AppStackNavigator: Onboarding decision:', {
      shouldShow,
      surveyCompleted,
      hasWorkouts,
      hasUserStats,
      currentState: isOnboarding,
    });
    
    if (isOnboarding !== shouldShow) {
      setIsOnboarding(shouldShow);
      setNavigationKey(prev => prev + 1); // Force navigation re-render
    }
  }, [surveyCompleted, hasWorkouts, hasUserStats, isOnboarding]);
  
  
  return (
    <Stack.Navigator
      key={navigationKey}
      screenOptions={{
        headerShown: false,
      }}
    >
      {isOnboarding ? (
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
  const appContext = useApp();

  const handleSurveyComplete = async (result) => {
    try {
      console.log('OnboardingSurveyScreen: Survey completed with result:', result);
      
      // Update user stats with survey completion flag
      if (appContext.updateUserStats) {
        console.log('OnboardingSurveyScreen: Updating user stats with survey completion flag');
        await appContext.updateUserStats({
          ...appContext.userStats,
          surveyCompleted: true,
          lastSurveyCompletion: new Date().toISOString(),
          segmentResult: result,
        });
        console.log('OnboardingSurveyScreen: User stats updated successfully');
        console.log('OnboardingSurveyScreen: Navigation should automatically update via AppStackNavigator useEffect');
      } else {
        console.log('OnboardingSurveyScreen: updateUserStats function not available');
        console.log('Available context methods:', Object.keys(appContext));
      }
      
    } catch (error) {
      console.error('Error completing survey:', error);
    }
  };

  const handleSkip = async () => {
    console.log('OnboardingSurveyScreen: Survey skipped');
    
    // Mark survey as completed even when skipped
    if (appContext.updateUserStats) {
      try {
        console.log('OnboardingSurveyScreen: Updating user stats for skipped survey');
        await appContext.updateUserStats({
          ...appContext.userStats,
          surveyCompleted: true,
          lastSurveyCompletion: new Date().toISOString(),
          surveySkipped: true,
        });
        console.log('OnboardingSurveyScreen: User stats updated for skipped survey');
        console.log('OnboardingSurveyScreen: Navigation should automatically update via AppStackNavigator useEffect');
      } catch (error) {
        console.error('OnboardingSurveyScreen: Error updating user stats for skip:', error);
      }
    } else {
      console.log('OnboardingSurveyScreen: updateUserStats not available');
      console.log('Available context methods:', Object.keys(appContext));
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
  
  // The context structure uses legacy compatibility wrapper
  const state = {
    loading: appContext.loading || false,
    error: appContext.error || null,
    isDemo: appContext.isDemo || false,
    workoutHistory: appContext.workoutHistory || [],
    userStats: appContext.userStats || {},
    characters: appContext.characterCollection || [],
    enhancedGacha: appContext.gacha?.enhancedGacha || null,
    dailyBonuses: appContext.gacha?.dailyBonuses || null,
    currentBanner: appContext.gacha?.currentBanner || null,
    segmentationLoaded: appContext.segmentation?.segmentationLoaded || false,
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