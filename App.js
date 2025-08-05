import React, { Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

// Import context provider
import { AppProvider, useApp } from './src/context/AppContext';

// Lazy load screens for better performance
const DashboardScreen = React.lazy(() => import('./src/screens/DashboardScreen'));
const AchievementsScreen = React.lazy(() => import('./src/screens/AchievementsScreen'));
const WorkoutScreen = React.lazy(() => import('./src/screens/WorkoutScreen'));
const ProgressScreen = React.lazy(() => import('./src/screens/ProgressScreen'));
const SettingsScreen = React.lazy(() => import('./src/screens/SettingsScreen'));
const ClassSelectionScreen = React.lazy(() => import('./src/screens/ClassSelectionScreen'));
const GachaScreen = React.lazy(() => import('./src/screens/GachaScreen'));
const CharacterCollectionScreen = React.lazy(() => import('./src/screens/CharacterCollectionScreen'));

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Loading component for lazy-loaded screens
const ScreenLoadingFallback = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

// Dashboard Stack Navigator with lazy loading
const DashboardStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen 
      name="DashboardMain" 
      component={DashboardScreen}
      options={{
        lazy: true
      }}
    />
    <Stack.Screen 
      name="Achievements" 
      component={AchievementsScreen}
      options={{
        lazy: true
      }}
    />
    <Stack.Screen 
      name="ClassSelection" 
      component={ClassSelectionScreen}
      options={{
        lazy: true
      }}
    />
    <Stack.Screen 
      name="GachaScreen" 
      component={GachaScreen}
      options={{
        lazy: true
      }}
    />
    <Stack.Screen 
      name="CharacterCollection" 
      component={CharacterCollectionScreen}
      options={{
        lazy: true
      }}
    />
  </Stack.Navigator>
);

// Loading screen component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color="#007AFF" />
    <Text style={styles.loadingText}>Loading your workout data...</Text>
  </View>
);

// Error screen component
const ErrorScreen = ({ error, onRetry }) => (
  <View style={styles.errorContainer}>
    <Ionicons name="alert-circle" size={64} color="#ff4444" />
    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
    <Text style={styles.errorMessage}>{error}</Text>
    <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
      <Text style={styles.retryButtonText}>Retry</Text>
    </TouchableOpacity>
  </View>
);

// Main app navigator component with Suspense wrapper
const AppNavigator = () => {
  const { loading, error, loadAllData } = useApp();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={loadAllData} />;
  }

  return (
    <Suspense fallback={<ScreenLoadingFallback />}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Dashboard') {
              iconName = focused ? 'home' : 'home-outline';
            } else if (route.name === 'Workout') {
              iconName = focused ? 'fitness' : 'fitness-outline';
            } else if (route.name === 'Progress') {
              iconName = focused ? 'trending-up' : 'trending-up-outline';
            } else if (route.name === 'Settings') {
              iconName = focused ? 'settings' : 'settings-outline';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          lazy: true, // Enable lazy loading for tab screens
        })}
      >
        <Tab.Screen 
          name="Dashboard" 
          component={DashboardStack}
          options={{
            lazy: true
          }}
        />
        <Tab.Screen 
          name="Workout" 
          component={WorkoutScreen}
          options={{
            lazy: true
          }}
        />
        <Tab.Screen 
          name="Progress" 
          component={ProgressScreen}
          options={{
            lazy: true
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{
            lazy: true
          }}
        />
      </Tab.Navigator>
    </Suspense>
  );
};

// Main app component with provider wrapper
export default function App() {
  return (
    <AppProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
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
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 