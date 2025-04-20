import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Dimensions,
  Image,
  Platform,
} from "react-native"; // Added Modal, Dimensions, Image, Platform
import { FontAwesome, Ionicons } from "@expo/vector-icons"; // Added Ionicons
import * as DocumentPicker from "expo-document-picker";
import axios from "axios";
// import { Picker } from '@react-native-picker/picker'; // Picker might not be needed anymore
import { MMKV } from "react-native-mmkv";
import { useThemeStore } from "../../../../stores/themeStore";
import themes from "../../../../utils/themes";
import { toast } from "@baronha/ting";
const storage = new MMKV();
import * as Clipboard from "expo-clipboard";
import { useAuthStore } from "../../../../stores/authStore"; // Added useAuthStore

const { width } = Dimensions.get("window");

const testBackendAPI = async () => {
  try {
    const backendIP = storage.getString("backendIP") || "http://localhost:8000";
    // console.log(backendIP);
    const response = await axios.get(`${backendIP}/chat-sessions/`);
    console.log("Backend API Response:", response.data);
  } catch (err) {
    console.error("Failed to test backend API:", err);
  }
};

const DocumentsScreen = () => {
  const [documents, setDocuments] = useState([]);
  const [chatId, setChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [chatSessions, setChatSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedSessionTitle, setSelectedSessionTitle] = useState("");
  const [showDrawer, setShowDrawer] = useState(false); // State to control the modal drawer
  const [showDocumentsPanel, setShowDocumentsPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const scrollViewRef = React.useRef(null); // Reference for ScrollView

  const { getUser } = useAuthStore(); // Get user info function
  const user = getUser(); // Get current user

  useEffect(() => {
    const fetchChatSessions = async () => {
      try {
        const storage = new MMKV();
        const backendIP =
          storage.getString("backendIP") || "http://localhost:8000";
        // console.log(backendIP);
        const response = await axios.get(`${backendIP}/chat-sessions/`);
        setChatSessions(response.data);
        // Keep initial selection logic commented out or adjust as needed
        // if (response.data.length > 0) {
        //     setSelectedSession(response.data[0].id);
        //     setSelectedSessionTitle(response.data[0].title);
        //     setChatId(response.data[0].id);
        //     await fetchChatMessages(response.data[0].id);
        //     const guides = await fetchDocumentGuides(response.data[0].id);
        //     if (guides) setDocuments(guides);
        // }
      } catch (err) {
        console.error("Failed to fetch chat sessions:", err);
      }
    };

    fetchChatSessions();
  }, []);

  const toggleDocumentsPanel = () => {
    setShowDocumentsPanel(!showDocumentsPanel);
  };

  const createNewSession = async () => {
    try {
      const backendIP =
        storage.getString("backendIP") || "http://localhost:8000";
      const response = await axios.post(`${backendIP}/chat-sessions/`, {
        title: `New Chat ${new Date().toLocaleString()}`,
      });
      const newSession = response.data;
      setChatSessions((prev) => [newSession, ...prev]); // Add new session to the top
      setSelectedSession(newSession.id);
      setSelectedSessionTitle(newSession.title);
      setChatId(newSession.id);
      setMessages([]); // Clear messages for new session
      setDocuments([]); // Clear documents for new session
      setShowDrawer(false); // Close drawer after creating
    } catch (err) {
      console.error("Failed to create new session:", err);
    }
  };

  const deleteSession = async (sessionIdToDelete) => {
    if (!sessionIdToDelete) return;
    try {
      const backendIP =
        storage.getString("backendIP") || "http://localhost:8000";
      await axios.delete(`${backendIP}/chat-sessions/${sessionIdToDelete}`);
      setChatSessions((prev) =>
        prev.filter((session) => session.id !== sessionIdToDelete)
      );
      if (selectedSession === sessionIdToDelete) {
        setSelectedSession("");
        setSelectedSessionTitle("");
        setMessages([]);
        setDocuments([]);
        setChatId("");
      }
    } catch (err) {
      console.error("Failed to delete session:", err);
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        multiple: true,
      });

      if (!result.canceled && chatId) {
        // Ensure chatId is selected
        processDocuments(result.assets);
      } else if (!chatId) {
        setError("Please select or create a chat session first.");
        toast({
          haptic: "warning",
          title: "Warning",
          message: "Please select or create a chat session first.",
        });
      }
    } catch (err) {
      setError("Failed to pick document");
      console.error(err);
    }
  };

  const processDocuments = async (files) => {
    if (!chatId) {
      setError("No chat session selected for processing documents.");
      toast({
        haptic: "warning",
        title: "Warning",
        message: "No chat session selected.",
      });
      return;
    }
    setIsProcessing(true);
    setError("");

    try {
      const formData = new FormData();
      files.forEach((file) => {
        const fileObj = {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        };
        formData.append("files", fileObj as any);
      });

      const backendIP =
        storage.getString("backendIP") || "http://localhost:8000";
      // Associate documents with the current chatId
      const response = await axios.post(
        `${backendIP}/process-multiple-documents/?chat_id=${chatId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Re-fetch guides after processing
      const newDocs = await fetchDocumentGuides(chatId);
      if (newDocs) {
        setDocuments(newDocs);
      }
      toast({
        haptic: "success",
        title: "Success",
        message: "Documents processed.",
      });
    } catch (err) {
      setError("Failed to process documents");
      console.error(err);
      toast({
        haptic: "error",
        title: "Error",
        message: "Failed to process documents.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const fetchChatMessages = async (chatIdToFetch: string) => {
    if (!chatIdToFetch) return;
    try {
      const backendIP =
        storage.getString("backendIP") || "http://localhost:8000";
      const response = await axios.get(
        `${backendIP}/chat-messages/${chatIdToFetch}`
      );
      setMessages(
        response.data.map((msg) => ({ role: msg.role, content: msg.content }))
      );
    } catch (err) {
      setError("Failed to fetch chat messages");
      console.error(err);
    }
  };

  const fetchDocumentGuides = async (chatIdForGuides: string) => {
    if (!chatIdForGuides) return [];
    try {
      const backendIP =
        storage.getString("backendIP") || "http://localhost:8000";
      const response = await axios.get(
        `${backendIP}/document-guides/${chatIdForGuides}`
      );
      return response.data || []; // Ensure returning an array
    } catch (err) {
      console.error("Failed to fetch document guides:", err);
      return [];
    }
  };

  const handleCopyMessage = async (content: string) => {
    try {
      await Clipboard.setStringAsync(content);
      toast({ haptic: "success", title: "Success", message: "Copied content" });
    } catch (err) {
      console.error("Failed to copy text:", err);
      toast({ haptic: "error", title: "Error", message: "Failed to copy" });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatId) {
      if (!chatId) {
        setError("Please select a chat session first.");
        toast({
          haptic: "warning",
          title: "Warning",
          message: "Please select a chat session first.",
        });
      }
      return;
    }

    try {
      const userMessage = { role: "user", content: inputMessage };
      setMessages((prev) => [...prev, userMessage]);
      const currentInput = inputMessage;
      setInputMessage("");
      const backendIP =
        storage.getString("backendIP") || "http://localhost:8000";

      const response = await axios.post(
        `${backendIP}/chat/?chat_id=${chatId}&prompt=${encodeURIComponent(
          currentInput
        )}`,
        null,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const aiMessage = { role: "assistant", content: response.data.response };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setError("Failed to send message");
      if (err.response?.status === 422) {
        console.error("Unprocessable content error:", err.response);
      }
      console.error(err);
    }
  };

  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? themes.dark : themes.light;

  // Filter chat sessions based on search query
  const filteredChatSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // MERGE STYLES HERE
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.backgroundColor,
    },
    header: {
      paddingTop: Platform.OS === "android" ? 35 : 15, // Adjust for status bar
      paddingBottom: 10,
      paddingHorizontal: 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between", // Adjust alignment
      backgroundColor: theme.backgroundColor, // Match container background
    },
    drawerButton: {
      padding: 8,
    },
    titleContainer: {
      flex: 1,
      alignItems: "center", // Center title horizontally
    },
    title: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.textColor,
    },
    editButton: {
      // New button next to drawer button
      padding: 8,
    },
    // --- Drawer Styles --- (NEW)
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    drawerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: width * 0.85, // 85% of screen width (Adjusted)
      backgroundColor: theme.cardBackgroundColor, // Use card background for drawer
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      paddingTop: Platform.OS === "android" ? 40 : 50, // Adjust top padding
    },
    searchBarContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    searchInput: {
      backgroundColor: theme.secondaryBackgroundColor,
      borderRadius: 8, // Slightly less rounded
      paddingHorizontal: 15,
      paddingVertical: 10, // Adjusted padding
      fontSize: 16,
      color: theme.textColor,
      flexDirection: "row",
      alignItems: "center",
    },
    searchInputIcon: {
      marginRight: 10,
    },
    searchInputText: {
      flex: 1,
      color: theme.textColor,
      fontSize: 16, // Ensure text input size matches placeholder
    },
    staticItemsContainer: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderColor,
    },
    staticItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    staticItemIcon: {
      marginRight: 15,
      width: 24, // Ensure consistent icon width
      textAlign: "center",
    },
    staticItemText: {
      fontSize: 16,
      color: theme.textColor,
    },
    staticItemBadge: {
      marginLeft: "auto",
      backgroundColor: theme.secondaryTextColor, // Example badge style
      color: theme.backgroundColor,
      fontSize: 12,
      fontWeight: "bold",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: "hidden", // Ensure text stays within rounded corners
      minWidth: 18, // Ensure badge has minimum width
      textAlign: "center", // Center text in badge
    },
    sessionsListContainer: {
      flex: 1, // Take remaining space
    },
    sessionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 15, // Adjusted horizontal padding
      marginHorizontal: 5, // Add slight margin for spacing
      borderRadius: 5, // Add slight rounding
      marginBottom: 2, // Add small space between items
    },
    selectedSessionItem: {
      backgroundColor: theme.secondaryBackgroundColor, // Highlight selected item
    },
    sessionTitle: {
      fontSize: 15,
      color: theme.textColor,
      flex: 1, // Allow text to take space
      marginRight: 10, // Space before delete icon
    },
    deleteSessionButton: {
      padding: 5,
    },
    // newSessionButton: { // Style for the edit button in the header now
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     paddingVertical: 12,
    //     paddingHorizontal: 20,
    //     borderTopWidth: 1,
    //     borderTopColor: theme.borderColor,
    // },
    // newSessionText: {
    //     color: theme.textColor,
    //     marginLeft: 15,
    //     fontSize: 16,
    // },
    userInfoContainer: {
      paddingVertical: 15, // Adjusted padding
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.secondaryBackgroundColor, // Slightly different background
    },
    userAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 12, // Increased margin
      backgroundColor: theme.secondaryTextColor, // Placeholder background
    },
    userName: {
      fontSize: 16,
      // fontWeight: 'bold', // Removed bold
      color: theme.textColor,
      flex: 1, // Allow name to take space
    },
    userMenuIcon: {
      marginLeft: "auto",
      paddingLeft: 10, // Add padding for easier touch
    },
    // --- End Drawer Styles ---
    content: {
      flex: 1,
      // padding: 15, // Padding applied within ScrollView contentContainerStyle if needed
      backgroundColor: theme.backgroundColor,
    },
    error: {
      color: "red",
      marginBottom: 10,
      textAlign: "center",
      paddingHorizontal: 15,
    },
    chatContainer: {
      // Styles for individual messages handle spacing
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: theme.ownMessageBackground,
      padding: 10,
      borderRadius: 10,
      marginBottom: 8, // Spacing between messages
      maxWidth: "85%", // Adjusted max width
      marginRight: 10,
    },
    aiMessage: {
      alignSelf: "flex-start",
      backgroundColor: theme.otherMessageBackground,
      padding: 10,
      borderRadius: 10,
      marginBottom: 8, // Spacing between messages
      maxWidth: "85%", // Adjusted max width
      marginLeft: 10,
    },
    messageText: {
      fontSize: 15, // Slightly larger text
      color: theme.textColor,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8, // Adjusted padding
      paddingHorizontal: 10,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      backgroundColor: theme.backgroundColor,
    },
    documentsButton: {
      padding: 10,
      marginRight: 5,
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.inputBorderColor,
      borderRadius: 20,
      paddingHorizontal: 15,
      paddingVertical: Platform.OS === "ios" ? 10 : 8, // Adjust padding for platform
      fontSize: 16,
      color: theme.textColor,
      backgroundColor: theme.cardBackgroundColor,
      marginRight: 10, // Add margin between input and send button
    },
    sendButton: {
      backgroundColor: theme.primaryColor,
      borderRadius: 20,
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      // marginLeft: 10, // Removed, using marginRight on input instead
    },
    sendButtonDisabled: {
      // Style for disabled send button
      backgroundColor: theme.secondaryBackgroundColor,
    },
    documentsPanel: {
      position: "absolute",
      bottom: Platform.OS === "ios" ? 70 : 60, // Adjust based on input container height and platform
      left: 0,
      right: 0,
      backgroundColor: theme.cardBackgroundColor,
      borderTopWidth: 1,
      borderTopColor: theme.borderColor,
      padding: 10,
      maxHeight: 250, // Increased max height
      zIndex: 50, // Ensure it's above content but below drawer
    },
    documentsHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    addDocumentButton: {
      backgroundColor: theme.primaryColor,
      borderRadius: 20,
      width: 30,
      height: 30,
      alignItems: "center",
      justifyContent: "center",
    },
    addDocumentButtonDisabled: {
      backgroundColor: theme.secondaryTextColor,
    },
    documentsList: {
      maxHeight: 200, // Adjusted max height
    },
    documentItemContainer: {
      // Wrapper for document item and guide
      marginBottom: 8,
    },
    documentItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderWidth: 1,
      borderColor: theme.borderColor,
      borderRadius: 5,
      backgroundColor: theme.secondaryBackgroundColor,
    },
    documentIcon: {
      marginRight: 10,
    },
    documentName: {
      color: theme.textColor,
      flex: 1,
      fontSize: 14,
    },
    emptyDocuments: {
      textAlign: "center",
      color: theme.secondaryTextColor,
      paddingVertical: 20,
    },
    guideContainer: {
      backgroundColor: theme.backgroundColor, // Use main background for guide
      padding: 10,
      marginTop: 5, // Add space between doc item and guide
      borderRadius: 5,
      borderWidth: 1,
      borderColor: theme.borderColor,
    },
    guideTitle: {
      fontWeight: "bold",
      marginTop: 5,
      marginBottom: 3,
      color: theme.textColor,
      fontSize: 14,
    },
    guideText: {
      marginLeft: 5,
      marginBottom: 5,
      color: theme.textColor,
      fontSize: 13,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.textColor,
    },
    emptyChatContainer: {
      // Style for when there are no messages
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    emptyChatText: {
      fontSize: 16,
      color: theme.secondaryTextColor,
      textAlign: "center",
    },
    processingText: {
      color: theme.secondaryTextColor,
      textAlign: "center",
      marginVertical: 10,
    },
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.drawerButton}
          onPress={() => setShowDrawer(true)}
        >
          <FontAwesome name="bars" size={22} color={theme.textColor} />
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {selectedSessionTitle || "TDMU Meet AI"}
          </Text>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={createNewSession}>
          <FontAwesome name="edit" size={22} color={theme.textColor} />
        </TouchableOpacity>
      </View>

      {/* Drawer Modal */}
      <Modal
        transparent={true}
        visible={showDrawer}
        animationType="slide"
        onRequestClose={() => setShowDrawer(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowDrawer(false)} // Close on overlay press
        >
          {/* Use a View that doesn't close the modal when touched */}
          <View
            style={styles.drawerContainer}
            onStartShouldSetResponder={() => true}
          >
            {/* Search Bar */}
            <View style={styles.searchBarContainer}>
              <View style={styles.searchInput}>
                <FontAwesome
                  name="search"
                  size={18}
                  color={theme.secondaryTextColor}
                  style={styles.searchInputIcon}
                />
                <TextInput
                  style={styles.searchInputText}
                  placeholder="Tìm kiếm" // Vietnamese placeholder
                  placeholderTextColor={theme.secondaryTextColor}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Static Items */}
            <View style={styles.staticItemsContainer}>
              <TouchableOpacity
                style={styles.staticItem}
                onPress={() => {
                  /* Add action */ setShowDrawer(false);
                }}
              >
                <FontAwesome
                  name="bolt"
                  size={18}
                  color={theme.textColor}
                  style={styles.staticItemIcon}
                />
                <Text style={styles.staticItemText}>ChatGPT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.staticItem}
                onPress={() => {
                  /* Add action */ setShowDrawer(false);
                }}
              >
                <Ionicons
                  name="apps-outline"
                  size={20}
                  color={theme.textColor}
                  style={styles.staticItemIcon}
                />
                <Text style={styles.staticItemText}>Khám phá GPT</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.staticItem}
                onPress={() => {
                  /* Add action */ setShowDrawer(false);
                }}
              >
                <FontAwesome
                  name="image"
                  size={18}
                  color={theme.textColor}
                  style={styles.staticItemIcon}
                />
                <Text style={styles.staticItemText}>Thư viện ảnh</Text>
                <Text style={styles.staticItemBadge}>8</Text>
              </TouchableOpacity>
            </View>

            {/* Session List */}
            <ScrollView style={styles.sessionsListContainer}>
              {filteredChatSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  style={[
                    styles.sessionItem,
                    selectedSession === session.id &&
                      styles.selectedSessionItem,
                  ]}
                  onPress={async () => {
                    if (selectedSession === session.id) return; // Avoid re-selecting same session
                    setSelectedSession(session.id);
                    setSelectedSessionTitle(session.title);
                    setChatId(session.id);
                    setMessages([]); // Clear messages before fetching new ones
                    setDocuments([]); // Clear documents before fetching new ones
                    setShowDrawer(false);
                    await fetchChatMessages(session.id);
                    const guides = await fetchDocumentGuides(session.id);
                    setDocuments(guides);
                  }}
                >
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {session.title}
                  </Text>
                  {selectedSession === session.id && ( // Show delete only for selected item for clarity
                    <TouchableOpacity
                      style={styles.deleteSessionButton}
                      onPress={() => deleteSession(session.id)}
                    >
                      <FontAwesome
                        name="trash-o"
                        size={18}
                        color={theme.secondaryTextColor}
                      />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* User Info */}
            <View style={styles.userInfoContainer}>
              <Image
                source={
                  user?.photoURL
                    ? { uri: user.photoURL }
                    : require("../../../../assets/icon.png")
                } // Fallback image
                style={styles.userAvatar}
              />
              <Text style={styles.userName} numberOfLines={1}>
                {user?.displayName || user?.email || "User"}
              </Text>
              <TouchableOpacity
                style={styles.userMenuIcon}
                onPress={() => {
                  /* Add action for user menu */
                }}
              >
                <FontAwesome
                  name="chevron-down"
                  size={16}
                  color={theme.secondaryTextColor}
                />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Main Content Area */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={
          messages.length === 0
            ? styles.emptyChatContainer
            : { paddingBottom: 20, paddingTop: 10 }
        }
        keyboardShouldPersistTaps="handled"
        ref={(ref) => {
          if (ref) {
            scrollViewRef.current = ref;
          }
        }}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {messages.length > 0 ? (
          <View style={styles.chatContainer}>
            {messages.map((msg, index) => (
              <TouchableOpacity
                key={index}
                style={
                  msg.role === "user" ? styles.userMessage : styles.aiMessage
                }
                onLongPress={() => handleCopyMessage(msg.content)}
                activeOpacity={0.7}
              >
                <Text style={styles.messageText}>{msg.content}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <Text style={styles.emptyChatText}>
            {chatId
              ? "Send a message to start chatting."
              : "Select or create a session to begin."}
          </Text>
        )}
      </ScrollView>

      {/* Input Area */}
      <View style={styles.inputContainer}>
        <TouchableOpacity
          style={styles.documentsButton}
          onPress={toggleDocumentsPanel}
          disabled={!chatId || isProcessing}
        >
          <FontAwesome
            name="file-text-o"
            size={20}
            color={chatId ? theme.primaryColor : theme.secondaryTextColor}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder={
            chatId ? "Ask about your documents..." : "Select a session first..."
          }
          placeholderTextColor={theme.secondaryTextColor}
          editable={!!chatId} // Disable input if no chat selected
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputMessage.trim() || !chatId) && styles.sendButtonDisabled,
          ]}
          onPress={sendMessage}
          disabled={!inputMessage.trim() || !chatId}
        >
          <FontAwesome
            name="send"
            size={18}
            color={
              inputMessage.trim() && chatId ? "white" : theme.secondaryTextColor
            }
          />
        </TouchableOpacity>
      </View>
      {showDocumentsPanel && chatId && (
        <View style={styles.documentsPanel}>
          <View style={styles.documentsHeader}>
            <Text style={styles.sectionTitle}>{"Documents"}</Text>
            <TouchableOpacity
              style={[
                styles.addDocumentButton,
                isProcessing && styles.addDocumentButtonDisabled,
              ]}
              onPress={pickDocument}
              disabled={isProcessing}
            >
              <FontAwesome
                name={isProcessing ? "spinner" : "plus"}
                size={16}
                color="white"
                spin={isProcessing}
              />
            </TouchableOpacity>
          </View>

          {isProcessing && (
            <Text style={styles.processingText}>Processing...</Text>
          )}

          {documents.length > 0 ? (
            <ScrollView style={styles.documentsList}>
              {documents.map((doc, index) => (
                <View key={doc.id || index}>
                  {/* Use doc.id if available */}
                  <View style={styles.documentItem}>
                    <FontAwesome
                      name={
                        doc.file_name?.endsWith(".pdf")
                          ? "file-pdf-o"
                          : "file-word-o"
                      }
                      size={16}
                      color={
                        doc.file_name?.endsWith(".pdf") ? "#FF0000" : "#2B579A"
                      }
                    />
                    <Text style={styles.documentName} numberOfLines={1}>
                      {/* Ensure file_name exists before trying to access properties */}
                      {doc.file_name
                        ? doc.file_name.includes(".")
                          ? doc.file_name
                          : `${doc.file_name}.${
                              doc.file_name.endsWith("pdf") ? "pdf" : "docx"
                            }`
                        : "Unknown Document"}
                    </Text>
                    {/* Add a delete button for individual documents? */}
                  </View>
                  {doc.guide && (
                    <View style={styles.guideContainer}>
                      {doc.guide.summary && (
                        <>
                          <Text style={styles.guideTitle}>Summary:</Text>
                          <Text style={styles.guideText}>
                            {doc.guide.summary}
                          </Text>
                        </>
                      )}
                      {doc.guide.key_points &&
                        doc.guide.key_points.length > 0 && (
                          <>
                            <Text style={styles.guideTitle}>Key Points:</Text>
                            {doc.guide.key_points.map((point, i) => (
                              <Text key={i} style={styles.guideText}>
                                • {point}
                              </Text>
                            ))}
                          </>
                        )}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>
          ) : (
            !isProcessing && (
              <Text style={styles.emptyDocuments}>
                No documents added to this session yet
              </Text>
            )
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  drawerButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  deleteButton: {
    padding: 8,
  },
  sessionDrawer: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e1e1",
    zIndex: 100,
    maxHeight: 300,
  },
  sessionItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  selectedSessionItem: {
    backgroundColor: "#f5f5f5",
  },
  sessionTitle: {
    fontSize: 16,
  },
  newSessionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 5,
    margin: 10,
  },
  newSessionText: {
    color: "white",
    marginLeft: 8,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 15,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  chatContainer: {
    marginBottom: 20,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#e3f2fd",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: "80%",
  },
  aiMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 5,
    maxWidth: "80%",
  },
  messageText: {
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
  },
  documentsButton: {
    padding: 10,
    marginRight: 5,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  sendButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  documentsPanel: {
    position: "absolute",
    bottom: 60,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e1e1e1",
    padding: 10,
    maxHeight: 200,
  },
  documentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  addDocumentButton: {
    backgroundColor: "#2196F3",
    borderRadius: 20,
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  documentsList: {
    maxHeight: 150,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 5,
    marginBottom: 5,
  },
  documentName: {
    marginLeft: 10,
  },
  emptyDocuments: {
    textAlign: "center",
    color: "#999",
    padding: 10,
  },
  guideContainer: {
    backgroundColor: "#f9f9f9",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  guideTitle: {
    fontWeight: "bold",
    marginTop: 5,
  },
  guideText: {
    marginLeft: 5,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default DocumentsScreen;
