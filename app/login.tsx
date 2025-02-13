import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";

const { width } = Dimensions.get("window");

interface Slide {
  title: string;
  description: string;
}

const slides: Slide[] = [
  {
    title: "Welcome",
    description: "Discover amazing features of our app.",
  },
  {
    title: "Connect",
    description: "Easily connect with your team and collaborate.",
  },
  {
    title: "Secure",
    description: "Your data is safe with our top-notch security.",
  },
  {
    title: "Get Started",
    description: "Sign in to start using the app.",
  },
];

export default function Login() {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();
  const { signIn, loading, signOut } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  const handleSignout = useCallback(async () => {
    await signOut();
  }, [signOut]);

  const handleScroll = useCallback((event: any) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentSlide(slideIndex);
  }, []);

  const handleSignIn = useCallback(async () => {
    await signIn();
  }, [signIn]);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderSlide = useCallback(
    (slide: Slide, index: number) => (
      <Animated.View
        key={index}
        style={[
          styles.slide,
          { width },
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.description}>{slide.description}</Text>
        {index === slides.length - 1 &&
          (loading ? (
            <ActivityIndicator
              size="large"
              color="#007BFF"
              style={{ marginTop: 20 }}
            />
          ) : (
            <TouchableOpacity style={styles.button} onPress={handleSignIn}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          ))}
        <TouchableOpacity style={styles.button} onPress={handleSignout}>
          <Text style={styles.buttonText}>Sign out</Text>
        </TouchableOpacity>
      </Animated.View>
    ),
    [loading, handleSignIn, fadeAnim, slideAnim]
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        ref={scrollViewRef}
      >
        {slides.map((slide, index) => renderSlide(slide, index))}
      </ScrollView>
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentSlide === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  slide: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#343a40",
  },
  description: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    color: "#6c757d",
  },
  button: {
    backgroundColor: "#007BFF",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#007BFF",
  },
  inactiveDot: {
    backgroundColor: "#ccc",
  },
});
