import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MotivationalQuote = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(1));
  
  const quotes = [
    {
      text: "The only bad workout is the one that didn't happen.",
      author: 'Unknown'
    },
    {
      text: "Strength does not come from the physical capacity. It comes from an indomitable will.",
      author: 'Mahatma Gandhi'
    },
    {
      text: "The difference between the impossible and the possible lies in determination.",
      author: 'Tommy Lasorda'
    },
    {
      text: "Don't wish for it. Work for it.",
      author: 'Unknown'
    },
    {
      text: "The only person you are destined to become is the person you decide to be.",
      author: 'Ralph Waldo Emerson'
    }
  ];
  
  useEffect(() => {
    const interval = setInterval(() => {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentQuote((prev) => (prev + 1) % quotes.length);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <View style={styles.container}>
      <Animated.View style={[styles.quoteContainer, { opacity: fadeAnim }]}>
        <Ionicons name="chatbubble-ellipses" size={20} color="#8b5cf6" />
        <Text style={styles.quoteText}>{quotes[currentQuote].text}</Text>
        <Text style={styles.authorText}>- {quotes[currentQuote].author}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quoteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  quoteText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginLeft: 10,
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

export default MotivationalQuote; 