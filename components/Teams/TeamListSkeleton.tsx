import { View, StyleSheet } from "react-native"
import ContentLoader, { Rect, Circle } from "react-content-loader/native"
import { useThemeStore } from "@/stores/themeStore"
import { darkTheme, lightTheme } from "@/utils/themes"
import React from "react"

const TeamListSkeleton = () => {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? darkTheme : lightTheme

    const backgroundColor = isDarkMode ? "#2a2a2a" : "#f3f3f3"
    const foregroundColor = isDarkMode ? "#3a3a3a" : "#ecebeb"

    return (
        <View style={styles.container}>
            {[...Array(4)].map((_, index) => (
                <View key={index} style={[styles.skeletonCard, { backgroundColor: theme.cardBackgroundColor }]}>
                    <ContentLoader
                        speed={1.5}
                        width="100%"
                        height={100}
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                        style={styles.loader}
                    >
                        <Circle cx="32" cy="32" r="32" />
                        <Rect x="80" y="17" rx="4" ry="4" width="70%" height="16" />
                        <Rect x="80" y="45" rx="3" ry="3" width="50%" height="12" />
                        <Rect x="80" y="70" rx="3" ry="3" width="30%" height="10" />
                        <Rect x="150" y="70" rx="8" ry="8" width="40" height="16" />
                    </ContentLoader>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    skeletonCard: {
        borderRadius: 16,
        marginBottom: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    loader: {
        width: "100%",
    },
})

export default TeamListSkeleton
