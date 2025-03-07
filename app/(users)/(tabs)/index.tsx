import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useThemeStore } from "../../../stores/themeStore";
import { darkTheme, lightTheme } from "../../../utils/themes";

const index = () => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.text, { color: theme.textColor }]}>Welcome to TDMU Meet</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  }
});

export default index;
