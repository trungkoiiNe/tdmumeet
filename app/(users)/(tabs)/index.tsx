import React, { useMemo } from "react";
import { SafeAreaView, StyleSheet, Text, View, ScrollView, TouchableOpacity } from "react-native";
import { useThemeStore } from "../../../stores/themeStore";
import { darkTheme, lightTheme } from "../../../utils/themes";

const HomeScreen: React.FC = () => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const themedStyles = useMemo(() => ({
    container: [styles.container, { backgroundColor: theme.backgroundColor }],
    welcomeText: [styles.welcomeText, { color: theme.textColor }],
    subtitle: [styles.subtitle, { color: theme.secondaryTextColor }],
    sectionTitle: [styles.sectionTitle, { color: theme.textColor }],
    eventItem: [styles.eventItem, { backgroundColor: theme.cardBackgroundColor, borderColor: theme.borderColor }],
    eventTitle: [styles.eventTitle, { color: theme.textColor }],
    eventTime: [styles.eventTime, { color: theme.secondaryTextColor }],
    teamItem: [styles.teamItem, { backgroundColor: theme.cardBackgroundColor, borderColor: theme.borderColor }],
    teamName: [styles.teamName, { color: theme.textColor }],
    announcementItem: [styles.announcementItem, { backgroundColor: theme.cardBackgroundColor, borderColor: theme.borderColor }],
    announcementTitle: [styles.announcementTitle, { color: theme.textColor }],
    announcementContent: [styles.announcementContent, { color: theme.secondaryTextColor }],
  }), [theme]);

  // Dummy data for upcoming events, teams, and announcements
  const upcomingEvents = [
    { id: '1', title: 'Math Lecture', time: '9:00 AM - 10:00 AM' },
    { id: '2', title: 'Science Lab', time: '10:30 AM - 12:30 PM' },
  ];

  const teams = [
    { id: '1', name: 'Project Group A' },
    { id: '2', name: 'Study Group B' },
  ];

  const announcements = [
    { id: '1', title: 'Important Announcement', content: 'Please remember to submit your assignments on time.' },
    { id: '2', title: 'School Closure', content: 'School will be closed on Monday due to a public holiday.' },
  ];

  return (
    <SafeAreaView style={themedStyles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={themedStyles.welcomeText}>Welcome to TDMU Meet</Text>
          <Text style={themedStyles.subtitle}>Stay updated with your classes</Text>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.section}>
          <Text style={themedStyles.sectionTitle}>Upcoming Events</Text>
          {upcomingEvents.map(event => (
            <View key={event.id} style={themedStyles.eventItem}>
              <Text style={themedStyles.eventTitle}>{event.title}</Text>
              <Text style={themedStyles.eventTime}>{event.time}</Text>
            </View>
          ))}
        </View>

        {/* Quick Access to Teams Section */}
        <View style={styles.section}>
          <Text style={themedStyles.sectionTitle}>Quick Access to Teams</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {teams.map(team => (
              <TouchableOpacity key={team.id} style={themedStyles.teamItem}>
                <Text style={themedStyles.teamName}>{team.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Important Announcements Section */}
        <View style={styles.section}>
          <Text style={themedStyles.sectionTitle}>Important Announcements</Text>
          {announcements.map(announcement => (
            <View key={announcement.id} style={themedStyles.announcementItem}>
              <Text style={themedStyles.announcementTitle}>{announcement.title}</Text>
              <Text style={themedStyles.announcementContent}>{announcement.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  eventItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 14,
  },
  teamItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  announcementItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  announcementContent: {
    fontSize: 14,
  },
});
export default React.memo(HomeScreen);
