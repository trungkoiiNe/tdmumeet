import { Stack } from "expo-router";
import React from "react";

export default function TeamStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: "Teams" }} />
      <Stack.Screen name="[id]" options={{ title: "Team Details" }} />
    </Stack>
  );
}