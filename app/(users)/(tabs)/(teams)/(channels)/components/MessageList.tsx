import { useRef, useEffect, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { View, ActivityIndicator } from "react-native";
import { Button } from "react-native-paper";
import type { Message } from "../types";
import { useThemeStore } from "@/stores/themeStore";
import { lightTheme, darkTheme } from "@/utils/themes";
import { StyleSheet } from "react-native";
import MessageItem from "./MessageItem";
import DateHeader from "./DateHeader";
import TypingIndicator from "./TypingIndicator";
import { shouldShowDateHeader } from "@/utils/dateUtils";
import React from "react";

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  onDeleteMessage: (message: Message) => void;
  onReplyMessage?: (message: Message) => void;
  onReactionMessage?: (message: Message, reaction: string) => void;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
  hasMoreMessages?: boolean;
  typingUsers?: string[];
}

const MessageList = ({
  messages,
  currentUserId,
  onDeleteMessage,
  onReplyMessage,
  onReactionMessage,
  isLoadingMore = false,
  onLoadMore,
  hasMoreMessages = false,
  typingUsers = [],
}: MessageListProps) => {
  // Access dynamic theme
  const isDark = useThemeStore((state) => state.isDarkMode);
  const theme = isDark ? darkTheme : lightTheme;
  const styles = getStyles(theme);
  const flatListRef = useRef<FlashList<Message> | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);

  useEffect(() => {
    if (flatListRef.current && messages.length > 0 && autoScrollEnabled) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, autoScrollEnabled]);

  const handleScroll = (event: any) => {
    const { contentOffset, layoutMeasurement, contentSize } = event.nativeEvent;
    const distanceFromBottom =
      contentSize.height - (contentOffset.y + layoutMeasurement.height);

    // If user scrolls up more than 100px, disable auto-scroll
    if (distanceFromBottom > 100) {
      setAutoScrollEnabled(false);
    } else {
      setAutoScrollEnabled(true);
    }
  };

  const renderItem = ({ item, index }: { item: Message; index: number }) => {
    const previousMessage = index > 0 ? messages[index - 1] : null;
    const showDateHeader = shouldShowDateHeader(
      item.createdAt,
      previousMessage?.createdAt
    );

    return (
      <>
        {showDateHeader && <DateHeader timestamp={item.createdAt} />}
        <MessageItem
          message={item}
          currentUserId={currentUserId}
          onDelete={onDeleteMessage}
          previousMessage={previousMessage}
          onReply={onReplyMessage}
          onReaction={onReactionMessage}
        />
      </>
    );
  };

  const renderFooter = () => {
    return (
      <View>
        {typingUsers.map((userId) => (
          <TypingIndicator key={userId} userId={userId} visible={true} />
        ))}
      </View>
    );
  };

  const renderHeader = () => {
    if (!hasMoreMessages) return null;

    return (
      <View style={{ padding: 8, alignItems: "center" }}>
        {isLoadingMore ? (
          <ActivityIndicator color={theme.primaryColor} />
        ) : (
          <Button
            mode="text"
            onPress={onLoadMore}
            loading={isLoadingMore}
            disabled={isLoadingMore}
            color={theme.primaryColor}
          >
            Load earlier messages
          </Button>
        )}
      </View>
    );
  };

  return (
    <FlashList
      ref={flatListRef}
      data={messages}
      estimatedItemSize={99}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.messagesList}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      onContentSizeChange={() => {
        if (autoScrollEnabled) {
          flatListRef.current?.scrollToEnd({ animated: false });
        }
      }}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      inverted={false}
    />
  );
};
// Theme-based dynamic styles
function getStyles(theme: typeof lightTheme | typeof darkTheme) {
  return StyleSheet.create({
    messagesList: {
      paddingHorizontal: 8,
      paddingTop: 4,
      paddingBottom: 8,
      backgroundColor: theme.backgroundColor,
      flexGrow: 1,
    },
  });
}

export default MessageList;