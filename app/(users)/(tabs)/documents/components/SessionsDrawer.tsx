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
} from "react-native"
import { FontAwesome, Ionicons } from "@expo/vector-icons"
import { useThemeStore } from "@/stores/themeStore"
import themes from "@/utils/themes"
import { useDocuments } from "./DocumentsContext"
import { useAuthStore } from "@/stores/authStore"
import { MotiView } from "moti"
import React from "react"

const { width } = Dimensions.get("window")

export default function SessionsDrawer() {
  const { isDarkMode } = useThemeStore()
  const theme = isDarkMode ? themes.dark : themes.light
  const {
    showDrawer,
    setShowDrawer,
    chatSessions,
    searchQuery,
    setSearchQuery,
    selectedSession,
    createNewSession,
    deleteSession,
    selectSession,
  } = useDocuments()

  const { getUser } = useAuthStore()
  const user = getUser()

  // Filter chat sessions based on search query
  const filteredChatSessions = chatSessions.filter((session) =>
    session.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const styles = StyleSheet.create({
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    drawerContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      width: width * 0.85,
      backgroundColor: "#0f172a", // Dark blue background to match screenshot
      shadowColor: "#000",
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      paddingTop: Platform.OS === "android" ? 40 : 50,
    },
    searchBarContainer: {
      paddingHorizontal: 15,
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    searchInput: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 8,
      paddingHorizontal: 15,
      paddingVertical: 10,
      fontSize: 16,
      color: "#fff",
      flexDirection: "row",
      alignItems: "center",
    },
    searchInputIcon: {
      marginRight: 10,
    },
    searchInputText: {
      flex: 1,
      color: "#fff",
      fontSize: 16,
    },
    staticItemsContainer: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255, 255, 255, 0.1)",
    },
    staticItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 20,
    },
    staticItemIcon: {
      marginRight: 15,
      width: 24,
      textAlign: "center",
    },
    staticItemText: {
      fontSize: 16,
      color: "#fff",
    },
    staticItemBadge: {
      marginLeft: "auto",
      backgroundColor: "#3b82f6", // Blue badge
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 10,
      overflow: "hidden",
      minWidth: 18,
      textAlign: "center",
    },
    sessionsListContainer: {
      flex: 1,
    },
    sessionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 15,
      marginHorizontal: 5,
      borderRadius: 5,
      marginBottom: 2,
    },
    selectedSessionItem: {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
    },
    sessionTitle: {
      fontSize: 15,
      color: "#fff",
      flex: 1,
      marginRight: 10,
    },
    deleteSessionButton: {
      padding: 5,
    },
    userInfoContainer: {
      paddingVertical: 15,
      paddingHorizontal: 20,
      borderTopWidth: 1,
      borderTopColor: "rgba(255, 255, 255, 0.1)",
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.05)",
    },
    userAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      marginRight: 12,
      backgroundColor: "#3b82f6", // Blue avatar background
    },
    userName: {
      fontSize: 16,
      color: "#fff",
      flex: 1,
    },
    userMenuIcon: {
      marginLeft: "auto",
      paddingLeft: 10,
    },
    newSessionButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#3b82f6", // Blue button
      padding: 12,
      borderRadius: 5,
      margin: 10,
      marginTop: 5,
    },
    newSessionText: {
      color: "white",
      marginLeft: 8,
      fontWeight: "bold",
    },
  })

  if (!showDrawer) {
    return null
  }

  return (
    <Modal transparent={true} visible={showDrawer} animationType="slide" onRequestClose={() => setShowDrawer(false)}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setShowDrawer(false)}>
        <MotiView
          style={styles.drawerContainer}
          from={{ translateX: -width * 0.85 }}
          animate={{ translateX: 0 }}
          transition={{ type: "spring", damping: 15 }}
          onStartShouldSetResponder={() => true}
        >
          {/* Search Bar */}
          <View style={styles.searchBarContainer}>
            <View style={styles.searchInput}>
              <FontAwesome name="search" size={18} color="rgba(255, 255, 255, 0.5)" style={styles.searchInputIcon} />
              <TextInput
                style={styles.searchInputText}
                placeholder="Search"
                placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
                setShowDrawer(false)
              }}
            >
              <FontAwesome name="bolt" size={18} color="#fff" style={styles.staticItemIcon} />
              <Text style={styles.staticItemText}>ChatGPT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.staticItem}
              onPress={() => {
                setShowDrawer(false)
              }}
            >
              <Ionicons name="apps-outline" size={20} color="#fff" style={styles.staticItemIcon} />
              <Text style={styles.staticItemText}>Explore GPT</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.staticItem}
              onPress={() => {
                setShowDrawer(false)
              }}
            >
              <FontAwesome name="image" size={18} color="#fff" style={styles.staticItemIcon} />
              <Text style={styles.staticItemText}>Image Gallery</Text>
              <Text style={styles.staticItemBadge}>8</Text>
            </TouchableOpacity>
          </View>

          {/* New Session Button */}
          <TouchableOpacity style={styles.newSessionButton} onPress={createNewSession}>
            <FontAwesome name="plus" size={16} color="#fff" />
            <Text style={styles.newSessionText}>New Chat</Text>
          </TouchableOpacity>

          {/* Session List */}
          <ScrollView style={styles.sessionsListContainer}>
            {filteredChatSessions.map((session) => (
              <MotiView
                key={session.id}
                from={{ opacity: 0, translateX: -20 }}
                animate={{ opacity: 1, translateX: 0 }}
                transition={{ type: "timing", duration: 300 }}
              >
                <TouchableOpacity
                  style={[styles.sessionItem, selectedSession === session.id && styles.selectedSessionItem]}
                  onPress={() => selectSession(session)}
                >
                  <Text style={styles.sessionTitle} numberOfLines={1}>
                    {session.title}
                  </Text>
                  {selectedSession === session.id && (
                    <TouchableOpacity style={styles.deleteSessionButton} onPress={() => deleteSession(session.id)}>
                      <FontAwesome name="trash-o" size={18} color="rgba(255, 255, 255, 0.5)" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              </MotiView>
            ))}
          </ScrollView>

          {/* User Info */}
          <View style={styles.userInfoContainer}>
            <View style={styles.userAvatar}>
              <Text style={{ color: "#fff", textAlign: "center", lineHeight: 30 }}>
                {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
              </Text>
            </View>
            <Text style={styles.userName} numberOfLines={1}>
              {user?.displayName || user?.email || "User"}
            </Text>
            <TouchableOpacity
              style={styles.userMenuIcon}
              onPress={() => {
                /* Add action for user menu */
              }}
            >
              <FontAwesome name="chevron-down" size={16} color="rgba(255, 255, 255, 0.5)" />
            </TouchableOpacity>
          </View>
        </MotiView>
      </TouchableOpacity>
    </Modal>
  )
}
