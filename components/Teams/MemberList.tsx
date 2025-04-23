import React from "react"
import { View, Text, Image, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"

interface Member {
    id: string
    displayName?: string
    email?: string
    photoURL?: string
}

interface MemberListProps {
    members: Member[]
    ownerId: string
    isCurrentUserOwner: boolean
    onKickMember?: (memberId: string) => void
    theme: any
    currentUserId: string;
}

const MemberList: React.FC<MemberListProps> = ({ members, ownerId, isCurrentUserOwner, onKickMember, theme, currentUserId }) => {
    // Create animated values for list items
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
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Team Members ({members.length})</Text>

            {members.map((member, index) => (
                <Animated.View key={index} style={[styles.memberItem, { borderBottomColor: theme.borderColor }]}>
                    <Image
                        source={{
                            uri: member.photoURL || "https://via.placeholder.com/40",
                        }}
                        style={styles.memberAvatar}
                    />
                    <View style={styles.memberInfo}>
                        <Text style={[styles.memberName, { color: theme.textColor }]}>{member.displayName || "Unknown User"}</Text>
                        <Text style={[styles.memberEmail, { color: theme.secondaryTextColor }]}>{member.email || ""}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 8 }}>
                        {member.id === ownerId && (
                            <View style={styles.ownerBadge}>
                                <Text style={styles.ownerBadgeText}>Owner</Text>
                            </View>
                        )}
                        {member.id === currentUserId && (
                            <View style={[styles.ownerBadge, { backgroundColor: "#3b82f6", marginLeft: 4 }]}> 
                                {/* Use a different color if you want, or keep as owner */}
                                <Text style={styles.ownerBadgeText}>Me</Text>
                            </View>
                        )}
                    </View>
                    {isCurrentUserOwner && member.id !== ownerId && (
                        <TouchableOpacity onPress={() => onKickMember && onKickMember(member.id)} style={styles.kickButton}>
                            <Feather name="user-minus" size={16} color="#DC2626" />
                        </TouchableOpacity>
                    )}
                </Animated.View>
            ))}

            {isCurrentUserOwner && (
                <TouchableOpacity style={[styles.inviteButton, { backgroundColor: theme.buttonBackgroundColor }]}>
                    <Feather name="user-plus" size={18} color={theme.primaryColor} />
                    <Text style={[styles.inviteButtonText, { color: theme.primaryColor }]}>Invite Member</Text>
                </TouchableOpacity>
            )}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 16,
    },
    memberItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    memberAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e5e7eb",
        marginRight: 12,
    },
    memberInfo: {
        flex: 1,
    },
    memberName: {
        fontWeight: "500",
        fontSize: 16,
    },
    memberEmail: {
        fontSize: 14,
    },
    ownerBadge: {
        backgroundColor: "#dbeafe",
        borderRadius: 20,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 8,
    },
    ownerBadgeText: {
        fontSize: 12,
        color: "#1d4ed8",
        fontWeight: "500",
    },
    kickButton: {
        padding: 8,
        marginLeft: 4,
    },
    inviteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
    },
    inviteButtonText: {
        fontWeight: "500",
        marginLeft: 8,
    },
})

export default MemberList
