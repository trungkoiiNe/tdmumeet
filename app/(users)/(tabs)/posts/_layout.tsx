import React from 'react';
import { Stack } from 'expo-router';
import { useThemeStore } from '@/stores/themeStore';
// Custom theme for the posts module

export default function PostsLayout() {
    const isDarkMode = useThemeStore(state => state.isDarkMode); // or whatever your store uses
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false } } />
            {/* If you need to wrap children in PaperProvider for theme context: */}
            {/* <PaperProvider theme={theme}>{children}</PaperProvider> */}
        </Stack>
    );
}

