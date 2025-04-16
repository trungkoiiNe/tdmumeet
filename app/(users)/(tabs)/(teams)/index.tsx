import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useTeamStore } from "../../../../stores/teamStore";
import { useThemeStore } from "../../../../stores/themeStore";
import { darkTheme, lightTheme } from "../../../../utils/themes";
import pickupImage from "../../../../utils/avatar";
import { getAuth } from "@react-native-firebase/auth";
import { FlashList } from "@shopify/flash-list";
import ContentLoader, { Rect } from "react-content-loader/native";
import CustomModal from "../../../../components/CustomModal";

// Create Team Modal Component
const CreateTeamModal = ({ visible, onClose, onSubmit }) => {
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamAvatar, setTeamAvatar] = useState("");
  const [teamTags, setTeamTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const slideAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    if (visible) {
      // Reset form when opening
      setTeamName("");
      setTeamDesc("");
      setTeamAvatar("");
      setTeamTags("");
      setIsPublic(true);

      // Animate in
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 8,
        tension: 40,
      }).start();
    } else {
      // Animate out
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePickImage = async () => {
    try {
      const base64Image = await pickupImage();
      if (base64Image) {
        setTeamAvatar(`data:image/jpeg;base64,${base64Image}`);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSubmit = () => {
    if (teamName.trim() === "") return;
    onSubmit({
      name: teamName,
      desc: teamDesc,
      avatar: teamAvatar,
      tags: teamTags,
      isPublic: isPublic,
    });
  };

  // Animation transforms
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  const backdropOpacity = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <Animated.View
          style={[
            { opacity: backdropOpacity },
            StyleSheet.absoluteFill,
            { backgroundColor: "black" },
          ]}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <Animated.View
            style={[
              modalStyles.modalContainer,
              {
                backgroundColor: theme.cardBackgroundColor,
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={modalStyles.modalHeader}>
              <Text
                style={[modalStyles.modalTitle, { color: theme.textColor }]}
              >
                Create New Team
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Feather name="x" size={24} color={theme.textColor} />
              </TouchableOpacity>
            </View>

            <ScrollView style={modalStyles.modalContent}>
              <TouchableOpacity
                onPress={handlePickImage}
                style={modalStyles.avatarPicker}
              >
                <View
                  style={[
                    modalStyles.avatarContainer,
                    { borderColor: theme.borderColor },
                  ]}
                >
                  {teamAvatar ? (
                    <Image
                      source={{ uri: teamAvatar }}
                      style={modalStyles.avatarImage}
                    />
                  ) : (
                    <Feather
                      name="camera"
                      size={24}
                      color={theme.tertiaryTextColor}
                    />
                  )}
                </View>
                <Text
                  style={[
                    modalStyles.avatarPickerText,
                    { color: theme.primaryColor },
                  ]}
                >
                  Choose Avatar
                </Text>
              </TouchableOpacity>

              <Text
                style={[modalStyles.inputLabel, { color: theme.textColor }]}
              >
                Team Name
              </Text>
              <TextInput
                value={teamName}
                onChangeText={setTeamName}
                placeholder="Enter team name"
                placeholderTextColor={theme.tertiaryTextColor}
                style={[
                  modalStyles.textInput,
                  {
                    borderColor: theme.inputBorderColor,
                    color: theme.textColor,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
              />

              <Text
                style={[modalStyles.inputLabel, { color: theme.textColor }]}
              >
                Description
              </Text>
              <TextInput
                value={teamDesc}
                onChangeText={setTeamDesc}
                placeholder="Enter team description"
                placeholderTextColor={theme.tertiaryTextColor}
                multiline
                numberOfLines={3}
                style={[
                  modalStyles.textAreaInput,
                  {
                    borderColor: theme.inputBorderColor,
                    color: theme.textColor,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
              />

              <Text
                style={[modalStyles.inputLabel, { color: theme.textColor }]}
              >
                Tags (comma separated)
              </Text>
              <TextInput
                value={teamTags}
                onChangeText={setTeamTags}
                placeholder="design, development, marketing"
                placeholderTextColor={theme.tertiaryTextColor}
                style={[
                  modalStyles.textInput,
                  {
                    borderColor: theme.inputBorderColor,
                    color: theme.textColor,
                    backgroundColor: theme.backgroundColor,
                  },
                ]}
              />

              <View style={modalStyles.checkboxContainer}>
                <Text
                  style={[
                    modalStyles.checkboxLabel,
                    { color: theme.textColor },
                  ]}
                >
                  Public Team
                </Text>
                <TouchableOpacity onPress={() => setIsPublic(!isPublic)}>
                  {isPublic ? (
                    <MaterialIcons
                      name="check-box"
                      size={24}
                      color={theme.primaryColor}
                    />
                  ) : (
                    <MaterialIcons
                      name="check-box-outline-blank"
                      size={24}
                      color={theme.tertiaryTextColor}
                    />
                  )}
                </TouchableOpacity>
              </View>

              <View style={modalStyles.infoBox}>
                <Feather
                  name="info"
                  size={16}
                  color={theme.primaryColor}
                  style={modalStyles.infoIcon}
                />
                <Text
                  style={[
                    modalStyles.infoText,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  {isPublic
                    ? "Public teams can be found and joined by anyone."
                    : "Private teams require an invitation to join."}
                </Text>
              </View>
            </ScrollView>

            <View
              style={[
                modalStyles.modalFooter,
                { borderTopColor: theme.borderColor },
              ]}
            >
              <TouchableOpacity
                style={modalStyles.cancelButton}
                onPress={onClose}
              >
                <Text
                  style={[
                    modalStyles.cancelButtonText,
                    { color: theme.secondaryTextColor },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  modalStyles.confirmButton,
                  {
                    backgroundColor: theme.buttonBackground,
                    opacity: teamName.trim() ? 1 : 0.6,
                  },
                ]}
                onPress={handleSubmit}
                disabled={!teamName.trim()}
              >
                <Text style={modalStyles.confirmButtonText}>Create Team</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

// Empty state component with better UI
const EmptyTeamsState = () => {
  const { isDarkMode } = useThemeStore();
  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <View
      style={[
        styles.emptyContainer,
        { backgroundColor: theme.cardBackgroundColor },
      ]}
    >
      <Feather
        name="users"
        size={60}
        color={theme.tertiaryTextColor}
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
        No Teams Yet
      </Text>
      <Text style={[styles.emptyText, { color: theme.secondaryTextColor }]}>
        Create a team to collaborate with others or join an existing team.
      </Text>
      <Text
        style={[styles.emptyInstructions, { color: theme.tertiaryTextColor }]}
      >
        Tap the + button above to create your first team
      </Text>
    </View>
  );
};

// Loading skeleton
const MyCustomLoader = () => {
  const { isDarkMode } = useThemeStore();
  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  return (
    <View style={styles.loaderContainer}>
      {[...Array(3)].map((_, index) => (
        <ContentLoader
          key={index}
          speed={1.5}
          width="100%"
          height={90}
          backgroundColor={isDarkMode ? "#2a2f3a" : "#f3f3f3"}
          foregroundColor={isDarkMode ? "#3d4451" : "#ecebeb"}
          style={styles.loader}
        >
          <Rect x="0" y="0" rx="8" ry="8" width="100%" height="90" />
        </ContentLoader>
      ))}
    </View>
  );
};

export default function TeamsScreen() {
  const { teams, fetchTeams, addTeam, deleteTeam, fetchUnreadMessages } =
    useTeamStore();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadTeams, setUnreadTeams] = useState<string[]>([]);
  const { isDarkMode } = useThemeStore();
  const theme = useMemo(
    () => (isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true);
      await fetchTeams();
      setLoading(false);
    };

    loadTeams();
  }, []);

  // Check for unread messages and update unreadTeams state
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!user) return;

      try {
        const unreadMessages = await fetchUnreadMessages(user.uid);

        // Extract unique team IDs that have unread messages
        const teamsWithUnread = Array.from(
          new Set(unreadMessages.map((msg) => msg.teamId))
        );
        setUnreadTeams(teamsWithUnread);
      } catch (error) {
        console.error("Error checking unread messages:", error);
      }
    };
    checkUnreadMessages();
    const intervalId = setInterval(checkUnreadMessages, 30000); // every 30 seconds

    return () => clearInterval(intervalId);
  }, [user, fetchUnreadMessages]);
  const handleAddTeam = useCallback(
    async (teamData) => {
      try {
        const newTeam = {
          id: uuidv4(),
          name: teamData.name,
          desc: teamData.desc,
          ownerId: user.uid,
          members: [user.uid],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          avatar: teamData.avatar || "",
          tags: teamData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag !== ""),
          isPublic: teamData.isPublic,
        };

        await addTeam(newTeam);
        setIsAddModalVisible(false);
      } catch (error) {
        console.error("Error adding team:", error);
      }
    },
    [user, addTeam]
  );

  const confirmDeleteTeam = useCallback((team) => {
    setTeamToDelete(team);
    setDeleteModalVisible(true);
  }, []);

  const handleDeleteTeam = useCallback(async () => {
    if (teamToDelete) {
      await deleteTeam(teamToDelete.id);
      setDeleteModalVisible(false);
      setTeamToDelete(null);
    }
  }, [teamToDelete, deleteTeam]);

  const renderTeamItem = useCallback(
    ({ item }) => {
      // Check if this team has unread messages
      const hasUnread = unreadTeams.includes(item.id);

      return (
        <TouchableOpacity
          style={[
            styles.teamItem,
            { backgroundColor: theme.cardBackgroundColor },
            hasUnread && styles.teamItemWithUnread,
          ]}
          onPress={() => router.push(`/(users)/(tabs)/(teams)/${item.id}`)}
        >
          <View style={styles.teamAvatarContainer}>
            <Image
              source={{
                uri: item.avatar || "https://via.placeholder.com/100",
              }}
              style={styles.teamAvatar}
            />
            {hasUnread && (
              <View
                style={[
                  styles.unreadIndicator,
                  { backgroundColor: theme.primaryColor },
                ]}
              />
            )}
          </View>

          <View style={styles.teamContent}>
            <Text
              style={[
                styles.teamName,
                { color: theme.textColor },
                hasUnread && styles.teamNameUnread,
              ]}
            >
              {item.name}
            </Text>
            <Text
              style={[styles.teamDesc, { color: theme.secondaryTextColor }]}
            >
              {item.desc.substring(0, 50)}
              {item.desc.length > 50 ? "..." : ""}
            </Text>
            <Text
              style={[styles.membersCount, { color: theme.tertiaryTextColor }]}
            >
              {item.members.length} members
            </Text>
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 3).map((tag, index) => (
                <Text
                  key={index}
                  style={[
                    styles.tag,
                    {
                      backgroundColor: theme.tagBackground,
                      color: theme.tagText,
                    },
                  ]}
                >
                  {tag}
                </Text>
              ))}
            </View>
          </View>
          {item.ownerId === user?.uid && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeleteTeam(item)}
            >
              <Feather name="trash-2" size={20} color={theme.dangerColor} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      );
    },
    [theme, user?.uid, confirmDeleteTeam, unreadTeams]
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Teams
        </Text>
        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={[
            styles.addButton,
            { backgroundColor: theme.buttonBackground },
          ]}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <MyCustomLoader />
      ) : (
        <FlashList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={84}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={<EmptyTeamsState />}
        />
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddTeam}
      />

      {/* Delete Confirmation Modal */}
      <CustomModal
        visible={deleteModalVisible}
        modalType="deleteConfirm"
        title="Delete Team"
        message={`Are you sure you want to delete "${teamToDelete?.name}"? This action cannot be undone and all team data will be permanently lost.`}
        onClose={() => setDeleteModalVisible(false)}
        onConfirm={handleDeleteTeam}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teamItemWithUnread: {
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
    borderLeftWidth: 3,
    borderLeftColor: "#3b82f6",
  },
  teamAvatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  unreadIndicator: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "white",
  },
  teamContent: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  teamNameUnread: {
    fontWeight: "800",
  },
  teamDesc: {
    fontSize: 16,
    marginBottom: 4,
  },
  membersCount: {
    fontSize: 12,
    marginBottom: 4,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    marginRight: 8,
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    margin: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyIcon: {
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  emptyInstructions: {
    fontSize: 14,
    textAlign: "center",
    fontStyle: "italic",
  },
  loaderContainer: {
    padding: 8,
  },
  loader: {
    marginBottom: 12,
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    width: "100%",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingTop: 16,
    borderTopWidth: 1,
    marginTop: 10,
  },
  confirmButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 2,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
  },
  cancelButtonText: {
    fontWeight: "500",
  },
  avatarPicker: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "transparent",
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPickerText: {
    marginTop: 8,
    fontWeight: "500",
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: "500",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxLabel: {
    marginRight: 8,
    fontWeight: "500",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
});
