import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Clipboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStore } from "../../stores/stores";
import auth from "@react-native-firebase/auth";
import { toast } from "@baronha/ting";

export default function TeamsScreen() {
  const {
    teams,
    loadingTeams,
    getTeams,
    createTeam,
    updateTeam,
    deleteTeam,
    joinTeam,
  } = useStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });

  useEffect(() => {
    getTeams();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      Alert.alert("Error", "Team name is required");
      return;
    }

    if (editingTeam) {
      await updateTeam(editingTeam.id, formData);
    } else {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      const teamData = {
        ...formData,
        createdBy: currentUser.uid,
        members: [currentUser.uid],
      };
      await createTeam(teamData);
    }

    setModalVisible(false);
    setEditingTeam(null);
    setFormData({ name: "", description: "", isPublic: false });
  };

  const handleDelete = (teamId: string) => {
    Alert.alert("Delete Team", "Are you sure you want to delete this team?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        onPress: () => deleteTeam(teamId),
        style: "destructive",
      },
    ]);
  };

  const openEditModal = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description,
      isPublic: team.isPublic || false,
    });
    setModalVisible(true);
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    await joinTeam(inviteCode.trim());
    setJoinModalVisible(false);
    setInviteCode("");
  };
  const handleJoinTeam2 = async () => {
    await joinTeam("HOV66B");
    setJoinModalVisible(false);
    setInviteCode("");
  };
  const copyInviteCode = (code: string) => {
    Clipboard.setString(code);
    toast({ title: "Copied!", message: "Invite code copied to clipboard" });
  };

  const renderTeamItem = ({ item }: { item: any }) => {
    const currentUser = auth().currentUser;
    const isCreator = item.createdBy === currentUser?.uid;
    const isMember = item.members?.includes(currentUser?.uid);

    return (
      <View style={styles.teamCard}>
        <View style={styles.teamHeader}>
          <MaterialCommunityIcons
            name="account-group"
            size={24}
            color="#32409A"
          />
          <Text style={styles.teamName}>{item.name}</Text>
          <MaterialCommunityIcons
            name={item.isPublic ? "earth" : "lock"}
            size={16}
            color="#666"
            style={styles.visibilityIcon}
          />
        </View>

        <Text style={styles.teamDescription}>{item.description}</Text>
        <Text style={styles.memberCount}>
          {item.members?.length || 0} members
        </Text>

        {(isCreator || isMember) && (
          <TouchableOpacity
            style={styles.inviteCodeContainer}
            onPress={() => copyInviteCode(item.inviteCode)}
          >
            <Text style={styles.inviteCodeLabel}>Invite Code:</Text>
            <Text style={styles.inviteCode}>{item.inviteCode}</Text>
            <MaterialCommunityIcons
              name="content-copy"
              size={16}
              color="#32409A"
            />
          </TouchableOpacity>
        )}

        <View style={styles.teamActions}>
          {!isMember && !isCreator && (
            <TouchableOpacity
              style={[styles.actionButton, styles.joinButton]}
              onPress={() => {
                setInviteCode(item.inviteCode);
                setJoinModalVisible(true);
              }}
            >
              <MaterialCommunityIcons
                name="account-plus"
                size={20}
                color="#44ADE2"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            onPress={() => {
              /* Navigate to team detail */
            }}
          >
            <MaterialCommunityIcons name="eye" size={20} color="#44ADE2" />
          </TouchableOpacity>

          {isCreator && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={() => openEditModal(item)}
              >
                <MaterialCommunityIcons
                  name="pencil"
                  size={20}
                  color="#32409A"
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDelete(item.id)}
              >
                <MaterialCommunityIcons
                  name="delete"
                  size={20}
                  color="#FF4444"
                />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teams</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.addButton, styles.joinTeamButton]}
            onPress={() => setJoinModalVisible(true)}
          >
            <MaterialCommunityIcons
              name="account-plus"
              size={24}
              color="#FFFFFF"
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setEditingTeam(null);
              setFormData({ name: "", description: "", isPublic: false });
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loadingTeams ? (
        <ActivityIndicator size="large" color="#32409A" style={styles.loader} />
      ) : (
        <FlatList
          data={teams}
          renderItem={renderTeamItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingTeam ? "Edit Team" : "Create New Team"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Team Name"
              value={formData.name}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, name: text }))
              }
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description"
              value={formData.description}
              onChangeText={(text) =>
                setFormData((prev) => ({ ...prev, description: text }))
              }
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={styles.visibilityToggle}
              onPress={() =>
                setFormData((prev) => ({ ...prev, isPublic: !prev.isPublic }))
              }
            >
              <MaterialCommunityIcons
                name={formData.isPublic ? "earth" : "lock"}
                size={20}
                color="#32409A"
              />
              <Text style={styles.visibilityText}>
                {formData.isPublic ? "Public Team" : "Private Team"}
              </Text>
            </TouchableOpacity>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleCreateOrUpdate}
              >
                <Text style={styles.buttonText}>
                  {editingTeam ? "Update" : "Create"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={joinModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setJoinModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Join Team</Text>

            <TextInput
              style={styles.input}
              placeholder="Enter Invite Code"
              value={inviteCode}
              onChangeText={setInviteCode}
              autoCapitalize="characters"
              maxLength={6}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setJoinModalVisible(false);
                  setInviteCode("");
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleJoinTeam}
              >
                <Text style={styles.buttonText}>Join</Text>
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
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    backgroundColor: "#32409A",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  addButton: {
    backgroundColor: "#44ADE2",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  joinTeamButton: {
    backgroundColor: "#44ADE2",
  },
  listContainer: {
    padding: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  teamCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    color: "#32409A",
  },
  teamDescription: {
    color: "#666",
    marginBottom: 8,
  },
  memberCount: {
    fontSize: 12,
    color: "#44ADE2",
    marginBottom: 12,
  },
  inviteCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F0F0",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
  inviteCodeLabel: {
    color: "#666",
    marginRight: 8,
  },
  inviteCode: {
    color: "#32409A",
    fontWeight: "bold",
    marginRight: 8,
  },
  teamActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 12,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  viewButton: {
    backgroundColor: "#F0F8FF",
  },
  editButton: {
    backgroundColor: "#F0F0F0",
  },
  deleteButton: {
    backgroundColor: "#FFF0F0",
  },
  joinButton: {
    backgroundColor: "#E3F2FD",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#32409A",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  visibilityIcon: {
    marginLeft: 8,
  },
  visibilityToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#F0F0F0",
    borderRadius: 8,
    marginBottom: 16,
  },
  visibilityText: {
    marginLeft: 8,
    color: "#32409A",
    fontSize: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: "#F0F0F0",
  },
  submitButton: {
    backgroundColor: "#32409A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
});
