import { View, Text, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import React from "react";
import { useThemeStore } from "../../../stores/themeStore";
import { darkTheme, lightTheme } from "../../../utils/themes";
import RecentUpdatesFeed from "../../../components/RecentUpdatesFeed";

const HomeScreen = () => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: theme.textColor }]}>Welcome to TDMU Meet</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryTextColor }]}>
          Stay updated with your classes
        </Text>
      </View>

      <View style={styles.feedContainer}>
        <RecentUpdatesFeed />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  feedContainer: {
    flex: 1,
  }
});

export default HomeScreen;
