import { toast } from "@baronha/ting";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { FlashList } from "@shopify/flash-list";
import * as FileSystem from "expo-file-system";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { nanoid } from "nanoid";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { useTeamStore } from "@/stores/teamStore";
import { useThemeStore } from "@/stores/themeStore";
import { darkTheme, lightTheme } from "@/utils/themes";
import pickupImage from "@/utils/avatar"; // added import for image picking

// Define interfaces for our data models
interface Message {
  id: string;
  channelId: string;
  text: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  file: string;
  memberRead: string[];
  memberUnread: string[];
}

interface Channel {
  id: string;
  name: string;
  desc?: string;
  isPrivate: boolean;
  createdBy: string;
  members?: string[];
  createdAt?: number;
  updatedAt?: number;
}

interface MenuAction {
  title: string;
  systemIcon: string;
  onPress: () => void;
}

// Extracted Component: Message Skeleton Loader
const MessageSkeleton = () => {
  const { width } = useWindowDimensions();
  const bubbleWidth = width * 0.6;

  return (
    <View style={styles.skeletonContainer}>
      {/* Left-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={70}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect x="10" y="10" rx="16" ry="16" width={bubbleWidth} height="50" />
      </ContentLoader>

      {/* Right-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={60}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect
          x={width - bubbleWidth - 10}
          y="10"
          rx="16"
          ry="16"
          width={bubbleWidth}
          height="40"
        />
      </ContentLoader>

      {/* Left-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={80}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect
          x="10"
          y="10"
          rx="16"
          ry="16"
          width={bubbleWidth - 40}
          height="60"
        />
      </ContentLoader>

      {/* Right-aligned message skeleton */}
      <ContentLoader
        speed={1}
        width={width}
        height={55}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={styles.skeletonLoader}
      >
        <Rect
          x={width - bubbleWidth + 30}
          y="10"
          rx="16"
          ry="16"
          width={bubbleWidth - 50}
          height="35"
        />
      </ContentLoader>
    </View>
  );
};

// Extracted Component: Message Item
const MessageItem = ({
  message,
  currentUserId,
  onDelete,
}: {
  message: Message;
  currentUserId: string;
  onDelete: (message: Message) => void;
}) => {
  const isOwnMessage = message.userId === currentUserId;
  const [modalVisible, setModalVisible] = useState(false);

  // New function to download the image to device storage
  const downloadImage = async () => {
    const base64Data = message.file.split(",")[1];
    const fileUri = FileSystem.documentDirectory + message.id + ".jpg";
    const fileInfo = await FileSystem.getInfoAsync(fileUri);
    if (fileInfo.exists) {
      toast({ message: "Already image" });
    } else {
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });
      toast({ message: "Image downloaded" });
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage,
      ]}
      onLongPress={() => {
        if (isOwnMessage) onDelete(message);
      }}
    >
      <View style={styles.messageContent}>
        {message.file && message.file.startsWith("data:image/jpeg;base64,") ? (
          <>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              accessibilityLabel="View image attachment"
              accessibilityRole="button"
            >
              <Image
                source={{ uri: message.file }}
                style={styles.thumbnailImage} // Use dedicated style
              />
            </TouchableOpacity>
            <Modal
              visible={modalVisible}
              transparent
              onRequestClose={() => setModalVisible(false)}
              animationType="fade"
              accessible={true} // Make modal accessible
              accessibilityLabel="Image viewer modal" // Label for the modal itself
            >
              <View style={styles.modalContainer}>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setModalVisible(false)}
                  accessibilityLabel="Close image viewer" // Accessibility for close button
                  accessibilityRole="button"
                >
                  <Ionicons name="close" size={30} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalDownloadButton}
                  onPress={downloadImage}
                  accessibilityLabel="Download image" // Accessibility for download button
                  accessibilityRole="button"
                >
                  <Ionicons name="download" size={30} color="#fff" />
                </TouchableOpacity>
                <ScrollView
                  contentContainerStyle={styles.modalScrollViewContent} // Use dedicated style
                  minimumZoomScale={1}
                  maximumZoomScale={3}
                >
                  <Image
                    source={{ uri: message.file }}
                    style={styles.modalImage} // Use dedicated style
                    accessibilityLabel="Full size image attachment" // Accessibility for image
                    accessibilityHint="Zooms on pinch, closes with button top left"
                  />
                </ScrollView>
              </View>
            </Modal>
          </>
        ) : (
          <Text
            style={[styles.messageText, !isOwnMessage && { color: "#333" }]}
          >
            {message.text}
          </Text>
        )}
        <Text
          style={[
            styles.messageTime,
            {
              color: isOwnMessage ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)",
            },
          ]}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Extracted Component: Channel Header
const ChannelHeader = ({
  channel,
  onBack,
  onInfoPress,
  menuActions,
}: {
  channel: Channel;
  onBack: () => void;
  onInfoPress: () => void;
  menuActions: MenuAction[];
}) => {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{channel.name}</Text>

      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onInfoPress} style={styles.headerButton}>
          <Ionicons name="information-circle-outline" size={24} color="black" />
        </TouchableOpacity>

        <ContextMenu
          actions={menuActions}
          onPress={(e) => {
            const selectedAction = menuActions.find(
              (action) => action.title === e.nativeEvent.name
            );
            if (selectedAction) {
              selectedAction.onPress();
            }
          }}
          previewBackgroundColor="#f2f2f2"
        >
          <View style={styles.headerButton}>
            <MaterialCommunityIcons
              name="dots-vertical"
              size={24}
              color="black"
            />
          </View>
        </ContextMenu>
      </View>
    </View>
  );
};

export default function ChannelDetailsScreen() {
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

  const flatListRef = useRef<FlashList<Message> | null>(null);
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
      Alert.alert("Error", "Failed to load channel details");
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

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Send a new message with error handling
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    try {
      const newMessage: Message = {
        id: nanoid(),
        channelId,
        text: messageText.trim(),
        userId: currentUser.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        file: "", // No file for now
        memberRead: [],
        memberUnread: [],
      };
      setMessageText("");
      await addMessage(teamId, newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
      Alert.alert("Error", "Failed to send message");
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
              } catch (err) {
                console.error("Error deleting message:", err);
                Alert.alert("Error", "Failed to delete message");
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
              Alert.alert("Error", "Failed to delete channel");
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
        } else {
          await joinChannel(teamId, channelId, currentUser.uid);
        }
        await fetchChannel();
      }
    } catch (err) {
      console.error("Error joining/leaving channel:", err);
      Alert.alert("Error", "Failed to update channel membership");
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

  // Render messages with extracted component
  const renderMessageItem = useCallback(
    ({ item }: { item: Message }) => (
      <MessageItem
        message={item}
        currentUserId={currentUser?.uid || ""}
        onDelete={handleDeleteMessage}
      />
    ),
    [currentUser, handleDeleteMessage]
  );

  // Render messages or loading indicator
  const renderMessages = useCallback(() => {
    if (loadingChannel || loading) {
      return <MessageSkeleton />;
    }
    return (
      <FlashList
        ref={flatListRef}
        data={messages}
        estimatedItemSize={99}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: false })
        }
      />
    );
  }, [loadingChannel, loading, messages, renderMessageItem]);

  // New attachment handler updated to send images
  const handleAttachmentPress = async () => {
    const base64 = await pickupImage();
    if (!base64) return;
    if (!currentUser) return;

    try {
      const newMessage: Message = {
        id: nanoid(),
        channelId,
        text: "", // No text for image messages
        userId: currentUser.uid,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        file: "data:image/jpeg;base64,".concat(base64), // send image base64 string
        memberRead: [],
        memberUnread: [],
      };
      await addMessage(teamId, newMessage);
    } catch (err) {
      console.error("Error sending image message:", err);
      Alert.alert("Error", "Failed to send image message");
    }
  };

  // If error occurred during fetching
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => fetchChannel()} style={styles.button}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!channel) {
    return (
      <View style={styles.container}>{/* Loading or not found state */}</View>
    );
  }

  // Check if user can access this channel
  const canAccessChannel =
    !channel.isPrivate ||
    (channel.isPrivate && channel.members?.includes(currentUser?.uid));
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      {/* Header with gradient background for a modern look */}
      <LinearGradient
        colors={["#4c669f", "#3b5998"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          {channel.name}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={handleChannelInfoPress}
            style={styles.headerButton}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color="#fff"
            />
          </TouchableOpacity>
          <ContextMenu
            actions={getMenuActions()}
            onPress={(e) => {
              const selectedAction = getMenuActions().find(
                (action) => action.title === e.nativeEvent.name
              );
              if (selectedAction) {
                selectedAction.onPress();
              }
            }}
            previewBackgroundColor="#f2f2f2"
          >
            <View style={styles.headerButton}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color="#fff"
              />
            </View>
          </ContextMenu>
        </View>
      </LinearGradient>

      {/* Chat area */}
      {!canAccessChannel ? (
        <View style={styles.noAccessContainer}>
          <Text style={styles.noAccessText}>
            This is a private channel. Join to view messages.
          </Text>
          <TouchableOpacity onPress={handleJoinLeave} style={styles.button}>
            <Text style={styles.buttonText}>Join Channel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={[styles.mainContainer, styles.messagesContainer]}>
            {renderMessages()}
          </View>

          {/* Modern Message input with attachment icon */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={handleAttachmentPress}
              style={styles.iconButton}
            >
              <Ionicons name="attach" size={24} color="#2563EB" />
            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  // Updated header style with shadow and padding adjustments
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    // Remove borderBottom in favor of gradient shadow effects
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    marginLeft: 16,
    padding: 4,
  },
  infoButton: {
    marginLeft: 8,
  },
  noAccessContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  noAccessText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  messagesContainer: {
    flex: 1,
    padding: 8,
  },
  messagesLoading: {
    marginTop: 20,
  },
  messagesList: {
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 4,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#2563EB",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#e5e7eb",
  },
  messageContent: {
    flexDirection: "column",
  },
  messageText: {
    fontSize: 16,
    color: "#fff",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
  // Updated input container with padding and shadow
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  // Updated text input style for modern look
  textInput: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#93c5fd",
  },
  // New icon button style for attachment icon
  iconButton: {
    padding: 8,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    margin: 8,
    justifyContent: "center",
  },
  deleteText: {
    color: "#dc2626",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    alignItems: "center",
  },
  skeletonContainer: {
    flex: 1,
    padding: 8,
  },
  skeletonLoader: {
    marginVertical: 5,
  },
  mainContainer: {
    flex: 1,
  },
  errorText: {
    fontSize: 16,
    color: "#DC2626",
    textAlign: "center",
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalCloseButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 2,
  },
  modalDownloadButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 2,
  },
  // New styles for enhanced image preview and modal
  thumbnailImage: {
    width: 150, // Increased width for higher-res preview
    height: 150, // Increased height
    borderRadius: 8,
    resizeMode: "cover", // Preserve aspect ratio while covering the area
    marginVertical: 4, // Add some vertical margin
  },
  modalScrollViewContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "95%", // Use most of the screen width
    height: "95%", // Use most of the screen height
    resizeMode: "contain", // Ensure the whole image is visible
  },
});
