import React, { memo } from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"
import { useThemeStore } from "../../stores/themeStore"
import { lightTheme, darkTheme } from "../../utils/themes"

interface TeamItemProps {
    team: {
        id: string
        name: string
        desc: string
        avatar: string
        members: string[]
        tags: string[]
    }
    hasUnread: boolean
    isOwner: boolean
    onDelete: () => void
}

const TeamItem = memo(({ team, hasUnread, isOwner, onDelete }: TeamItemProps) => {
    const isDarkMode = useThemeStore((state) => state.isDarkMode)
    const theme = isDarkMode ? darkTheme : lightTheme

    // Create animated values for subtle animations
    const scaleAnim = React.useRef(new Animated.Value(0.97)).current
    const opacityAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start()
    }, [scaleAnim, opacityAnim])

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 0.98,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start()

        router.push(`/(users)/(tabs)/(teams)/${team.id}`)
    }

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    backgroundColor: theme.cardBackgroundColor,
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                    borderLeftColor: theme.primaryColor,
                    shadowColor: isDarkMode ? "#000" : "#000",
                    shadowOpacity: isDarkMode ? 0.5 : 0.18,
                    shadowRadius: isDarkMode ? 12 : 8,
                    elevation: isDarkMode ? 8 : 5,
                    borderWidth: 1,
                    borderColor: theme.borderColor,
                    marginHorizontal: 8, // add horizontal margin for separation
                },
                hasUnread && styles.containerWithUnread,
            ]}
        >
            <TouchableOpacity style={styles.content} onPress={handlePress} activeOpacity={0.7}>
                <View style={styles.avatarContainer}>
                    <Image
                        source={{ uri: team.avatar || "https://via.placeholder.com/100" }}
                        style={[
                            styles.avatar,
                            { backgroundColor: theme.secondaryBackgroundColor, borderColor: theme.borderColor, borderWidth: 1 },
                        ]}
                    />
                    {hasUnread && (
                        <View
                            style={[
                                styles.unreadIndicator,
                                {
                                    backgroundColor: theme.primaryColor,
                                    borderColor: theme.cardBackgroundColor,
                                },
                            ]}
                        />
                    )}
                </View>

                <View style={styles.details}>
                    <Text
                        style={[
                            styles.name,
                            { color: theme.textColor },
                            hasUnread && styles.nameUnread,
                        ]}
                        numberOfLines={1}
                    >
                        {team.name}
                    </Text>

                    <Text
                        style={[styles.description, { color: theme.secondaryTextColor }]}
                        numberOfLines={2}
                    >
                        {team.desc}
                    </Text>

                    <View style={styles.metaContainer}>
                        <View style={styles.memberCount}>
                            <Feather name="users" size={14} color={theme.tertiaryTextColor} />
                            <Text style={[styles.memberCountText, { color: theme.tertiaryTextColor }]}>
                                {team.members.length}
                            </Text>
                        </View>

                        <View style={styles.tagsContainer}>
                            {team.tags.slice(0, 3).map((tag, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.tag,
                                        { backgroundColor: theme.tagBackground },
                                    ]}
                                >
                                    <Text style={[styles.tagText, { color: theme.tagText }]}>
                                        #{tag}
                                    </Text>
                                </View>
                            ))}
                            {team.tags.length > 3 && (
                                <Text style={[styles.moreTagsText, { color: theme.tertiaryTextColor }]}>+{team.tags.length - 3}</Text>
                            )}
                        </View>
                    </View>
                </View>
            </TouchableOpacity>

            {isOwner && (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={onDelete}
                    hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                >
                    <Feather name="trash-2" size={20} color={theme.dangerColor} />
                </TouchableOpacity>
            )}
        </Animated.View>
    )
})

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        marginBottom: 16,
        // shadowColor moved to inline for theme
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        overflow: "hidden",
    },
    containerWithUnread: {
        borderLeftWidth: 4,
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 4,
    },
    content: {
        flex: 1,
        flexDirection: "row",
        padding: 16,
    },
    avatarContainer: {
        position: "relative",
        marginRight: 16,
    },
    avatar: {
        width: 64,
        height: 64,
        borderRadius: 32,
        // backgroundColor moved to inline for theme
    },
    unreadIndicator: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        // borderColor moved to inline for theme
    },
    details: {
        flex: 1,
        justifyContent: "center",
    },
    name: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    nameUnread: {
        fontWeight: "700",
    },
    description: {
        fontSize: 14,
        marginBottom: 8,
        lineHeight: 20,
    },
    metaContainer: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
    },
    memberCount: {
        flexDirection: "row",
        alignItems: "center",
        marginRight: 12,
    },
    memberCountText: {
        fontSize: 14,
        marginLeft: 4,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        flex: 1,
    },
    tag: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginRight: 6,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 12,
        fontWeight: "500",
    },
    moreTagsText: {
        fontSize: 12,
        marginLeft: 4,
    },
    deleteButton: {
        padding: 16,
        alignSelf: "stretch",
        justifyContent: "center",
    },
})

export default TeamItem
