import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from 'expo-linear-gradient';
import type { Meeting } from '../types';

interface TeamMeetingsProps {
  teamId: string;
  meetings: Meeting[];
  onCreateMeeting: (meetingData: Partial<Meeting>) => Promise<void>;
}

export default function TeamMeetings({ teamId, meetings, onCreateMeeting }: TeamMeetingsProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [meetingData, setMeetingData] = useState({
    title: '',
    description: '',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000), // 1 hour from now
  });

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const handleCreateMeeting = async () => {
    await onCreateMeeting({
      ...meetingData,
      teamId,
      startTime: meetingData.startTime.getTime(),
      endTime: meetingData.endTime.getTime(),
    });
    setModalVisible(false);
    setMeetingData({
      title: '',
      description: '',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Upcoming Meetings</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setModalVisible(true)}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#102A83" />
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {meetings.map((meeting) => (
          <TouchableOpacity 
            key={meeting.id} 
            style={styles.meetingCard}
            onPress={() => {/* Handle meeting press */}}
          >
            <LinearGradient
              colors={['#1494CB', '#102A83']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.meetingGradient}
            >
              <View style={styles.meetingHeader}>
                <MaterialCommunityIcons name="video" size={24} color="#FFF" />
                <Text style={styles.meetingTime}>
                  {formatTime(new Date(meeting.startTime))}
                </Text>
              </View>
              <Text style={styles.meetingTitle}>{meeting.title}</Text>
              <Text style={styles.meetingDate}>
                {formatDate(new Date(meeting.startTime))}
              </Text>
              <TouchableOpacity style={styles.joinButton}>
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule Meeting</Text>

            <TextInput
              style={styles.input}
              placeholder="Meeting Title"
              value={meetingData.title}
              onChangeText={(text) => setMeetingData(prev => ({ ...prev, title: text }))}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              value={meetingData.description}
              onChangeText={(text) => setMeetingData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={4}
            />

            <View style={styles.timeContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Start Time</Text>
                <DateTimePicker
                  value={meetingData.startTime}
                  mode="datetime"
                  onChange={(event, date) => {
                    if (date) {
                      setMeetingData(prev => ({ ...prev, startTime: date }));
                    }
                  }}
                />
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>End Time</Text>
                <DateTimePicker
                  value={meetingData.endTime}
                  mode="datetime"
                  minimumDate={meetingData.startTime}
                  onChange={(event, date) => {
                    if (date) {
                      setMeetingData(prev => ({ ...prev, endTime: date }));
                    }
                  }}
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateMeeting}
              >
                <Text style={styles.createButtonText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#102A83',
  },
  addButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
  },
  meetingCard: {
    width: 200,
    marginRight: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  meetingGradient: {
    padding: 16,
  },
  meetingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  meetingTime: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  meetingTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  meetingDate: {
    color: '#FFF',
    opacity: 0.8,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  joinButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#102A83',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  timeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  createButton: {
    backgroundColor: '#102A83',
  },
  cancelButtonText: {
    color: '#102A83',
    fontWeight: '600',
  },
  createButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
});