import React, { useEffect, useRef } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuthStore } from "../../../stores/authStore";
import { BlurView } from "expo-blur";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";

const { width } = Dimensions.get('window');

const TeamsHomeScreen = () => {
  const { signOut } = useAuthStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
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

  const renderMeetingCard = (meeting) => (
    <TouchableOpacity 
      style={styles.meetingCard}
      onPress={() => router.push(`/(user)/(tabs)/(teams)/${meeting.teamId}`)}
    >
      <LinearGradient
        colors={['#44ADE2', '#32409A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.meetingGradient}
      >
        <MaterialCommunityIcons name="video" size={24} color="#FFF" />
        <View style={styles.meetingInfo}>
          <Text style={styles.meetingTitle}>{meeting.title}</Text>
          <Text style={styles.meetingTime}>{meeting.time}</Text>
        </View>
        <TouchableOpacity style={styles.joinButton}>
          <Text style={styles.joinButtonText}>Join</Text>
        </TouchableOpacity>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderChatPreview = (chat: { name: any; initials: any; lastMessage: any; unread: any; color: any; }) => (
    <TouchableOpacity style={styles.chatPreviewContainer}>
      <View style={[styles.avatar, { backgroundColor: chat.color }]}>
        <Text style={styles.avatarText}>{chat.initials}</Text>
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.chatName}>{chat.name}</Text>
        <Text style={styles.lastMessage}>{chat.lastMessage}</Text>
      </View>
      {chat.unread > 0 && (
        <View style={styles.unreadBadge}>
          <Text style={styles.unreadText}>{chat.unread}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#32409A', '#44ADE2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Welcome Back!</Text>
        <Text style={styles.headerSubtitle}>Your workspace</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View style={{ 
          transform: [{ translateY: slideAnim }], 
          opacity: fadeAnim 
        }}>
          {/* Quick Actions */}
          <View style={styles.quickActions}>
              {['New Meeting', 'Schedule', 'Chat', 'Tasks'].map((action, index) => (
              <TouchableOpacity key={index} style={styles.quickActionButton}>
                <MaterialCommunityIcons
                  name={(["video-plus", "calendar", "chat", "checkbox-marked-circle"] as const)[index]}
                  size={24}
                  color="#32409A"
                />
                <Text style={styles.quickActionText}>{action}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Upcoming Meetings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Meetings</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {[
                { title: 'Daily Standup', time: '10:00 AM' },
                { title: 'Project Review', time: '2:30 PM' },
                { title: 'Team Sync', time: '4:00 PM' },
              ].map((meeting, index) => (
                <View key={index} style={{ marginRight: 16 }}>
                  {renderMeetingCard(meeting)}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Recent Chats */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Conversations</Text>
            {[
              { name: 'John Doe', initials: 'JD', lastMessage: 'Great work on the presentation!', unread: 2, color: '#FF6B6B' },
              { name: 'Sarah Smith', initials: 'SS', lastMessage: 'When is the next meeting?', unread: 0, color: '#4ECDC4' },
            ].map((chat, index) => (
              <View key={index}>
                {renderChatPreview(chat)}
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      <TouchableOpacity style={styles.signOutButton} onPress={signOut}>
        <BlurView intensity={100} style={styles.signOutBlur}>
          <MaterialCommunityIcons name="logout" size={20} color="#32409A" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </BlurView>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFF',
    opacity: 0.8,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  quickActionButton: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    width: (width - 80) / 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#32409A',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#32409A',
    marginBottom: 16,
  },
  meetingCard: {
    width: width * 0.75,
    borderRadius: 16,
    overflow: 'hidden',
  },
  meetingGradient: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  meetingInfo: {
    flex: 1,
    marginLeft: 16,
  },
  meetingTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  meetingTime: {
    color: '#FFF',
    opacity: 0.8,
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  joinButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  chatPreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 16,
  },
  chatName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#32409A',
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#32409A',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  signOutButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    overflow: 'hidden',
    borderRadius: 25,
  },
  signOutBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  signOutText: {
    marginLeft: 8,
    color: '#32409A',
    fontWeight: '600',
  },
});

export default TeamsHomeScreen;
