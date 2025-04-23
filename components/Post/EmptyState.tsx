import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text, Button, IconButton } from 'react-native-paper';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';

interface EmptyStateProps {
    hasSearchQuery: boolean;
    onClearSearch: () => void;
    onCreatePost: () => void;
}

const EmptyState = ({ hasSearchQuery, onClearSearch, onCreatePost }: EmptyStateProps) => {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const theme = isDarkMode ? darkTheme : lightTheme;
    return (
        <Animated.View
            entering={FadeIn.duration(500)}
            style={[styles.container, { backgroundColor: theme.backgroundColor }]}
        >
            <IconButton icon="post" size={50}
            //  color="#9ca3af" 
            />
            <Text style={[styles.title, { color: theme.textColor }]}>No posts found</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryTextColor }] }>
                {hasSearchQuery
                    ? "Try a different search term"
                    : "Create your first post by tapping the + button"}
            </Text>

            <Image
                source={require('@/assets/no-data.jpg')}
                style={styles.image}
            />

            {hasSearchQuery ? (
                <Button
                    mode="outlined"
                    onPress={onClearSearch}
                    style={[styles.button, { borderColor: theme.primaryColor }]}
                    textColor={theme.primaryColor}
                >
                    Clear search
                </Button>
            ) : (
                <Button
                    mode="contained"
                    onPress={onCreatePost}
                    style={[styles.button, { backgroundColor: theme.primaryColor }]}
                    textColor={theme.buttonText}
                >
                    Create post
                </Button>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 16
    },
    subtitle: {
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
        color: "#6b7280"
    },
    image: {
        width: 180,
        height: 120,
        alignSelf: 'center',
        marginVertical: 16,
        opacity: 0.7
    },
    button: {
        marginTop: 8
    }
});

export default React.memo(EmptyState);
