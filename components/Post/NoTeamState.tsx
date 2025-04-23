import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, IconButton, Button } from 'react-native-paper';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';

interface NoTeamStateProps {
    isSelectPrompt?: boolean;
}

const NoTeamState = ({ isSelectPrompt = false }: NoTeamStateProps) => {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const theme = isDarkMode ? darkTheme : lightTheme;
    if (isSelectPrompt) {
        return (
            <Surface style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
                <IconButton icon="arrow-up" size={40}
                // color="#9ca3af" 
                />
                <Text variant="headlineSmall">Select a Team</Text>
                <Text variant="bodyMedium" style={[styles.text, { color: theme.secondaryTextColor }]}>
                    Choose a team from above to view and manage posts
                </Text>
            </Surface>
        );
    }

    return (
        <Surface style={styles.container}>
            <IconButton icon="account-group" size={50}
            //   color="#9ca3af"
            />
            <Text variant="headlineSmall">No Teams Available</Text>
            <Text variant="bodyMedium" style={styles.text}>
                You haven't joined any teams yet.
            </Text>
            <Button mode="contained" style={[styles.button, { backgroundColor: theme.primaryColor }]} textColor={theme.buttonText}>
                Create or Join Team
            </Button>
        </Surface>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 24
    },
    text: {
        textAlign: "center",
        marginTop: 8,
        marginBottom: 24,
        color: "#6b7280"
    },
    button: {
        marginTop: 8
    }
});

export default React.memo(NoTeamState);
