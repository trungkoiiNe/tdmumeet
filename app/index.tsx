import { Redirect } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { MMKV } from "react-native-mmkv";
import { View } from "react-native";
import { Animated } from "react-native";
import { useEffect } from "react";

const storage = new MMKV();

export default function MainStack() {
  const { user, loading } = useAuthStore();
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (loading) {
    return null;
  }

  const storedUser = storage.getString("user");
  const hasUser = !!storedUser || !!user;

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {!hasUser ? <Redirect href="/login" /> : <Redirect href="/(user)" />}
    </Animated.View>
  );
}
