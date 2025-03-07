import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, Button, ActivityIndicator } from 'react-native';
import * as Calendar from 'expo-calendar';

export default function App() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch upcoming events (7 days from now)
    const fetchEvents = async () => {
        try {
            // Request calendar permissions
            let { status } = await Calendar.requestCalendarPermissionsAsync();
            if (status !== 'granted') {
                throw new Error('Permission to access calendar was denied.');
            }

            // Get all calendars
            const calendars = await Calendar.getCalendarsAsync();
            if (calendars.length === 0) {
                throw new Error('No calendars found.');
            }

            // Define date range (now to 7 days later)
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + 7);

            // Fetch events from all calendars
            const fetchedEvents = await Calendar.getEventsAsync(
                calendars.map(cal => cal.id),
                startDate,
                endDate
            );

            // Sort events by start time
            const sortedEvents = fetchedEvents.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
            setEvents(sortedEvents);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    // Add sample event (for testing)
    const addTestEvent = async () => {
        try {
            const status = await Calendar.requestCalendarPermissionsAsync();
            if (status.status !== 'granted') return;

            const calendar = await Calendar.getDefaultCalendarAsync();
            await Calendar.createEventAsync(calendar.id, {
                title: 'Team Meeting',
                startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
                endDate: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
                location: 'Microsoft Teams',
                notes: 'Discuss project updates',
            });

            fetchEvents(); // Refresh events list
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    // Render event items
    const renderItem = ({ item }) => (
        <View style={styles.eventContainer}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text style={styles.eventDetails}>
                {new Date(item.startDate).toLocaleTimeString()} - {new Date(item.endDate).toLocaleTimeString()}
            </Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
        </View>
    );

    useEffect(() => {
        fetchEvents();
    }, []);

    return (
        <View style={styles.container}>
            {loading && <ActivityIndicator size="large" color="#0000ff" />}
            {error && <Text style={{ color: 'red' }}>{error}</Text>}
            <FlatList
                data={events}
                keyExtractor={(item) => item.title + item.startDate.toString()}
                renderItem={renderItem}
                ListHeaderComponent={
                    <View style={styles.addButtonContainer}>
                        <Button title="Add Test Event" onPress={addTestEvent} />
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff',
    },
    eventContainer: {
        padding: 15,
        marginVertical: 8,
        backgroundColor: '#f1f1f1',
        borderRadius: 8,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    eventDetails: {
        fontSize: 14,
        color: '#666',
    },
    eventLocation: {
        fontSize: 12,
        fontStyle: 'italic',
    },
    addButtonContainer: {
        marginVertical: 10,
    },
});