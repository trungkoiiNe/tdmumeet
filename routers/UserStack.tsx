import { Stack } from "expo-router";
import React from "react";

export default function UserStack() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="chat" />
      <Stack.Screen name="teams" />
      <Stack.Screen name="calendar" />
    </Stack>
  );
}