// src/components/LoadingFallback.js
// Loading fallback component for React Native with Expo

import React from 'react';
import {
  // View,
  // Text,
  // ActivityIndicator,
  // StyleSheet
} from 'react-native';

const LoadingFallback = ({ message = 'Loading Gymmy...' }) => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#007AFF" />
      <Text style={styles.loadingText}>{message}</Text>
      <Text style={styles.subText}>Initializing character systems...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  subText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoadingFallback;