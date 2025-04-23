import React from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native"
import { Feather } from "@expo/vector-icons"
import { Animated } from "react-native"

interface Team {
    id: string
    name: string
    desc: string
    avatar: string
    members: string[]
    ownerId: string
    tags: string[]
    isPublic: boolean
    createdAt: number
    updatedAt: number
}

interface TeamInfoProps {
    team: Team
    isCurrentUserOwner: boolean
    isCurrentUserMember: boolean
    onJoin: () => void
    onLeave: () => void
    theme: any
}

const TeamInfo: React.FC<TeamInfoProps> = ({
    team,
    isCurrentUserOwner,
    isCurrentUserMember,
    onJoin,
    onLeave,
    theme,
}) => {
    // Create animated values for subtle animations
    const fadeAnim = React.useRef(new Animated.Value(0)).current

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start()
    }, [fadeAnim])

    return (
        <Animated.View style={{ opacity: fadeAnim }}>
            <View style={styles.teamInfoHeader}>
                <Image source={{ uri: team.avatar || "https://via.placeholder.com/100" }} style={styles.teamAvatar} />
                <Text style={[styles.teamName, { color: theme.textColor }]}>{team.name}</Text>
                <View style={styles.publicStatusContainer}>
                    <Feather name={team.isPublic ? "globe" : "lock"} size={16} color={theme.secondaryTextColor} />
                    <Text style={[styles.publicStatusText, { color: theme.secondaryTextColor }]}>
                        {team.isPublic ? "Public" : "Private"} Team
                    </Text>
                </View>

                {!isCurrentUserOwner && (
                    <TouchableOpacity
                        style={[styles.membershipButton, isCurrentUserMember ? styles.leaveButton : styles.joinButton]}
                        onPress={isCurrentUserMember ? onLeave : onJoin}
                    >
                        <Feather
                            name={isCurrentUserMember ? "user-x" : "user-plus"}
                            size={16}
                            color={isCurrentUserMember ? "#DC2626" : "#2563EB"}
                        />
                        <Text
                            style={[
                                styles.membershipButtonText,
                                isCurrentUserMember ? styles.leaveButtonText : styles.joinButtonText,
                            ]}
                        >
                            {isCurrentUserMember ? "Leave Team" : "Join Team"}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <Text style={[styles.teamDescription, { color: theme.textColor }]}>{team.desc}</Text>

            <View style={styles.tagsContainer}>
                {team.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: theme.tagBackgroundColor }]}>
                        <Text style={[styles.tagText, { color: theme.tagTextColor }]}>#{tag}</Text>
                    </View>
                ))}
            </View>

            <View style={[styles.infoSection, { borderTopColor: theme.borderColor }]}>
                <Text style={[styles.infoLabel, { color: theme.secondaryTextColor }]}>Created</Text>
                <Text style={{ color: theme.textColor }}>{new Date(team.createdAt).toLocaleDateString()}</Text>
            </View>

            <View style={[styles.infoSection, { borderTopColor: theme.borderColor }]}>
                <Text style={[styles.infoLabel, { color: theme.secondaryTextColor }]}>Last Updated</Text>
                <Text style={{ color: theme.textColor }}>{new Date(team.updatedAt).toLocaleDateString()}</Text>
            </View>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    teamInfoHeader: {
        alignItems: "center",
        marginBottom: 16,
    },
    teamAvatar: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: "#e5e7eb",
    },
    teamName: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 12,
        textAlign: "center",
    },
    publicStatusContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 8,
    },
    publicStatusText: {
        marginLeft: 6,
    },
    teamDescription: {
        marginVertical: 16,
        lineHeight: 22,
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginBottom: 16,
    },
    tag: {
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 6,
        margin: 4,
    },
    tagText: {
        fontSize: 14,
    },
    infoSection: {
        borderTopWidth: 1,
        paddingTop: 16,
        marginBottom: 16,
    },
    infoLabel: {
        marginBottom: 4,
        fontWeight: "500",
    },
    membershipButton: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 16,
    },
    joinButton: {
        backgroundColor: "#DBEAFE", // Light blue background
    },
    leaveButton: {
        backgroundColor: "#FEE2E2", // Light red background
    },
    membershipButtonText: {
        marginLeft: 8,
        fontWeight: "500",
    },
    joinButtonText: {
        color: "#2563EB", // Blue text for join
    },
    leaveButtonText: {
        color: "#DC2626", // Red text for leave
    },
})

export default TeamInfo
