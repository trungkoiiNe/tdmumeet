import React from 'react';
import { StyleSheet } from 'react-native';
import { Surface, Text, IconButton, Button } from 'react-native-paper';

const AuthRequiredState = () => {
    return (
        <Surface style={styles.container}>
            <IconButton icon="account-lock" size={50}
            //   color="#9ca3af"
            />
            <Text variant="headlineSmall">Authentication Required</Text>
            <Text variant="bodyMedium" style={styles.text}>
                You need to log in to view and manage posts.
            </Text>
            <Button mode="contained" style={styles.button}>
                Log In
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
        marginTop: 8,
        backgroundColor: "#3b82f6"
    }
});

export default React.memo(AuthRequiredState);

console.log("Created posts/components/AuthRequiredState.tsx");