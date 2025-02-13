import { Stack } from "expo-router";

export default function UserStack() {
  return (
    <Stack>
      <Stack.Screen 
        name="Home" 
        options={{ 
          title: "Home",
          headerShown: true 
        }} 
      />
    </Stack>
  );
}