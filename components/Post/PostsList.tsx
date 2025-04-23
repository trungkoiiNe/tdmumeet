import React from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import PostItem from './PostItem';
import SkeletonLoader from './SkeletonLoader';

interface PostsListProps {
  posts: any[];
  loading: boolean;
  refreshing: boolean;
  userId: string;
  teamId: string; // Add teamId parameter
  onRefresh: () => void;
  onSelectPost: (postId: string) => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onOpenMenu: (post: any, position: { x: number, y: number }) => void;
  renderEmptyState: () => React.ReactNode;
}

const PostsList = ({
  posts,
  loading,
  refreshing,
  userId,
  teamId, // Add teamId parameter
  onRefresh,
  onSelectPost,
  onToggleLike,
  onOpenMenu,
  renderEmptyState
}: PostsListProps) => {

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <SkeletonLoader />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlashList
        data={posts}
        renderItem={({ item }) => (
          <PostItem
            post={item}
            userId={userId}
            teamId={teamId} // Pass teamId to PostItem
            onPress={() => onSelectPost(item.id)}
            onLike={() => {
              const isLiked = item.likedBy?.includes(userId);
              onToggleLike(item.id, isLiked);
            }}
            onOpenMenu={(position) => onOpenMenu(item, position)}
          />
        )}
        estimatedItemSize={250}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyState}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  loadingContainer: {
    flex: 1,
  }
});

export default React.memo(PostsList);
