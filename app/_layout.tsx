import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { darkTheme, lightTheme } from "../utils/themes";

export default function RootLayout() {
  const { getUser } = useAuthStore();
  const { isDarkMode, init } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();

  // Initialize theme on app startup
  useEffect(() => {
    init();
  }, []);

  // Handle authentication routing
  useEffect(() => {
    const inAuth = segments[0] === "(auth)";
    if (!getUser() && !inAuth) {
      router.replace("/(auth)");
    } else if (getUser() && inAuth) {
      router.replace("/(users)");
    }
  }, [getUser, segments, router]);

  // Get current theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <>
      <Slot />
      <StatusBar barStyle={theme.statusBarStyle as any} />
    </>
  );
}
