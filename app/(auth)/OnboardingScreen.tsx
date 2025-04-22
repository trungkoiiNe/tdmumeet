import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import Swiper from "react-native-swiper";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore"; // Import theme store
import { useRouter } from "expo-router";

const logo = require("@/assets/tdmu_logo.png");
const googleLogo = require("@/assets/google_logo.png");

const OnboardingScreen = () => {
  const { login, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const swiperRef = React.useRef<Swiper>(null);
  const router = useRouter();

  const handleSkip = () => {
    swiperRef.current?.scrollTo(slides.length - 1, true);
  };

  const handleGoogleSignIn = async () => {
    await login();
    // router.replace('/(users)');
  };
  const handleLogout = async () => {
    await logout();
    // router.replace('/(auth)/login');
  };

  const slides = [
    {
      key: "1",
      title: "Welcome to TDMU Meet!",
      text: "Connect and collaborate seamlessly with colleagues and students.",
      showSkip: true,
    },
    {
      key: "2",
      title: "Instant Meetings",
      text: "Start or join video meetings instantly with just a few taps.",
    },
    {
      key: "3",
      title: "Stay Organized",
      text: "Schedule meetings, manage teams, and keep track of your calendar.",
      isLast: true,
    },
  ];

  // Adjust colors based on dark mode
  const backgroundColor = isDarkMode ? "#181818" : "#fff";
  const textColor = isDarkMode ? "#eee" : "#333";
  const subTextColor = isDarkMode ? "#bbb" : "#666";

  return (
    <Swiper
      ref={swiperRef}
      style={styles.wrapper}
      showsButtons={false}
      loop={false}
      dotStyle={[
        styles.dot,
        isDarkMode && { backgroundColor: "rgba(255,255,255,0.2)" },
      ]}
      activeDotStyle={[
        styles.activeDot,
        isDarkMode && { backgroundColor: "#007AFF" },
      ]}
    >
      {slides.map((slide, index) => (
        <View key={slide.key} style={[styles.slide, { backgroundColor }]}>
          {/* Dark mode toggle icon */}
          <TouchableOpacity
            style={styles.themeToggle}
            onPress={toggleTheme}
            accessibilityLabel="Toggle dark mode"
          >
            <Text style={{ fontSize: 24 }}>{isDarkMode ? "🌙" : "☀️"}</Text>
          </TouchableOpacity>

          <Image source={logo} style={styles.logo} resizeMode="contain" />
          {slide.showSkip && (
            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text
                style={[styles.skipText, isDarkMode && { color: "#4faaff" }]}
              >
                Skip
              </Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.title, { color: textColor }]}>
            {slide.title}
          </Text>
          <Text style={[styles.text, { color: subTextColor }]}>
            {slide.text}
          </Text>
          {slide.isLast && (
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignIn}
            >
              {/* <Image source={googleLogo} style={styles.googleLogo} resizeMode="contain" /> */}
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </Swiper>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    // backgroundColor set dynamically
    padding: 20,
  },
  logo: {
    width: "80%",
    height: 80, // Adjust height as needed
    position: "absolute",
    top: 60, // Adjust positioning
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    marginTop: 100, // Add margin to avoid overlap with logo
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  dot: {
    backgroundColor: "rgba(0,0,0,.2)",
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  activeDot: {
    backgroundColor: "#007AFF", // Or your theme primary color
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
  },
  skipButton: {
    position: "absolute",
    top: 60, // Align with logo or adjust as needed
    right: 20,
    padding: 10,
  },
  skipText: {
    fontSize: 16,
    color: "#007AFF", // Or your theme primary color
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4285F4", // Google blue
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  googleLogo: {
    width: 24,
    height: 24,
    marginRight: 15,
  },
  googleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  themeToggle: {
    position: "absolute",
    top: 60,
    left: 20, // changed from right: 20 to left: 20
    zIndex: 10,
    padding: 8,
  },
});

export default OnboardingScreen;
