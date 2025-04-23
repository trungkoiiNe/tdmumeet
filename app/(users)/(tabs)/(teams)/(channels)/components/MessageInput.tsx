import { useState, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Animated,
  Keyboard,
  Image,
} from "react-native";
import { IconButton, Surface } from "react-native-paper";
// import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { styles, theme } from "../styles";
import React from "react";
import { Text } from "react-native";
interface MessageInputProps {
  messageText: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onAttachment: () => void;
  replyingTo?: { id: string; text: string } | null;
  onCancelReply?: () => void;
  attachmentPreview?: string | null;
  onRemoveAttachment?: () => void;
}

const MessageInput = ({
  messageText,
  onChangeText,
  onSend,
  onAttachment,
  replyingTo,
  onCancelReply,
  attachmentPreview,
  onRemoveAttachment,
}: MessageInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const recordingAnimation = useRef(new Animated.Value(0)).current;

  const startRecording = () => {
    // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsRecording(true);
    Animated.loop(
      Animated.sequence([
        Animated.timing(recordingAnimation, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(recordingAnimation, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recordingAnimation.stopAnimation();
    recordingAnimation.setValue(0);
    // In a real app, you would process the audio recording here
  };

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <View>
      {replyingTo && (
        <Surface
          style={{
            marginHorizontal: 12,
            marginTop: 8,
            padding: 8,
            borderRadius: 8,
            backgroundColor: theme.colors.surfaceVariant,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={styles.replyContainer}>
            <Text style={styles.replyText}>Replying to message</Text>
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ fontSize: 14 }}
            >
              {replyingTo.text}
            </Text>
          </View>
          <IconButton icon="close" size={16} onPress={onCancelReply} />
        </Surface>
      )}

      {attachmentPreview && (
        <View
          style={{
            marginHorizontal: 12,
            marginTop: 8,
            flexDirection: "row",
          }}
        >
          <View style={styles.attachmentPreviewContainer}>
            <Image
              source={{ uri: attachmentPreview }}
              style={styles.attachmentPreview}
            />
            <TouchableOpacity
              style={styles.removeAttachmentButton}
              onPress={onRemoveAttachment}
            >
              <MaterialCommunityIcons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={styles.inputContainer}>
        <View style={styles.inputToolbar}>
          <IconButton
            icon="emoticon-outline"
            size={24}
            iconColor={theme.colors.onSurfaceVariant}
            onPress={() => {
              // Open emoji picker
              Keyboard.dismiss();
            }}
            style={styles.inputToolbarButton}
          />

          <View style={styles.messageInputContainer}>
            <TextInput
              ref={inputRef}
              style={[
                styles.textInput,
                {
                  backgroundColor: "transparent",
                  marginHorizontal: 0,
                  paddingHorizontal: 0,
                },
              ]}
              placeholder="Type a message..."
              placeholderTextColor="#999"
              value={messageText}
              onChangeText={onChangeText}
              multiline
              maxLength={1000}
              accessibilityLabel="Message input field"
            />
          </View>

          {messageText.trim() ? (
            <IconButton
              icon="send"
              size={24}
              iconColor={theme.colors.primary}
              onPress={onSend}
              style={styles.inputToolbarButton}
              disabled={!messageText.trim()}
            />
          ) : (
            <>
              <IconButton
                icon="paperclip"
                size={24}
                iconColor={theme.colors.onSurfaceVariant}
                onPress={onAttachment}
                style={styles.inputToolbarButton}
              />
              <IconButton
                icon="microphone"
                size={24}
                iconColor={
                  isRecording
                    ? theme.colors.error
                    : theme.colors.onSurfaceVariant
                }
                onPress={isRecording ? stopRecording : startRecording}
                style={[
                  styles.inputToolbarButton,
                  isRecording && { backgroundColor: "rgba(239, 68, 68, 0.1)" },
                ]}
              />
            </>
          )}
        </View>
      </View>
    </View>
  );
};
export default MessageInput;