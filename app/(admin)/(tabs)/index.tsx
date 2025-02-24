import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AdminDashboard() {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Summary Cards */}
        <View style={styles.cardsContainer}>
          <View style={styles.card}>
            <MaterialCommunityIcons name="account-group" size={24} color="#464775" />
            <Text style={styles.cardTitle}>Total Users</Text>
            <Text style={styles.cardValue}>245</Text>
          </View>
          <View style={styles.card}>
            <MaterialCommunityIcons name="account-multiple-check" size={24} color="#464775" />
            <Text style={styles.cardTitle}>Active Teams</Text>
            <Text style={styles.cardValue}>12</Text>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityItem}>
            <MaterialCommunityIcons name="account-plus" size={20} color="#464775" />
            <Text style={styles.activityText}>New user registration</Text>
            <Text style={styles.activityTime}>2m ago</Text>
          </View>
          <View style={styles.activityItem}>
            <MaterialCommunityIcons name="account-group" size={20} color="#464775" />
            <Text style={styles.activityText}>New team created</Text>
            <Text style={styles.activityTime}>1h ago</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    color: '#666',
    fontSize: 14,
    marginTop: 8,
  },
  cardValue: {
    color: '#464775',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
  section: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#464775',
    marginBottom: 16,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activityText: {
    marginLeft: 12,
    flex: 1,
    color: '#333',
  },
  activityTime: {
    color: '#666',
    fontSize: 12,
  },
});