import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from "react-native";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../stores/authStore";
import { useRouter } from "expo-router";

const TeamsHomeScreen = () => {
  const { signOut } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[{ opacity: fadeAnim }]}>
        <View style={styles.topNav}>
          <Text style={styles.headerText}>Teams</Text>
          <View style={styles.topNavIcons}>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <MaterialIcons
                name="notifications-none"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      <ScrollView style={styles.content}>
        <Animated.View style={{ transform: [{ translateY: slideAnim }], opacity: fadeAnim }}>
          {/* Recent Chats Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Chats</Text>
            <View style={styles.chatItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>John Doe</Text>
                <Text style={styles.chatPreview}>
                  Last message: Hi, can we discuss...
                </Text>
              </View>
            </View>
          </View>

          {/* Today's Meetings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Today's Meetings</Text>
            <TouchableOpacity style={styles.meetingItem}>
              <MaterialCommunityIcons name="video" size={24} color="#44ADE2" />
              <View style={styles.meetingInfo}>
                <Text style={styles.meetingTitle}>Daily Standup</Text>
                <Text style={styles.meetingTime}>10:00 AM - 10:30 AM</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Teams List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Teams</Text>
            <TouchableOpacity style={styles.teamItem}>
              <View style={styles.teamIcon}>
                <MaterialCommunityIcons
                  name="account-group"
                  size={24}
                  color="#44ADE2"
                />
              </View>
              <Text style={styles.teamName}>Development Team</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>

      <Animated.View style={[styles.bottomNav, { opacity: fadeAnim }]}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color="#44ADE2" />
          <Text style={[styles.navText, styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="chat" size={24} color="#32409A" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push("/(user)/teams")}
        >
          <MaterialCommunityIcons name="account-group" size={24} color="#32409A" />
          <Text style={styles.navText}>Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="calendar" size={24} color="#32409A" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  topNav: {
    backgroundColor: "#32409A",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  topNavIcons: {
    flexDirection: "row",
  },
  iconButton: {
    marginLeft: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    marginVertical: 10,
    padding: 16,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#32409A",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#44ADE2",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontWeight: "bold",
  },
  chatInfo: {
    marginLeft: 12,
  },
  chatName: {
    fontWeight: "600",
  },
  chatPreview: {
    color: "#666",
    fontSize: 13,
  },
  meetingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 8,
  },
  meetingInfo: {
    marginLeft: 12,
  },
  meetingTitle: {
    fontWeight: "600",
  },
  meetingTime: {
    color: "#666",
    fontSize: 13,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    marginBottom: 8,
  },
  teamIcon: {
    marginRight: 12,
  },
  teamName: {
    fontWeight: "600",
  },
  signOutButton: {
    marginTop: 20,
    padding: 12,
    backgroundColor: "#32409A",
    borderRadius: 8,
    alignItems: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 10,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: "#32409A",
  },
  activeNavText: {
    color: "#44ADE2",
    fontWeight: "600",
  },
});

export default TeamsHomeScreen;
