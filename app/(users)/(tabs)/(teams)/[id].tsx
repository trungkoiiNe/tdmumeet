import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { getAuth } from "@react-native-firebase/auth";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useAuthStore } from "@/stores/authStore";
import { useTeamStore } from "@/stores/teamStore";
import pickupImage from "@/utils/avatar";
import { useThemeStore } from "@/stores/themeStore";
import { darkTheme, lightTheme } from "@/utils/themes";
import { Animated, KeyboardAvoidingView, Platform } from "react-native";

// Define interfaces for type safety
interface Team {
  id: string;
  name: string;
  desc: string;
  avatar: string;
  members: string[];
  ownerId: string;
  tags: string[];
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

interface Channel {
  id: string;
  teamId: string;
  name: string;
  desc: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  isPrivate: boolean;
  members: string[];
}

interface Member {
  id: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

interface SimpleModalProps {
  visible: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  children: React.ReactNode;
}

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

// Extract SimpleModal component
const SimpleModal: React.FC<SimpleModalProps> = ({
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
            <TouchableOpacity onPress={onClose} style={styles.modalButtons}>
              <Text>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onConfirm} style={styles.modalButtons}>
              <Text>{confirmText || "Confirm"}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Extract TeamInfo component
const TeamInfo: React.FC<{
  team: Team;
  isCurrentUserOwner: boolean;
  isCurrentUserMember: boolean;
  onJoin: () => void;
  onLeave: () => void;
}> = ({ team, isCurrentUserOwner, isCurrentUserMember, onJoin, onLeave }) => {
  return (
    <>
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

        {!isCurrentUserOwner && (
          <TouchableOpacity
            style={[
              styles.membershipButton,
              isCurrentUserMember ? styles.leaveButton : styles.joinButton,
            ]}
            onPress={isCurrentUserMember ? onLeave : onJoin}
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
    </>
  );
};

// Extract MemberList component
const MemberList: React.FC<{
  members: Member[];
  ownerId: string;
  isCurrentUserOwner: boolean;
  onKickMember?: (memberId: string) => void;
}> = ({ members, ownerId, isCurrentUserOwner, onKickMember }) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Team Members ({members.length})</Text>

      {members.map((member, index) => (
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
          {member.id === ownerId && (
            <View style={styles.ownerBadge}>
              <Text style={styles.ownerBadgeText}>Owner</Text>
            </View>
          )}
          {isCurrentUserOwner && member.id !== ownerId && (
            <TouchableOpacity
              onPress={() => onKickMember && onKickMember(member.id)}
              style={{ marginLeft: 8 }}
            >
              <Feather name="user-minus" size={16} color="red" />
            </TouchableOpacity>
          )}
        </View>
      ))}

      {isCurrentUserOwner && (
        <TouchableOpacity style={styles.inviteButton}>
          <Feather name="user-plus" size={18} color="gray" />
          <Text style={styles.inviteButtonText}>Invite Member</Text>
        </TouchableOpacity>
      )}
    </>
  );
};

// Extract ChannelList component
const ChannelList: React.FC<{
  channels: Channel[];
  teamId: string;
  isCurrentUserOwner: boolean;
  currentUserId: string | null;
  onDeleteChannel: (channelId: string) => void;
  onCreateChannel: () => void;
  unreadChannels: string[];
}> = ({
  channels,
  teamId,
  isCurrentUserOwner,
  currentUserId,
  onDeleteChannel,
  onCreateChannel,
  unreadChannels,
}) => {
  return (
    <>
      <Text style={styles.sectionTitle}>Channels</Text>
      {channels.map((channel) => {
        const hasUnread = unreadChannels.includes(channel.id);

        return (
          <View
            key={channel.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 10,
            }}
          >
            <TouchableOpacity
              style={[
                styles.channelItem,
                hasUnread && styles.channelItemWithUnread,
              ]}
              onPress={() =>
                router.push(
                  `/(users)/(tabs)/(teams)/(channels)/${channel.id}?teamId=${teamId}`
                )
              }
            >
              <View style={styles.channelIconContainer}>
                <Feather
                  name={channel.isPrivate ? "lock" : "message-square"}
                  size={16}
                  color={hasUnread ? "#3b82f6" : "#6b7280"}
                />
                {hasUnread && <View style={styles.channelUnreadDot} />}
              </View>

              <View style={styles.channelTextContainer}>
                <Text
                  style={[
                    styles.channelNameText,
                    hasUnread && styles.channelNameUnread,
                  ]}
                >
                  {channel.name}
                </Text>
                <Text style={styles.channelDescText}>{channel.desc}</Text>
              </View>
            </TouchableOpacity>

            {(isCurrentUserOwner || channel.createdBy === currentUserId) && (
              <TouchableOpacity
                style={styles.channelDeleteButton}
                onPress={() => onDeleteChannel(channel.id)}
              >
                <Feather name="trash" size={16} color="red" />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
      {isCurrentUserOwner && (
        <TouchableOpacity
          style={[styles.actionButton, { marginTop: 16 }]}
          onPress={onCreateChannel}
        >
          <Feather name="plus" size={18} color="#2563eb" />
          <Text style={[styles.editActionText, { marginLeft: 8 }]}>
            Create Channel
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

const TeamEditModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  children: React.ReactNode;
  theme: any;
}> = ({ visible, onClose, onConfirm, confirmText, children, theme }) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: theme.cardBackgroundColor },
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              Edit Team
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.textColor} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>{children}</ScrollView>
          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={{ color: theme.secondaryTextColor }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={[
                styles.confirmButton,
                { backgroundColor: theme.primaryColor },
              ]}
            >
              <Text style={{ color: "#fff" }}>
                {confirmText || "Save Changes"}
              </Text>
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
    fetchChannels,
    addChannel,
    deleteChannel,
    channels,
    kickTeamMember,
    fetchUnreadMessages,
    getUnreadCountForChannel,
  } = useTeamStore();

  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isCurrentUserMember, setIsCurrentUserMember] =
    useState<boolean>(false);
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState<boolean>(false);
  const [unreadChannels, setUnreadChannels] = useState<string[]>([]);

  const auth = getAuth();
  const currentUser = auth.currentUser;

  // Edit form state
  const [editName, setEditName] = useState<string>("");
  const [editDesc, setEditDesc] = useState<string>("");
  const [editAvatar, setEditAvatar] = useState<string>("");
  const [avatarChanged, setAvatarChanged] = useState<boolean>(false);
  const [editTags, setEditTags] = useState<string>("");
  const [editIsPublic, setEditIsPublic] = useState<boolean>(true);

  const { getUserByUid, changeAvatar } = useAuthStore();
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Add state to store member information
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);

  // New states for channel creation modal
  const [isChannelModalVisible, setIsChannelModalVisible] =
    useState<boolean>(false);
  const [newChannelName, setNewChannelName] = useState<string>("");
  const [newChannelDesc, setNewChannelDesc] = useState<string>("");

  const fetchTeamDetails = useCallback(async () => {
    try {
      setLoading(true);
      const teamId =
        typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
      const fetchedTeam = await getTeamById(teamId);

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
        setEditAvatar(fetchedTeam.avatar || "");
        setAvatarChanged(false); // Reset avatar changed flag
        setEditTags(fetchedTeam.tags.join(", "));
        setEditIsPublic(fetchedTeam.isPublic);

        // Fetch member details
        await fetchMemberDetails(fetchedTeam.members);
      }
    } catch (error) {
      console.error("Error fetching team details:", error);
      Alert.alert("Error", "Failed to load team details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [id, getTeamById, currentUser]);

  // Add function to fetch member details
  const fetchMemberDetails = useCallback(
    async (memberIds: string[]) => {
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
        Alert.alert("Error", "Failed to load member information.");
      }
    },
    [getUserByUid]
  );

  const handleEditTeam = useCallback(async () => {
    try {
      if (editName.trim() === "" || !team) return;

      const updatedTeam: Team = {
        ...team,
        name: editName,
        desc: editDesc,
        avatar: editAvatar || "", // Provide empty string as fallback
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
    } catch (error) {
      console.error("Error updating team:", error);
      Alert.alert(
        "Error",
        "Failed to update team information. Please try again."
      );
    }
  }, [
    team,
    editName,
    editDesc,
    editAvatar,
    editTags,
    editIsPublic,
    updateTeam,
  ]);

  const confirmDelete = useCallback(() => {
    Alert.alert(
      "Delete Team",
      "Are you sure you want to delete this team? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const teamId =
                typeof id === "string" ? id : Array.isArray(id) ? id[0] : "";
              await deleteTeam(teamId);
              router.back();
            } catch (error) {
              console.error("Error deleting team:", error);
              Alert.alert("Error", "Failed to delete team. Please try again.");
            }
          },
        },
      ]
    );
  }, [id, deleteTeam]);

  const handlePickImage = useCallback(async () => {
    try {
      const base64Image = await pickupImage();
      if (base64Image) {
        const imageUri = `data:image/jpeg;base64,${base64Image}`;
        await changeAvatar(imageUri);
        setEditAvatar(imageUri);
        setAvatarChanged(true);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to select image. Please try again.");
    }
  }, [changeAvatar]);

  const handleJoinTeam = useCallback(async () => {
    try {
      if (currentUser && team) {
        await joinTeam(team.id, currentUser.uid);
        // Refresh team details after joining
        fetchTeamDetails();
      }
    } catch (error) {
      console.error("Error joining team:", error);
      Alert.alert("Error", "Failed to join team. Please try again.");
    }
  }, [currentUser, team, joinTeam, fetchTeamDetails]);

  const handleLeaveTeam = useCallback(() => {
    if (currentUser && team) {
      // Confirm before leaving team
      Alert.alert("Leave Team", "Are you sure you want to leave this team?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              await leaveTeam(team.id, currentUser.uid);
              // Refresh team details after leaving
              fetchTeamDetails();
            } catch (error) {
              console.error("Error leaving team:", error);
              Alert.alert("Error", "Failed to leave team. Please try again.");
            }
          },
        },
      ]);
    }
  }, [currentUser, team, leaveTeam, fetchTeamDetails]);

  const handleCreateChannel = useCallback(async () => {
    try {
      if (!newChannelName.trim() || !team || !currentUser) return;
      const channelId = uuidv4();
      const newChannel: Channel = {
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
    } catch (error) {
      console.error("Error creating channel:", error);
      Alert.alert("Error", "Failed to create channel. Please try again.");
    }
  }, [
    newChannelName,
    newChannelDesc,
    team,
    currentUser,
    addChannel,
    fetchChannels,
  ]);

  const handleDeleteChannel = useCallback(
    async (channelId: string) => {
      try {
        if (!team) return;
        await deleteChannel(team.id, channelId);
        fetchChannels(team.id);
      } catch (error) {
        console.error("Error deleting channel:", error);
        Alert.alert("Error", "Failed to delete channel. Please try again.");
      }
    },
    [team, deleteChannel, fetchChannels]
  );

  const handleKickMember = useCallback(
    async (memberId: string) => {
      if (team) {
        Alert.alert(
          "Remove Member",
          "Are you sure you want to remove this member?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Remove",
              style: "destructive",
              onPress: async () => {
                try {
                  await kickTeamMember(team.id, memberId);
                  // Refresh team details after kicking
                  fetchTeamDetails();
                } catch (error) {
                  console.error("Error kicking member:", error);
                }
              },
            },
          ]
        );
      }
    },
    [team, kickTeamMember, fetchTeamDetails]
  );

  const checkUnreadMessages = useCallback(async () => {
    if (!team || !currentUser) return;

    try {
      const unreadMessages = await fetchUnreadMessages(currentUser.uid);

      // Filter messages by this team and get their channel IDs
      const teamUnreadMessages = unreadMessages.filter(
        (msg) => msg.teamId === team.id
      );
      const channelsWithUnread = Array.from(
        new Set(teamUnreadMessages.map((msg) => msg.channelId))
      );

      setUnreadChannels(channelsWithUnread);
    } catch (error) {
      console.error("Error checking unread channel messages:", error);
    }
  }, [team, currentUser, fetchUnreadMessages]);

  useEffect(() => {
    fetchTeamDetails();
  }, [fetchTeamDetails]);

  // New effect to fetch channels once team details are loaded
  useEffect(() => {
    if (team) {
      try {
        fetchChannels(team.id);
      } catch (error) {
        console.error("Error fetching channels:", error);
        Alert.alert("Error", "Failed to load channels. Please try again.");
      }
    }
  }, [team, fetchChannels]);

  // Update effect to also check for unread messages
  useEffect(() => {
    if (team) {
      checkUnreadMessages();

      // Set up interval to periodically check for unread messages
      const intervalId = setInterval(checkUnreadMessages, 15000); // every 15 seconds

      return () => clearInterval(intervalId);
    }
  }, [team, checkUnreadMessages]);

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
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>
          Team Details
        </Text>
      </View>

      {/* Team info section */}
      <View style={styles.sectionCard}>
        <TeamInfo
          team={team}
          isCurrentUserOwner={isCurrentUserOwner}
          isCurrentUserMember={isCurrentUserMember}
          onJoin={handleJoinTeam}
          onLeave={handleLeaveTeam}
        />
      </View>

      {/* Team members section */}
      <View style={styles.sectionCard}>
        <MemberList
          members={teamMembers}
          ownerId={team.ownerId}
          isCurrentUserOwner={isCurrentUserOwner}
          onKickMember={handleKickMember}
        />
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

      {/* Channels Section */}
      <View style={styles.sectionCard}>
        <ChannelList
          channels={channels}
          teamId={team.id}
          isCurrentUserOwner={isCurrentUserOwner}
          currentUserId={currentUser?.uid || null}
          onDeleteChannel={handleDeleteChannel}
          onCreateChannel={() => setIsChannelModalVisible(true)}
          unreadChannels={unreadChannels}
        />
      </View>

      <TeamEditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onConfirm={handleEditTeam}
        confirmText="Save Changes"
        theme={theme}
      >
        <View style={styles.modalContent}>
          <TouchableOpacity
            onPress={handlePickImage}
            style={styles.avatarPicker}
          >
            <View
              style={[
                styles.avatarContainer,
                { borderWidth: 1, borderColor: theme.inputBorderColor },
              ]}
            >
              {editAvatar ? (
                <Image
                  source={{ uri: editAvatar }}
                  style={styles.avatarImage}
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
              style={[styles.avatarPickerText, { color: theme.primaryColor }]}
            >
              Change Avatar
            </Text>
          </TouchableOpacity>
          <Text style={[styles.inputLabel, { color: theme.textColor }]}>
            Team Name
          </Text>
          <TextInput
            value={editName}
            onChangeText={setEditName}
            placeholder="Enter team name"
            placeholderTextColor={theme.tertiaryTextColor}
            style={[
              styles.textInput,
              { borderColor: theme.inputBorderColor, color: theme.textColor },
            ]}
          />
          <Text style={[styles.inputLabel, { color: theme.textColor }]}>
            Description
          </Text>
          <TextInput
            value={editDesc}
            onChangeText={setEditDesc}
            placeholder="Enter team description"
            multiline
            numberOfLines={3}
            placeholderTextColor={theme.tertiaryTextColor}
            style={[
              styles.textAreaInput,
              { borderColor: theme.inputBorderColor, color: theme.textColor },
            ]}
          />
          <Text style={[styles.inputLabel, { color: theme.textColor }]}>
            Tags (comma separated)
          </Text>
          <TextInput
            value={editTags}
            onChangeText={setEditTags}
            placeholder="design, development, marketing"
            placeholderTextColor={theme.tertiaryTextColor}
            style={[
              styles.textInput,
              { borderColor: theme.inputBorderColor, color: theme.textColor },
            ]}
          />
          <View style={styles.checkboxContainer}>
            <Text style={[styles.checkboxLabel, { color: theme.textColor }]}>
              Public Team
            </Text>
            <TouchableOpacity onPress={() => setEditIsPublic(!editIsPublic)}>
              {editIsPublic ? (
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
        </View>
      </TeamEditModal>

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
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  channelItemWithUnread: {
    backgroundColor: "rgba(59, 130, 246, 0.08)",
  },
  channelIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  channelUnreadDot: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#3b82f6",
    borderWidth: 1.5,
    borderColor: "white",
  },
  channelTextContainer: {
    flex: 1,
  },
  channelNameText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#374151",
  },
  channelNameUnread: {
    fontWeight: "700",
    color: "#1f2937",
  },
  channelDescText: {
    fontSize: 14,
    color: "#6b7280",
  },
  channelDeleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  // modalContent: {
  //   maxHeight: 300,
  // },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  cancelButton: {
    padding: 10,
    marginRight: 12,
  },
  confirmButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 16,
  },
  // avatarPicker: {
  //   alignItems: "center",
  //   marginBottom: 16,
  // },
  // avatarContainer: {
  //   width: 80,
  //   height: 80,
  //   borderRadius: 40,
  //   overflow: "hidden",
  //   alignItems: "center",
  //   justifyContent: "center",
  //   backgroundColor: "#e5e7eb",
  // },
  // avatarImage: {
  //   width: "100%",
  //   height: "100%",
  // },
  // avatarPickerText: {
  //   marginTop: 8,
  //   fontWeight: "500",
  // },
});
