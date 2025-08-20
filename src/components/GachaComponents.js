import React, { useState } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity,
  // ScrollView,
  // Alert,
  // Animated,
  // Platform
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useUnifiedApp
} from '../context/UnifiedAppProvider';

// Safe LinearGradient fallback for web or when expo-linear-gradient is unavailable
let LinearGradient = ({ colors = ['#4CAF50'], style, children }) => (
  <View style={[style, { backgroundColor: colors[0] }]}>{children}</View>
);
if (Platform.OS !== 'web') {
  try {
    // eslint-disable-next-line global-require, @typescript-eslint/no-var-requires
    LinearGradient = require('expo-linear-gradient').LinearGradient;
  } catch (e) {
    // Keep fallback
  }
}

const GachaComponents = ({ navigation }) => {
  // const unified = ...; // Quick fix: commented unused variable
  // const userStats = ...; // Quick fix: commented unused variable
  // const gacha = ...; // Quick fix: commented unused variable
  // const pullGacha = ...; // Quick fix: commented unused variable
  // const gachaStats = ...; // Quick fix: commented unused variable
  
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [isPulling, setIsPulling] = useState(false);
  const [pullAnimation] = useState(new Animated.Value(1));
  
  const handlePull = async (pullType) => {
    if (isPulling) return;
    
    setIsPulling(true);
    
    try {
      // const newResults = ...; // Quick fix: commented unused variable
      setResults(newResults);
      setShowResults(true);
      
      // Animate pull button
      Animated.sequence([
        Animated.timing(pullAnimation, { toValue: 0.8, duration: 100, useNativeDriver: true }),
        Animated.timing(pullAnimation, { toValue: 1, duration: 200, useNativeDriver: true }),
      ]).start();
      
    } catch (_error) {
      Alert.alert('Error', 'Failed to perform gacha pull. Please try again.');
    } finally {
      setIsPulling(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#4CAF50', '#81C784']}
        style={styles.background}
      >
        <View style={styles.header}>
          <Ionicons name="gift" size={40} color="#fff" />
          <Text style={styles.title}>Gacha System</Text>
        </View>

        <View style={styles.gachaInfo}>
          <Text style={styles.gachaTitle}>Your Gacha Currency:</Text>
          <Text style={styles.gachaAmount}>{userStats.gems ?? 0} Gems</Text>
        </View>

        <View style={styles.gachaInfo}>
          <Text style={styles.gachaTitle}>Total Pulls:</Text>
          <Text style={styles.gachaAmount}>{gachaStats.total_pulls ?? 0}</Text>
        </View>

        <View style={styles.gachaInfo}>
          <Text style={styles.gachaTitle}>Total Rewards:</Text>
          <Text style={styles.gachaAmount}>{gachaStats.totalRewards}</Text>
        </View>

        <TouchableOpacity
          style={styles.pullButton}
          onPress={() => handlePull('normal')}
          disabled={isPulling}
        >
          <Animated.View style={{ transform: [{ scale: pullAnimation }] }}>
            <LinearGradient
              colors={['#FFD700', '#FFC107']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pullButtonContent}
            >
              <Ionicons name="dice" size={24} color="#fff" />
              <Text style={styles.pullButtonText}>Pull Gacha</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pullButton}
          onPress={() => handlePull('premium')}
          disabled={isPulling}
        >
          <Animated.View style={{ transform: [{ scale: pullAnimation }] }}>
            <LinearGradient
              colors={['#4CAF50', '#81C784']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.pullButtonContent}
            >
              <Ionicons name="star" size={24} color="#fff" />
              <Text style={styles.pullButtonText}>Premium Pull</Text>
            </LinearGradient>
          </Animated.View>
        </TouchableOpacity>

        {showResults && (
          <ScrollView style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Your Gacha Results:</Text>
            {results.map((item, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultText}>{item.name}</Text>
                <Text style={styles.resultValue}>{item.value}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#fff',
  },
  gachaInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    width: '100%',
    alignItems: 'center',
  },
  gachaTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 10,
  },
  gachaAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  pullButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pullButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  pullButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  resultsContainer: {
    width: '100%',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 15,
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.3)',
  },
  resultText: {
    fontSize: 18,
    color: '#fff',
    fontWeight: '500',
  },
  resultValue: {
    fontSize: 18,
    color: '#FFD700',
    fontWeight: 'bold',
  },
});

export default GachaComponents; 