import { Stack } from "expo-router";

export default function AdminStack() {
  return (
    <Stack>
      <Stack.Screen 
        name="AdminHome" 
        options={{ 
          title: "Admin Dashboard",
          headerShown: true 
        }} 
      />
    </Stack>
  );
}