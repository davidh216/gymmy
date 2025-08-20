import React from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // TouchableOpacity
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';

interface FeatureButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}

export const FeatureButton: React.FC<FeatureButtonProps> = ({
  icon,
  iconColor,
  title,
  subtitle,
  onPress,
}) => (
  <TouchableOpacity style={styles.featureButton} onPress={onPress}>
    <Ionicons name={icon} size={24} color={iconColor} />
    <Text style={styles.buttonText}>{title}</Text>
    <Text style={styles.buttonSubtext}>{subtitle}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  featureButton: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  buttonSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
}); 