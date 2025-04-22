import { StatusBar } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import { darkTheme, lightTheme } from "@/utils/themes";
import * as Network from "expo-network";
import { PaperProvider } from "react-native-paper";

export default function RootLayout() {
  const { getUser } = useAuthStore();
  const { isDarkMode, init } = useThemeStore();
  const segments = useSegments();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const previousScreen = useRef("");

  // Initialize theme on app startup
  useEffect(() => {
    init();
  }, []);

  // Monitor network connectivity
  useEffect(() => {
    let networkSubscription: any = null;

    // Initial network check
    const checkConnection = async () => {
      try {
        const status = await Network.getNetworkStateAsync();
        setIsConnected(status.isConnected || false);

        // If not connected, navigate to NoConnectionScreen
        if (!status.isConnected) {
          console.log("first");
        }
        if (!status.isConnected && segments[0] !== "NoConnectionScreen") {
          // Store current path before navigating away
          if (segments.length > 0) {
            previousScreen.current = "/" + segments.join("/");
          }
          router.replace("/NoConnectionScreen");
        }
      } catch (error) {
        console.error("Error checking network:", error);
        setIsConnected(false);
      }
    };

    // Set up event listeners for connection changes
    const setupNetworkListeners = () => {
      // Clear any existing listeners
      if (networkSubscription) {
        networkSubscription();
      }

      // Check connection immediately
      checkConnection();

      // Set up interval to check connection status
      networkSubscription = setInterval(async () => {
        const status = await Network.getNetworkStateAsync();
        const wasConnected = isConnected;
        const nowConnected = status.isConnected || false;

        // Update connection state
        setIsConnected(nowConnected);

        // Handle connection state changes
        if (!wasConnected && nowConnected) {
          // Connection restored, navigate back to previous screen
          if (
            previousScreen.current &&
            previousScreen.current !== "/NoConnectionScreen"
          ) {
            router.replace(previousScreen.current);
          } else {
            router.replace("/(users)");
          }
        } else if (
          wasConnected &&
          !nowConnected &&
          segments[0] !== "NoConnectionScreen"
        ) {
          // Lost connection, save current screen and navigate to no connection screen
          if (segments.length > 0) {
            previousScreen.current = "/" + segments.join("/");
          }
          router.replace("/NoConnectionScreen");
        }
      }, 5000); // Check every 5 seconds
    };

    setupNetworkListeners();

    // Cleanup function
    return () => {
      if (networkSubscription) {
        clearInterval(networkSubscription);
      }
    };
  }, [isConnected, segments, router]);

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

  // Create a handleRetry function to pass to NoConnectionScreen
  const handleRetry = async () => {
    const status = await Network.getNetworkStateAsync();
    setIsConnected(status.isConnected || false);
    if (status.isConnected) {
      if (
        previousScreen.current &&
        previousScreen.current !== "/NoConnectionScreen"
      ) {
        router.replace(previousScreen.current);
      } else {
        router.replace("/(users)");
      }
    }
  };

  return (
    <PaperProvider >
      <Slot />
      <StatusBar barStyle={theme.statusBarStyle as any} />
    </PaperProvider>
  );
}
