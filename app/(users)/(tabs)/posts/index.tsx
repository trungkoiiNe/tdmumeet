import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet } from "react-native";
import { usePostStore } from "@/stores/postStore";
import { useTeamStore } from "@/stores/teamStore";
import { useAuthStore } from "@/stores/authStore";
import { Portal } from "react-native-paper";
import { useThemeStore } from "@/stores/themeStore";

// Import components
import Header from "./components/Header";
import TeamSelector from "./components/TeamSelector";
import SearchBar from "./components/SearchBar";
import PostsList from "./components/PostsList";
import EmptyState from "./components/EmptyState";
import NoTeamState from "./components/NoTeamState";
import AuthRequiredState from "./components/AuthRequiredState";
import CreatePostFAB from "./components/CreatePostFAB";
import CreatePostModal from "./components/CreatePostModal";
// import PostDetailModal from "../../../../components/PostDetailModal";
import PostOptionsMenu from "./components/PostOptionsMenu";

// Import constants
import { INITIAL_POST_STATE } from "./constants";
import { lightTheme, darkTheme } from '@/utils/themes';


export default function PostsScreen() {
    const isDarkMode = useThemeStore(state => state.isDarkMode); // or whatever your store uses
    const theme = isDarkMode ? darkTheme : lightTheme;
    // Store hooks
    const {
        posts,
        fetchPosts,
        addPost,
        deletePost,
        likePost,
        unlikePost,
        getPostById,
        loading,
    } = usePostStore();
    const { teams, fetchTeams } = useTeamStore();
    const { getUser } = useAuthStore();
    // State
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    // Modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [menuVisible, setMenuVisible] = useState(false);
    const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

    // Post states
    const [selectedPost, setSelectedPost] = useState(null);
    const [postFormData, setPostFormData] = useState(INITIAL_POST_STATE);

    // Get current user
    const user = getUser();
    const userId = user?.uid;

    // Only show teams the user has access to
    const accessibleTeams = teams.filter(team => team.members.includes(userId));

    // Fetch teams on mount
    useEffect(() => {
        fetchTeams();
    }, []);

    // Fetch posts when team changes
    useEffect(() => {
        if (selectedTeamId) fetchPosts(selectedTeamId);
    }, [selectedTeamId]);

    // Filter posts based on search query
    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );

    // Handle refresh
    const handleRefresh = useCallback(async () => {
        setRefreshing(true);
        if (selectedTeamId) {
            await fetchPosts(selectedTeamId);
        }
        setRefreshing(false);
    }, [selectedTeamId, fetchPosts]);

    // Handle post selection
    const handleSelectPost = useCallback(async (postId) => {
        if (!selectedTeamId) return;
        const post = await getPostById(selectedTeamId, postId);
        setSelectedPost(post);
        setDetailModalVisible(true);
    }, [selectedTeamId, getPostById]);

    // Handle post creation
    const handleCreatePost = useCallback(async () => {
        if (!postFormData.title || !postFormData.content || !selectedTeamId) return;

        await addPost(selectedTeamId, {
            ...postFormData,
            visibility: postFormData.visibility as "public" | "team" | "private",
            authorId: userId || "test-user",
            authorName: user?.displayName || "Test User",
            isPinned: false,
            likes: 0,
            likedBy: [],
            commentsCount: 0,
        });

        setPostFormData(INITIAL_POST_STATE);
        setCreateModalVisible(false);
        fetchPosts(selectedTeamId);
    }, [postFormData, selectedTeamId, userId, user, addPost, fetchPosts]);

    // Handle post deletion
    const handleDeletePost = useCallback(async (postId) => {
        if (!selectedTeamId) return;
        await deletePost(selectedTeamId, postId);
        fetchPosts(selectedTeamId);

        if (selectedPost?.id === postId) {
            setSelectedPost(null);
            setDetailModalVisible(false);
        }

        setMenuVisible(false);
    }, [selectedTeamId, selectedPost, deletePost, fetchPosts]);

    // Handle post like/unlike
    const handleToggleLike = useCallback(async (postId, isLiked) => {
        if (!selectedTeamId) return;

        if (isLiked) {
            await unlikePost(selectedTeamId, postId, userId || "test-user");
        } else {
            await likePost(selectedTeamId, postId, userId || "test-user");
        }

        fetchPosts(selectedTeamId);

        // Update selected post if it's the one being liked/unliked
        if (selectedPost?.id === postId) {
            const updatedPost = await getPostById(selectedTeamId, postId);
            setSelectedPost(updatedPost);
        }
    }, [selectedTeamId, selectedPost, userId, likePost, unlikePost, getPostById, fetchPosts]);

    // Handle post menu
    const handleOpenMenu = useCallback((post, position) => {
        setSelectedPost(post);
        setMenuPosition(position);
        setMenuVisible(true);
    }, []);

    // If user is not logged in
    if (!userId) {
        return <AuthRequiredState />;
    }

    // If user has no teams
    if (accessibleTeams.length === 0) {
        return <NoTeamState />;
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
            <Header
                title="Posts"
                subtitle={selectedTeamId ? teams.find(t => t.id === selectedTeamId)?.name : "Select a team"}
            />

            <TeamSelector
                teams={accessibleTeams}
                selectedTeamId={selectedTeamId}
                onSelectTeam={setSelectedTeamId}
            />

            {selectedTeamId && (
                <SearchBar
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onClear={() => setSearchQuery("")}
                />
            )}

            {selectedTeamId ? (
                <PostsList
                    posts={filteredPosts}
                    loading={loading}
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    onSelectPost={handleSelectPost}
                    onToggleLike={handleToggleLike}
                    onOpenMenu={handleOpenMenu}
                    userId={userId}
                    teamId={selectedTeamId} // Pass selectedTeamId to PostsList
                    renderEmptyState={() => (
                        <EmptyState
                            hasSearchQuery={!!searchQuery}
                            onClearSearch={() => setSearchQuery("")}
                            onCreatePost={() => setCreateModalVisible(true)}
                        />
                    )}
                />
            ) : (
                <NoTeamState isSelectPrompt />
            )}

            {selectedTeamId && (
                <CreatePostFAB onPress={() => setCreateModalVisible(true)} />
            )}

            <Portal>
                <CreatePostModal
                    visible={createModalVisible}
                    formData={postFormData}
                    onChange={setPostFormData}
                    onSubmit={handleCreatePost}
                    onDismiss={() => {
                        setPostFormData(INITIAL_POST_STATE);
                        setCreateModalVisible(false);
                    }}
                />
                <PostOptionsMenu
                    visible={menuVisible}
                    post={selectedPost}
                    position={menuPosition}
                    onDismiss={() => setMenuVisible(false)}
                    onDelete={handleDeletePost}
                />
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    }
});
