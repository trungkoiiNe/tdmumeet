import React from "react"
import { Text, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { useThemeStore } from "@/stores/themeStore"
import { darkTheme, lightTheme } from "@/utils/themes"
import { router } from "expo-router"
import { Animated } from "react-native"

const EmptyTeamsState = () => {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? darkTheme : lightTheme

    // Create animated values for subtle animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current
    const scaleAnim = React.useRef(new Animated.Value(0.95)).current

    React.useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start()
    }, [fadeAnim, scaleAnim])

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.cardBackgroundColor,
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }],
                },
            ]}
        >
            <Feather name="users" size={64} color={theme.tertiaryTextColor} style={styles.icon} />

            <Text style={[styles.title, { color: theme.textColor }]}>No Teams Yet</Text>

            <Text style={[styles.description, { color: theme.secondaryTextColor }]}>
                Create a team to collaborate with others or join an existing team.
            </Text>

            <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.primaryColor }]}
                onPress={() => router.push("/teams/create")}
            >
                <Feather name="plus" size={18} color="white" />
                <Text style={styles.buttonText}>Create Your First Team</Text>
            </TouchableOpacity>

            <Text style={[styles.hint, { color: theme.tertiaryTextColor }]}>
                You can also tap the + button in the top right corner
            </Text>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        margin: 16,
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    icon: {
        marginBottom: 24,
        opacity: 0.7,
    },
    title: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 12,
        textAlign: "center",
    },
    description: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        lineHeight: 22,
    },
    button: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    buttonText: {
        color: "white",
        fontWeight: "600",
        marginLeft: 8,
    },
    hint: {
        fontSize: 14,
        textAlign: "center",
        fontStyle: "italic",
    },
})

export default EmptyTeamsState
