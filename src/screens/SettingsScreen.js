import React, { useState, useEffect } from 'react';
import {
  // View,
  // Text,
  // StyleSheet,
  // ScrollView,
  // TouchableOpacity,
  // SafeAreaView,
  // Switch,
  // Alert,
  // 
} from 'react-native';
import {
  // Ionicons
} from '@expo/vector-icons';
import {
  // useApp
} from '../context';

const SettingsScreen = ({ navigation }) => {
  const { settings: appSettings, isDemo, setDemoMode, updateSettings } = useApp();
  
  const [settings, setSettings] = useState({
    notifications: appSettings?.notifications ?? true,
    autoSave: appSettings?.autoSave ?? true,
    darkMode: appSettings?.darkMode ?? false,
    units: appSettings?.units ?? 'lbs',
    showSorenessRatings: true,
    showWorkoutRatings: true,
    demoMode: appSettings?.demoMode ?? false,
  });

  // Sync settings when app settings change
  useEffect(() => {
    if (appSettings) {
      setSettings(prev => ({
        ...prev,
        notifications: appSettings.notifications,
        autoSave: appSettings.autoSave,
        darkMode: appSettings.darkMode,
        units: appSettings.units,
        demoMode: appSettings.demoMode,
      }));
    }
  }, [appSettings]);

  const toggleSetting = async (key) => {
    if (key === 'demoMode') {
      // const newDemoMode = ...; // Quick fix: commented unused variable
      setSettings(prev => ({ ...prev, demoMode: newDemoMode }));
      
      // Bypass Alert and directly call setDemoMode
      try {
        await setDemoMode(newDemoMode);
      } catch (error) {
        console.error('Error toggling demo mode:', error);
        // Revert the setting on error
        setSettings(prev => ({ ...prev, demoMode: !newDemoMode }));
      }
    } else {
      // const newValue = ...; // Quick fix: commented unused variable
      // const newSettings = ...; // Quick fix: commented unused variable
      setSettings(newSettings);
      
      // Update app settings for other toggles
      if (updateSettings) {
        try {
          await updateSettings(newSettings);
        } catch (error) {
          console.error('Error updating settings:', error);
          // Revert on error
          setSettings(prev => ({ ...prev, [key]: !newValue }));
        }
      }
    }
  };

  const exportData = () => {
    // TODO: Implement data export
    Alert.alert(
      'Export Data',
      'This will export all your workout data to a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => console.log('Exporting data...') },
      ],
    );
  };

  const importData = () => {
    // TODO: Implement data import
    Alert.alert(
      'Import Data',
      'This will import workout data from a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Import', onPress: () => console.log('Importing data...') },
      ],
    );
  };

  const clearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your workout data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: () => {
            // TODO: Clear all data
            console.log('Clearing all data...');
            Alert.alert('Data Cleared', 'All workout data has been deleted.');
          },
        },
      ],
    );
  };

  const aboutApp = () => {
    Alert.alert(
      'About Gymmy',
      'Version 1.0.0\n\nA comprehensive workout tracking app for weightlifting and cardio.\n\nFeatures:\n• Track weightlifting exercises\n• Monitor cardio activities\n• Progress tracking\n• One-rep max tracking\n• Workout ratings\n• Soreness tracking',
      [{ text: 'OK' }],
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Customize your workout experience</Text>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="notifications" size={20} color="#007AFF" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={settings.notifications}
              onValueChange={() => toggleSetting('notifications')}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="save" size={20} color="#007AFF" />
              <Text style={styles.settingLabel}>Auto Save</Text>
            </View>
            <Switch
              value={settings.autoSave}
              onValueChange={() => toggleSetting('autoSave')}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="moon" size={20} color="#007AFF" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={settings.darkMode}
              onValueChange={() => toggleSetting('darkMode')}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="scale-outline" size={20} color="#007AFF" />
              <Text style={styles.settingLabel}>Units</Text>
            </View>
            <TouchableOpacity 
              style={styles.unitButton}
              onPress={() => {
                setSettings(prev => ({
                  ...prev,
                  units: prev.units === 'lbs' ? 'kg' : 'lbs',
                }));
              }}
            >
              <Text style={styles.unitText}>{settings.units.toUpperCase()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Demo Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo & Testing</Text>
          
          <View style={[styles.settingItem, isDemo && styles.demoModeActive]}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="eye" 
                size={20} 
                color={isDemo ? '#ff6b35' : '#007AFF'} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingLabel, isDemo && styles.demoModeText]}>
                  Demo Mode
                </Text>
                {isDemo && (
                  <Text style={styles.demoModeSubtext}>
                    Currently viewing demo data
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={settings.demoMode}
              onValueChange={() => toggleSetting('demoMode')}
              trackColor={{ false: '#ddd', true: '#ff6b35' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Tracking Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tracking Options</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="fitness" size={20} color="#007AFF" />
              <Text style={styles.settingLabel}>Workout Ratings</Text>
            </View>
            <Switch
              value={settings.showWorkoutRatings}
              onValueChange={() => toggleSetting('showWorkoutRatings')}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <Ionicons name="body" size={20} color="#007AFF" />
              <Text style={styles.settingLabel}>Soreness Ratings</Text>
            </View>
            <Switch
              value={settings.showSorenessRatings}
              onValueChange={() => toggleSetting('showSorenessRatings')}
              trackColor={{ false: '#ddd', true: '#007AFF' }}
              thumbColor="#fff"
            />
          </View>
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Ionicons name="download" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Export Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={importData}>
            <Ionicons name="cloud-upload-outline" size={20} color="#007AFF" />
            <Text style={styles.actionText}>Import Data</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={clearAllData}>
            <Ionicons name="trash" size={20} color="#dc3545" />
            <Text style={[styles.actionText, { color: '#dc3545' }]}>Clear All Data</Text>
          </TouchableOpacity>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.actionButton} onPress={aboutApp}>
            <Ionicons name="information-circle" size={20} color="#007AFF" />
            <Text style={styles.actionText}>About App</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  unitButton: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  unitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    gap: 10,
  },
  actionText: {
    fontSize: 16,
    color: '#333',
  },
  
  // Demo Mode Styles
  demoModeActive: {
    backgroundColor: '#fff5f0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b35',
  },
  settingTextContainer: {
    flex: 1,
  },
  demoModeText: {
    color: '#ff6b35',
    fontWeight: '600',
  },
  demoModeSubtext: {
    fontSize: 12,
    color: '#ff6b35',
    marginTop: 2,
    fontStyle: 'italic',
  },
});

export default SettingsScreen; 