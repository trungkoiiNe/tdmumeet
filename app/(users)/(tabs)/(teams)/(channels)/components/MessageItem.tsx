import { useState, useRef, useEffect } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  Image,
  Animated,
  Pressable,
} from "react-native";
import { Avatar, Surface, Menu, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// import * as Haptics from "expo-haptics";
import type { Message } from "../types";
import ImageViewer from "./ImageViewer";
import { formatRelativeTime } from "@/utils/dateUtils";
import React from "react";
import { useThemeStore } from "@/stores/themeStore";
import { lightTheme, darkTheme } from "@/utils/themes";
import { StyleSheet } from "react-native";

interface MessageItemProps {
  message: Message;
  currentUserId: string;
  onDelete: (message: Message) => void;
  previousMessage?: Message | null;
  onReply?: (message: Message) => void;
  onReaction?: (message: Message, reaction: string) => void;
}
const MessageItem = ({
  message,
  currentUserId,
  onDelete,
  previousMessage,
  onReply,
  onReaction,
}: MessageItemProps) => {
  const isDark = useThemeStore((state) => state.isDarkMode);
  const theme = isDark ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  const isOwnMessage = message.userId === currentUserId;
  const [modalVisible, setModalVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const isImage =
    message.file && message.file.startsWith("data:image/jpeg;base64,");
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Show sender name if different from previous message
  const showSenderName = previousMessage?.userId !== message.userId;

  // Format timestamp
  const formattedTime = formatRelativeTime(message.createdAt);

  // Simulate read status
  const isRead = message.memberRead?.includes(currentUserId) || false;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  const handleLongPress = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setMenuVisible(true);
  };

  const getInitials = (userId: string) => {
    // In a real app, you'd get the user's name from a user store
    return userId.substring(0, 2).toUpperCase();
  };

  const getAvatarColor = (userId: string) => {
    // Generate a consistent color based on userId
    const colors = [
      "#f97316", // Orange
      "#8b5cf6", // Violet
      "#06b6d4", // Cyan
      "#22c55e", // Green
      "#ec4899", // Pink
    ];
    const index = userId.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Animated.View
      style={[
        styles.messageRow,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          justifyContent: isOwnMessage ? "flex-end" : "flex-start",
        },
      ]}
    >
      {!isOwnMessage && (
        <View style={styles.avatarContainer}>
          <Avatar.Text
            size={28}
            label={getInitials(message.userId)}
            style={{ backgroundColor: getAvatarColor(message.userId) }}
            color="#fff"
          />
        </View>
      )}

      <Pressable
        onLongPress={handleLongPress}
        delayLongPress={200}
        style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}
      >
        <Surface
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownMessage : styles.otherMessage,
            { elevation: 1 },
          ]}
        >
          {showSenderName && !isOwnMessage && (
            <View style={styles.messageHeader}>
              <Text style={styles.senderName}>
                User {getInitials(message.userId)}
              </Text>
            </View>
          )}

          <View style={styles.messageContent}>
            {isImage ? (
              <>
                <TouchableOpacity
                  onPress={() => setModalVisible(true)}
                  accessibilityLabel="View image attachment"
                  accessibilityRole="button"
                >
                  <Image
                    source={{ uri: message.file }}
                    style={styles.thumbnailImage}
                  />
                </TouchableOpacity>

                <ImageViewer
                  imageUri={message.file}
                  visible={modalVisible}
                  onClose={() => setModalVisible(false)}
                // messageId={message.id}
                />
              </>
            ) : (
              <Text
                style={[
                  styles.messageText,
                  !isOwnMessage && { color: theme.otherMessageText },
                ]}
              >
                {message.text}
              </Text>
            )}

            <View
              style={{
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Text
                style={[
                  styles.messageTime,
                  {
                    color: isOwnMessage
                      ? theme.ownMessageText
                      : theme.secondaryTextColor,
                    marginRight: 4,
                  },
                ]}
              >
                {formattedTime}
              </Text>

              {isOwnMessage && (
                <MaterialCommunityIcons
                  name={isRead ? "check-all" : "check"}
                  size={14}
                  color={isRead ? theme.primaryColor : theme.ownMessageText}
                />
              )}
            </View>
          </View>
        </Surface>
      </Pressable>

      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={{ x: 0, y: 0 }} // This will be ignored as we're using contentStyle
        contentStyle={{
          backgroundColor: theme.cardBackgroundColor,
          borderRadius: 12,
          marginTop: -100, // Adjust based on your needs
          marginLeft: isOwnMessage ? -100 : 50,
        }}
      >
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            onReply?.(message);
          }}
          title="Reply"
          leadingIcon="reply"
        />
        <Menu.Item
          onPress={() => {
            setMenuVisible(false);
            onReaction?.(message, "👍");
          }}
          title="React"
          leadingIcon="emoticon-outline"
        />
        <Divider />
        {isOwnMessage && (
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              onDelete(message);
            }}
            title="Delete"
            leadingIcon="delete-outline"
            titleStyle={{ color: theme.dangerColor }}
          />
        )}
        <Menu.Item
          onPress={() => setMenuVisible(false)}
          title="Cancel"
          leadingIcon="close"
        />
      </Menu>
    </Animated.View>
  );
};
// Theme-based dynamic styles
function getStyles(theme: typeof lightTheme | typeof darkTheme) {
  return StyleSheet.create({
    messageRow: {
      flexDirection: "row",
      alignItems: "flex-end",
      marginVertical: 2,
      paddingHorizontal: 8,
    },
    avatarContainer: {
      marginRight: 8,
      alignSelf: "flex-end",
    },
    messageContainer: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 8,
      maxWidth: "80%",
      minWidth: 60,
      marginVertical: 2,
      backgroundColor: theme.otherMessageBackground,
    },
    ownMessage: {
      backgroundColor: theme.ownMessageBackground,
      alignSelf: "flex-end",
    },
    otherMessage: {
      backgroundColor: theme.otherMessageBackground,
      alignSelf: "flex-start",
    },
    messageHeader: {
      marginBottom: 2,
      flexDirection: "row",
      alignItems: "center",
    },
    senderName: {
      fontSize: 12,
      fontWeight: "600",
      color: theme.secondaryTextColor,
      marginBottom: 2,
    },
    messageContent: {
      flexDirection: "column",
      alignItems: "flex-start",
    },
    messageText: {
      fontSize: 15,
      color: theme.ownMessageText,
    },
    messageTime: {
      fontSize: 11,
      marginTop: 2,
      alignSelf: "flex-end",
    },
    thumbnailImage: {
      width: 180,
      height: 180,
      borderRadius: 10,
      marginTop: 4,
      marginBottom: 2,
      backgroundColor: theme.secondaryBackgroundColor,
    },
  });
}

export default MessageItem;
