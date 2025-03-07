import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import { nanoid } from "nanoid";
import React, { useEffect, useRef, useState } from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  ScrollView
} from "react-native";
import ContextMenu from "react-native-context-menu-view";
import { useTeamStore } from "../../../../../stores/teamStore";
import MeetingsList from "../../../../../components/MeetingsList";
import meetingServices from "../../../../../services/meetingServices";

// Message skeleton loader component
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
        <Rect x={width - bubbleWidth - 10} y="10" rx="16" ry="16" width={bubbleWidth} height="40" />
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
        <Rect x="10" y="10" rx="16" ry="16" width={bubbleWidth - 40} height="60" />
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
        <Rect x={width - bubbleWidth + 30} y="10" rx="16" ry="16" width={bubbleWidth - 50} height="35" />
      </ContentLoader>
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
    loading
  } = useTeamStore();

  const [channel, setChannel] = useState(null);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [messageText, setMessageText] = useState("");
  const flatListRef = useRef(null);
  const auth = getAuth();
  const currentUser = auth?.currentUser;
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
  }, [channelId, teamId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const fetchChannel = async () => {
    setLoadingChannel(true);
    const fetched = await getChannelById(teamId, channelId);
    setChannel(fetched);
    setLoadingChannel(false);
  };

  // Send a new message
  const handleSendMessage = async () => {
    if (!messageText.trim() || !currentUser) return;

    const newMessage = {
      id: nanoid(),
      channelId,
      text: messageText.trim(),
      userId: currentUser.uid,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      file: "", // No file for now
    };

    await addMessage(teamId, newMessage);
    setMessageText("");
  };

  // Delete message (only user's own messages)
  const handleDeleteMessage = (message) => {
    if (message.userId !== currentUser?.uid) return;

    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteMessage(teamId, message),
        },
      ]
    );
  };

  // Delete channel
  const handleDelete = () => {
    Alert.alert(
      "Delete Channel",
      "Are you sure you want to delete this channel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteChannel(teamId, channelId);
            router.back();
          },
        },
      ]
    );
  };

  // Toggle join/leave for private channels
  const handleJoinLeave = async () => {
    if (!channel || !currentUser) return;
    if (channel.isPrivate) {
      if (channel.members && channel.members.includes(currentUser.uid)) {
        await leaveChannel(teamId, channelId, currentUser.uid);
      } else {
        await joinChannel(teamId, channelId, currentUser.uid);
      }
      fetchChannel();
    }
  };

  // Show channel options menu
  const getMenuActions = () => {
    const actions = [
      {
        title: "Channel Info",
        systemIcon: "info",
        onPress: () => Alert.alert(
          channel.name,
          channel.desc || 'No description'
        ),
      }
    ];

    // Add delete option if user is the channel creator
    if (channel?.createdBy === currentUser?.uid) {
      actions.push({
        title: "Delete Channel",
        systemIcon: "trash",
        attributes: { destructive: true },
        onPress: handleDelete,
      });
    }

    return actions;
  };

  // Render a single message
  const renderMessageItem = ({ item }) => {
    const isOwnMessage = item.userId === currentUser?.uid;

    return (
      <TouchableOpacity
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
        onLongPress={() => {
          if (isOwnMessage) handleDeleteMessage(item);
        }}
      >
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{item.text}</Text>
          <Text style={styles.messageTime}>
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render messages or loading indicator
  const renderMessages = () => {
    if (loadingChannel || loading) {
      return <MessageSkeleton />;
    }

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessageItem}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
    );
  };

  // if (loadingChannel) {
  //   return MessageSkeleton();
  // }

  if (!channel) {
    return (
      <View style={styles.container}>
        {/* <Text>Channel not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text>Go Back</Text>
        </TouchableOpacity> */}
      </View>
    );
  }

  // Check if user can access this channel
  const canAccessChannel = !channel.isPrivate ||
    (channel.isPrivate && channel.members?.includes(currentUser?.uid));
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{channel.name}</Text>

        {/* Channel info and options buttons with context menu */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => Alert.alert(
              channel.name,
              channel.desc || 'No description'
            )}
            style={styles.headerButton}
          >
            <Ionicons name="information-circle-outline" size={24} color="black" />
          </TouchableOpacity>

          {/* Context Menu replacing the simple button */}
          <ContextMenu
            actions={getMenuActions()}
            onPress={(e) => {
              if (e.nativeEvent.name === 'Delete Channel') {
                handleDelete();
              } else if (e.nativeEvent.name === 'Channel Info') {
                Alert.alert(
                  channel.name,
                  channel.desc || 'No description'
                );
              }
            }

            }
            previewBackgroundColor="#f2f2f2"
          >
            <View style={styles.headerButton}>
              <MaterialCommunityIcons name="dots-vertical" size={24} color="black" />
            </View>
          </ContextMenu>
        </View>
      </View>

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
          {/* Meetings section */}
          <ScrollView style={styles.mainContainer}>
            {/* Meetings list component */}
            <MeetingsList teamId={teamId} channelId={channelId} />

            {/* Messages */}
            <View style={styles.messagesContainer}>
              {renderMessages()}
            </View>
          </ScrollView>

          {/* Message input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={messageText}
              onChangeText={setMessageText}
              multiline
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                !messageText.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim()}
            >
              <Ionicons name="send" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Remove the delete button from here */}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#fff",
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
  inputContainer: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: "#fff",
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: "#93c5fd",
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
});
