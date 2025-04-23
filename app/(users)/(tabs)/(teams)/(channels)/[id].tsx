import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  View,
  StatusBar,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { getAuth } from "@react-native-firebase/auth";
import { nanoid } from "nanoid";
import {
  Provider as PaperProvider,
  Portal,
  Snackbar,
  IconButton,
  MD3LightTheme,
  MD3DarkTheme,
} from "react-native-paper";
import pickupImage from "@/utils/avatar";
import { useTeamStore } from "@/stores/teamStore";
import { useThemeStore } from "@/stores/themeStore";
import { lightTheme, darkTheme } from "@/utils/themes";
import { StyleSheet } from "react-native";
import type { Channel, Message, MenuAction } from "./types";
import ChannelHeader from "./components/ChannelHeader";
import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import MessageSkeleton from "./components/MessageSkeleton";
import NoAccessView from "./components/NoAccessView";
import ErrorView from "./components/ErrorView";
import React from "react";

export default function ChannelDetailsScreen() {
  // Dynamic theming setup
  const isDark = useThemeStore((state) => state.isDarkMode);
  const appTheme = isDark ? darkTheme : lightTheme;
  const paperTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const styles = getStyles(appTheme);

  // Get channel id and teamId from URL parameters
  const params = useLocalSearchParams();
  const channelId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);
  const teamId = Array.isArray(params.teamId)
    ? params.teamId[0]
    : (params.teamId as string);

  const {
    getChannelById,
    deleteChannel,
    joinChannel,
    leaveChannel,
    listenToMessages,
    addMessage,
    deleteMessage,
    messages,
    loading,
  } = useTeamStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [loadingChannel, setLoadingChannel] = useState<boolean>(true);
  const [messageText, setMessageText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<{
    id: string;
    text: string;
  } | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(
    null
  );
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const auth = getAuth();
  const currentUser = auth?.currentUser;

  // Fetch channel details with error handling
  const fetchChannel = useCallback(async () => {
    try {
      setLoadingChannel(true);
      setError(null);
      const fetched = await getChannelById(teamId, channelId);
      setChannel(fetched);
    } catch (err) {
      console.error("Error fetching channel:", err);
      setError("Failed to load channel details");
      showSnackbar("Failed to load channel details");
    } finally {
      setLoadingChannel(false);
    }
  }, [teamId, channelId, getChannelById]);

  useEffect(() => {
    if (channelId && teamId) {
      fetchChannel();

      // Set up real-time listeners for messages with teamId
      const unsubscribe = listenToMessages(teamId, channelId);

      // Clean up listener when component unmounts
      return () => {
        unsubscribe();
      };
    }
  }, [channelId, teamId, fetchChannel, listenToMessages]);

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  // Send a new message with error handling
  const handleSendMessage = async () => {
    if ((!messageText.trim() && !attachmentPreview) || !currentUser) return;

    try {
      const newMessage: Message = {
        id: nanoid(),
        channelId,
        text: messageText.trim(),
        userId: currentUser.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        file: attachmentPreview || "", // Use attachment if available
        memberRead: [],
        memberUnread: [],
      };

      setMessageText("");
      setAttachmentPreview(null);
      setReplyingTo(null);

      await addMessage(teamId, newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      showSnackbar("Failed to send message");
    }
  };

  // Delete message with error handling
  const handleDeleteMessage = useCallback(
    (message: Message) => {
      if (!currentUser || message.userId !== currentUser.uid) return;

      Alert.alert(
        "Delete Message",
        "Are you sure you want to delete this message?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await deleteMessage(teamId, message);
                showSnackbar("Message deleted");
              } catch (err) {
                console.error("Error deleting message:", err);
                showSnackbar("Failed to delete message");
              }
            },
          },
        ]
      );
    },
    [teamId, deleteMessage, currentUser]
  );

  // Delete channel with error handling
  const handleDelete = useCallback(() => {
    if (!channel) return;

    Alert.alert(
      "Delete Channel",
      "Are you sure you want to delete this channel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChannel(teamId, channelId);
              router.back();
            } catch (err) {
              console.error("Error deleting channel:", err);
              showSnackbar("Failed to delete channel");
            }
          },
        },
      ]
    );
  }, [teamId, channelId, channel, deleteChannel]);

  // Toggle join/leave for private channels with error handling
  const handleJoinLeave = useCallback(async () => {
    if (!channel || !currentUser) return;

    try {
      if (channel.isPrivate) {
        if (channel.members && channel.members.includes(currentUser.uid)) {
          await leaveChannel(teamId, channelId, currentUser.uid);
          showSnackbar("Left channel");
        } else {
          await joinChannel(teamId, channelId, currentUser.uid);
          showSnackbar("Joined channel");
        }
        await fetchChannel();
      }
    } catch (err) {
      console.error("Error joining/leaving channel:", err);
      showSnackbar("Failed to update channel membership");
    }
  }, [
    channel,
    currentUser,
    teamId,
    channelId,
    joinChannel,
    leaveChannel,
    fetchChannel,
  ]);

  // Show channel options menu - memoized to prevent recreating on each render
  const getMenuActions = useCallback((): MenuAction[] => {
    const actions: MenuAction[] = [
      {
        title: "Channel Info",
        systemIcon: "info",
        onPress: () =>
          Alert.alert(channel?.name || "", channel?.desc || "No description"),
      },
    ];

    // Add delete option if user is the channel creator
    if (channel?.createdBy === currentUser?.uid) {
      actions.push({
        title: "Delete Channel",
        systemIcon: "trash",
        onPress: handleDelete,
      });
    }

    return actions;
  }, [channel, currentUser, handleDelete]);

  // Channel header info handler
  const handleChannelInfoPress = useCallback(() => {
    if (channel) {
      Alert.alert(channel.name, channel.desc || "No description");
    }
  }, [channel]);

  // Handle reply to message
  const handleReplyMessage = useCallback((message: Message) => {
    setReplyingTo({
      id: message.id,
      text: message.text || "Image attachment",
    });
  }, []);

  // Handle reaction to message
  const handleReactionMessage = useCallback(
    (message: Message, reaction: string) => {
      // In a real app, you would update the message with the reaction
      showSnackbar(`Reacted with ${reaction}`);
    },
    []
  );

  // Load more messages
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMore || !hasMoreMessages) return;

    try {
      setIsLoadingMore(true);
      // In a real app, you would fetch older messages here
      // For this example, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // If no more messages, update state
      setHasMoreMessages(false);
    } catch (error) {
      console.error("Error loading more messages:", error);
      showSnackbar("Failed to load more messages");
    } finally {
      setIsLoadingMore(false);
    }
  }, [isLoadingMore, hasMoreMessages]);

  // Render messages or loading indicator
  const renderMessages = useCallback(() => {
    if (loadingChannel || loading) {
      return <MessageSkeleton />;
    }
    return (
      <MessageList
        messages={messages}
        currentUserId={currentUser?.uid || ""}
        onDeleteMessage={handleDeleteMessage}
        onReplyMessage={handleReplyMessage}
        onReactionMessage={handleReactionMessage}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
        hasMoreMessages={hasMoreMessages}
        typingUsers={typingUsers}
      />
    );
  }, [
    loadingChannel,
    loading,
    messages,
    currentUser,
    handleDeleteMessage,
    handleReplyMessage,
    handleReactionMessage,
    isLoadingMore,
    handleLoadMore,
    hasMoreMessages,
    typingUsers,
  ]);

  // New attachment handler updated to send images
  const handleAttachmentPress = async () => {
    try {
      const base64 = await pickupImage();
      if (!base64) return;

      setAttachmentPreview("data:image/jpeg;base64,".concat(base64));
    } catch (error) {
      console.error("Error selecting image:", error);
      showSnackbar("Failed to select image");
    }
  };

  // If error occurred during fetching
  if (error) {
    return <ErrorView errorMessage={error} onRetry={fetchChannel} />;
  }

  if (!channel) {
    return <View style={styles.container} />;
  }

  // Check if user can access this channel
  const canAccessChannel =
    !channel.isPrivate ||
    (channel.isPrivate && channel.members?.includes(currentUser?.uid));

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        barStyle={appTheme.statusBarStyle as "dark-content" | "light-content"}
        backgroundColor={appTheme.backgroundColor}
      />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <ChannelHeader
          channel={channel}
          onBack={() => router.back()}
          onInfoPress={handleChannelInfoPress}
          menuActions={getMenuActions()}
        />

        {/* Chat area */}
        {!canAccessChannel ? (
          <NoAccessView onJoin={handleJoinLeave} />
        ) : (
          <>
            <View style={styles.messagesContainer}>
              {renderMessages()}
            </View>

            <MessageInput
              messageText={messageText}
              onChangeText={setMessageText}
              onSend={handleSendMessage}
              onAttachment={handleAttachmentPress}
              replyingTo={replyingTo}
              onCancelReply={() => setReplyingTo(null)}
              attachmentPreview={attachmentPreview}
              onRemoveAttachment={() => setAttachmentPreview(null)}
            />
          </>
        )}

        <Portal>
          <Snackbar
            visible={snackbarVisible}
            onDismiss={() => setSnackbarVisible(false)}
            duration={3000}
            action={{
              label: "Dismiss",
              onPress: () => setSnackbarVisible(false),
            }}
          >
            {snackbarMessage}
          </Snackbar>
        </Portal>
      </KeyboardAvoidingView>
    </PaperProvider>
);
}

// Theme-based dynamic styles
function getStyles(theme: typeof lightTheme | typeof darkTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    messagesContainer: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
      paddingHorizontal: 8,
      paddingTop: 4,
    },
    // Add more styles here as needed, using theme properties
  });
}