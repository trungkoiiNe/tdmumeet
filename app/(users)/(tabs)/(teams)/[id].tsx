import { getAuth } from "@react-native-firebase/auth"
import { router, useLocalSearchParams } from "expo-router"
import { useCallback, useEffect, useState } from "react"
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput, // Import TextInput
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuthStore } from "@/stores/authStore"
import { useTeamStore } from "@/stores/teamStore"
import { useThemeStore } from "@/stores/themeStore"
import { darkTheme, lightTheme } from "@/utils/themes"
import { v4 as uuidv4 } from "uuid"
import pickupImage from "@/utils/avatar" // Import pickupImage

// Import components
import TeamSkeleton from "@/components/Teams/TeamSkeleton"
import TeamInfo from "@/components/Teams/TeamInfo"
import MemberList from "@/components/Teams/MemberList"
import ChannelList from "@/components/Teams/ChannelList"
import TeamEditModal from "@/components/Teams/TeamEditModal"
import SimpleModal from "@/components/Teams/SimpleModal"
import React from "react"

// Define interfaces for type safety
interface Team {
  id: string
  name: string
  desc: string
  avatar: string
  members: string[]
  ownerId: string
  tags: string[]
  isPublic: boolean
  createdAt: number
  updatedAt: number
}

interface Channel {
  id: string
  teamId: string
  name: string
  desc: string
  createdAt: number
  updatedAt: number
  createdBy: string
  isPrivate: boolean
  members: string[]
}

interface Member {
  id: string
  displayName?: string
  email?: string
  photoURL?: string
}

export default function TeamDetailsScreen() {
  const { id } = useLocalSearchParams()
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
  } = useTeamStore()

  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false)
  const [isCurrentUserMember, setIsCurrentUserMember] = useState<boolean>(false)
  const [isCurrentUserOwner, setIsCurrentUserOwner] = useState<boolean>(false)
  const [unreadChannels, setUnreadChannels] = useState<string[]>([])

  const auth = getAuth()
  const currentUser = auth.currentUser

  // Edit form state
  const [editName, setEditName] = useState<string>("")
  const [editDesc, setEditDesc] = useState<string>("")
  const [editAvatar, setEditAvatar] = useState<string>("")
  const [avatarChanged, setAvatarChanged] = useState<boolean>(false)
  const [editTags, setEditTags] = useState<string>("")
  const [editIsPublic, setEditIsPublic] = useState<boolean>(true)

  const { getUserByUid, changeAvatar } = useAuthStore()
  const { isDarkMode } = useThemeStore()
  const theme = isDarkMode ? darkTheme : lightTheme

  // Add state to store member information
  const [teamMembers, setTeamMembers] = useState<Member[]>([])

  // New states for channel creation modal
  const [isChannelModalVisible, setIsChannelModalVisible] = useState<boolean>(false)
  const [newChannelName, setNewChannelName] = useState<string>("")
  const [newChannelDesc, setNewChannelDesc] = useState<string>("")

  const fetchTeamDetails = useCallback(async () => {
    try {
      setLoading(true)
      const teamId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : ""
      const fetchedTeam = await getTeamById(teamId)

      if (fetchedTeam) {
        setTeam(fetchedTeam)

        // Check if current user is a member or owner
        if (currentUser) {
          setIsCurrentUserMember(fetchedTeam.members.includes(currentUser.uid))
          setIsCurrentUserOwner(fetchedTeam.ownerId === currentUser.uid)
        }

        // Initialize edit form with current values
        setEditName(fetchedTeam.name)
        setEditDesc(fetchedTeam.desc)
        setEditAvatar(fetchedTeam.avatar || "")
        setAvatarChanged(false) // Reset avatar changed flag
        setEditTags(fetchedTeam.tags.join(", "))
        setEditIsPublic(fetchedTeam.isPublic)

        // Fetch member details
        await fetchMemberDetails(fetchedTeam.members)
      }
    } catch (error) {
      console.error("Error fetching team details:", error)
      Alert.alert("Error", "Failed to load team details. Please try again.")
    } finally {
      setLoading(false)
    }
  }, [id, getTeamById, currentUser])

  // Add function to fetch member details
  const fetchMemberDetails = useCallback(
    async (memberIds: string[]) => {
      try {
        const memberPromises = memberIds.map(async (memberId) => {
          const userData = await getUserByUid(memberId)
          return {
            id: memberId,
            ...userData,
          }
        })

        const memberData = await Promise.all(memberPromises)
        setTeamMembers(memberData)
      } catch (error) {
        console.error("Error fetching member details:", error)
        Alert.alert("Error", "Failed to load member information.")
      }
    },
    [getUserByUid],
  )

  const handleEditTeam = useCallback(async () => {
    try {
      if (editName.trim() === "" || !team) return

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
      }

      await updateTeam(updatedTeam)
      setTeam(updatedTeam)
      setIsEditModalVisible(false)
    } catch (error) {
      console.error("Error updating team:", error)
      Alert.alert("Error", "Failed to update team information. Please try again.")
    }
  }, [team, editName, editDesc, editAvatar, editTags, editIsPublic, updateTeam])

  const confirmDelete = useCallback(() => {
    Alert.alert("Delete Team", "Are you sure you want to delete this team? This action cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const teamId = typeof id === "string" ? id : Array.isArray(id) ? id[0] : ""
            await deleteTeam(teamId)
            router.back()
          } catch (error) {
            console.error("Error deleting team:", error)
            Alert.alert("Error", "Failed to delete team. Please try again.")
          }
        },
      },
    ])
  }, [id, deleteTeam])

  const handlePickImage = useCallback(async () => {
    try {
      const base64Image = await pickupImage()
      if (base64Image) {
        const imageUri = `data:image/jpeg;base64,${base64Image}`
        await changeAvatar(imageUri)
        setEditAvatar(imageUri)
        setAvatarChanged(true)
      }
    } catch (error) {
      console.error("Error picking image:", error)
      Alert.alert("Error", "Failed to select image. Please try again.")
    }
  }, [changeAvatar])

  const handleJoinTeam = useCallback(async () => {
    try {
      if (currentUser && team) {
        await joinTeam(team.id, currentUser.uid)
        // Refresh team details after joining
        fetchTeamDetails()
      }
    } catch (error) {
      console.error("Error joining team:", error)
      Alert.alert("Error", "Failed to join team. Please try again.")
    }
  }, [currentUser, team, joinTeam, fetchTeamDetails])

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
              await leaveTeam(team.id, currentUser.uid)
              // Refresh team details after leaving
              router.back()
              // fetchTeamDetails()
            } catch (error) {
              console.error("Error leaving team:", error)
              Alert.alert("Error", "Failed to leave team. Please try again.")
            }
          },
        },
      ])
    }
  }, [currentUser, team, leaveTeam, fetchTeamDetails])

  const handleCreateChannel = useCallback(async () => {
    try {
      if (!newChannelName.trim() || !team || !currentUser) return
      const channelId = uuidv4()
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
      }
      await addChannel(newChannel)
      fetchChannels(team.id)
      // Reset and close modal
      setNewChannelName("")
      setNewChannelDesc("")
      setIsChannelModalVisible(false)
    } catch (error) {
      console.error("Error creating channel:", error)
      Alert.alert("Error", "Failed to create channel. Please try again.")
    }
  }, [newChannelName, newChannelDesc, team, currentUser, addChannel, fetchChannels])

  const handleDeleteChannel = useCallback(
    async (channelId: string) => {
      try {
        if (!team) return
        await deleteChannel(team.id, channelId)
        fetchChannels(team.id)
      } catch (error) {
        console.error("Error deleting channel:", error)
        Alert.alert("Error", "Failed to delete channel. Please try again.")
      }
    },
    [team, deleteChannel, fetchChannels],
  )

  const handleKickMember = useCallback(
    async (memberId: string) => {
      if (team) {
        Alert.alert("Remove Member", "Are you sure you want to remove this member?", [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                await kickTeamMember(team.id, memberId)
                // Refresh team details after kicking
                fetchTeamDetails()
              } catch (error) {
                console.error("Error kicking member:", error)
              }
            },
          },
        ])
      }
    },
    [team, kickTeamMember, fetchTeamDetails],
  )

  const checkUnreadMessages = useCallback(async () => {
    if (!team || !currentUser) return

    try {
      const unreadMessages = await fetchUnreadMessages(currentUser.uid)

      // Filter messages by this team and get their channel IDs
      const teamUnreadMessages = unreadMessages.filter((msg) => msg.teamId === team.id)
      const channelsWithUnread = Array.from(new Set(teamUnreadMessages.map((msg) => msg.channelId)))

      setUnreadChannels(channelsWithUnread)
    } catch (error) {
      console.error("Error checking unread channel messages:", error)
    }
  }, [team, currentUser, fetchUnreadMessages])

  useEffect(() => {
    fetchTeamDetails()
  }, [fetchTeamDetails])

  // New effect to fetch channels once team details are loaded
  useEffect(() => {
    if (team) {
      try {
        fetchChannels(team.id)
      } catch (error) {
        console.error("Error fetching channels:", error)
        Alert.alert("Error", "Failed to load channels. Please try again.")
      }
    }
  }, [team, fetchChannels])

  // Update effect to also check for unread messages
  useEffect(() => {
    if (team) {
      checkUnreadMessages()

      // Set up interval to periodically check for unread messages
      const intervalId = setInterval(checkUnreadMessages, 15000) // every 15 seconds

      return () => clearInterval(intervalId)
    }
  }, [team, checkUnreadMessages])

  if (loading) {
    return <TeamSkeleton />
  }

  if (!team) {
    return (
      <View style={[styles.notFoundContainer, { backgroundColor: theme.backgroundColor }]}>
        <Text style={{ color: theme.textColor }}>Team not found</Text>
        <TouchableOpacity style={styles.goBackButton} onPress={() => router.back()}>
          <Text style={styles.goBackButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={[styles.header, { backgroundColor: theme.cardBackgroundColor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Team Details</Text>
      </View>

      {/* Team info section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackgroundColor }]}>
        <TeamInfo
          team={team}
          isCurrentUserOwner={isCurrentUserOwner}
          isCurrentUserMember={isCurrentUserMember}
          onJoin={handleJoinTeam}
          onLeave={handleLeaveTeam}
          theme={theme}
        />
      </View>

      {/* Team members section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackgroundColor }]}>
        <MemberList
          members={teamMembers}
          ownerId={team.ownerId}
          isCurrentUserOwner={isCurrentUserOwner}
          onKickMember={handleKickMember}
          theme={theme} currentUserId={currentUser?.uid || ""} />
      </View>

      {/* Admin actions - only show if current user is owner */}
      {isCurrentUserOwner && (
        <View style={[styles.sectionCard, { backgroundColor: theme.cardBackgroundColor }]}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>Admin Actions</Text>

          <TouchableOpacity style={styles.actionButton} onPress={() => setIsEditModalVisible(true)}>
            <Ionicons name="pencil" size={18} color={theme.primaryColor} />
            <Text style={[styles.editActionText, { color: theme.primaryColor }]}>Edit Team Info</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={confirmDelete}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
            <Text style={styles.deleteActionText}>Delete Team</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Channels Section */}
      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackgroundColor }]}>
        <ChannelList
          channels={channels}
          teamId={team.id}
          isCurrentUserOwner={isCurrentUserOwner}
          currentUserId={currentUser?.uid || null}
          onDeleteChannel={handleDeleteChannel}
          onCreateChannel={() => setIsChannelModalVisible(true)}
          unreadChannels={unreadChannels}
          theme={theme}
        />
      </View>

      {/* Team Edit Modal */}
      <TeamEditModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
        onConfirm={handleEditTeam}
        confirmText="Save Changes"
        theme={theme}
        editName={editName}
        setEditName={setEditName}
        editDesc={editDesc}
        setEditDesc={setEditDesc}
        editTags={editTags}
        setEditTags={setEditTags}
        editIsPublic={editIsPublic}
        setEditIsPublic={setEditIsPublic}
        editAvatar={editAvatar}
        handlePickImage={handlePickImage}
      />

      {/* Create Channel Modal */}
      <SimpleModal
        visible={isChannelModalVisible}
        title="Create Channel"
        onClose={() => setIsChannelModalVisible(false)}
        onConfirm={handleCreateChannel}
        confirmText="Create"
        theme={theme}
      >
        <View style={styles.modalContent}>
          <Text style={[styles.inputLabel, { color: theme.textColor }]}>Channel Name</Text>
          <TextInput
            value={newChannelName}
            onChangeText={setNewChannelName}
            placeholder="Enter channel name"
            placeholderTextColor={theme.tertiaryTextColor}
            style={[styles.textInput, { borderColor: theme.inputBorderColor, color: theme.textColor }]}
          />
          <Text style={[styles.inputLabel, { color: theme.textColor }]}>Description</Text>
          <TextInput
            value={newChannelDesc}
            onChangeText={setNewChannelDesc}
            placeholder="Enter channel description"
            placeholderTextColor={theme.tertiaryTextColor}
            style={[styles.textInput, { borderColor: theme.inputBorderColor, color: theme.textColor }]}
          />
        </View>
      </SimpleModal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  notFoundContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
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
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 8,
  },
  sectionCard: {
    borderRadius: 16,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  editActionText: {
    marginLeft: 8,
    fontWeight: "500",
  },
  deleteActionText: {
    color: "#DC2626",
    marginLeft: 8,
    fontWeight: "500",
  },
  modalContent: {
    marginTop: 16,
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
})
