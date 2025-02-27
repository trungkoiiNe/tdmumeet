import { StatusBar } from "react-native";
import React, { useEffect } from "react";
import { Slot, useRouter, useSegments } from "expo-router";
import { useAuthStore } from "../stores/authStore";
export default function RootLayout() {
  const { getUser } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    const inAuth = segments[0] === "(auth)";
    // console.log("inAuth", inAuth);
    // console.log("getUser", getUser());
    if (!getUser() && !inAuth) {
      router.replace("/(auth)");
    } else if (getUser() && inAuth) {
      router.replace("/(users)");
    }
  }, [getUser, segments, router]);

  return (
    <>
      <Slot />
      <StatusBar barStyle="dark-content" />
    </>
  );
}
