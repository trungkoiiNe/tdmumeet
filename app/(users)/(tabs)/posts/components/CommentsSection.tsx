import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text, Avatar, IconButton, Divider } from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { FontAwesome } from '@expo/vector-icons';
import { usePostStore } from '@/stores/postStore';
import { useThemeStore } from '@/stores/themeStore';
import { lightTheme, darkTheme } from '@/utils/themes';
import type { Comment } from '@/stores/postStore';

// Extending the Comment type from postStore to include replies for local state management
type CommentWithReplies = Comment & {
  replies?: CommentWithReplies[];
};

interface CommentsSectionProps {
  teamId: string;
  postId: string;
  userId: string;
  userName: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ teamId, postId, userId, userName }) => {
  // console.log(teamId, postId, userId, userName);
  const isDarkMode = useThemeStore(state => state.isDarkMode);
  const theme = isDarkMode ? darkTheme : lightTheme;
  const { fetchComments, addComment, likeComment, unlikeComment, deleteComment } = usePostStore();

  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: string, name: string } | null>(null);
  const [showReplies, setShowReplies] = useState<Record<string, boolean>>({});

  // Fetch comments when component mounts
  useEffect(() => {
    loadComments();
  }, [teamId, postId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      // Only fetch top-level comments (parentId is empty)
      const result = await fetchComments(teamId, postId, "");
      setComments(result);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      const newComment: Omit<Comment, 'commentId' | 'createdAt' | 'likes' | 'likedBy' | 'isDeleted' | 'childrenCount'> = {
        authorId: userId,
        authorName: userName,
        content: newCommentText.trim(),
        parentId: replyingTo ? replyingTo.id : "",
        replyToName: replyingTo ? replyingTo.name : "",
      };

      await addComment(teamId, postId, newComment);
      setNewCommentText('');
      setReplyingTo(null);
      // Refresh comments
      loadComments();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    try {
      if (isLiked) {
        await unlikeComment(teamId, postId, commentId, userId);
      } else {
        await likeComment(teamId, postId, commentId, userId);
      }
      // Refresh comments
      loadComments();
    } catch (error) {
      console.error('Error liking/unliking comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(teamId, postId, commentId);
      // Refresh comments
      loadComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReplyToComment = (commentId: string, authorName: string) => {
    setReplyingTo({ id: commentId, name: authorName });
    // Focus the text input
  };

  const handleLoadReplies = async (commentId: string) => {
    try {
      const replies = await fetchComments(teamId, postId, commentId);
      // Add replies to the state
      setComments(prevComments => {
        return prevComments.map(comment => {
          if (comment.commentId === commentId) {
            return { ...comment, replies };
          }
          return comment;
        });
      });
      // Show replies for this comment
      setShowReplies(prev => ({ ...prev, [commentId]: true }));
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };

  const renderComment = ({ item }: { item: CommentWithReplies }) => {
    if (item.isDeleted) {
      return (
        <View style={[styles.commentContainer, { backgroundColor: theme.cardBackgroundColor }]}>
          <Text style={{ color: theme.secondaryTextColor, fontStyle: 'italic' }}>This comment has been deleted</Text>
        </View>
      );
    }

    const isLiked = item.likedBy?.includes(userId);
    const isOwnComment = item.authorId === userId;

    return (
      <View style={[styles.commentContainer, { backgroundColor: theme.cardBackgroundColor }]}>
        <View style={styles.commentHeader}>
          <Avatar.Text
            size={32}
            label={item.authorName.charAt(0).toUpperCase()}
            style={{ backgroundColor: theme.primaryColor, marginRight: 8 }}
          />
          <View style={styles.commentContent}>
            <View style={styles.commentAuthorRow}>
              <Text style={[styles.commentAuthor, { color: theme.textColor }]}>{item.authorName}</Text>
              {item.replyToName && (
                <Text style={{ color: theme.secondaryTextColor }}>
                  <Text> replying to </Text>
                  <Text style={{ fontWeight: 'bold' }}>{item.replyToName}</Text>
                </Text>
              )}
            </View>
            <Text style={[styles.commentText, { color: theme.textColor }]}>{item.content}</Text>

            <View style={styles.commentActions}>
              <TouchableOpacity
                style={styles.commentAction}
                onPress={() => handleLikeComment(item.commentId, isLiked)}
              >
                <FontAwesome
                  name={isLiked ? "thumbs-up" : "thumbs-o-up"}
                  size={14}
                  color={isLiked ? theme.primaryColor : theme.secondaryTextColor}
                />
                <Text style={[styles.actionText, {
                  color: isLiked ? theme.primaryColor : theme.secondaryTextColor
                }]}>
                  {item.likes > 0 ? item.likes : ''} Like
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.commentAction}
                onPress={() => handleReplyToComment(item.commentId, item.authorName)}
              >
                <FontAwesome name="reply" size={14} color={theme.secondaryTextColor} />
                <Text style={[styles.actionText, { color: theme.secondaryTextColor }]}>Reply</Text>
              </TouchableOpacity>

              {isOwnComment && (
                <TouchableOpacity
                  style={styles.commentAction}
                  onPress={() => handleDeleteComment(item.commentId)}
                >
                  <FontAwesome name="trash-o" size={14} color={theme.secondaryTextColor} />
                  <Text style={[styles.actionText, { color: theme.secondaryTextColor }]}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>

            {item.childrenCount > 0 && !showReplies[item.commentId] && (
              <TouchableOpacity
                style={styles.viewRepliesButton}
                onPress={() => handleLoadReplies(item.commentId)}
              >
                <Text style={{ color: theme.primaryColor }}>
                  View {item.childrenCount} {item.childrenCount === 1 ? 'reply' : 'replies'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Render replies if they exist and are visible */}
        {showReplies[item.commentId] && item.replies && (
          <View style={styles.repliesContainer}>
            {item.replies.map(reply => (
              <View key={reply.commentId} style={styles.replyItem}>
                <View style={styles.replyLine} />
                {renderComment({ item: reply })}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Divider style={{ backgroundColor: theme.borderColor }} />

      <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
        Comments
      </Text>

      {/* Comment input */}
      <View style={[styles.inputContainer, { backgroundColor: theme.backgroundColor }]}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={{ color: theme.secondaryTextColor }}>
              Replying to <Text style={{ fontWeight: 'bold' }}>{replyingTo.name}</Text>
            </Text>
            <IconButton
              icon="close"
              size={16}
              iconColor={theme.secondaryTextColor}
              onPress={() => setReplyingTo(null)}
            />
          </View>
        )}
        <View style={styles.inputRow}>
          <Avatar.Text
            size={32}
            label={userName.charAt(0).toUpperCase()}
            style={{ backgroundColor: theme.primaryColor, marginRight: 8 }}
          />
          <TextInput
            style={[
              styles.input,
              {
                color: theme.textColor,
                backgroundColor: theme.backgroundColor,
                borderColor: theme.borderColor
              }
            ]}
            placeholder="Write a comment..."
            placeholderTextColor={theme.secondaryTextColor}
            value={newCommentText}
            onChangeText={setNewCommentText}
            multiline
          />
          <IconButton
            icon="send"
            size={20}
            iconColor={newCommentText.trim() ? theme.primaryColor : theme.secondaryTextColor}
            disabled={!newCommentText.trim()}
            onPress={handleAddComment}
          />
        </View>
      </View>

      {/* Comments list */}
      {loading ? (
        <ActivityIndicator size="large" color={theme.primaryColor} style={styles.loader} />
      ) : comments.length === 0 ? (
        <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
          No comments yet. Be the first to comment!
        </Text>
      ) : (
        <FlashList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.commentId}
          contentContainerStyle={styles.commentsList}
          estimatedItemSize={150}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  inputContainer: {
    borderRadius: 8,
    marginBottom: 16,
    padding: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingBottom: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
  },
  commentsList: {
    paddingBottom: 16,
  },
  commentContainer: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentContent: {
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  commentText: {
    marginTop: 4,
    marginBottom: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  viewRepliesButton: {
    marginTop: 8,
  },
  repliesContainer: {
    marginLeft: 24,
    marginTop: 8,
  },
  replyItem: {
    position: 'relative',
  },
  replyLine: {
    position: 'absolute',
    left: -12,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#e0e0e0',
  },
});

export default CommentsSection;
