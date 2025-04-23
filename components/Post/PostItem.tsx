import React, { useCallback, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Modal, Dimensions, Platform, Alert } from 'react-native';
import { Card, Text, Avatar, IconButton, Menu } from 'react-native-paper';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';
import { getVisibilityIcon } from './constants';
import { FontAwesome } from '@expo/vector-icons';
import CommentsSection from './CommentsSection';

interface PostItemProps {
    post: any;
    userId: string;
    teamId: string; // Add teamId parameter
    onPress: () => void;
    onLike: () => void;
    onOpenMenu: (position: { x: number, y: number }) => void;
}

const PostItem = ({ post, userId, teamId, onPress, onLike, onOpenMenu }: PostItemProps) => {
    const isDarkMode = useThemeStore(state => state.isDarkMode);
    const theme = isDarkMode ? darkTheme : lightTheme;
    const isLiked = post.likedBy?.includes(userId);

    // State for modal and comments
    const [imageModalVisible, setImageModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleMenuPress = useCallback((e) => {
        e.stopPropagation();
        // Get the position of the menu button for the popup menu
        const position = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
        onOpenMenu(position);
    }, [onOpenMenu]);

    const handleLikePress = useCallback((e) => {
        e.stopPropagation();
        onLike();
    }, [onLike]);

    // Download handler
    const handleDownloadImage = async () => {
        try {
            setMenuVisible(false);
            if (!post.imageBase64) return;
            // Save base64 to file
            const fileUri = FileSystem.cacheDirectory + `post_image_${Date.now()}.jpg`;
            await FileSystem.writeAsStringAsync(fileUri, post.imageBase64, { encoding: FileSystem.EncodingType.Base64 });
            // Ask for permission
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission required', 'Please grant media library permission to save images.');
                return;
            }
            // Save to gallery
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('Success', 'Image saved to gallery!');
        } catch (e) {
            Alert.alert('Error', 'Failed to save image.');
        }
    };

    return (
        <>
            <Animated.View
                entering={SlideInRight.duration(300).delay(100)}
                exiting={SlideOutLeft.duration(300)}
            >
                <Card style={[styles.card, { backgroundColor: theme.cardBackgroundColor, borderRadius: 12, marginBottom: 16, overflow: 'hidden', elevation: 0, borderWidth: 1, borderColor: theme.borderColor }]} onPress={onPress}>
                    {/* HEADER */}
                    <View style={styles.fbHeader}>
                        <Avatar.Text
                            size={44}
                            label={post.authorName?.charAt(0)?.toUpperCase() || '?'}
                            style={{ backgroundColor: theme.primaryColor, marginRight: 10 }}
                        />
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.fbName, { color: theme.textColor }]}>{post.authorName}</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                <Text style={[styles.fbTimestamp, { color: theme.secondaryTextColor }]}>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</Text>
                                <Text style={{ marginHorizontal: 4, color: theme.secondaryTextColor }}>·</Text>
                                <Text>{getVisibilityIcon(post.visibility)}</Text>
                            </View>
                        </View>
                        <TouchableOpacity onPress={handleMenuPress} style={{ padding: 6 }}>
                            <IconButton icon="dots-horizontal" size={20} iconColor={theme.secondaryTextColor} />
                        </TouchableOpacity>
                    </View>
                    {/* CONTENT */}
                    <View style={{ paddingHorizontal: 12, paddingTop: 2 }}>
                        <Text style={[styles.fbContent, { color: theme.textColor }]}>{post.title}</Text>
                        {post.imageBase64 && (
                            <TouchableOpacity activeOpacity={0.9} onPress={() => setImageModalVisible(true)}>
                                <Image source={{ uri: `data:image/jpeg;base64,${post.imageBase64}` }} style={styles.fbImage} resizeMode="cover" />
                            </TouchableOpacity>
                        )}
                    </View>
                    {/* REACTIONS BAR */}
                    {post.reactions && post.reactions.length > 0 && (
                        <View style={styles.fbReactionsBar}>
                            {/* Example: render emojis and count */}
                            <Text style={{ fontSize: 16, marginRight: 4 }}>😆👍❤️</Text>
                            <Text style={{ color: theme.secondaryTextColor, fontSize: 14 }}>{post.reactions.length}</Text>
                        </View>
                    )}
                    {/* ACTIONS ROW */}
                    <View style={styles.fbActionsRow}>
                        <TouchableOpacity style={styles.fbActionBtn} onPress={handleLikePress}>
                            <FontAwesome name="thumbs-up" size={18} color={isLiked ? theme.primaryColor : theme.secondaryTextColor} />
                            <Text style={[styles.fbActionText, { color: isLiked ? theme.primaryColor : theme.secondaryTextColor }]}>Like</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.fbActionBtn}
                            onPress={(e) => {
                                e.stopPropagation();
                                setShowComments(!showComments);
                            }}
                        >
                            <FontAwesome name="comment-o" size={18} color={theme.secondaryTextColor} />
                            <Text style={[styles.fbActionText, { color: theme.secondaryTextColor }]}>Comment</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.fbActionBtn}>
                            <FontAwesome name="share" size={18} color={theme.secondaryTextColor} />
                            <Text style={[styles.fbActionText, { color: theme.secondaryTextColor }]}>Share</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Comments Section */}
                    {showComments && (
                        <CommentsSection
                            teamId={teamId} // Use the teamId passed from props instead of post.teamId
                            postId={post.id}
                            userId={userId}
                            userName={post.authorName || "Anonymous"}
                        />
                    )}
                </Card>
            </Animated.View>

            {/* Fullscreen Image Modal */}
            <Modal
                visible={imageModalVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setImageModalVisible(false)}
            >
                <View style={styles.fullscreenOverlay}>
                    <TouchableOpacity style={styles.fullscreenBackdrop} activeOpacity={1} onPress={() => setImageModalVisible(false)} />
                    <View style={styles.fullscreenContent}>
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${post.imageBase64}` }}
                            style={styles.fullscreenImage}
                            resizeMode="contain"
                        />
                        <View style={styles.fullscreenMenuBtnWrap}>
                            <Menu
                                visible={menuVisible}
                                onDismiss={() => setMenuVisible(false)}
                                anchor={
                                    <IconButton icon="dots-horizontal" size={28} iconColor="#fff" onPress={() => setMenuVisible(true)} />
                                }
                            >
                                <Menu.Item onPress={handleDownloadImage} title="Download" leadingIcon="download" />
                            </Menu>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );

};
const styles = StyleSheet.create({
    fullscreenOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.96)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    fullscreenContent: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    fullscreenImage: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height * 0.7,
        resizeMode: 'contain',
    },
    fullscreenMenuBtnWrap: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 48 : 24,
        right: 24,
        zIndex: 10,
    },
    fbHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingTop: 14,
        paddingBottom: 6,
        backgroundColor: 'transparent',
    },
    fbName: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    fbTimestamp: {
        fontSize: 13,
    },
    fbContent: {
        fontSize: 16,
        marginBottom: 8,
        marginTop: 2,
        lineHeight: 22,
    },
    fbImage: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        marginTop: 8,
        marginBottom: 4,
        backgroundColor: '#eee',
    },
    fbReactionsBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#e4e6eb',
    },
    fbActionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 14,
        paddingVertical: 4,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e4e6eb',
        backgroundColor: 'transparent',
    },
    fbActionBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        paddingVertical: 8,
    },
    fbActionText: {
        marginLeft: 6,
        fontSize: 15,
        fontWeight: 'bold',
    },
    card: {
        marginBottom: 16,
        elevation: 2
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12
    },
    headerText: {
        marginLeft: 12,
        flex: 1
    },
    authorText: {
        color: "#6b7280",
        marginTop: 2,
        fontWeight: '600'
    },
    timestampText: {
        color: "#9ca3af",
        marginTop: 2
    },
    content: {
        marginBottom: 12
    },
    image: {
        width: "100%",
        height: 200,
        borderRadius: 8,
        marginBottom: 12
    },
    tagsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 8,
        gap: 4
    },
    tagChip: {
        marginRight: 8,
        marginBottom: 8,
        backgroundColor: "#e5e7eb"
    },
    tagChipText: {
        fontSize: 12,
        color: '#2563eb',
        fontWeight: 'bold'
    },
    actions: {
        justifyContent: "flex-start",
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb"
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center"
    },
    actionText: {
        marginLeft: 0,
        color: "#6b7280",
        fontWeight: "bold"
    },
    likedText: {
        color: "#ef4444"
    },
    pinnedChip: {
        alignSelf: "flex-start",
        marginBottom: 8,
        backgroundColor: "#3b82f6"
    }
});
export default React.memo(PostItem);