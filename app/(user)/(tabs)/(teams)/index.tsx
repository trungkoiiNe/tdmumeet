import React, { useEffect, useState, useRef } from "react";
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
  Dimensions,
  Platform,
  StatusBar,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useStore } from "../../../../stores/stores";
import auth from "@react-native-firebase/auth";
import { toast } from "@baronha/ting";
import { BlurView } from "expo-blur";
import { LinearGradient } from 'expo-linear-gradient';
import AlertBox from "../../../../components/AlertBox";
import { useRouter } from 'expo-router';

interface TeamCardProps {
  item: any;
  index: number;
  onJoin: (code: string) => void;
  onEdit: (team: any) => void;
  onDelete: (teamId: string) => void;
  onCopyCode: (code: string) => void;
}

const { width } = Dimensions.get('window');

const TeamCard: React.FC<TeamCardProps> = React.memo(({ item, index, onJoin, onEdit, onDelete, onCopyCode }) => {
  const currentUser = auth().currentUser;
  const isCreator = item.createdBy === currentUser?.uid;
  const isMember = item.members?.includes(currentUser?.uid);
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
      delay: index * 100,
    }).start();
  }, [index]);

  return (
    <Animated.View
      style={[
        styles.teamCard,
        {
          transform: [{ scale: scaleAnim }],
          opacity: scaleAnim,
        },
      ]}
    >
      <TouchableOpacity
        onPress={() => router.navigate(`${item.id}`)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[item.isPublic ? '#44ADE2' : '#32409A', '#2A3580']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.teamGradient}
        >
          <View style={styles.teamHeader}>
            <MaterialCommunityIcons
              name={item.isPublic ? "earth" : "shield-lock"}
              size={24}
              color="#FFF"
            />
            <Text style={styles.teamName}>{item.name}</Text>
          </View>

          <Text style={styles.teamDescription}>{item.description}</Text>
          
          <View style={styles.teamStats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="account-group" size={20} color="#FFF" />
              <Text style={styles.statText}>{item.members?.length || 0}</Text>
            </View>
            {(isCreator || isMember) && (
              <TouchableOpacity
                style={styles.inviteCodeButton}
                onPress={() => onCopyCode(item.inviteCode)}
              >
                <MaterialCommunityIcons name="key-variant" size={16} color="#FFF" />
                <Text style={styles.inviteCode}>{item.inviteCode}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.teamActions}>
            {!isMember && !isCreator && (
              <TouchableOpacity
                style={[styles.actionButton, styles.joinFabButton]}
                onPress={() => onJoin(item.inviteCode)}
              >
                <MaterialCommunityIcons name="account-plus" size={20} color="#FFF" />
                <Text style={styles.actionButtonText}>Join Team</Text>
              </TouchableOpacity>
            )}

            {isCreator && (
              <View style={styles.creatorActions}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => onEdit(item)}
                >
                  <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDelete(item.id)}
                >
                  <MaterialCommunityIcons name="delete" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
});

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
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: false,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [alert, setAlert] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'info' | 'error' | 'success' | 'warning',
    onConfirm: () => {},
  });

  useEffect(() => {
    getTeams();
  }, []);

  const filteredTeams = teams?.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateOrUpdate = async () => {
    if (!formData.name.trim()) {
      setAlert({
        visible: true,
        title: 'Validation Error',
        message: 'Team name is required',
        type: 'error',
        onConfirm: () => setAlert(prev => ({ ...prev, visible: false })),
      });
      return;
    }

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, formData);
        setAlert({
          visible: true,
          title: 'Success',
          message: 'Team updated successfully',
          type: 'success',
          onConfirm: () => {
            setAlert(prev => ({ ...prev, visible: false }));
            setModalVisible(false);
          },
        });
      } else {
        const currentUser = auth().currentUser;
        if (!currentUser) return;

        const teamData = {
          ...formData,
          createdBy: currentUser.uid,
          members: [currentUser.uid],
          inviteCode: Math.random().toString(36).substring(2,8).toUpperCase(),
        };
        await createTeam(teamData);
        setAlert({
          visible: true,
          title: 'Success',
          message: 'Team created successfully',
          type: 'success',
          onConfirm: () => {
            setAlert(prev => ({ ...prev, visible: false }));
            setModalVisible(false);
          },
        });
      }

      setEditingTeam(null);
      setFormData({ name: "", description: "", isPublic: false });
    } catch (error) {
      setAlert({
        visible: true,
        title: 'Error',
        message: 'An error occurred. Please try again.',
        type: 'error',
        onConfirm: () => setAlert(prev => ({ ...prev, visible: false })),
      });
    }
  };

  const handleDelete = (teamId: string) => {
    setAlert({
      visible: true,
      title: 'Delete Team',
      message: 'Are you sure you want to delete this team? This action cannot be undone.',
      type: 'warning',
      onConfirm: () => {
        deleteTeam(teamId);
        setAlert(prev => ({ ...prev, visible: false }));
      },
    });
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

  const handleJoinTeam = async (code: string) => {
    if (!code.trim()) {
      Alert.alert("Error", "Please enter an invite code");
      return;
    }

    await joinTeam(code.trim());
    setJoinModalVisible(false);
    setInviteCode("");
  };

  const copyInviteCode = (code: string) => {
    Clipboard.setString(code);
    toast({ title: "Copied!", message: "Invite code copied to clipboard" });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#32409A', '#44ADE2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Teams</Text>
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#32409A" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search teams..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#666"
          />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {loadingTeams ? (
          <ActivityIndicator size="large" color="#32409A" style={styles.loader} />
        ) : (
          <FlatList
            data={filteredTeams}
            renderItem={({ item, index }) => (
              <TeamCard
                item={item}
                index={index}
                onJoin={handleJoinTeam}
                onEdit={openEditModal}
                onDelete={handleDelete}
                onCopyCode={copyInviteCode}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}

        <View style={styles.fab}>
          <TouchableOpacity
            style={[styles.fabButton, styles.joinFabButton]}
            onPress={() => setJoinModalVisible(true)}
          >
            <MaterialCommunityIcons name="account-plus" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.fabButton}
            onPress={() => {
              setEditingTeam(null);
              setFormData({ name: "", description: "", isPublic: false });
              setModalVisible(true);
            }}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

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
                onPress={() => handleJoinTeam(inviteCode)}
              >
                <Text style={styles.buttonText}>Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AlertBox
        visible={alert.visible}
        title={alert.title}
        message={alert.message}
        type={alert.type}
        onConfirm={alert.onConfirm}
        onClose={() => setAlert(prev => ({ ...prev, visible: false }))}
        showCancel={alert.type === 'warning'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF', // white background
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    // Updated gradient colors will be applied in LinearGradient component
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#0F2982',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  listContainer: {
    padding: 16,
  },
  teamCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  teamGradient: {
    padding: 20,
    // Updated to use theme colors in component LinearGradient
  },
  teamHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginLeft: 12,
  },
  teamDescription: {
    color: '#FFF',
    opacity: 0.9,
    marginBottom: 16,
  },
  teamStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 16,
  },
  inviteCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  inviteCode: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  teamActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  creatorActions: {
    flexDirection: 'row',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFF',
    marginLeft: 8,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  fabButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0F2982', // primary dark color
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  joinFabButton: {
    backgroundColor: '#1393CA', // primary light color
  },
  editButton: {
    backgroundColor: '#1393CA',
  },
  deleteButton: {
    backgroundColor: '#0F2982',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#0F2982',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#0F2982',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginBottom: 16,
  },
  visibilityText: {
    marginLeft: 8,
    color: '#0F2982',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#F0F0F0',
  },
  submitButton: {
    backgroundColor: '#1393CA',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  loader: {
    marginTop: 20,
  },
});
