import React, { useEffect, useState } from "react";
import { View, StyleSheet, Image, TouchableOpacity, ScrollView, Platform } from "react-native";
import { FlashList } from "@shopify/flash-list";
import pickupImage from "@/utils/avatar";
import { usePostStore, Post } from "@/stores/postStore";
import { useTeamStore } from "@/stores/teamStore";
import { useAuthStore } from "@/stores/authStore";

// Import React Native Paper components
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Avatar,
  IconButton,
  HelperText,
  Divider,
  FAB,
  Portal,
  Modal,
  ActivityIndicator,
  Menu,
  Appbar,
  SegmentedButtons,
  Surface
} from 'react-native-paper';

// Import React Native Reanimated for animations
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

const TAG_OPTIONS = ["math", "science", "discussion", "news", "event"];
import type { Visibility } from "@/stores/postStore";

const VISIBILITY_OPTIONS: Visibility[] = ["public", "team", "private"];

export default function PostsScreen() {
  const {
    posts,
    fetchPosts,
    addPost,
    updatePost,
    deletePost,
    likePost,
    unlikePost,
    getPostById,
    loading,
  } = usePostStore();
  const { teams, fetchTeams, getAvatarUrl } = useTeamStore();
  const { getUser } = useAuthStore();

  // State
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [teamAvatars, setTeamAvatars] = useState({});
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [visibility, setVisibility] = useState<Visibility>("team");
  const [imageBase64, setImageBase64] = useState("");
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Animation values
  const fabScale = useSharedValue(1);
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }]
    };
  });

  // Get current user
  const user = getUser();
  const userId = user?.uid;

  // Only show teams the user has access to
  const accessibleTeams = teams.filter(team => team.members.includes(userId));

  useEffect(() => {
    fetchTeams();
  }, []);

  // Fetch team avatars when teams change
  useEffect(() => {
    const fetchAvatars = async () => {
      const avatars = {};
      for (const team of teams) {
        try {
          const avatarUrl = await getAvatarUrl(team.id);
          avatars[team.id] = avatarUrl;
        } catch {
          avatars[team.id] = "";
        }
      }
      setTeamAvatars(avatars);
    };
    if (teams.length > 0) fetchAvatars();
  }, [teams]);

  useEffect(() => {
    if (selectedTeamId) fetchPosts(selectedTeamId);
  }, [selectedTeamId]);

  const handlePickImage = async () => {
    const base64 = await pickupImage();
    if (base64) setImageBase64(base64);
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAdd = async () => {
    if (!title || !content || !selectedTeamId) return;

    await addPost(selectedTeamId, {
      title,
      content,
      authorId: userId || "test-user",
      authorName: user?.displayName || "Test User",
      imageBase64,
      tags: selectedTags,
      isPinned: false,
      visibility,
      attachmentUrls: [],
      likes: 0,
      likedBy: [],
      commentsCount: 0
    });

    resetForm();
    setCreateModalVisible(false);
    fetchPosts(selectedTeamId);
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setImageBase64("");
    setSelectedTags([]);
    setVisibility("team");
  };

  const handleDelete = async (postId) => {
    if (!selectedTeamId) return;
    await deletePost(selectedTeamId, postId);
    fetchPosts(selectedTeamId);
    if (selectedPost?.id === postId) {
      setSelectedPost(null);
      setDetailModalVisible(false);
    }
  };

  const handleLike = async (postId) => {
    if (!selectedTeamId) return;
    await likePost(selectedTeamId, postId, userId || "test-user");
    fetchPosts(selectedTeamId);

    // Update selected post if it's the one being liked
    if (selectedPost?.id === postId) {
      const updatedPost = await getPostById(selectedTeamId, postId);
      setSelectedPost(updatedPost);
    }
  };

  const handleUnlike = async (postId) => {
    if (!selectedTeamId) return;
    await unlikePost(selectedTeamId, postId, userId || "test-user");
    fetchPosts(selectedTeamId);

    // Update selected post if it's the one being unliked
    if (selectedPost?.id === postId) {
      const updatedPost = await getPostById(selectedTeamId, postId);
      setSelectedPost(updatedPost);
    }
  };

  const handleSelect = async (postId) => {
    if (!selectedTeamId) return;
    const post = await getPostById(selectedTeamId, postId);
    setSelectedPost(post);
    setDetailModalVisible(true);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (selectedTeamId) {
      await fetchPosts(selectedTeamId);
    }
    setRefreshing(false);
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Render empty state
  const renderEmptyState = () => (
    <Animated.View
      entering={FadeIn.duration(500)}
      style={styles.emptyState}
    >
      <IconButton icon="post" size={50} iconColor="#9ca3af" />
      <Text style={styles.emptyStateText}>No posts found</Text>
      <Text style={styles.emptyStateSubtext}>
        {searchQuery ? "Try a different search term" : "Create your first post by tapping the + button"}
      </Text>
      <Image source={require('@/assets/no-data.jpg')} style={{ width: 180, height: 120, alignSelf: 'center', marginVertical: 16, opacity: 0.7 }} />
      {searchQuery ? (
        <Button
          mode="outlined"
          onPress={() => setSearchQuery("")}
          style={styles.emptyStateButton}
        >
          Clear search
        </Button>
      ) : (
        <Button
          mode="contained"
          onPress={() => setCreateModalVisible(true)}
          style={styles.emptyStateButton}
        >
          Create post
        </Button>
      )}
    </Animated.View>
  );

  // Render post item
  const renderPostItem = ({ item }) => (
    <Animated.View
      entering={SlideInRight.duration(300).delay(100)}
      exiting={SlideOutLeft.duration(300)}
    >
      <Card style={styles.postCard} onPress={() => handleSelect(item.id)}>
        <Card.Content>
          {item.isPinned && (
            <Chip icon="pin" style={styles.pinnedChip} textStyle={{ color: '#fff' }}>
              Pinned
            </Chip>
          )}

          <View style={styles.postHeader}>
            <Avatar.Text
              size={40}
              label={item.authorName.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: '#3b82f6' }}
            />
            <View style={styles.postHeaderText}>
              <Text variant="titleMedium">{item.title}</Text>
              <Text variant="bodySmall" style={styles.authorText}>
                {item.authorName} • {getVisibilityIcon(item.visibility)} {item.visibility}
              </Text>
              <Text variant="labelSmall" style={styles.timestampText}>
                {item.createdAt ? new Date(item.createdAt).toLocaleString() : ''}
              </Text>
            </View>
          </View>

          <Text variant="bodyMedium" style={styles.postContent} numberOfLines={3}>
            {item.content}
          </Text>

          {item.imageBase64 && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }}
              style={styles.postImage}
            />
          )}

          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.map(tag => (
                <Chip
                  key={tag}
                  style={styles.tagChip}
                  textStyle={styles.tagChipText}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          )}
        </Card.Content>

        <Card.Actions style={styles.postActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              item.likedBy?.includes(userId || "test-user")
                ? handleUnlike(item.id)
                : handleLike(item.id);
            }}
          >
            <IconButton
              icon={item.likedBy?.includes(userId || "test-user") ? "heart" : "heart-outline"}
              size={20}
              iconColor={item.likedBy?.includes(userId || "test-user") ? "#ef4444" : "#6b7280"}
            />
            <Text style={styles.actionText}>{item.likes || 0}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <IconButton icon="comment-outline" size={20} iconColor="#6b7280" />
            <Text style={styles.actionText}>{item.commentsCount || 0}</Text>
          </TouchableOpacity>

          <IconButton
            icon="dots-vertical"
            size={20}
            onPress={(e) => {
              e.stopPropagation();
              setSelectedPost(item);
              setMenuVisible(true);
            }}
          />
        </Card.Actions>
      </Card>
    </Animated.View>
  );

  // Helper function to get visibility icon
  const getVisibilityIcon = (visibility) => {
    switch (visibility) {
      case 'public': return '🌐';
      case 'team': return '👥';
      case 'private': return '🔒';
      default: return '👥';
    }
  };

  // If user is not logged in
  if (!userId) {
    return (
      <Surface style={styles.authContainer}>
        <IconButton icon="account-lock" size={50} iconColor="#9ca3af" />
        <Text variant="headlineSmall">Authentication Required</Text>
        <Text variant="bodyMedium" style={styles.authText}>
          You need to log in to view and manage posts.
        </Text>
        <Button mode="contained" style={styles.authButton}>
          Log In
        </Button>
      </Surface>
    );
  }

  // If user has no teams
  if (accessibleTeams.length === 0) {
    return (
      <Surface style={styles.authContainer}>
        <IconButton icon="account-group" size={50} iconColor="#9ca3af" />
        <Text variant="headlineSmall">No Teams Available</Text>
        <Text variant="bodyMedium" style={styles.authText}>
          You haven't joined any teams yet.
        </Text>
        <Button mode="contained" style={styles.authButton}>
          Create or Join Team
        </Button>
      </Surface>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="Posts" subtitle={selectedTeamId ? teams.find(t => t.id === selectedTeamId)?.name : "Select a team"} />
        <Appbar.Action icon="magnify" onPress={() => { }} />
        <Appbar.Action icon="dots-vertical" onPress={() => { }} />
      </Appbar.Header>

      {/* Team Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.teamSelector}>
        {accessibleTeams.map((team) => (
          <Chip
            key={team.id}
            selected={selectedTeamId === team.id}
            onPress={() => setSelectedTeamId(team.id)}
            style={[
              styles.teamChip,
              selectedTeamId === team.id && styles.selectedTeamChip,
              { paddingVertical: 4, paddingHorizontal: 10, minHeight: 36, elevation: 1, borderRadius: 18 }
            ]}
            avatar={
              teamAvatars[team.id] ? (
                <Avatar.Image size={24} source={{ uri: teamAvatars[team.id] }} />
              ) : (
                <Avatar.Text size={24} label={team.name.substring(0, 2).toUpperCase()} />
              )
            }
          >
            {team.name}
          </Chip>
        ))}
      </ScrollView>

      {/* Search Bar */}
      {selectedTeamId && (
        <Animated.View entering={FadeIn.duration(300)} style={styles.searchContainer}>
          <TextInput
            mode="outlined"
            placeholder="Search posts..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" />}
            right={searchQuery ? <TextInput.Icon icon="close" onPress={() => setSearchQuery("")} /> : null}
            style={styles.searchInput}
          />
        </Animated.View>
      )}

      {/* Posts List */}
      {selectedTeamId ? (
        <View style={styles.postsContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <SkeletonLoader />
              <Text style={styles.loadingText}>Loading posts...</Text>
            </View>
          ) : (
            <FlashList
              data={filteredPosts}
              renderItem={renderPostItem}
              estimatedItemSize={250}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={renderEmptyState}
              onRefresh={onRefresh}
              refreshing={refreshing}
            />
          )}
        </View>
      ) : (
        <View style={styles.selectTeamContainer}>
          <IconButton icon="arrow-up" size={40} iconColor="#9ca3af" />
          <Text variant="headlineSmall">Select a Team</Text>
          <Text variant="bodyMedium" style={styles.selectTeamText}>
            Choose a team from above to view and manage posts
          </Text>
        </View>
      )}

      {/* FAB for creating new post */}
      {selectedTeamId && (
        <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => {
              fabScale.value = withSpring(1.1, {}, () => {
                fabScale.value = withSpring(1);
              });
              setCreateModalVisible(true);
            }}
            label="New Post"
            color="#ffffff"
          />
        </Animated.View>
      )}

      {/* Create Post Modal */}
      <Portal>
        <Modal
          visible={createModalVisible}
          onDismiss={() => setCreateModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView>
            <Text variant="headlineMedium" style={styles.modalTitle}>Create New Post</Text>

            <TextInput
              label="Title"
              mode="outlined"
              value={title}
              onChangeText={setTitle}
              style={styles.modalInput}
              placeholder="Add a catchy title"
              maxLength={100}
              right={<TextInput.Affix text={`${title.length}/100`} />}
            />
            {!title && <HelperText type="error" visible={true}>Required</HelperText>}

            <TextInput
              label="Content"
              mode="outlined"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              style={styles.modalInput}
              placeholder="Write something interesting..."
              maxLength={2000}
              right={<TextInput.Affix text={`${content.length}/2000`} />}
            />
            {!content && <HelperText type="error" visible={true}>Required. Max 2000 characters.</HelperText>}

            <Text variant="titleMedium" style={styles.sectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {TAG_OPTIONS.map((tag) => (
                <Chip
                  key={tag}
                  selected={selectedTags.includes(tag)}
                  onPress={() => handleTagToggle(tag)}
                  style={styles.modalChip}
                  selectedColor="#3b82f6"
                >
                  {tag}
                </Chip>
              ))}
            </View>

            <Text variant="titleMedium" style={styles.sectionTitle}>Visibility</Text>
            <SegmentedButtons
              value={visibility}
              onValueChange={v => setVisibility(v as Visibility)}
              buttons={VISIBILITY_OPTIONS.map(v => ({
                value: v,
                label: v.charAt(0).toUpperCase() + v.slice(1),
                icon: v === 'public' ? 'earth' : v === 'team' ? 'account-group' : 'lock'
              }))}
              style={styles.segmentedButtons}
            />

            <Text variant="titleMedium" style={styles.sectionTitle}>Image</Text>
            <Button
              mode="outlined"
              icon="image"
              onPress={handlePickImage}
              style={styles.imageButton}
            >
              {imageBase64 ? "Change Image" : "Add Image"}
            </Button>

            {imageBase64 && (
              <View style={styles.previewImageContainer}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
                  style={styles.previewImage}
                />
                <IconButton
                  icon="close-circle"
                  size={24}
                  style={styles.removeImageButton}
                  onPress={() => setImageBase64("")}
                />
              </View>
            )}

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  resetForm();
                  setCreateModalVisible(false);
                }}
                style={styles.cancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAdd}
                disabled={!title || !content}
                style={styles.submitButton}
              >
                Create Post
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* Post Detail Modal */}
      <Portal>
        <Modal
          visible={detailModalVisible}
          onDismiss={() => setDetailModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          {selectedPost && (
            <ScrollView>
              <View style={styles.detailHeader}>
                <Avatar.Text
                  size={50}
                  label={selectedPost.authorName.substring(0, 2).toUpperCase()}
                  style={{ backgroundColor: '#3b82f6' }}
                />
                <View style={styles.detailHeaderText}>
                  <Text variant="headlineSmall">{selectedPost.title}</Text>
                  <Text variant="bodyMedium">
                    By {selectedPost.authorName} • {getVisibilityIcon(selectedPost.visibility)} {selectedPost.visibility}
                  </Text>
                </View>
              </View>

              {selectedPost.imageBase64 && (
                <Image
                  source={{ uri: `data:image/jpeg;base64,${selectedPost.imageBase64}` }}
                  style={styles.detailImage}
                />
              )}

              <Text variant="bodyLarge" style={styles.detailContent}>
                {selectedPost.content}
              </Text>

              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <View style={styles.detailTagsContainer}>
                  <Text variant="titleMedium" style={styles.sectionTitle}>Tags</Text>
                  <View style={styles.tagsContainer}>
                    {selectedPost.tags.map(tag => (
                      <Chip key={tag} style={styles.tagChip}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              )}

              <Divider style={styles.divider} />

              <View style={styles.detailActions}>
                <Button
                  mode="outlined"
                  icon={selectedPost.likedBy?.includes(userId || "test-user") ? "heart" : "heart-outline"}
                  onPress={() => selectedPost.likedBy?.includes(userId || "test-user")
                    ? handleUnlike(selectedPost.id)
                    : handleLike(selectedPost.id)}
                  style={styles.detailActionButton}
                  textColor={selectedPost.likedBy?.includes(userId || "test-user") ? "#ef4444" : undefined}
                >
                  {selectedPost.likedBy?.includes(userId || "test-user") ? "Liked" : "Like"} ({selectedPost.likes || 0})
                </Button>

                <Button
                  mode="outlined"
                  icon="comment-outline"
                  style={styles.detailActionButton}
                >
                  Comments ({selectedPost.commentsCount || 0})
                </Button>

                <Button
                  mode="outlined"
                  icon="delete-outline"
                  onPress={() => {
                    handleDelete(selectedPost.id);
                  }}
                  style={styles.detailActionButton}
                  textColor="#ef4444"
                >
                  Delete
                </Button>
              </View>
            </ScrollView>
          )}
        </Modal>
      </Portal>

      {/* Post Menu */}
      <Portal>
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={{ x: 0, y: 0 }}
          style={styles.menu}
        >
          <Menu.Item
            leadingIcon="pencil"
            onPress={() => {
              setMenuVisible(false);
              // Edit functionality would go here
            }}
            title="Edit Post"
          />
          <Menu.Item
            leadingIcon="pin"
            onPress={() => {
              setMenuVisible(false);
              // Pin functionality would go here
            }}
            title={selectedPost?.isPinned ? "Unpin Post" : "Pin Post"}
          />
          <Divider />
          <Menu.Item
            leadingIcon="delete"
            onPress={() => {
              handleDelete(selectedPost?.id);
              setMenuVisible(false);
            }}
            title="Delete Post"
            titleStyle={{ color: "#ef4444" }}
          />
        </Menu>
      </Portal>
    </View>
  );
}

// --- Skeleton Loader for posts ---
const SkeletonLoader = () => (
  <View style={{ padding: 16 }}>
    {[...Array(3)].map((_, idx) => (
      <View key={idx} style={{ backgroundColor: '#e5e7eb', borderRadius: 12, marginBottom: 16, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#d1d5db', marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <View style={{ height: 14, backgroundColor: '#d1d5db', borderRadius: 4, marginBottom: 6, width: '60%' }} />
            <View style={{ height: 10, backgroundColor: '#d1d5db', borderRadius: 4, width: '40%' }} />
          </View>
        </View>
        <View style={{ height: 14, backgroundColor: '#d1d5db', borderRadius: 4, marginBottom: 8, width: '80%' }} />
        <View style={{ height: 14, backgroundColor: '#d1d5db', borderRadius: 4, width: '70%' }} />
      </View>
    ))}
  </View>
);

const styles = StyleSheet.create({
  timestampText: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 2,
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5"
  },
  teamSelector: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 30,
    backgroundColor: "#ffffff"
  },
  teamChip: {
    marginRight: 8,
    height: 50,
    backgroundColor: "#f3f4f6"
  },
  selectedTeamChip: {
    backgroundColor: "#dbeafe"
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb"
  },
  searchInput: {
    backgroundColor: "#ffffff"
  },
  postsContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16
  },
  postCard: {
    marginBottom: 16,
    elevation: 2
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  postHeaderText: {
    marginLeft: 12,
    flex: 1
  },
  authorText: {
    color: "#6b7280",
    marginTop: 2,
    fontWeight: '600'
  },
  postContent: {
    marginBottom: 12
  },
  postImage: {
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
  postActions: {
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
    color: "#3b82f6",
    fontWeight: "bold"
  },
  fabContainer: {
    position: "absolute",
    right: 16,
    bottom: 16
  },
  fab: {
    backgroundColor: "#3b82f6"
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: "90%"
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: "center"
  },
  modalInput: {
    marginBottom: 16
  },
  sectionTitle: {
    marginBottom: 8,
    marginTop: 8
  },
  modalChip: {
    marginRight: 8,
    marginBottom: 8
  },
  segmentedButtons: {
    marginBottom: 16
  },
  imageButton: {
    marginBottom: 16
  },
  previewImageContainer: {
    position: "relative",
    marginBottom: 16
  },
  previewImage: {
    width: "100%",
    height: 200,
    borderRadius: 8
  },
  removeImageButton: {
    position: "absolute",
    top: -12,
    right: -12,
    backgroundColor: "white"
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    marginBottom: 16
  },
  cancelButton: {
    flex: 1,
    marginRight: 8
  },
  submitButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: "#3b82f6"
  },
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  detailHeaderText: {
    marginLeft: 16,
    flex: 1
  },
  detailImage: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 16
  },
  detailContent: {
    marginBottom: 16
  },
  detailTagsContainer: {
    marginBottom: 16
  },
  divider: {
    marginVertical: 16
  },
  detailActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between"
  },
  detailActionButton: {
    marginBottom: 8,
    flex: 1,
    marginHorizontal: 4
  },
  pinnedChip: {
    alignSelf: "flex-start",
    marginBottom: 8,
    backgroundColor: "#3b82f6"
  },
  menu: {
    marginTop: 40
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280"
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16
  },
  emptyStateSubtext: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    color: "#6b7280"
  },
  emptyStateButton: {
    marginTop: 8
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  authText: {
    textAlign: "center",
    marginTop: 8,
    marginBottom: 24,
    color: "#6b7280"
  },
  authButton: {
    marginTop: 8,
    backgroundColor: "#3b82f6"
  },
  selectTeamContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24
  },
  selectTeamText: {
    textAlign: "center",
    marginTop: 8,
    color: "#6b7280"
  }
});
