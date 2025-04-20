import { View, Text } from "react-native";
import React from "react";
import { Stack } from "expo-router";
export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerTitle: "Chat",
          headerStyle: { backgroundColor: "teal" },
          headerTintColor: "#fff",
          headerShown: false,
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      />
    </Stack>
  );
}
