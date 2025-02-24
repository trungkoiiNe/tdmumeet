import { Stack } from "expo-router";
import React from "react";
export default function TeamStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="(teams)" />
      <Stack.Screen name="teams" />
    </Stack>
  );
}
