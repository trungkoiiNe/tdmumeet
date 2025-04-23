import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';
import { Text } from 'react-native-paper';
const SkeletonLoader = () => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}> 
      <Text style={[styles.loadingText, { color: theme.tertiaryTextColor }]}>Loading posts...</Text>
      {[...Array(3)].map((_, idx) => (
        <View key={idx} style={[styles.skeletonCard, { backgroundColor: theme.cardBackgroundColor }]}> 
          <View style={styles.skeletonHeader}>
            <View style={[styles.skeletonAvatar, { backgroundColor: theme.inputBorderColor }]} />
            <View style={styles.skeletonHeaderText}>
              <View style={[styles.skeletonTitle, { backgroundColor: theme.inputBorderColor }]} />
              <View style={[styles.skeletonSubtitle, { backgroundColor: theme.inputBorderColor }]} />
            </View>
          </View>
          <View style={[styles.skeletonContent1, { backgroundColor: theme.inputBorderColor }]} />
          <View style={[styles.skeletonContent2, { backgroundColor: theme.inputBorderColor }]} />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  loadingText: {
    textAlign: 'center',
    marginBottom: 16
  },
  skeletonCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  skeletonAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  skeletonHeaderText: {
    flex: 1
  },
  skeletonTitle: {
    height: 14,
    // backgroundColor: theme.inputBorderColor,
    borderRadius: 4,
    marginBottom: 6,
    width: '60%'
  },
  skeletonSubtitle: {
    height: 10,
    // backgroundColor: theme.inputBorderColor,
    borderRadius: 4,
    width: '40%'
  },
  skeletonContent1: {
    height: 12,
    // backgroundColor: theme.cardBackgroundColor,
    borderRadius: 4,
    marginBottom: 8,
    width: '80%'
  },
  skeletonContent2: {
    height: 12,
    // backgroundColor: theme.cardBackgroundColor,
    borderRadius: 4,
    width: '70%'
  }
});

export default React.memo(SkeletonLoader);
