import { StatusBar } from "react-native";
import React, { useEffect, useState } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { darkTheme, lightTheme } from "../utils/themes";
import Loading from "./loading";

export default function RootLayout() {
  const { getUser } = useAuthStore();
  const { isDarkMode, init } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme on app startup
  useEffect(() => {
    init();
  }, []);

  // Handle authentication routing
  useEffect(() => {
    const authCheck = async () => {
      setIsLoading(true);
      const inAuth = segments[0] === "(auth)";
      const user = await getUser();
      //no user and not in auth
      if (user == null && !inAuth) {
        console.log("no user and not in auth");
        router.replace("/(auth)");
      }
      //have user and in auth
      else if (user != null && inAuth) {
        router.replace("/(users)");
      }
    };
    authCheck();

    setIsLoading(false);
  }, [getUser, segments, router]);

  // Get current theme based on dark mode setting
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <>
      {isLoading ? <Loading /> : <Slot />}
      <StatusBar barStyle={theme.statusBarStyle as any} />
    </>
  );
}
