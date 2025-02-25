import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Button,
  StyleSheet,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useStore } from "../../../../stores/stores";
import auth from "@react-native-firebase/auth";
import { useAuthStore } from "../../../../stores/authStore";
import { FlashList } from "@shopify/flash-list";
import { UserData } from "../../../../types";
import ContentLoader, { Rect } from "react-content-loader/native";

// Add a new skeleton loader component for Team Details
const TeamDetailsLoader = () => {
  const screenWidth = Dimensions.get("window").width;
  return (
    <ScrollView style={styles.container}>
      {/* Header Skeleton */}
      <ContentLoader
        speed={2}
        width={screenWidth - 32}
        height={120}
        viewBox={`0 0 ${screenWidth - 32} 120`}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
        style={{ marginBottom: 16 }}
      >
        <Rect x="0" y="10" rx="5" ry="5" width={screenWidth - 32} height="30" />
        <Rect
          x="0"
          y="50"
          rx="5"
          ry="5"
          width={screenWidth - 100}
          height="15"
        />
        <Rect
          x="0"
          y="70"
          rx="5"
          ry="5"
          width={screenWidth - 220}
          height="15"
        />
        <Rect
          x="0"
          y="90"
          rx="5"
          ry="5"
          width={screenWidth - 180}
          height="15"
        />
      </ContentLoader>

      {/* Members Skeleton */}
      <ContentLoader
        speed={2}
        width={screenWidth - 32}
        height={100}
        viewBox={`0 0 ${screenWidth - 32} 100`}
        backgroundColor="#f3f3f3"
        foregroundColor="#ecebeb"
      >
        <Rect x="0" y="10" rx="5" ry="5" width={screenWidth - 32} height="20" />
        <Rect
          x="0"
          y="40"
          rx="5"
          ry="5"
          width={screenWidth - 120}
          height="15"
        />
        <Rect
          x="0"
          y="60"
          rx="5"
          ry="5"
          width={screenWidth - 180}
          height="15"
        />
      </ContentLoader>
    </ScrollView>
  );
};

export default function TeamDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTeamById, joinTeam, getUserById } = useStore();
  const [team, setTeam] = useState(null);
  const [membersDetails, setMembersDetails] = useState<any[]>([]);
  const [meetings, setMeetings] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [loadingMeetings, setLoadingMeetings] = useState(true);
  const [error, setError] = useState("");
  const { signOut } = useAuthStore();

  useEffect(() => {
    if (!id) return;
    async function fetchTeam() {
      setLoadingTeam(true);
      const teamData = await getTeamById(typeof id === "string" ? id : id[0]);
      if (!teamData) {
        setError("Team not found");
      }
      setTeam(teamData);
      setLoadingTeam(false);
    }
    fetchTeam();
  }, [id, getTeamById]);

  useEffect(() => {
    if (team?.members?.length) {
      setLoadingMembers(true);
      Promise.all(team.members.map((uid: string) => getUserById(uid)))
        .then((results) => {
          // Filter out any nulls
          setMembersDetails(results.filter(Boolean));
        })
        .catch((err) => console.error("Error fetching member details:", err))
        .finally(() => setLoadingMembers(false));
    } else {
      setMembersDetails([]);
      setLoadingMembers(false);
    }
  }, [team, getUserById]);

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
    return <TeamDetailsLoader />;
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
        <Text style={styles.info}>Total Members: {team.members?.length}</Text>
        {!isMember && <Button title="Join Team" onPress={handleJoin} />}
      </View>
      <View style={styles.membersSection}>
        <Text style={styles.sectionTitle}>Team Members</Text>
        {loadingMembers ? (
          <ActivityIndicator size="small" color="#32409A" />
        ) : membersDetails.length > 0 ? (
          <FlashList
            data={membersDetails}
            keyExtractor={(item, index) => item.uid || index.toString()}
            renderItem={({ item }) => (
              <View style={styles.memberItem}>
                <Text style={styles.memberName}>
                  {item.displayName || item.email || item.uid}
                </Text>
              </View>
            )}
            estimatedItemSize={50}
          />
        ) : (
          <Text style={styles.description}>No members data available.</Text>
        )}
      </View>
      {/* <View style={styles.meetingsSection}>
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
      </View> */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  membersSection: { marginTop: 16 },
  // sectionTitle: {
  //   fontSize: 20,
  //   fontWeight: "bold",
  //   color: "#32409A",
  //   marginBottom: 8,
  // },
  memberItem: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
  },
  memberName: {
    fontSize: 16,
    color: "#32409A",
  },
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
