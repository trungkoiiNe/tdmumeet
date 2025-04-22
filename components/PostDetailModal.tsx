import React from 'react';
import { View, StyleSheet, ScrollView, Image } from 'react-native';
import { Modal, Text, Button, Avatar, Divider, Chip } from 'react-native-paper';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';
import { getVisibilityIcon } from '../app/(users)/(tabs)/posts/constants';

interface PostDetailModalProps {
  visible: boolean;
  post: any;
  userId: string;
  onDismiss: () => void;
  onToggleLike: (postId: string, isLiked: boolean) => void;
  onDelete: (postId: string) => void;
}

const PostDetailModal = ({ visible, post, userId, onDismiss, onToggleLike, onDelete }: PostDetailModalProps) => {
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  if (!post) return null;

  const isLiked = post.likedBy?.includes(userId);

  // Example comments data (replace with real data if available)

  return (
    <Modal visible={visible} onDismiss={onDismiss} contentContainerStyle={styles.modalContainer}>
      <View style={[styles.fbModalContent, { backgroundColor: theme.backgroundColor }]}>
        <ScrollView>
          <View style={styles.fbHeader}>
            <Avatar.Text
              size={50}
              label={post.authorName.substring(0, 2).toUpperCase()}
              style={{ backgroundColor: theme.primaryColor }}
            />
            <View style={styles.headerText}>
              <Text variant="headlineSmall" style={{ color: theme.textColor }}>{post.authorName}</Text>
              <Text variant="bodyMedium" style={{ color: theme.secondaryTextColor }}>
                {getVisibilityIcon(post.visibility)} {post.visibility}
              </Text>
            </View>
          </View>
          <View style={styles.headerText}>
            <Text variant="headlineSmall" style={{ color: theme.textColor }}>{post.title}</Text>
            <Text variant="bodyMedium" style={{ color: theme.secondaryTextColor }}>
              By {post.authorName} • {getVisibilityIcon(post.visibility)} {post.visibility}
            </Text>
            {post.createdAt && (
              <Text variant="bodySmall" style={[styles.timestamp, { color: theme.tertiaryTextColor }]}>
                {new Date(post.createdAt).toLocaleString()}
              </Text>
            )}
          </View>

          {post.imageBase64 && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${post.imageBase64}` }}
              style={styles.image}
            />
          )}

          <Text variant="bodyLarge" style={[styles.content, { color: theme.textColor }]}>
            {post.content}
          </Text>

          {post.tags && post.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text variant="titleMedium" style={[styles.sectionTitle, { color: theme.secondaryTextColor }]}>Tags</Text>
              <View style={styles.tags}>
                {post.tags.map(tag => (
                  <Chip key={tag} style={[styles.tagChip, { backgroundColor: theme.tagBackground }]} textStyle={{ color: theme.tagText }}>
                    {tag}
                  </Chip>
                ))}
              </View>
            </View>
          )}

          <Divider style={styles.divider} />

          <View style={styles.actions}>
            <Button
              mode="outlined"
              icon={isLiked ? "heart" : "heart-outline"}
              onPress={() => onToggleLike(post.id, isLiked)}
              style={styles.actionButton}
              textColor={isLiked ? "#ef4444" : undefined}
            >
              {isLiked ? "Liked" : "Like"} ({post.likes || 0})
            </Button>

            <Button
              mode="outlined"
              icon="comment-outline"
              style={styles.actionButton}
            >
              Comments ({post.commentsCount || 0})
            </Button>

            <Button
              mode="outlined"
              icon="delete-outline"
              onPress={() => onDelete(post.id)}
              style={styles.actionButton}
              textColor="#ef4444"
            >
              Delete
            </Button>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  fbModalContent: {
    borderRadius: 16,
    overflow: 'hidden',
    paddingBottom: 0,
    backgroundColor: '#fff',
    maxHeight: '90%',
    marginHorizontal: 4,
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
  fbCommentsList: {
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    maxHeight: 180,
  },
  fbCommentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  fbCommentName: {
    fontWeight: 'bold',
    fontSize: 15,
  },
  fbCommentContent: {
    fontSize: 15,
    marginTop: 1,
    marginBottom: 2,
  },
  fbCommentTimestamp: {
    fontSize: 12,
    marginTop: 2,
  },
  fbAddCommentBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e4e6eb',
    backgroundColor: 'transparent',
  },

  container: {
    backgroundColor: "white",
    padding: 20,
    margin: 20,
    borderRadius: 12,
    maxHeight: "90%"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16
  },
  headerText: {
    marginLeft: 16,
    flex: 1
  },
  timestamp: {
    color: "#6b7280",
    marginTop: 4
  },
  image: {
    width: "100%",
    height: 250,
    borderRadius: 8,
    marginBottom: 16
  },
  content: {
    marginBottom: 16
  },
  tagsContainer: {
    marginBottom: 16
  },
  sectionTitle: {
    marginBottom: 8
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  tagChip: {
    backgroundColor: "#e5e7eb"
  },
  divider: {
    marginVertical: 16
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8
  },
  actionButton: {
    flex: 1,
    minWidth: '30%'
  }, modalContainer: {
    // your style properties here
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    // etc.
  }
});

export default React.memo(PostDetailModal);
