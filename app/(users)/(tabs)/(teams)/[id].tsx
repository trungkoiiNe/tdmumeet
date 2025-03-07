import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "../../../../stores/authStore";
import { useTeamStore } from "../../../../stores/teamStore";
import meetingServices from "../../../../services/meetingServices";
// Create TeamSkeleton component for loading state
const TeamSkeleton = () => (
  <ScrollView style={styles.container}>
    <View style={styles.header}>
      <View style={{ width: 24 }} />
      <ContentLoader
        speed={2}
        width={200}
        height={24}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
      </ContentLoader>
    </View>

    <View style={styles.sectionCard}>
      <View style={styles.teamInfoHeader}>
        <ContentLoader
          speed={2}
          width={96}
          height={96}
          viewBox="0 0 96 96"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
        >
          <Circle cx="48" cy="48" r="48" />
        </ContentLoader>

        <ContentLoader
          speed={2}
          width={150}
          height={24}
          viewBox="0 0 150 24"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          style={{ marginTop: 8 }}
        >
          <Rect x="0" y="0" rx="4" ry="4" width="150" height="24" />
        </ContentLoader>

        <ContentLoader
          speed={2}
          width={100}
          height={16}
          viewBox="0 0 100 16"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          style={{ marginTop: 8 }}
        >
          <Rect x="0" y="0" rx="4" ry="4" width="100" height="16" />
        </ContentLoader>
      </View>

      <ContentLoader
        speed={2}
        width={300}
        height={60}
        viewBox="0 0 300 60"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={{ marginVertical: 16 }}
      >
        <Rect x="0" y="0" rx="4" ry="4" width="300" height="60" />
      </ContentLoader>

      <ContentLoader
        speed={2}
        width={250}
        height={20}
        viewBox="0 0 250 20"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="0" y="0" rx="20" ry="20" width="70" height="20" />
        <Rect x="80" y="0" rx="20" ry="20" width="80" height="20" />
        <Rect x="170" y="0" rx="20" ry="20" width="60" height="20" />
      </ContentLoader>
    </View>

    <View style={styles.sectionCard}>
      <ContentLoader
        speed={2}
        width={200}
        height={24}
        viewBox="0 0 200 24"
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={{ marginBottom: 16 }}
      >
        <Rect x="0" y="0" rx="4" ry="4" width="200" height="24" />
      </ContentLoader>

      {[...Array(3)].map((_, i) => (
        <ContentLoader
          key={i}
          speed={2}
          width={320}
          height={60}
          viewBox="0 0 320 60"
          backgroundColor="#f3f3f3"
          foregroundColor="#ecebeb"
          style={{ marginBottom: 12 }}
        >
          <Circle cx="20" cy="30" r="20" />
          <Rect x="50" y="15" rx="4" ry="4" width="150" height="16" />
          <Rect x="50" y="40" rx="4" ry="4" width="100" height="12" />
        </ContentLoader>
      ))}
    </View>
  </ScrollView>
);

// Add new SimpleModal component
const SimpleModal = ({
  visible,
  title,
  onClose,
  onConfirm,
  confirmText,
  children,
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{title}</Text>
          {children}
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onClose} style={styles.modalButton}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.modalButton}>
              <Text>{confirmText || "Confirm"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams();
  const {
    getTeamById,
    updateTeam,
    deleteTeam,
    joinTeam,
    leaveTeam,
    fetchChannels, // added
    addChannel, // added
    deleteChannel, // added
    channels, // added
  } = useTeamStore();
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isCurrentUserMember, setIsCurrentUserMember] = useState(false);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState(false);
  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editTags, setEditTags] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);
  const { getUserByUid } = useAuthStore();

  // Add state to store member information
  const [teamMembers, setTeamMembers] = useState([]);

  // New states for channel creation modal
  const [isChannelModalVisible, setIsChannelModalVisible] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelDesc, setNewChannelDesc] = useState("");

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  // New effect to fetch channels once team details are loaded
  useEffect(() => {
    if (team) {
      fetchChannels(team.id);
    }
  }, [team]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    const fetchedTeam = await getTeamById(id.toString());
    if (fetchedTeam) {
      setTeam(fetchedTeam);

      // Check if current user is a member or owner
      if (currentUser) {
        setIsCurrentUserMember(fetchedTeam.members.includes(currentUser.uid));
        setIsCurrentUserOwner(fetchedTeam.ownerId === currentUser.uid);
      }

      // Initialize edit form with current values
      setEditName(fetchedTeam.name);
      setEditDesc(fetchedTeam.desc);
      setEditAvatar(fetchedTeam.avatar);
      setEditTags(fetchedTeam.tags.join(", "));
      setEditIsPublic(fetchedTeam.isPublic);

      // Fetch member details
      fetchMemberDetails(fetchedTeam.members);
    }
    setLoading(false);
  };

  // Add function to fetch member details
  const fetchMemberDetails = async (memberIds) => {
    try {
      const memberPromises = memberIds.map(async (memberId) => {
        const userData = await getUserByUid(memberId);
        return {
          id: memberId,
          ...userData,
        };
      });

      const memberData = await Promise.all(memberPromises);
      setTeamMembers(memberData);
    } catch (error) {
      console.error("Error fetching member details:", error);
    }
  };

  const handleEditTeam = async () => {
    if (editName.trim() === "") return;

    const updatedTeam = {
      ...team,
      name: editName,
      desc: editDesc,
      avatar: editAvatar,
      tags: editTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      isPublic: editIsPublic,
      updatedAt: Date.now(),
    };

    await updateTeam(updatedTeam);
    setTeam(updatedTeam);
    setIsEditModalVisible(false);
  };

  const confirmDelete = () => {
    Alert.alert(
      "Delete Team",
      "Are you sure you want to delete this team? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteTeam(id.toString());
            router.push("/(users)/(tabs)/(teams)");
          },
        },
      ]
    );
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setEditAvatar(result.assets[0].uri);
    }
  };

  const handleJoinTeam = async () => {
    if (currentUser && team) {
      await joinTeam(team.id, currentUser.uid);
      // Refresh team details after joining
      fetchTeamDetails();
    }
  };

  const handleLeaveTeam = async () => {
    if (currentUser && team) {
      // Confirm before leaving team
      Alert.alert("Leave Team", "Are you sure you want to leave this team?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            await leaveTeam(team.id, currentUser.uid);
            // Refresh team details after leaving
            fetchTeamDetails();
          },
        },
      ]);
    }
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim() || !team || !currentUser) return;
    const channelId = uuidv4();
    const newChannel = {
      id: channelId,
      teamId: team.id,
      name: newChannelName,
      desc: newChannelDesc,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      createdBy: currentUser.uid,
      isPrivate: false,
      members: [],
    };
    await addChannel(newChannel);
    fetchChannels(team.id);
    // Reset and close modal
    setNewChannelName("");
    setNewChannelDesc("");
    setIsChannelModalVisible(false);
  };

  const handleDeleteChannel = async (channelId: string) => {
    if (!team) return;
    await deleteChannel(team.id, channelId);
    fetchChannels(team.id);
  };

  if (loading) {
    return <TeamSkeleton />;
  }

  if (!team) {
    return (
      <View style={styles.notFoundContainer}>
        <Text>Team not found</Text>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => router.back()}
        >
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Team Details</Text>
      </View>

      {/* Team info section */}
      <View style={styles.sectionCard}>
        <View style={styles.teamInfoHeader}>
          <Image
            source={{ uri: team.avatar || "https://via.placeholder.com/100" }}
            style={styles.teamAvatar}
          />
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.publicStatusContainer}>
            <Feather
              name={team.isPublic ? "globe" : "lock"}
              size={16}
              color="gray"
            />
            <Text style={styles.publicStatusText}>
              {team.isPublic ? "Public" : "Private"} Team
            </Text>
          </View>

          {/* Join/Leave Team Button */}
          {currentUser && !isCurrentUserOwner && (
            <TouchableOpacity
              style={[
                styles.membershipButton,
                isCurrentUserMember ? styles.leaveButton : styles.joinButton,
              ]}
              onPress={isCurrentUserMember ? handleLeaveTeam : handleJoinTeam}
            >
              <Feather
                name={isCurrentUserMember ? "user-x" : "user-plus"}
                size={16}
                color={isCurrentUserMember ? "#DC2626" : "#2563EB"}
              />
              <Text
                style={[
                  styles.membershipButtonText,
                  isCurrentUserMember
                    ? styles.leaveButtonText
                    : styles.joinButtonText,
                ]}
              >
                {isCurrentUserMember ? "Leave Team" : "Join Team"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.teamDescription}>{team.desc}</Text>

        <View style={styles.tagsContainer}>
          {team.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>#{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Created</Text>
          <Text>{new Date(team.createdAt).toLocaleDateString()}</Text>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>Last Updated</Text>
          <Text>{new Date(team.updatedAt).toLocaleDateString()}</Text>
        </View>
      </View>

      {/* Team members section - updated to show member info */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>
          Team Members ({team.members.length})
        </Text>

        {teamMembers.map((member, index) => (
          <View key={index} style={styles.memberItem}>
            <Image
              source={{
                uri: member.photoURL || "https://via.placeholder.com/40",
              }}
              style={styles.memberAvatar}
            />
            <View style={styles.memberInfo}>
              <Text style={styles.memberName}>
                {member.displayName || "Unknown User"}
              </Text>
              <Text style={styles.memberEmail}>{member.email || ""}</Text>
            </View>
            {member.id === team.ownerId && (
              <View style={styles.ownerBadge}>
                <Text style={styles.ownerBadgeText}>Owner</Text>
              </View>
            )}
          </View>
        ))}

        {isCurrentUserOwner && (
          <TouchableOpacity style={styles.inviteButton}>
            <Feather name="user-plus" size={18} color="gray" />
            <Text style={styles.inviteButtonText}>Invite Member</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Admin actions - only show if current user is owner */}
      {isCurrentUserOwner && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Admin Actions</Text>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setIsEditModalVisible(true)}
          >
            <Feather name="edit" size={18} color="blue" />
            <Text style={styles.editActionText}>Edit Team Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={confirmDelete}>
            <Feather name="trash-2" size={18} color="red" />
            <Text style={styles.deleteActionText}>Delete Team</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Edit Modal */}
      <SimpleModal
        visible={isEditModalVisible}
        title="Edit Team"
        onClose={() => setIsEditModalVisible(false)}
        onConfirm={handleEditTeam}
        confirmText="Save Changes"
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.avatarPicker}
          >
            <View style={styles.avatarContainer}>
              {editAvatar ? (
                <Image
                  source={{ uri: editAvatar }}
                  style={styles.avatarImage}
                />
              ) : (
                <Feather name="camera" size={24} color="gray" />
              )}
            </View>
            <Text style={styles.avatarPickerText}>Change Avatar</Text>
          </TouchableOpacity>

          <Text style={styles.inputLabel}>Team Name</Text>
          <TextInput
            value={editName}
            onChangeText={setEditName}
            placeholder="Enter team name"
            style={styles.textInput}
          />

          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            value={editDesc}
            onChangeText={setEditDesc}
            placeholder="Enter team description"
            multiline
            numberOfLines={3}
            style={styles.textAreaInput}
          />

          <Text style={styles.inputLabel}>Tags (comma separated)</Text>
          <TextInput
            value={editTags}
            onChangeText={setEditTags}
            placeholder="design, development, marketing"
            style={styles.textInput}
          />

          <View style={styles.checkboxContainer}>
            <Text style={styles.checkboxLabel}>Public Team</Text>
            <TouchableOpacity onPress={() => setEditIsPublic(!editIsPublic)}>
              {editIsPublic ? (
                <MaterialIcons name="check-box" size={24} color="blue" />
              ) : (
                <MaterialIcons
                  name="check-box-outline-blank"
                  size={24}
                  color="gray"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </SimpleModal>

      {/* New Channels Section with Create and Delete actions */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Channels</Text>
        {channels.map((channel) => (
          <View
            key={channel.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <TouchableOpacity
              style={{ flex: 1 }}
              onPress={() =>
                router.push(
                  `/(users)/(tabs)/(teams)/(channels)/${channel.id}?teamId=${team.id}`
                )
              }
            >
              <Text style={styles.channelNameText}>{channel.name}</Text>
              <Text style={styles.channelDescText}>{channel.desc}</Text>
            </TouchableOpacity>
            {(isCurrentUserOwner || channel.createdBy === currentUser?.uid) && (
              <TouchableOpacity onPress={() => handleDeleteChannel(channel.id)}>
                <Feather name="trash" size={16} color="red" />
              </TouchableOpacity>
            )}
          </View>
        ))}
        {isCurrentUserOwner && (
          <TouchableOpacity
            style={[styles.actionButton, { marginTop: 16 }]}
            onPress={() => setIsChannelModalVisible(true)}
          >
            <Feather name="plus" size={18} color="#2563eb" />
            <Text style={[styles.editActionText, { marginLeft: 8 }]}>
              Create Channel
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Create Channel Modal */}
      <SimpleModal
        visible={isChannelModalVisible}
        title="Create Channel"
        onClose={() => setIsChannelModalVisible(false)}
        onConfirm={handleCreateChannel}
        confirmText="Create"
      >
        <View style={styles.modalContent}>
          <Text style={styles.inputLabel}>Channel Name</Text>
          <TextInput
            value={newChannelName}
            onChangeText={setNewChannelName}
            placeholder="Enter channel name"
            style={styles.textInput}
          />
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            value={newChannelDesc}
            onChangeText={setNewChannelDesc}
            placeholder="Enter channel description"
            style={styles.textInput}
          />
        </View>
      </SimpleModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  goBackButton: {
    marginTop: 16,
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  goBackButtonText: {
    color: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  sectionCard: {
    backgroundColor: "white",
    borderRadius: 8,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  teamInfoHeader: {
    alignItems: "center",
    marginBottom: 16,
  },
  teamAvatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  teamName: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
  },
  publicStatusContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  publicStatusText: {
    color: "#6b7280",
    marginLeft: 4,
  },
  teamDescription: {
    color: "#1f2937",
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  tag: {
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    margin: 4,
  },
  tagText: {
    fontSize: 14,
    color: "#4b5563",
  },
  infoSection: {
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 16,
    marginBottom: 16,
  },
  infoLabel: {
    color: "#6b7280",
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  memberItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    marginRight: 12,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontWeight: "500",
    fontSize: 16,
  },
  memberEmail: {
    color: "#6b7280",
    fontSize: 14,
  },
  ownerBadge: {
    backgroundColor: "#dbeafe",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  ownerBadgeText: {
    fontSize: 12,
    color: "#1d4ed8",
  },
  inviteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    backgroundColor: "#f3f4f6",
    padding: 12,
    borderRadius: 8,
  },
  inviteButtonText: {
    color: "#6b7280",
    marginLeft: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  editActionText: {
    color: "#2563eb",
    marginLeft: 8,
  },
  deleteActionText: {
    color: "#dc2626",
    marginLeft: 8,
  },
  modalContent: {
    marginTop: 16,
  },
  avatarPicker: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPickerText: {
    color: "#3b82f6",
    marginTop: 8,
  },
  inputLabel: {
    color: "#374151",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    height: 80,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    color: "#374151",
    marginRight: 8,
  },
  membershipButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  joinButton: {
    backgroundColor: "#DBEAFE", // Light blue background
  },
  leaveButton: {
    backgroundColor: "#FEE2E2", // Light red background
  },
  membershipButtonText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  joinButtonText: {
    color: "#2563EB", // Blue text for join
  },
  leaveButtonText: {
    color: "#DC2626", // Red text for leave
  },
  channelItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  channelNameText: { fontSize: 16, fontWeight: "500" },
  channelDescText: { fontSize: 14, color: "#6b7280" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    borderRadius: 8,
    padding: 16,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  modalButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 4,
  },
});
