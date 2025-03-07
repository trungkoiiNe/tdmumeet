import React, { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { View, StyleSheet } from "react-native";
import { useThemeStore } from "../../../stores/themeStore";
import { darkTheme, lightTheme } from "../../../utils/themes";
import { useTeamStore } from "../../../stores/teamStore";
import { getAuth } from "@react-native-firebase/auth";

export default function UserTabsLayout() {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const auth = getAuth();
  const currentUser = auth?.currentUser;
  // Compute overall unread count across all team messages
  const { messages, fetchUnreadMessages } = useTeamStore();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);
  useEffect(() => {
    const getUnreadMessages = async () => {
      setTotalUnreadCount((await fetchUnreadMessages(currentUser?.uid)).length);

    };
    getUnreadMessages();
  }, [])


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.primaryColor,
        tabBarInactiveTintColor: theme.tertiaryTextColor,
        tabBarStyle: {
          backgroundColor: theme.cardBackgroundColor,
          borderTopColor: theme.borderColor,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="cog" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="(teams)"
        options={{
          title: "Teams",
          tabBarIcon: ({ color }) => (
            <View>
              <FontAwesome size={28} name="users" color={color} />
              {totalUnreadCount > 0 && <View style={styles.redDot} />}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <FontAwesome size={28} name="calendar" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  redDot: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
  },
});
