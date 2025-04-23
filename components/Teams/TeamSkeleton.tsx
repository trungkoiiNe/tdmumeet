import ContentLoader, { Circle, Rect } from "react-content-loader/native"
import { ScrollView, StyleSheet, View } from "react-native"
import { useThemeStore } from "@/stores/themeStore"
import { darkTheme, lightTheme } from "@/utils/themes"
import React from "react"

const TeamSkeleton = () => {
    const { isDarkMode } = useThemeStore()
    const theme = isDarkMode ? darkTheme : lightTheme

    const foregroundColor = isDarkMode ? "#3a3a3a" : "#ecebeb"
    const backgroundColor = isDarkMode ? "#2a2a2a" : "#f3f3f3"

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <View style={[styles.header, { backgroundColor: theme.cardBackgroundColor }]}>
                <View style={{ width: 24 }} />
                <ContentLoader
                    speed={2}
                    width={200}
                    height={24}
                    backgroundColor={backgroundColor}
                    foregroundColor={foregroundColor}
                >
                    <Rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
                </ContentLoader>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBackgroundColor }]}>
                <View style={styles.teamInfoHeader}>
                    <ContentLoader
                        speed={2}
                        width={96}
                        height={96}
                        viewBox="0 0 96 96"
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                    >
                        <Circle cx="48" cy="48" r="48" />
                    </ContentLoader>

                    <ContentLoader
                        speed={2}
                        width={150}
                        height={24}
                        viewBox="0 0 150 24"
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                        style={{ marginTop: 8 }}
                    >
                        <Rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
                    </ContentLoader>

                    <ContentLoader
                        speed={2}
                        width={100}
                        height={16}
                        viewBox="0 0 100 16"
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                        style={{ marginTop: 8 }}
                    >
                        <Rect x="0" y="0" rx="4" ry="4" width="100" height="16" />
                    </ContentLoader>
                </View>

                <ContentLoader
                    speed={2}
                    width={300}
                    height={60}
                    viewBox="0 0 300 60"
                    backgroundColor={backgroundColor}
                    foregroundColor={foregroundColor}
                    style={{ marginVertical: 16 }}
                >
                    <Rect x="0" y="0" rx="4" ry="4" width="300" height="60" />
                </ContentLoader>

                <ContentLoader
                    speed={2}
                    width={250}
                    height={20}
                    viewBox="0 0 250 20"
                    backgroundColor={backgroundColor}
                    foregroundColor={foregroundColor}
                >
                    <Rect x="0" y="0" rx="20" ry="20" width="70" height="20" />
                    <Rect x="80" y="0" rx="20" ry="20" width="80" height="20" />
                    <Rect x="170" y="0" rx="20" ry="20" width="60" height="20" />
                </ContentLoader>
            </View>

            <View style={[styles.sectionCard, { backgroundColor: theme.cardBackgroundColor }]}>
                <ContentLoader
                    speed={2}
                    width={200}
                    height={24}
                    viewBox="0 0 200 24"
                    backgroundColor={backgroundColor}
                    foregroundColor={foregroundColor}
                    style={{ marginBottom: 16 }}
                >
                    <Rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
                </ContentLoader>

                {[...Array(3)].map((_, i) => (
                    <ContentLoader
                        key={i}
                        speed={2}
                        width={320}
                        height={60}
                        viewBox="0 0 320 60"
                        backgroundColor={backgroundColor}
                        foregroundColor={foregroundColor}
                        style={{ marginBottom: 12 }}
                    >
                        <Circle cx="20" cy="30" r="20" />
                        <Rect x="50" y="15" rx="4" ry="4" width="150" height="16" />
                        <Rect x="50" y="40" rx="4" ry="4" width="100" height="12" />
                    </ContentLoader>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 3,
    },
    sectionCard: {
        borderRadius: 16,
        margin: 16,
        padding: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    teamInfoHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
})

export default TeamSkeleton
