import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemeStore } from '@/stores/themeStore';
import { darkTheme, lightTheme } from '@/utils/themes';
import * as Network from 'expo-network';

export default function NoConnectionScreen() {
  const router = useRouter();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const handleRetry = async () => {
    try {
      // Check if connection is restored
      const status = await Network.getNetworkStateAsync();
      if (status.isConnected) {
        // If connected, go back to the users screen
        router.replace('/(users)');
      }
    } catch (error) {
      console.error('Error checking network on retry:', error);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>
        No Internet Connection
      </Text>
      <Text style={[styles.message, { color: theme.secondaryTextColor }]}>
        Please check your network settings and try again.
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: theme.primaryColor }]}
        onPress={handleRetry}
      >        <Text style={[styles.retryText, { color: theme.buttonText }]}>
          Retry
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    marginBottom: 30,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  retryText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
