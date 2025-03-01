import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { getAuth } from "@react-native-firebase/auth";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useTeamStore } from "../../../../../stores/teamStore";
import { MMKV } from "react-native-mmkv";

export default function ChannelDetailsScreen() {
  // Get channel id and teamId from URL parameters
  const params = useLocalSearchParams();
  const channelId = Array.isArray(params.id)
    ? params.id[0]
    : (params.id as string);
  const teamId = Array.isArray(params.teamId)
    ? params.teamId[0]
    : (params.teamId as string);
  const { getChannelById, deleteChannel, joinChannel, leaveChannel } =
    useTeamStore();
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const currentUser = auth?.currentUser;

  useEffect(() => {
    if (channelId && teamId) {
      fetchChannel();
    }
  }, [channelId, teamId]);

  const fetchChannel = async () => {
    setLoading(true);
    const fetched = await getChannelById(teamId, channelId);
    setChannel(fetched);
    setLoading(false);
  };

  // Delete channel
  const handleDelete = () => {
    Alert.alert(
      "Delete Channel",
      "Are you sure you want to delete this channel?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteChannel(teamId, channelId);
            router.back();
          },
        },
      ]
    );
  };

  // Toggle join/leave for private channels
  const handleJoinLeave = async () => {
    if (!channel || !currentUser) return;
    if (channel.isPrivate) {
      if (channel.members && channel.members.includes(currentUser.uid)) {
        await leaveChannel(teamId, channelId, currentUser.uid);
      } else {
        await joinChannel(teamId, channelId, currentUser.uid);
      }
      fetchChannel();
    }
  };

  if (loading) {
    return <ActivityIndicator style={styles.loading} />;
  }

  if (!channel) {
    return (
      <View style={styles.container}>
        <Text>Channel not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Channel Details</Text>
      </View>

      {/* Channel info */}
      <View style={styles.content}>
        <Text style={styles.title}>{channel.name}</Text>
        <Text style={styles.desc}>{channel.desc}</Text>
        <Text style={styles.info}>
          Created: {new Date(channel.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.info}>
          Updated: {new Date(channel.updatedAt).toLocaleDateString()}
        </Text>

        {/* Join/Leave button for private channels */}
        {channel.isPrivate && currentUser && (
          <TouchableOpacity onPress={handleJoinLeave} style={styles.button}>
            <Text style={styles.buttonText}>
              {channel.members?.includes(currentUser.uid)
                ? "Leave Channel"
                : "Join Channel"}
            </Text>
          </TouchableOpacity>
        )}

        {/* Delete channel: visible if current user is the creator */}
        {channel.createdBy === currentUser?.uid && (
          <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
            <Feather name="trash" size={18} color="red" />
            <Text style={styles.deleteText}> Delete Channel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f9fafb",
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 16,
  },
  content: {
    // ...existing code...
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  desc: {
    fontSize: 16,
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "500",
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
  },
  deleteText: {
    color: "#dc2626",
    marginLeft: 8,
  },
  backButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    alignItems: "center",
  },
});
