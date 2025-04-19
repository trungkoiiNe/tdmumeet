import { toast } from "@baronha/ting";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  setDoc,
  updateDoc,
} from "@react-native-firebase/firestore";
import { create } from "zustand";
const db = getFirestore();

// Helper functions for toast notifications and error handling
type ToastType = "done" | "error";

const showToast = (type: ToastType, message: string) => {
  toast({ preset: type, message });
};

const handleError = (error: unknown, message: string): null => {
  console.error(`${message}:`, error);
  showToast("error", message);
  return null;
};

export type Team = {
  id: string;
  name: string;
  desc: string;
  ownerId: string;
  members: string[];
  createdAt: number;
  updatedAt: number;
  avatar: string;
  tags: string[];
  isPublic: boolean;
};
type Message = {
  id: string;
  channelId: string;
  text: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  file: string;
  memberRead: string[];
  memberUnread: string[];
  teamId?: string; // Optional for backward compatibility with existing messages
};
// New Channel type
type Channel = {
  id: string;
  teamId: string;
  name: string;
  desc: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  isPrivate: boolean;
  members: string[]; // For private channels
};

type TeamStore = {
  teams: Team[];
  team: Team | null;
  channels: Channel[];
  currentChannel: Channel | null;
  fetchTeams: () => Promise<void>;
  addTeam: (team: Team) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  getTeamById: (teamId: string) => Promise<Team | null>;
  getAvatarUrl: (teamId: string) => Promise<string>;
  setAvatarUrl: (teamId: string, url: string) => Promise<void>;
  joinTeam: (teamId: string, userId: string) => Promise<void>;
  leaveTeam: (teamId: string, userId: string) => Promise<void>;

  // New channel methods
  fetchChannels: (teamId: string) => Promise<void>;
  addChannel: (channel: Channel) => Promise<void>;
  updateChannel: (channel: Channel) => Promise<void>;
  deleteChannel: (teamId: string, channelId: string) => Promise<void>;
  getChannelById: (
    teamId: string,
    channelId: string
  ) => Promise<Channel | null>;
  joinChannel: (
    teamId: string,
    channelId: string,
    userId: string
  ) => Promise<void>;
  leaveChannel: (
    teamId: string,
    channelId: string,
    userId: string
  ) => Promise<void>;

  messages: Message[];
  loading: boolean;
  listenToMessages: (teamId: string, channelId: string) => () => void; // Returns an unsubscribe function
  getMessages: (teamId: string, channelId: string) => Promise<Message[]>;
  addMessage: (teamId: string, message: Message) => Promise<void>;
  updateMessage: (teamId: string, message: Message) => Promise<void>;
  deleteMessage: (teamId: string, message: Message) => Promise<void>;
  markMessageAsRead: (
    teamId: string,
    message: Message,
    uid: string
  ) => Promise<void>;
  fetchUnreadMessages: (userId: string) => Promise<Message[]>;
  getUnreadCountForTeam: (teamId: string, userId: string) => number;
  getUnreadCountForChannel: (
    teamId: string,
    channelId: string,
    userId: string
  ) => number;
  kickTeamMember: (teamId: string, memberId: string) => Promise<void>;
};

export const useTeamStore = create<TeamStore>((set, get) => {
  // Utility functions for state updates
  const updateLocalTeam = (teamId: string, updater: (team: Team) => Team) => {
    const updated = get().teams.map((t) => (t.id === teamId ? updater(t) : t));
    set({ teams: updated });
  };

  const updateLocalChannel = (
    channelId: string,
    updater: (channel: Channel) => Channel
  ) => {
    const updated = get().channels.map((c) =>
      c.id === channelId ? updater(c) : c
    );
    set({ channels: updated });
  };

  const removeLocalTeam = (teamId: string) => {
    const filtered = get().teams.filter((t) => t.id !== teamId);
    set({ teams: filtered });
  };

  const removeLocalChannel = (channelId: string) => {
    const filtered = get().channels.filter((c) => c.id !== channelId);
    set({ channels: filtered });
  };
  return {
    teams: [],
    team: null,
    channels: [],
    currentChannel: null,
    messages: [],
    loading: false,

    getChannelById: async (teamId: string, channelId: string) => {
      try {
        const channelRef = doc(db, "teams", teamId, "channels", channelId);
        const channelDoc = await getDoc(channelRef);
        return channelDoc.exists ? (channelDoc.data() as Channel) : null;
      } catch (error) {
        handleError(error, "Failed to get channel");
        return null;
      }
    },

    joinChannel: async (teamId: string, channelId: string, userId: string) => {
      try {
        const channelRef = doc(db, "teams", teamId, "channels", channelId);
        await updateDoc(channelRef, {
          members: arrayUnion(userId),
          updatedAt: Date.now(),
        });
        updateLocalChannel(channelId, (channel) => ({
          ...channel,
          members: [...channel.members, userId],
          updatedAt: Date.now(),
        }));
      } catch (error) {
        handleError(error, "Failed to join channel");
      }
    },

    leaveChannel: async (teamId: string, channelId: string, userId: string) => {
      try {
        const channelRef = doc(db, "teams", teamId, "channels", channelId);
        await updateDoc(channelRef, {
          members: arrayRemove(userId),
          updatedAt: Date.now(),
        });
        updateLocalChannel(channelId, (channel) => ({
          ...channel,
          members: channel.members.filter((id) => id !== userId),
          updatedAt: Date.now(),
        }));
      } catch (error) {
        handleError(error, "Failed to leave channel");
      }
    },
    // loading: false,

    fetchTeams: async () => {
      try {
        const snapshot = await getDocs(collection(db, "teams"));
        const teams = snapshot.docs.map((doc) => doc.data() as Team);
        set({ teams });
      } catch (error) {
        handleError(error, "Failed to fetch teams");
      }
    },

    addTeam: async (team) => {
      try {
        await setDoc(doc(db, "teams", team.id), team);
        set((state) => ({ teams: [...state.teams, team] }));
        showToast("done", "Team created donefully");
      } catch (error) {
        handleError(error, "Failed to create team");
      }
    },

    updateTeam: async (team) => {
      try {
        await setDoc(doc(db, "teams", team.id), team);
        updateLocalTeam(team.id, () => team);
        showToast("done", "Team updated donefully");
      } catch (error) {
        handleError(error, "Failed to update team");
      }
    },

    deleteTeam: async (teamId) => {
      try {
        await deleteDoc(doc(db, "teams", teamId));
        removeLocalTeam(teamId);
        showToast("done", "Team deleted donefully");
      } catch (error) {
        handleError(error, "Failed to delete team");
      }
    },

    getTeamById: async (teamId) => {
      try {
        const teamDoc = await getDoc(doc(db, "teams", teamId));
        return teamDoc.data() as Team;
      } catch (error) {
        return handleError(error, "Failed to get team");
      }
    },

    getAvatarUrl: async (teamId) => {
      try {
        const teamDoc = await getDoc(doc(db, "teams", teamId));
        if (teamDoc.exists) {
          return teamDoc.data()?.avatar || "";
        }
        return "";
      } catch (error) {
        return handleError(error, "Error getting avatar") || "";
      }
    },

    setAvatarUrl: async (teamId, url) => {
      try {
        const teamRef = doc(db, "teams", teamId);
        await updateDoc(teamRef, {
          avatar: url,
          updatedAt: Date.now(),
        });

        updateLocalTeam(teamId, (team) => ({
          ...team,
          avatar: url,
          updatedAt: Date.now(),
        }));

        showToast("done", "Team avatar updated");
      } catch (error) {
        handleError(error, "Failed to update avatar");
      }
    },

    joinTeam: async (teamId, userId) => {
      try {
        // Using transaction for atomicity
        await runTransaction(db, async (transaction) => {
          const teamRef = doc(db, "teams", teamId);
          const teamDoc = await transaction.get(teamRef);

          if (!teamDoc.exists) {
            throw new Error("Team not found");
          }

          const teamData = teamDoc.data() as Team;

          if (teamData.members.includes(userId)) {
            throw new Error("You are already a member of this team");
          }

          const updatedMembers = [...teamData.members, userId];

          transaction.update(teamRef, {
            members: updatedMembers,
            updatedAt: Date.now(),
          });
        });

        // Update local state after doneful transaction
        updateLocalTeam(teamId, (team) => ({
          ...team,
          members: [...team.members, userId],
          updatedAt: Date.now(),
        }));

        showToast("done", "donefully joined team");
      } catch (error: any) {
        handleError(error, error.message || "Failed to join team");
      }
    },

    leaveTeam: async (teamId, userId) => {
      try {
        // Using transaction for atomicity
        await runTransaction(db, async (transaction) => {
          const teamRef = doc(db, "teams", teamId);
          const teamDoc = await transaction.get(teamRef);

          if (!teamDoc.exists) {
            throw new Error("Team not found");
          }

          const teamData = teamDoc.data() as Team;

          if (!teamData.members.includes(userId)) {
            throw new Error("You are not a member of this team");
          }

          const updatedMembers = teamData.members.filter((id) => id !== userId);

          transaction.update(teamRef, {
            members: updatedMembers,
            updatedAt: Date.now(),
          });
        });

        // Update local state after doneful transaction
        updateLocalTeam(teamId, (team) => ({
          ...team,
          members: team.members.filter((id) => id !== userId),
          updatedAt: Date.now(),
        }));

        showToast("done", "donefully left team");
      } catch (error: any) {
        handleError(error, error.message || "Failed to leave team");
      }
    },

    // Add new kickTeamMember method
    kickTeamMember: async (teamId: string, memberId: string) => {
      try {
        await runTransaction(db, async (transaction) => {
          const teamRef = doc(db, "teams", teamId);
          const teamDoc = await transaction.get(teamRef);
          if (!teamDoc.exists) {
            throw new Error("Team not found");
          }
          const teamData = teamDoc.data() as Team;
          if (!teamData.members.includes(memberId)) {
            throw new Error("Member not found in team");
          }
          const updatedMembers = teamData.members.filter(
            (id) => id !== memberId
          );
          transaction.update(teamRef, {
            members: updatedMembers,
            updatedAt: Date.now(),
          });
        });
        // Update local team state
        const updateLocalTeam = (
          teamId: string,
          updater: (team: Team) => Team
        ) => {
          const updated = get().teams.map((t) =>
            t.id === teamId ? updater(t) : t
          );
          set({ teams: updated });
        };
        updateLocalTeam(teamId, (team) => ({
          ...team,
          members: team.members.filter((id) => id !== memberId),
          updatedAt: Date.now(),
        }));
        showToast("done", "Member removed successfully");
      } catch (error: any) {
        handleError(error, error.message || "Failed to remove member");
      }
    },

    // Channel operations with improved error handling
    fetchChannels: async (teamId) => {
      try {
        const channelsRef = collection(db, "teams", teamId, "channels");
        const snapshot = await getDocs(channelsRef);
        const channels = snapshot.docs.map((doc) => doc.data() as Channel);
        set({ channels });
      } catch (error) {
        handleError(error, "Failed to load channels");
      }
    },

    addChannel: async (channel) => {
      try {
        const channelRef = doc(
          db,
          "teams",
          channel.teamId,
          "channels",
          channel.id
        );
        await setDoc(channelRef, channel);
        set((state) => ({ channels: [...state.channels, channel] }));
        showToast("done", "Channel created donefully");
      } catch (error) {
        handleError(error, "Failed to create channel");
      }
    },

    updateChannel: async (channel) => {
      try {
        const channelRef = doc(
          db,
          "teams",
          channel.teamId,
          "channels",
          channel.id
        );
        await setDoc(channelRef, channel);
        updateLocalChannel(channel.id, () => channel);
        showToast("done", "Channel updated donefully");
      } catch (error) {
        handleError(error, "Failed to update channel");
      }
    },

    deleteChannel: async (teamId, channelId) => {
      try {
        const channelRef = doc(db, "teams", teamId, "channels", channelId);
        await deleteDoc(channelRef);
        removeLocalChannel(channelId);
        showToast("done", "Channel deleted donefully");
      } catch (error) {
        handleError(error, "Failed to delete channel");
      }
    },

    // Optimized fetchUnreadMessages with parallel processing
    fetchUnreadMessages: async (userId) => {
      try {
        // Get all teams
        const teamsSnapshot = await getDocs(collection(db, "teams"));
        const teams = teamsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Process teams in parallel
        const teamPromises = teams.map(async (team) => {
          // Get all channels for this team
          const channelsSnapshot = await getDocs(
            collection(db, "teams", team.id, "channels")
          );
          const channels = channelsSnapshot.docs.map((doc) => doc.id);

          // Process channels in parallel
          const channelPromises = channels.map(async (channelId) => {
            const messagesSnapshot = await getDocs(
              collection(
                db,
                "teams",
                team.id,
                "channels",
                channelId,
                "messages"
              )
            );
            return messagesSnapshot.docs
              .map((doc) => {
                const messageData = doc.data() as Message;
                return {
                  ...messageData,
                  teamId: team.id,
                };
              })
              .filter((message) => message.memberUnread.includes(userId));
          });

          // Wait for all channel promises
          const channelResults = await Promise.all(channelPromises);
          return channelResults.flat();
        });

        // Wait for all team promises
        const teamResults = await Promise.all(teamPromises);
        // Flatten and sort
        return teamResults.flat().sort((a, b) => b.createdAt - a.createdAt);
      } catch (error) {
        return handleError(error, "Error fetching unread messages") || [];
      }
    },

    // Message CRUD operations with corrected paths
    listenToMessages: (teamId, channelId) => {
      set({ loading: true });

      // Corrected path structure: teams/{teamId}/channels/{channelId}/messages
      const messagesRef = collection(
        db,
        "teams",
        teamId,
        "channels",
        channelId,
        "messages"
      );
      const q = query(messagesRef, orderBy("createdAt", "asc"));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const messages = snapshot.docs.map((doc) => doc.data() as Message);
          set({ messages, loading: false });
        },
        (error) => {
          console.error("Error listening to messages:", error);
          set({ loading: false });
        }
      );

      // Return unsubscribe function to caller
      return unsubscribe;
    },

    getMessages: async (teamId, channelId) => {
      try {
        set({ loading: true });
        // Corrected path structure: teams/{teamId}/channels/{channelId}/messages
        const messagesRef = collection(
          db,
          "teams",
          teamId,
          "channels",
          channelId,
          "messages"
        );
        const q = query(messagesRef, orderBy("createdAt", "asc"));
        const snapshot = await getDocs(q);
        const messages = snapshot.docs.map((doc) => doc.data() as Message);
        set({ messages, loading: false });
        return messages;
      } catch (error) {
        console.error("Error fetching messages:", error);
        set({ loading: false });
        return [];
      }
    },

    addMessage: async (teamId, message) => {
      try {
        // First get the team to find all members
        const teamRef = doc(db, "teams", teamId);
        const teamDoc = await getDoc(teamRef);

        if (!teamDoc.exists) {
          throw new Error("Team not found");
        }

        const teamData = teamDoc.data() as Team;

        // Add all team members to memberUnread except the sender
        const memberUnread = teamData.members.filter(
          (id) => id !== message.userId
        );

        // Create a modified message with the memberUnread and empty memberRead array
        const updatedMessage = {
          ...message,
          memberUnread,
          memberRead: [message.userId], // The sender has implicitly read the message
        };

        // Corrected path structure: teams/{teamId}/channels/{channelId}/messages
        const messagesRef = collection(
          db,
          "teams",
          teamId,
          "channels",
          message.channelId,
          "messages"
        );

        // Use addDoc to auto-generate ID if not provided
        if (updatedMessage.id) {
          await setDoc(doc(messagesRef, updatedMessage.id), updatedMessage);
        } else {
          const docRef = await addDoc(messagesRef, updatedMessage);
          // Update the message with the generated ID
          await updateDoc(docRef, { id: docRef.id });
        }

        // No need to update local state as the listener will handle that
      } catch (error) {
        console.error("Error adding message:", error);
        const options = {
          type: "error",
          message: "Failed to send message",
        };
        toast(options);
      }
    },

    deleteMessage: async (teamId, message) => {
      try {
        // Corrected path structure: teams/{teamId}/channels/{channelId}/messages
        const messageRef = doc(
          db,
          "teams",
          teamId,
          "channels",
          message.channelId,
          "messages",
          message.id
        );
        await deleteDoc(messageRef);
        // No need to update local state as the listener will handle that

        const options = {
          type: "done",
          message: "Message deleted",
        };
        toast(options);
      } catch (error) {
        console.error("Error deleting message:", error);
        const options = {
          type: "error",
          message: "Failed to delete message",
        };
        toast(options);
      }
    },

    updateMessage: async (teamId, message) => {
      try {
        // Corrected path structure: teams/{teamId}/channels/{channelId}/messages
        const messageRef = doc(
          db,
          "teams",
          teamId,
          "channels",
          message.channelId,
          "messages",
          message.id
        );
        await updateDoc(messageRef, {
          text: message.text,
          updatedAt: Date.now(),
        });
        // No need to update local state as the listener will handle that

        const options = {
          type: "done",
          message: "Message updated",
        };
        toast(options);
      } catch (error) {
        console.error("Error updating message:", error);
        const options = {
          type: "error",
          message: "Failed to update message",
        };
        toast(options);
      }
    },
    markMessageAsRead: async (teamId, message, uid) => {
      try {
        const messageRef = doc(
          db,
          "teams",
          teamId,
          "channels",
          message.channelId,
          "messages",
          message.id
        );

        if (!uid) {
          console.error("No authenticated user found");
          return;
        }

        // Update the message document - add user to memberRead and remove from memberUnread
        await updateDoc(messageRef, {
          memberRead: [...(message.memberRead || []), uid],
          memberUnread: (message.memberUnread || []).filter((id) => id !== uid),
          updatedAt: Date.now(),
        });

        // No need to update local state as the listener will handle that
      } catch (error) {
        console.error("Error marking message as read:", error);
        const options = {
          type: "error",
          message: "Failed to mark message as read",
        };
        toast(options);
      }
    },
    // ...after your existing state and methods, add:
    getUnreadCountForTeam: (teamId: string, userId: string) => {
      const { messages } = get();
      return messages.filter(
        (msg) => msg.teamId === teamId && !msg.memberRead.includes(userId)
      ).length;
    },
    getUnreadCountForChannel: (
      teamId: string,
      channelId: string,
      userId: string
    ) => {
      const { messages } = get();
      return messages.filter(
        (msg) =>
          msg.teamId === teamId &&
          msg.channelId === channelId &&
          !msg.memberRead.includes(userId)
      ).length;
    },
  };
});
