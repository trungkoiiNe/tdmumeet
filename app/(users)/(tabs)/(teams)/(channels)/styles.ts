import { StyleSheet } from "react-native";
import { MD3LightTheme, MD3DarkTheme } from "react-native-paper";
import { lightTheme, darkTheme } from "@/utils/themes";
import { useThemeStore } from "@/stores/themeStore";

// Get the current theme based on the theme store state
const getTheme = () => {
  const isDark = useThemeStore.getState().isDarkMode;
  return isDark ? darkTheme : lightTheme;
};

// Custom hook for components to access the current theme
export const useAppTheme = () => {
  const isDark = useThemeStore((state) => state.isDarkMode);
  return isDark ? darkTheme : lightTheme;
};

// Get Paper theme based on dark/light mode
export const getPaperTheme = () => {
  const isDark = useThemeStore.getState().isDarkMode;
  const baseTheme = isDark ? MD3DarkTheme : MD3LightTheme;
  const colorTheme = isDark ? darkTheme : lightTheme;

  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colorTheme.primaryColor,
      onPrimary: colorTheme.textColor,
      background: colorTheme.backgroundColor,
      surface: colorTheme.cardBackgroundColor,
      error: colorTheme.dangerColor,
      onBackground: colorTheme.textColor,
      onSurface: colorTheme.textColor,
    }
  };
};

// For backward compatibility with existing code
export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6366f1", // Indigo
    primaryContainer: "#818cf8", // Lighter indigo
    secondary: "#ec4899", // Pink
    secondaryContainer: "#f472b6", // Lighter pink
    background: "#f9fafb",
    surface: "#ffffff",
    surfaceVariant: "#f3f4f6",
    error: "#ef4444",
    onPrimary: "#ffffff",
    onSecondary: "#ffffff",
    onBackground: "#1f2937",
    onSurface: "#1f2937",
    onSurfaceVariant: "#6b7280",
    elevation: {
      level0: "transparent",
      level1: "rgba(0, 0, 0, 0.05)",
      level2: "rgba(0, 0, 0, 0.08)",
      level3: "rgba(0, 0, 0, 0.11)",
      level4: "rgba(0, 0, 0, 0.12)",
      level5: "rgba(0, 0, 0, 0.14)",
    },
  },
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
    backgroundColor: theme.colors.surface,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 16,
    flex: 1,
    color: theme.colors.onSurface,
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
    backgroundColor: theme.colors.background,
  },
  noAccessText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: theme.colors.onBackground,
  },
  messagesContainer: {
    flex: 1,
    padding: 8,
    backgroundColor: theme.colors.background,
  },
  messagesLoading: {
    marginTop: 20,
  },
  messagesList: {
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4, // Pointed edge
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.surfaceVariant,
    borderBottomLeftRadius: 4, // Pointed edge
  },
  messageContent: {
    flexDirection: "column",
  },
  messageText: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginHorizontal: 8,
    color: theme.colors.onSurface,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  sendButtonDisabled: {
    backgroundColor: "rgba(99, 102, 241, 0.5)",
  },
  iconButton: {
    padding: 8,
  },
  button: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    margin: 8,
    justifyContent: "center",
  },
  deleteText: {
    color: "#dc2626",
    fontWeight: "500",
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: theme.colors.surfaceVariant,
    borderRadius: 12,
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
    color: theme.colors.error,
    textAlign: "center",
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalCloseButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  modalDownloadButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 2,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
  },
  thumbnailImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    resizeMode: "cover",
    marginVertical: 4,
  },
  modalScrollViewContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalImage: {
    width: "95%",
    height: "95%",
    resizeMode: "contain",
  },
  // New styles for enhanced UI
  avatarContainer: {
    marginRight: 8,
    alignSelf: "flex-end",
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginVertical: 2,
  },
  messageStatus: {
    fontSize: 10,
    marginRight: 4,
    color: "rgba(255,255,255,0.7)",
  },
  typingIndicator: {
    flexDirection: "row",
    padding: 8,
    alignItems: "center",
    alignSelf: "flex-start",
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginHorizontal: 2,
  },
  reactionContainer: {
    flexDirection: "row",
    alignSelf: "flex-start",
    marginTop: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reactionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    marginVertical: 4,
  },
  imageGridItem: {
    width: 100,
    height: 100,
    margin: 2,
    borderRadius: 8,
  },
  swipeableMessageContainer: {
    marginVertical: 2,
  },
  replyContainer: {
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    paddingLeft: 8,
    marginBottom: 4,
    opacity: 0.7,
  },
  replyText: {
    fontSize: 12,
  },
  dateHeader: {
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 8,
  },
  dateHeaderText: {
    fontSize: 12,
    color: theme.colors.onSurfaceVariant,
  },
  messageInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    flex: 1,
    marginHorizontal: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  attachmentPreview: {
    width: 60,
    height: 60,
    borderRadius: 8,
    margin: 4,
  },
  attachmentPreviewContainer: {
    position: "relative",
  },
  removeAttachmentButton: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  inputToolbar: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
  },
  inputToolbarButton: {
    padding: 8,
  },
  readReceipt: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginLeft: 4,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  readReceiptContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.onSurfaceVariant,
  },
});
export default styles;