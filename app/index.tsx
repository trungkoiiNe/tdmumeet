import {
  View,
  StyleSheet,
  useWindowDimensions,
  SafeAreaView,
  Text,
  Animated,
  Easing,
} from "react-native";
import React, { useMemo, useState, useEffect, useRef } from "react";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { useThemeStore } from "@/stores/themeStore";

// Loading messages to display
const LOADING_MESSAGES = [
  "Connecting to server...",
  "Bringing you closer to success...",
  "Please wait a moment...",
  "Preparing to initialize data...",
];

// Extract colors and configuration constants
const SKELETON_CONFIG = {
  speed: 1,
  contentListItems: 4,
};

// Logo component with animation
const AnimatedLogo = ({ width, isDarkMode }) => {
  const opacityAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.5,
          duration: 1200,
          easing: Easing.ease,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const logoWidth = width * 0.7;
  const logoHeight = 80;

  return (
    <Animated.View style={{ opacity: opacityAnim }}>
      <ContentLoader
        speed={SKELETON_CONFIG.speed}
        width={logoWidth}
        height={logoHeight}
        viewBox={`0 0 ${logoWidth} ${logoHeight}`}
        backgroundColor={isDarkMode ? "#333333" : "#f3f3f3"}
        foregroundColor={isDarkMode ? "#444444" : "#ecebeb"}
        aria-label="Loading logo"
      >
        <Rect x="0" y="0" rx="8" ry="8" width={logoWidth} height={logoHeight} />
      </ContentLoader>
    </Animated.View>
  );
};

export default function Loading() {
  const { isDarkMode } = useThemeStore();
  const { width, height } = useWindowDimensions();
  const [messageIndex, setMessageIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Change loading message at regular intervals
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) {
          // Change message and fade in
          setMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            easing: Easing.ease,
            useNativeDriver: true,
          }).start();
        }
      });
    }, 3500); // Change message every 3.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: isDarkMode ? "#000000" : "#ffffff" },
      ]}
      accessibilityLabel="Loading content"
      accessibilityHint="Please wait while the content loads"
    >
      <View style={styles.centerContent}>
        <AnimatedLogo width={width} isDarkMode={isDarkMode} />

        <Animated.Text
          style={[
            styles.loadingText,
            {
              opacity: fadeAnim,
              color: isDarkMode ? "#ffffff" : "#333333",
            },
          ]}
        >
          {LOADING_MESSAGES[messageIndex]}
        </Animated.Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 30,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 30,
  },
});
