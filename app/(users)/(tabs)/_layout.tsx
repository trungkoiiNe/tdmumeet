import React, { useEffect, useState, useCallback } from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { View, StyleSheet } from "react-native";
import { useThemeStore } from "../../../stores/themeStore";
import { darkTheme, lightTheme } from "../../../utils/themes";
import { useTeamStore } from "../../../stores/teamStore";
import { getAuth } from "@react-native-firebase/auth";

// Tab configuration object
const TAB_CONFIG = {
  home: {
    name: "index",
    title: "Home",
    iconName: "home",
  },
  settings: {
    name: "settings",
    title: "Settings",
    iconName: "cog",
  },
  teams: {
    name: "(teams)",
    title: "Teams",
    iconName: "users",
  },
  calendar: {
    name: "calendar",
    title: "Calendar",
    iconName: "calendar",
  }
};

export default function UserTabsLayout() {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const auth = getAuth();
  const currentUser = auth?.currentUser;
  // Removed unused 'messages' property from destructuring
  const { fetchUnreadMessages } = useTeamStore();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  useEffect(() => {
    const getUnreadMessages = async () => {
      try {
        // Handle null/undefined user ID gracefully
        if (!currentUser?.uid) {
          setTotalUnreadCount(0);
          return;
        }
        const unreadMessages = await fetchUnreadMessages(currentUser.uid);
        setTotalUnreadCount(unreadMessages?.length || 0);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
        setTotalUnreadCount(0); // Fallback to 0 on error
      }
    };

    getUnreadMessages();
  }, [fetchUnreadMessages, currentUser?.uid]); // Added proper dependencies

  // Memoized tab icon render functions
  const renderTabIcon = useCallback((iconName: keyof typeof FontAwesome.glyphMap, color: string, showBadge = false) => {
    return (
      <View>
        <FontAwesome size={28} name={iconName} color={color} />
        {showBadge && totalUnreadCount > 0 && <View style={styles.redDot} />}
      </View>
    );
  }, [totalUnreadCount]);

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
        name={TAB_CONFIG.home.name}
        options={{
          title: TAB_CONFIG.home.title,
          tabBarIcon: ({ color }: { color: string }) => renderTabIcon(TAB_CONFIG.home.iconName as keyof typeof FontAwesome.glyphMap, color),
        }}
      />

      <Tabs.Screen
        name={TAB_CONFIG.teams.name}
        options={{
          title: TAB_CONFIG.teams.title,
          tabBarIcon: ({ color }) => renderTabIcon(TAB_CONFIG.teams.iconName as keyof typeof FontAwesome.glyphMap, color, true),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.calendar.name}
        options={{
          title: TAB_CONFIG.calendar.title,
          tabBarIcon: ({ color }) => renderTabIcon(TAB_CONFIG.calendar.iconName as keyof typeof FontAwesome.glyphMap, color),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.settings.name}
        options={{
          title: TAB_CONFIG.settings.title,
          tabBarIcon: ({ color }) => renderTabIcon(TAB_CONFIG.settings.iconName as keyof typeof FontAwesome.glyphMap, color),
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
