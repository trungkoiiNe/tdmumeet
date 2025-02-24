import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  FlatList,
  StyleSheet,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../../../stores/stores";
import auth from "@react-native-firebase/auth";
import { useAuthStore } from "../../../../stores/authStore";
export default function TeamDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTeamById, subscribeToTeam, getTeamMeetings, joinTeam } =
    useStore();
  const [team, setTeam] = useState(null);
  const [meetings, setMeetings] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [error, setError] = useState("");
  const { signOut } = useAuthStore();
  useEffect(() => {
    if (!id) return;
    async function fetchTeam() {
      setLoadingTeam(true);
      const teamData = await getTeamById(id);
      if (!teamData) {
        setError("Team not found");
      }
      setTeam(teamData);
      setLoadingTeam(false);
    }
    fetchTeam();

    const unsubscribeTeam = subscribeToTeam(id, (updatedTeam) => {
      setTeam(updatedTeam);
    });

    return () => {
      if (unsubscribeTeam) unsubscribeTeam();
    };
  }, [id]);

  useEffect(() => {
    if (!id) return;
    async function fetchMeetings() {
      setLoadingMeetings(true);
      const teamMeetings = await getTeamMeetings(id);
      setMeetings(teamMeetings);
      setLoadingMeetings(false);
    }
    fetchMeetings();
  }, [id]);

  const handleJoin = async () => {
    try {
      if (team?.inviteCode) {
        await joinTeam(team.inviteCode);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const currentUser = auth().currentUser;
  const isMember = team?.members?.includes(currentUser?.uid);

  if (loadingTeam) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#32409A" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
        <Button title="Go Back" onPress={() => router.back()} />
        <Button title="Signout" onPress={() => signOut()} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{team.name}</Text>
        <Text style={styles.description}>{team.description}</Text>
        <Text style={styles.info}>Created by: {team.createdBy}</Text>
        <Text style={styles.info}>Members: {team.members?.length}</Text>

        {!isMember && <Button title="Join Team" onPress={handleJoin} />}
      </View>
      <View style={styles.meetingsSection}>
        <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
        {loadingMeetings ? (
          <ActivityIndicator size="small" color="#32409A" />
        ) : meetings.length > 0 ? (
          <FlatList
            data={meetings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.meetingItem}>
                <Text style={styles.meetingTitle}>
                  {item.title || "Meeting"}
                </Text>
                <Text>{new Date(item.endTime).toLocaleString()}</Text>
              </View>
            )}
          />
        ) : (
          <Text>No upcoming meetings</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F8F9FA" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: "bold", color: "#32409A" },
  description: { fontSize: 16, marginTop: 8, color: "#666" },
  info: { fontSize: 14, marginTop: 4, color: "#444" },
  meetingsSection: { marginTop: 16 },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#32409A",
    marginBottom: 8,
  },
  meetingItem: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  meetingTitle: { fontSize: 16, fontWeight: "bold", color: "#32409A" },
});
