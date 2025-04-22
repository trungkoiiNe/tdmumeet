import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useTeamStore } from '@/stores/teamStore';
import { getAuth } from '@react-native-firebase/auth';
import { FlashList } from '@shopify/flash-list';

// Meeting item props
type MeetingProps = {
    teamId: string;
    channelId: string;
};

// Format date helper function
const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
    });
};

// Format time helper function
const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

export default function MeetingsList({ teamId, channelId }: MeetingProps) {
    const { fetchMeetings, meetings } = useTeamStore();
    const [loading, setLoading] = useState(true);
    const auth = getAuth();
    const currentUser = auth?.currentUser;
    const pathname = usePathname();

    // Get the parent path (channel path)
    const parentPath = pathname.split('/').slice(0, -1).join('/');

    useEffect(() => {
        if (teamId && channelId) {
            loadMeetings();
        }
    }, [teamId, channelId]);

    const loadMeetings = async () => {
        setLoading(true);
        await fetchMeetings(teamId, channelId);
        setLoading(false);
    };

    // Navigate to create meeting screen using parent path
    const handleCreateMeeting = () => {
        router.push(`${parentPath}/meetings/create?teamId=${teamId}&channelId=${channelId}`,

        );
    };

    // Navigate to meeting details screen using parent path
    const handleOpenMeeting = (meetingId: string) => {
        router.push(`${parentPath}/meetings/${meetingId}?teamId=${teamId}&channelId=${channelId}`);
    };

    // Determine meeting status
    const getMeetingStatus = (startTime: number, endTime: number) => {
        const now = Date.now();
        if (now < startTime) return 'upcoming';
        if (now > endTime) return 'past';
        return 'active';
    };

    // Render meeting item
    const renderMeetingItem = ({ item }) => {
        const status = getMeetingStatus(item.startTime, item.endTime);
        const isActive = status === 'active';
        const isPast = status === 'past';

        return (
            <TouchableOpacity
                style={[
                    styles.meetingItem,
                    isActive && styles.activeMeeting,
                    isPast && styles.pastMeeting,
                ]}
                onPress={() => handleOpenMeeting(item.id)}
            >
                <View style={styles.meetingTimeContainer}>
                    <Text style={styles.meetingDate}>{formatDate(item.startTime)}</Text>
                    <Text style={styles.meetingTime}>
                        {formatTime(item.startTime)} - {formatTime(item.endTime)}
                    </Text>
                </View>
                <View style={styles.meetingDetailsContainer}>
                    <Text style={styles.meetingTitle}>{item.title}</Text>
                    {item.desc && (
                        <Text style={styles.meetingDescription} numberOfLines={1}>
                            {item.desc}
                        </Text>
                    )}
                </View>
                {isActive && (
                    <View style={styles.joinBadge}>
                        <Text style={styles.joinText}>Join</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    // Sort meetings by status and time
    const sortedMeetings = [...meetings].sort((a, b) => {
        const aStatus = getMeetingStatus(a.startTime, a.endTime);
        const bStatus = getMeetingStatus(b.startTime, b.endTime);

        // Active meetings first
        if (aStatus === 'active' && bStatus !== 'active') return -1;
        if (aStatus !== 'active' && bStatus === 'active') return 1;

        // Then upcoming meetings
        if (aStatus === 'upcoming' && bStatus === 'past') return -1;
        if (aStatus === 'past' && bStatus === 'upcoming') return 1;

        // Sort by start time within the same status
        return a.startTime - b.startTime;
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>Meetings</Text>
                <TouchableOpacity
                    style={styles.createButton}
                    onPress={handleCreateMeeting}
                >
                    <Ionicons name="add" size={20} color="white" />
                    <Text style={styles.createButtonText}>New Meeting</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <Text>Loading meetings...</Text>
                </View>
            ) : sortedMeetings.length > 0 ? (
                <View style={styles.listContainer}>
                    <FlashList
                        data={sortedMeetings}
                        renderItem={renderMeetingItem}
                        estimatedItemSize={80}
                        keyExtractor={(item) => item.id}
                        showsVerticalScrollIndicator={true}
                        contentContainerStyle={styles.listContentContainer}
                    />
                </View>
            ) : (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No meetings scheduled</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: '#f9fafb',
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    createButtonText: {
        color: 'white',
        marginLeft: 4,
        fontWeight: '500',
    },
    loadingContainer: {
        padding: 16,
        alignItems: 'center',
    },
    emptyContainer: {
        padding: 16,
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 8,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    emptyText: {
        color: '#6b7280',
    },
    meetingItem: {
        flexDirection: 'row',
        backgroundColor: 'white',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    activeMeeting: {
        borderLeftWidth: 4,
        borderLeftColor: '#10B981', // green for active
    },
    pastMeeting: {
        opacity: 0.7,
    },
    meetingTimeContainer: {
        width: 80,
        justifyContent: 'center',
        paddingRight: 8,
        borderRightWidth: 1,
        borderRightColor: '#e5e7eb',
    },
    meetingDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    meetingTime: {
        fontSize: 12,
        color: '#374151',
        fontWeight: '500',
    },
    meetingDetailsContainer: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'center',
    },
    meetingTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 2,
    },
    meetingDescription: {
        fontSize: 13,
        color: '#6b7280',
    },
    joinBadge: {
        backgroundColor: '#DCFCE7', // Light green
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        alignSelf: 'center',
        marginLeft: 8,
    },
    joinText: {
        color: '#10B981', // Green
        fontWeight: '600',
        fontSize: 12,
    },
    listContainer: {
        flex: 1,
        height: 400, // Set a fixed height that works for your UI
        width: '100%',
    },
    listContentContainer: {
        paddingBottom: 16,
    },
});
