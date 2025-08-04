import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MotivationalQuote = () => {
  const [quote, setQuote] = useState('');
  const [author, setAuthor] = useState('');

  const quotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Strength does not come from the physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
    { text: "The difference between the impossible and the possible lies in determination.", author: "Tommy Lasorda" },
    { text: "Your body can stand almost anything. It's your mind you have to convince.", author: "Unknown" },
    { text: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
    { text: "Success isn't always about greatness. It's about consistency.", author: "Dwayne Johnson" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Arnold Schwarzenegger" },
    { text: "Don't wish for it. Work for it.", author: "Unknown" },
    { text: "The only way to define your limits is by going beyond them.", author: "Arthur C. Clarke" },
    { text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
    { text: "The hard days are what make you stronger.", author: "Aly Raisman" },
    { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Make yourself proud.", author: "Unknown" },
    { text: "The body achieves what the mind believes.", author: "Unknown" },
    { text: "Every rep counts.", author: "Unknown" },
    { text: "You are stronger than you think.", author: "Unknown" },
    { text: "Progress is progress, no matter how small.", author: "Unknown" },
    { text: "The only person you should try to be better than is the person you were yesterday.", author: "Unknown" },
    { text: "Your future self is watching you right now through memories.", author: "Unknown" }
  ];

  useEffect(() => {
    // Get today's date as a string to use as seed
    const today = new Date().toDateString();
    const seed = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Use the seed to select a quote for today
    const quoteIndex = seed % quotes.length;
    setQuote(quotes[quoteIndex].text);
    setAuthor(quotes[quoteIndex].author);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.quote}>"{quote}"</Text>
      <Text style={styles.author}>— {author}</Text>
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
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  author: {
    fontSize: 14,
    color: '#666',
    textAlign: 'right',
    fontStyle: 'italic',
  },
});

export default MotivationalQuote; 