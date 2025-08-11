// Simple test to verify Jest setup is working
describe('Jest Setup', () => {
  test('should run tests successfully', () => {
    expect(true).toBe(true);
  });

  test('should have React Native mocks available', () => {
    const { View, Text } = require('react-native');
    expect(View).toBe('View');
    expect(Text).toBe('Text');
  });

  test('should have AsyncStorage mock available', () => {
    const AsyncStorage = require('@react-native-async-storage/async-storage');
    expect(AsyncStorage.setItem).toBeDefined();
    expect(AsyncStorage.getItem).toBeDefined();
  });
}); 