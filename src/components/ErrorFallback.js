// src/components/ErrorFallback.js
// Error boundary fallback component for React Native with Expo

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ErrorFallback = ({ error, resetError }) => {
  return (
    <View style={styles.container}>
      <View style={styles.errorCard}>
        <Ionicons name="warning" size={64} color="#ef4444" />
        <Text style={styles.title}>Oops! Something went wrong</Text>
        <Text style={styles.message}>
          We&apos;re sorry, but something unexpected happened. Please try again.
        </Text>
        
        {error && (
          <View style={styles.errorDetails}>
            <Text style={styles.errorTitle}>Error Details:</Text>
            <Text style={styles.errorText}>{error.toString()}</Text>
          </View>
        )}
        
        <TouchableOpacity style={styles.retryButton} onPress={resetError}>
          <Ionicons name="refresh" size={20} color="white" />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFEBEE',
    padding: 20,
    justifyContent: 'center',
  },
  errorCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#FFCDD2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    maxHeight: 200,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D32F2F',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#D32F2F',
    fontFamily: 'monospace',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ErrorFallback;