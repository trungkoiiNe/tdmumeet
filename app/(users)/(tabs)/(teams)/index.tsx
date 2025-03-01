import { Feather, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";
import { useTeamStore } from "../../../../stores/teamStore";
import pickupImage from "../../../../utils/avatar";
import { getAuth } from "@react-native-firebase/auth";
// Create Team Modal Component
const CreateTeamModal = ({ visible, onClose, onSubmit }) => {
  const [teamName, setTeamName] = useState("");
  const [teamDesc, setTeamDesc] = useState("");
  const [teamAvatar, setTeamAvatar] = useState("");
  const [teamTags, setTeamTags] = useState("");
  const [isPublic, setIsPublic] = useState(true);

  const handlePickImage = async () => {
    try {
      const base64Image = await pickupImage();
      if (base64Image) {
        setTeamAvatar(`data:image/jpeg;base64,${base64Image}`);
      }
    } catch (error) {
      console.error("Error picking image:", error);
    }
  };

  const handleSubmit = () => {
    if (teamName.trim() === "") return;
    onSubmit({
      name: teamName,
      desc: teamDesc,
      avatar: teamAvatar,
      tags: teamTags,
      isPublic: isPublic,
    });
    // Reset form
    setTeamName("");
    setTeamDesc("");
    setTeamAvatar("");
    setTeamTags("");
    setIsPublic(true);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalHeader}>
            <Text style={modalStyles.modalTitle}>Create New Team</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.modalContent}>
            <TouchableOpacity
              onPress={handlePickImage}
              style={modalStyles.avatarPicker}
            >
              <View style={modalStyles.avatarContainer}>
                {teamAvatar ? (
                  <Image
                    source={{ uri: teamAvatar }}
                    style={modalStyles.avatarImage}
                  />
                ) : (
                  <Feather name="camera" size={24} color="gray" />
                )}
              </View>
              <Text style={modalStyles.avatarPickerText}>Choose Avatar</Text>
            </TouchableOpacity>

            <Text style={modalStyles.inputLabel}>Team Name</Text>
            <TextInput
              value={teamName}
              onChangeText={setTeamName}
              placeholder="Enter team name"
              style={modalStyles.textInput}
            />

            <Text style={modalStyles.inputLabel}>Description</Text>
            <TextInput
              value={teamDesc}
              onChangeText={setTeamDesc}
              placeholder="Enter team description"
              multiline
              numberOfLines={3}
              style={modalStyles.textAreaInput}
            />

            <Text style={modalStyles.inputLabel}>Tags (comma separated)</Text>
            <TextInput
              value={teamTags}
              onChangeText={setTeamTags}
              placeholder="design, development, marketing"
              style={modalStyles.textInput}
            />

            <View style={modalStyles.checkboxContainer}></View>
            <Text style={modalStyles.checkboxLabel}>Public Team</Text>
            <TouchableOpacity onPress={() => setIsPublic(!isPublic)}>
              {isPublic ? (
                <MaterialIcons name="check-box" size={24} color="blue" />
              ) : (
                <MaterialIcons
                  name="check-box-outline-blank"
                  size={24}
                  color="gray"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={modalStyles.modalFooter}>
          <TouchableOpacity style={modalStyles.cancelButton} onPress={onClose}>
            <Text style={modalStyles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={modalStyles.confirmButton}
            onPress={handleSubmit}
          >
            <Text style={modalStyles.confirmButtonText}>Create Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TeamsScreen() {
  const { teams, fetchTeams, addTeam, deleteTeam } = useTeamStore();
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const auth = getAuth();
  const user = auth.currentUser;
  useEffect(() => {
    fetchTeams();
  }, []);

  const handleAddTeam = async (teamData) => {
    try {
      const newTeam = {
        id: uuidv4(),
        name: teamData.name,
        desc: teamData.desc,
        ownerId: user.uid, // Replace with actual user ID
        members: [user.uid], // Replace with actual user ID
        createdAt: Date.now(),
        updatedAt: Date.now(),
        avatar: teamData.avatar || "",
        tags: teamData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        isPublic: teamData.isPublic,
      };

      await addTeam(newTeam);
      setIsAddModalVisible(false);
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  const renderTeamItem = ({ item }) => (
    <TouchableOpacity
      style={styles.teamItem}
      onPress={() => router.push(`/(users)/(tabs)/(teams)/${item.id}`)}
    >
      <Image
        source={{
          uri: item.avatar || "https://via.placeholder.com/100",
        }}
        style={styles.teamAvatar}
      />
      <View style={styles.teamContent}>
        <Text style={styles.teamName}>{item.name}</Text>
        <Text style={styles.teamDesc}>
          {item.desc.substring(0, 50)}
          {item.desc.length > 50 ? "..." : ""}
        </Text>
        <Text style={styles.membersCount}>{item.members.length} members</Text>
        <View style={styles.tagsContainer}>
          {item.tags.slice(0, 3).map((tag, index) => (
            <Text key={index} style={styles.tag}>
              {tag}
            </Text>
          ))}
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteTeam(item.id)}
      >
        <Feather name="trash-2" size={20} color="red" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        <TouchableOpacity
          onPress={() => setIsAddModalVisible(true)}
          style={styles.addButton}
        >
          <Feather name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={teams}
        renderItem={renderTeamItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No teams found. Create a team to get started!
            </Text>
          </View>
        }
      />

      <CreateTeamModal
        visible={isAddModalVisible}
        onClose={() => setIsAddModalVisible(false)}
        onSubmit={handleAddTeam}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#3b82f6",
    padding: 8,
    borderRadius: 20,
  },
  teamItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  teamAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 16,
  },
  teamContent: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  teamDesc: {
    fontSize: 14,
    color: "#4b5563",
  },
  membersCount: {
    fontSize: 12,
    color: "#9ca3af",
  },
  tagsContainer: {
    flexDirection: "row",
    marginTop: 4,
  },
  tag: {
    marginRight: 8,
    fontSize: 12,
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    color: "#6b7280",
  },
  modalContent: {
    marginTop: 16,
  },
  avatarPicker: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPickerText: {
    color: "#3b82f6",
    marginTop: 8,
  },
  inputLabel: {
    color: "#374151",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    height: 80,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    color: "#374151",
    marginRight: 8,
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  modalContent: {
    marginBottom: 15,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  confirmButton: {
    backgroundColor: "#3b82f6",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  confirmButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  cancelButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#6b7280",
  },
  avatarPicker: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarPickerText: {
    color: "#3b82f6",
    marginTop: 8,
  },
  inputLabel: {
    color: "#374151",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
    height: 80,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  checkboxLabel: {
    color: "#374151",
    marginRight: 8,
  },
});
