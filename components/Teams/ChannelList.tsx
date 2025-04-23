import React from "react"
import { View, Text, StyleSheet, TouchableOpacity, Animated } from "react-native"
import { Feather } from "@expo/vector-icons"
import { router } from "expo-router"

interface Channel {
    id: string
    teamId: string
    name: string
    desc: string
    createdAt: number
    updatedAt: number
    createdBy: string
    isPrivate: boolean
    members: string[]
}

interface ChannelListProps {
    channels: Channel[]
    teamId: string
    isCurrentUserOwner: boolean
    currentUserId: string | null
    onDeleteChannel: (channelId: string) => void
    onCreateChannel: () => void
    unreadChannels: string[]
    theme: any
}

const ChannelList: React.FC<ChannelListProps> = ({
    channels,
    teamId,
    isCurrentUserOwner,
    currentUserId,
    onDeleteChannel,
    onCreateChannel,
    unreadChannels,
    theme,
}) => {
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
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Channels</Text>

            {channels.length === 0 ? (
                <View style={styles.emptyState}>
                    <Feather name="message-square" size={24} color={theme.secondaryTextColor} />
                    <Text style={[styles.emptyStateText, { color: theme.secondaryTextColor }]}>No channels yet</Text>
                </View>
            ) : (
                channels.map((channel) => {
                    const hasUnread = unreadChannels.includes(channel.id)

                    return (
                        <View key={channel.id} style={styles.channelContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.channelItem,
                                    hasUnread && [styles.channelItemWithUnread, { backgroundColor: `${theme.primaryColor}15` }],
                                ]}
                                onPress={() => router.push(`/(users)/(tabs)/(teams)/(channels)/${channel.id}?teamId=${teamId}`)}
                            >
                                <View style={[styles.channelIconContainer, { backgroundColor: theme.buttonBackgroundColor }]}>
                                    <Feather
                                        name={channel.isPrivate ? "lock" : "message-square"}
                                        size={16}
                                        color={hasUnread ? theme.primaryColor : theme.secondaryTextColor}
                                    />
                                    {hasUnread && <View style={[styles.channelUnreadDot, { backgroundColor: theme.primaryColor }]} />}
                                </View>

                                <View style={styles.channelTextContainer}>
                                    <Text
                                        style={[
                                            styles.channelNameText,
                                            { color: theme.textColor },
                                            hasUnread && [styles.channelNameUnread, { color: theme.primaryColor }],
                                        ]}
                                    >
                                        {channel.name}
                                    </Text>
                                    <Text style={[styles.channelDescText, { color: theme.secondaryTextColor }]}>{channel.desc}</Text>
                                </View>
                            </TouchableOpacity>

                            {(isCurrentUserOwner || channel.createdBy === currentUserId) && (
                                <TouchableOpacity style={styles.channelDeleteButton} onPress={() => onDeleteChannel(channel.id)}>
                                    <Feather name="trash" size={16} color="#DC2626" />
                                </TouchableOpacity>
                            )}
                        </View>
                    )
                })
            )}

            {isCurrentUserOwner && (
                <TouchableOpacity
                    style={[styles.createChannelButton, { backgroundColor: theme.buttonBackgroundColor }]}
                    onPress={onCreateChannel}
                >
                    <Feather name="plus" size={18} color={theme.primaryColor} />
                    <Text style={[styles.createChannelText, { color: theme.primaryColor }]}>Create Channel</Text>
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
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
    },
    emptyStateText: {
        marginTop: 8,
    },
    channelContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    channelItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderRadius: 8,
    },
    channelItemWithUnread: {
        borderRadius: 8,
    },
    channelIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
        position: "relative",
    },
    channelUnreadDot: {
        position: "absolute",
        top: -2,
        right: -2,
        width: 10,
        height: 10,
        borderRadius: 5,
        borderWidth: 1.5,
        borderColor: "white",
    },
    channelTextContainer: {
        flex: 1,
    },
    channelNameText: {
        fontSize: 16,
        fontWeight: "500",
    },
    channelNameUnread: {
        fontWeight: "700",
    },
    channelDescText: {
        fontSize: 14,
    },
    channelDeleteButton: {
        padding: 8,
        marginLeft: 4,
    },
    createChannelButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 16,
        padding: 12,
        borderRadius: 8,
    },
    createChannelText: {
        fontWeight: "500",
        marginLeft: 8,
    },
})

export default ChannelList
