import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { useThemeStore } from '../stores/themeStore';
import { darkTheme, lightTheme } from '../utils/themes';
import { useTeamStore } from '../stores/teamStore';
import { useAuthStore } from '../stores/authStore';
import { router } from 'expo-router';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

// Types for our updates
export type UpdateType = 'announcement' | 'assignment' | 'notification' | 'message';

export interface Update {
    id: string;
    type: UpdateType;
    title: string;
    content: string;
    timestamp: string; // ISO date string
    source?: string; // e.g., "Math Class", "Biology Teacher"
    teamId?: string; // For message updates
    channelId?: string; // For message updates
    userId?: string; // For message updates
}

// The mock data has been removed

const getIconForType = (type: UpdateType) => {
    switch (type) {
        case 'announcement':
            return '📢'; // Use actual image resources instead of emoji in production
        case 'assignment':
            return '📝';
        case 'notification':
            return '🔔';
        case 'message':
            return '💬';
        default:
            return '📌';
    }
};

const getColorForType = (type: UpdateType, theme: any) => {
    switch (type) {
        case 'announcement':
            return '#FF9500';
        case 'assignment':
            return '#34C759';
        case 'notification':
            return '#007AFF';
        case 'message':
            return '#5856D6'; // Purple for messages
        default:
            return theme.textColor;
    }
};

const formatTime = (timestamp: string | number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMin < 60) {
        return `${diffMin} min ago`;
    } else if (diffHrs < 24) {
        return `${diffHrs} hr ago`;
    } else {
        return `${diffDays} days ago`;
    }
};

// Create a skeleton loader component
const UpdatesLoader = ({ theme }: { theme: any }) => {
    return (
        <View style={[styles.card, { backgroundColor: theme.cardBackgroundColor }]}>
            <ContentLoader
                speed={1.2}
                width={"100%"}
                height={100}
                viewBox="0 0 340 100"
                backgroundColor={theme.isDark ? "#3a3a3a" : "#f3f3f3"}
                foregroundColor={theme.isDark ? "#555555" : "#ecebeb"}
            >
                {/* Icon circle */}
                <Circle cx="20" cy="20" r="20" />
                {/* Title */}
                <Rect x="50" y="10" rx="4" ry="4" width="200" height="18" />
                {/* Source and timestamp */}
                <Rect x="50" y="35" rx="3" ry="3" width="120" height="10" />
                <Rect x="200" y="35" rx="3" ry="3" width="70" height="10" />
                {/* Message content */}
                <Rect x="0" y="60" rx="3" ry="3" width="300" height="14" />
                <Rect x="0" y="80" rx="3" ry="3" width="250" height="14" />
            </ContentLoader>
        </View>
    );
};

const RecentUpdatesFeed = ({ updates: externalUpdates = [] }: { updates?: Update[] }) => {
    const { isDarkMode } = useThemeStore();
    const theme = isDarkMode ? darkTheme : lightTheme;
    const { fetchUnreadMessages } = useTeamStore();
    const { getUser } = useAuthStore();
    const [updates, setUpdates] = useState<Update[]>(externalUpdates);
    const [loading, setLoading] = useState(true);
    const [noUpdates, setNoUpdates] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            setLoading(true);
            const user = getUser();
            if (user) {
                try {
                    // Fetch unread messages
                    const unreadMessages = await fetchUnreadMessages(user.uid);
                    // Transform messages to updates format
                    const messageUpdates: Update[] = unreadMessages.map(message => ({
                        id: message.id,
                        type: 'message',
                        title: 'New Message',
                        content: message.text,
                        timestamp: message.createdAt.toString(),
                        source: `Channel Message`,
                        teamId: message.teamId,
                        channelId: message.channelId,
                        userId: message.userId
                    }));

                    // Combine with external updates
                    const allUpdates = [...messageUpdates, ...externalUpdates];
                    setUpdates(allUpdates);
                    setNoUpdates(allUpdates.length === 0);
                } catch (error) {
                    console.error('Error fetching unread messages:', error);
                    setUpdates(externalUpdates);
                    setNoUpdates(externalUpdates.length === 0);
                }
            } else {
                setUpdates(externalUpdates);
                setNoUpdates(externalUpdates.length === 0);
            }

        };

        fetchMessages();
        setLoading(false);
    }, [externalUpdates]);

    const handleMessagePress = (update: Update) => {
        if (update.type === 'message' && update.teamId && update.channelId) {
            // Navigate to the channel
            router.push(`/(users)/(tabs)/(teams)/(channels)/${update.channelId}?teamId=${update.teamId}`);
        }
    };

    const renderItem = ({ item }: { item: Update }) => {
        const typeColor = getColorForType(item.type, theme);
        const icon = getIconForType(item.type);

        return (
            <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.cardBackgroundColor }]}
                onPress={() => handleMessagePress(item)}
            >
                <View style={styles.cardHeader}>
                    <View style={[styles.iconContainer, { backgroundColor: typeColor + '20' }]}>
                        <Text style={styles.icon}>{icon}</Text>
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={[styles.title, { color: theme.textColor }]}>{item.title}</Text>
                        <View style={styles.metaContainer}>
                            <Text style={[styles.source, { color: theme.secondaryTextColor }]}>
                                {item.source}
                            </Text>
                            <Text style={[styles.timestamp, { color: theme.secondaryTextColor }]}>
                                {formatTime(item.timestamp)}
                            </Text>
                        </View>
                    </View>
                </View>
                <Text style={[styles.content, { color: theme.textColor }]}>
                    {item.content}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderLoader = () => (
        <>
            <UpdatesLoader theme={theme} />
            <UpdatesLoader theme={theme} />
            <UpdatesLoader theme={theme} />
        </>
    );

    const renderEmptyState = () => (
        <View style={styles.emptyStateContainer}>
            <Text style={[styles.emptyStateText, { color: theme.secondaryTextColor }]}>
                No updates available
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={[styles.header, { color: theme.textColor }]}>Recent Updates</Text>

            {loading ? (
                <View style={styles.loaderContainer}>
                    {renderLoader()}
                </View>
            ) : noUpdates ? (
                renderEmptyState()
            ) : (
                <FlatList
                    data={updates}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContainer}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        marginLeft: 8,
    },
    listContainer: {
        paddingBottom: 16,
    },
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        marginHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    icon: {
        fontSize: 20,
    },
    headerTextContainer: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    source: {
        fontSize: 12,
    },
    timestamp: {
        fontSize: 12,
    },
    content: {
        fontSize: 14,
        lineHeight: 20,
    },
    loaderContainer: {
        paddingHorizontal: 8,
    },
    emptyStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyStateText: {
        fontSize: 16,
        textAlign: 'center',
    }
});

export default RecentUpdatesFeed;