import { Stack } from "expo-router";
import React from "react";

export default function TeamsLayout() {
  return (
    <Stack initialRouteName="index">
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="(channels)"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
