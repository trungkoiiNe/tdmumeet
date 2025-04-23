"use client"

import { useEffect, useState, useCallback } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { Feather } from "@expo/vector-icons"
import { FlashList } from "@shopify/flash-list"
import { getAuth } from "@react-native-firebase/auth"
import { useTeamStore } from "@/stores/teamStore"
import { useThemeStore } from "@/stores/themeStore"
import { darkTheme, lightTheme } from "@/utils/themes"

// Import components
import TeamItem from "@/components/Teams/TeamItem"
import EmptyTeamsState from "@/components/Teams/EmptyTeamState"
import TeamListSkeleton from "@/components/Teams/TeamListSkeleton"
import CreateTeamModal from "@/components/Teams/CreateTeamModal"
import CustomModal from "@/components/CustomModal"
import 'react-native-get-random-values';
import { v4 as uuidv4 } from "uuid"
import React from "react"

export default function TeamsScreen() {
  const { teams, fetchTeams, addTeam, deleteTeam, fetchUnreadMessages } = useTeamStore()
  const [isAddModalVisible, setIsAddModalVisible] = useState(false)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [teamToDelete, setTeamToDelete] = useState(null)
  const [deleteConfirmInput, setDeleteConfirmInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [unreadTeams, setUnreadTeams] = useState<string[]>([])

  const { isDarkMode } = useThemeStore()
  const theme = isDarkMode ? darkTheme : lightTheme

  const auth = getAuth()
  const user = auth.currentUser

  // Load teams on initial render
  useEffect(() => {
    const loadTeams = async () => {
      setLoading(true)
      try {
        await fetchTeams()
      } catch (error) {
        console.error("Error loading teams:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTeams()
  }, [fetchTeams])

  // Check for unread messages and update unreadTeams state
  useEffect(() => {
    const checkUnreadMessages = async () => {
      if (!user) return

      try {
        const unreadMessages = await fetchUnreadMessages(user.uid)

        // Extract unique team IDs that have unread messages
        const teamsWithUnread = Array.from(new Set(unreadMessages.map((msg) => msg.teamId)))
        setUnreadTeams(teamsWithUnread)
      } catch (error) {
        console.error("Error checking unread messages:", error)
      }
    }

    checkUnreadMessages()
    const intervalId = setInterval(checkUnreadMessages, 30000) // every 30 seconds

    return () => clearInterval(intervalId)
  }, [user, fetchUnreadMessages])

  const handleAddTeam = useCallback(
    async (teamData: { name: string; desc: string; avatar: string; tags: string; isPublic: boolean }) => {
      try {
        if (!user) return

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
        }

        await addTeam(newTeam)
        setIsAddModalVisible(false)
      } catch (error) {
        console.error("Error adding team:", error)
      }
    },
    [user, addTeam],
  )

  const confirmDeleteTeam = useCallback((team) => {
    setTeamToDelete(team)
    setDeleteConfirmInput("")
    setDeleteModalVisible(true)
  }, [])

  const handleDeleteTeam = useCallback(async () => {
    if (teamToDelete) {
      try {
        await deleteTeam(teamToDelete.id)
        setDeleteModalVisible(false)
        setTeamToDelete(null)
        setDeleteConfirmInput("")
      } catch (error) {
        console.error("Error deleting team:", error)
      }
    }
  }, [teamToDelete, deleteTeam])

  const renderTeamItem = useCallback(
    ({ item }) => (
      <TeamItem
        team={item}
        hasUnread={unreadTeams.includes(item.id)}
        isOwner={item.ownerId === user?.uid}
        onDelete={() => confirmDeleteTeam(item)}
      // theme={theme}
      />
    ),
    [unreadTeams, user?.uid, confirmDeleteTeam, theme],
  )

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textColor }]}>Teams</Text>
        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={[styles.addButton, { backgroundColor: theme.primaryColor }]}
          activeOpacity={0.7}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <TeamListSkeleton />
      ) : (
        <FlashList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          estimatedItemSize={120}
          contentContainerStyle={styles.listContainer}
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
        confirmationValue={deleteConfirmInput}
        onChangeConfirmationValue={setDeleteConfirmInput}
        confirmDisabled={deleteConfirmInput !== (teamToDelete?.name || "")}
        onClose={() => {
          setDeleteModalVisible(false)
          setDeleteConfirmInput("")
        }}
        onConfirm={handleDeleteTeam}
      />
    </View>
  )
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
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  listContainer: {
    paddingBottom: 20,
  },
})
