import React, { useEffect, useState, useCallback } from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { View, StyleSheet, LayoutAnimation } from "react-native";
import { useThemeStore } from "@/stores/themeStore";
import { darkTheme, lightTheme } from "@/utils/themes";
import { useTeamStore } from "@/stores/teamStore";
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
  },
  documents: {
    name: "documents",
    title: "Documents",
    iconName: "file-text",
  },
  // calling: {
  //   name: "(calling)",
  //   title: "Calling",
  //   iconName: "phone",
  // },
  // calling2: {
  //   name: "(calling2)",
  //   title: "Calling2",
  //   iconName: "phone",
  // },
  // calling3: {
  //   name: "(calling3)",
  //   title: "Calling3",
  //   iconName: "phone",
  // },
  posts: {
    name: "posts",
    title: "Posts",
    iconName: "file-text",
  },
};

export default function UserTabsLayout() {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const auth = getAuth();
  const currentUser = auth?.currentUser;
  const { fetchUnreadMessages } = useTeamStore();
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  // Configure animations when component mounts
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, []);

  useEffect(() => {
    const getUnreadMessages = async () => {
      try {
        if (!currentUser?.uid) {
          setTotalUnreadCount(0);
          return;
        }
        const unreadMessages = await fetchUnreadMessages(currentUser.uid);
        setTotalUnreadCount(unreadMessages?.length || 0);
      } catch (error) {
        console.error("Error fetching unread messages:", error);
        setTotalUnreadCount(0);
      }
    };

    getUnreadMessages();
  }, [fetchUnreadMessages, currentUser?.uid]);

  const renderTabIcon = useCallback(
    (
      iconName: keyof typeof FontAwesome.glyphMap,
      color: string,
      showBadge = false
    ) => {
      return (
        <View>
          <FontAwesome size={28} name={iconName} color={color} />
          {showBadge && totalUnreadCount > 0 && <View style={styles.redDot} />}
        </View>
      );
    },
    [totalUnreadCount]
  );

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
      {/* All Tabs.Screen components remain unchanged */}
      <Tabs.Screen
        name={TAB_CONFIG.home.name}
        options={{
          title: TAB_CONFIG.home.title,
          tabBarIcon: ({ color }: { color: string }) =>
            renderTabIcon(
              TAB_CONFIG.home.iconName as keyof typeof FontAwesome.glyphMap,
              color
            ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.teams.name}
        options={{
          title: TAB_CONFIG.teams.title,
          tabBarIcon: ({ color }) =>
            renderTabIcon(
              TAB_CONFIG.teams.iconName as keyof typeof FontAwesome.glyphMap,
              color,
              true
            ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.calendar.name}
        options={{
          title: TAB_CONFIG.calendar.title,
          tabBarIcon: ({ color }) =>
            renderTabIcon(
              TAB_CONFIG.calendar.iconName as keyof typeof FontAwesome.glyphMap,
              color
            ),
        }}
      />
      {/* <Tabs.Screen
        name={TAB_CONFIG.calling3.name}
        options={{
          title: TAB_CONFIG.calling3.title,
          tabBarIcon: ({ color }) =>
            renderTabIcon(
              TAB_CONFIG.calling3.iconName as keyof typeof FontAwesome.glyphMap,
              color
            ),
        }}
      /> */}
      <Tabs.Screen
        name={TAB_CONFIG.documents.name}
        options={{
          title: TAB_CONFIG.documents.title,
          tabBarIcon: ({ color }) =>
            renderTabIcon(
              TAB_CONFIG.documents.iconName as keyof typeof FontAwesome.glyphMap,
              color
            ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.posts.name}
        options={{
          title: TAB_CONFIG.posts.title,
          tabBarIcon: ({ color }) =>
            renderTabIcon(
              TAB_CONFIG.posts.iconName as keyof typeof FontAwesome.glyphMap,
              color
            ),
        }}
      />
      <Tabs.Screen
        name={TAB_CONFIG.settings.name}
        options={{
          title: TAB_CONFIG.settings.title,
          tabBarIcon: ({ color }) =>
            renderTabIcon(
              TAB_CONFIG.settings.iconName as keyof typeof FontAwesome.glyphMap,
              color
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
