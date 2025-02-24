import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AdminSettings() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Admin settings coming soon...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});