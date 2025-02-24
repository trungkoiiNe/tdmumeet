import { Stack, Slot } from "expo-router";
import { useEffect } from "react";
import { useSegments, useRouter } from "expo-router";
import { useAuthStore } from "../stores/authStore";
import { MMKV } from "react-native-mmkv";
import React = require("react");

const storage = new MMKV();

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const inLoginScreen = segments[0] === "login";
    const inAdminGroup = segments[0] === "(admin)";
    const inUserGroup = segments[0] === "(user)";
    const storedUser = storage.getString("user");
    const hasUser = !!storedUser || !!user;

    if (!hasUser && !inLoginScreen) {
      router.navigate("/login");
      return;
    }
    if (hasUser) {
      const storedRole = storage.getString("userRole");
      if (storedRole === "admin" && !inAdminGroup) {
        router.navigate("/(admin)");
      } else if ((storedRole === "user" || !storedRole) && !inUserGroup) {
        router.navigate("/(user)");
      }
    }
  }, [user, segments, router]);

  return <Slot />;
}
