import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';

const TeamsHomeScreen = () => {
  return (
    <View style={styles.container}>
      {/* Top Navigation */}
      <View style={styles.topNav}>
        <Text style={styles.headerText}>Teams</Text>
        <View style={styles.topNavIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialCommunityIcons name="calendar-blank" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <MaterialIcons name="notifications-none" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Recent Chats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Chats</Text>
          <View style={styles.chatItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.chatInfo}>
              <Text style={styles.chatName}>John Doe</Text>
              <Text style={styles.chatPreview}>Last message: Hi, can we discuss...</Text>
            </View>
          </View>
        </View>

        {/* Today's Meetings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today's Meetings</Text>
          <TouchableOpacity style={styles.meetingItem}>
            <MaterialCommunityIcons name="video" size={24} color="#464775" />
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
              <MaterialCommunityIcons name="account-group" size={24} color="#464775" />
            </View>
            <Text style={styles.teamName}>Development Team</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="home" size={24} color="#464775" />
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="chat" size={24} color="#666" />
          <Text style={styles.navText}>Chat</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="account-group" size={24} color="#666" />
          <Text style={styles.navText}>Teams</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem}>
          <MaterialCommunityIcons name="calendar" size={24} color="#666" />
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  topNav: {
    backgroundColor: '#464775',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  topNavIcons: {
    flexDirection: 'row',
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
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#464775',
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#464775',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  chatInfo: {
    marginLeft: 12,
  },
  chatName: {
    fontWeight: '600',
  },
  chatPreview: {
    color: '#666',
    fontSize: 13,
  },
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  meetingInfo: {
    marginLeft: 12,
  },
  meetingTitle: {
    fontWeight: '600',
  },
  meetingTime: {
    color: '#666',
    fontSize: 13,
  },
  teamItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 8,
  },
  teamIcon: {
    marginRight: 12,
  },
  teamName: {
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#666',
  },
});

export default TeamsHomeScreen;