import { Stack } from "expo-router";
import React from "react";

export default function ChannelLayout() {
  return (
    <Stack initialRouteName="[id]">
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false,
          presentation: "card",
        }}
      />
    </Stack>
  );
}
