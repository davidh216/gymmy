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
        component={SegmentResultsScreenWrapper}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
    </Stack.Navigator>
  );
};

// Create a context to share the setIsOnboarding function
const NavigationControlContext = React.createContext();

// ============================================================================
// DEMO MODE TOGGLE (Persistent)
// Reads from unified context settings/state so it persists across views
// ============================================================================

// Main App Stack Navigator (includes both onboarding and main app)
const AppStackNavigator = () => {
  const appContext = useApp();
  const [navigationKey, setNavigationKey] = React.useState(0);
  const [isOnboarding, setIsOnboarding] = React.useState(true);
  
  // Provide the setIsOnboarding function to children
  const navigationControl = React.useMemo(() => ({
    forceMainApp: () => {
      console.log('AppStackNavigator: FORCE MAIN APP called directly');
      setIsOnboarding(false);
      setNavigationKey(prev => prev + 1);
    }
  }), []);
  
  // Track survey completion more aggressively - check multiple possible locations
  const surveyCompleted = appContext.userStats?.surveyCompleted || 
                          appContext.userStats?.userStats?.surveyCompleted ||
                          appContext.segmentation?.onboardingCompleted;
  const hasWorkouts = (appContext.userStats?.totalWorkouts || 0) > 0 || 
                     (appContext.userStats?.userStats?.totalWorkouts || 0) > 0;
  const hasUserStats = !!(appContext.userStats && Object.keys(appContext.userStats).length > 0);
  
  // DEMO MODE: Initialize demo data and skip onboarding
  React.useEffect(() => {
    const demoEnabled = appContext?.settings?.demoMode || appContext?.isDemo;
    if (demoEnabled) {
      console.log('AppStackNavigator: DEMO MODE ENABLED - Setting up demo data and bypassing survey');
      // Seed comprehensive demo data via context helper
      if (typeof appContext.resetToDummyData === 'function') {
        appContext.resetToDummyData();
      }
      // Top-up gems for gacha testing in demo
      if (typeof appContext.gacha?.updateCurrencies === 'function') {
        appContext.gacha.updateCurrencies({ gems: 1000000, coins: 1000000, crystals: 1000 });
      }
      
      // Force main app immediately
      setIsOnboarding(false);
      setNavigationKey(prev => prev + 1);
      return; // Skip normal onboarding logic
    }
  }, [appContext?.settings?.demoMode, appContext?.isDemo, appContext.updateUserStats]);

  // Determine onboarding state with immediate updates
  React.useEffect(() => {
    if (appContext?.settings?.demoMode || appContext?.isDemo) return; // Skip if demo mode is enabled
    // Debug: Log the complete userStats structure with full expansion
    console.log('AppStackNavigator: appContext.userStats =', JSON.stringify(appContext.userStats, null, 2));
    console.log('AppStackNavigator: appContext.segmentation =', JSON.stringify(appContext.segmentation, null, 2));
    console.log('AppStackNavigator: All context keys =', Object.keys(appContext));
    console.log('AppStackNavigator: Survey status check:', {
      'userStats?.surveyCompleted': appContext.userStats?.surveyCompleted,
      'userStats?.userStats?.surveyCompleted': appContext.userStats?.userStats?.surveyCompleted,  
      'segmentation?.onboardingCompleted': appContext.segmentation?.onboardingCompleted,
      'final surveyCompleted': surveyCompleted,
    });
    
    // Force immediate check if survey completion is detected anywhere
    if (surveyCompleted === true) {
      console.log('AppStackNavigator: *** SURVEY COMPLETION DETECTED - FORCING MAIN APP ***');
    }
    
    // MANUAL OVERRIDE: If we detect survey data but surveyCompleted is still undefined,
    // check for other indicators of completion
    const manualOverride = appContext.userStats?.lastSurveyCompletion || 
                          appContext.userStats?.segmentResult ||
                          appContext.userStats?.surveySkipped ||
                          appContext.userStats?.userStats?.lastSurveyCompletion ||
                          appContext.userStats?.userStats?.segmentResult ||
                          appContext.userStats?.userStats?.surveySkipped;
                          
    const hasAnyUserData = appContext.userStats && Object.keys(appContext.userStats).length > 1;
    
    if ((manualOverride || hasAnyUserData) && surveyCompleted === undefined) {
      console.log('AppStackNavigator: *** MANUAL OVERRIDE - SURVEY/USER DATA DETECTED ***', {
        manualOverride,
        hasAnyUserData,
        userStatsKeys: appContext.userStats ? Object.keys(appContext.userStats) : null
      });
      // Force navigation to main app
      if (isOnboarding === true) {
        console.log('AppStackNavigator: Forcing navigation to main app via manual override');
        setIsOnboarding(false);
        setNavigationKey(prev => prev + 1);
      }
    }
    
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
  }, [
    surveyCompleted, 
    hasWorkouts, 
    hasUserStats, 
    isOnboarding, 
    appContext.userStats, 
    appContext.segmentation?.onboardingCompleted,
    appContext.userStats?.surveyCompleted,
    appContext.userStats?.userStats?.surveyCompleted,
    appContext.userStats?.totalWorkouts,
    appContext.userStats?.userStats?.totalWorkouts,
    appContext.userStats?.lastSurveyCompletion,
    appContext.userStats?.segmentResult,
    appContext.userStats?.surveySkipped,
    appContext.userStats?.userStats?.lastSurveyCompletion,
    appContext.userStats?.userStats?.segmentResult,
    appContext.userStats?.userStats?.surveySkipped,
  ]);
  
  
  return (
    <NavigationControlContext.Provider value={navigationControl}>
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
    </NavigationControlContext.Provider>
  );
};

// Survey Screen Wrapper Component
const OnboardingSurveyScreen = ({ navigation, route }) => {
  const appContext = useApp();
  const navigationControl = React.useContext(NavigationControlContext);

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
        
        // Navigate to Results screen first, then let the AppStackNavigator handle the main transition
        console.log('OnboardingSurveyScreen: Navigating to Results screen');
        navigation.navigate('Results', { result });
      } else {
        console.log('OnboardingSurveyScreen: updateUserStats function not available');
        console.log('Available context methods:', Object.keys(appContext));
      }
      
    } catch (error) {
      console.error('Error completing survey:', error);
    }
  };

  const handleSkip = async () => {
    console.log('OnboardingSurveyScreen: Survey skipped - directly forcing navigation to main app');
    
    try {
      // Mark survey as completed even when skipped
      if (appContext.updateUserStats) {
        console.log('OnboardingSurveyScreen: Updating user stats for skipped survey');
        await appContext.updateUserStats({
          ...appContext.userStats,
          surveyCompleted: true,
          lastSurveyCompletion: new Date().toISOString(),
          surveySkipped: true,
        });
        console.log('OnboardingSurveyScreen: User stats updated for skipped survey');
      }
      
      // Use the direct navigation control context to force main app
      if (navigationControl?.forceMainApp) {
        console.log('OnboardingSurveyScreen: Calling forceMainApp via context');
        navigationControl.forceMainApp();
      } else {
        console.log('OnboardingSurveyScreen: navigationControl not available, falling back');
        navigation.goBack();
      }
      
    } catch (error) {
      console.error('OnboardingSurveyScreen: Error in skip handler:', error);
      // Fallback - just go back
      navigation.goBack();
    }
  };

  return (
    <OnboardingSurvey
      onComplete={handleSurveyComplete}
      onSkip={handleSkip}
    />
  );
};

// Segment Results Screen Wrapper Component  
const SegmentResultsScreenWrapper = ({ navigation, route }) => {
  const navigationControl = React.useContext(NavigationControlContext);

  // Pass the navigationControl to the SegmentResultsScreen via props
  // and handle the navigation properly from this wrapper
  return (
    <SegmentResultsScreen
      navigation={navigation}
      route={route}
      navigationControl={navigationControl}
      segment={route.params?.result?.segment || route.params?.segment}
      confidence={route.params?.result?.confidence || route.params?.confidence || 85}
      secondarySegment={route.params?.result?.secondarySegment || route.params?.secondarySegment}
      goals={route.params?.result?.goals || route.params?.goals || []}
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