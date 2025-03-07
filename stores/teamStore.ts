import { create } from "zustand";
import {
  addDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  orderBy,
  onSnapshot,
} from "@react-native-firebase/firestore";
import { toast } from "@baronha/ting";
import meetingServices from "../services/meetingServices";
const db = getFirestore();
type Team = {
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
  // addMessage: (channelId: string, message: Message) => Promise<void>;

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
};

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  team: null,
  channels: [],
  currentChannel: null,
  messages: [],
  meetings: [], // Add meetings array to state initialization
  loading: false,
  fetchTeams: async () => {
    const snapshot = await getDocs(collection(db, "teams"));
    const teams = snapshot.docs.map((doc) => doc.data() as Team);
    set({ teams });
  },
  addTeam: async (team) => {
    try {
      await setDoc(doc(db, "teams", team.id), team);
      set((state) => ({ teams: [...state.teams, team] }));
      const options = {
        type: "success",
        message: "Team created successfully",
      };
      toast(options);
    } catch (error) {}
  },
  updateTeam: async (team) => {
    try {
      await setDoc(doc(db, "teams", team.id), team);
      const updated = get().teams.map((t) => (t.id === team.id ? team : t));
      set({ teams: updated });
      const options = {
        type: "success",
        message: "Team updated successfully",
      };
      toast(options);
    } catch (error) {}
  },
  deleteTeam: async (teamId) => {
    try {
      await deleteDoc(doc(db, "teams", teamId));
      const filtered = get().teams.filter((t) => t.id !== teamId);
      set({ teams: filtered });
      const options = {
        type: "success",
        message: "Team deleted successfully",
      };
      toast(options);
    } catch (error) {}
  },
  getTeamById: async (teamId) => {
    try {
      const teamDoc = await getDoc(doc(db, "teams", teamId));
      return teamDoc.data() as Team;
    } catch (error) {
      return null;
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
      console.error("Error getting avatar:", error);
      return "";
    }
  },
  setAvatarUrl: async (teamId, url) => {
    try {
      const teamRef = doc(db, "teams", teamId);
      await updateDoc(teamRef, {
        avatar: url,
        updatedAt: Date.now(),
      });

      // Update the local store
      const updated = get().teams.map((t) =>
        t.id === teamId ? { ...t, avatar: url, updatedAt: Date.now() } : t
      );
      set({ teams: updated });

      const options = {
        type: "success",
        message: "Team avatar updated",
      };
      toast(options);
    } catch (error) {
      console.error("Error updating avatar:", error);
      const options = {
        type: "error",
        message: "Failed to update avatar",
      };
      toast(options);
    }
  },
  joinTeam: async (teamId, userId) => {
    try {
      // Get current team data
      const teamRef = doc(db, "teams", teamId);
      const teamDoc = await getDoc(teamRef);

      if (!teamDoc.exists) {
        throw new Error("Team not found");
      }

      const teamData = teamDoc.data() as Team;

      // Check if user is already a member
      if (teamData.members.includes(userId)) {
        const options = {
          type: "warning",
          message: "You are already a member of this team",
        };
        toast(options);
        return;
      }

      // Add user to members array
      const updatedMembers = [...teamData.members, userId];

      // Update Firestore
      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: Date.now(),
      });

      // Update local state
      const updated = get().teams.map((t) =>
        t.id === teamId
          ? { ...t, members: updatedMembers, updatedAt: Date.now() }
          : t
      );
      set({ teams: updated });

      const options = {
        type: "success",
        message: "Successfully joined team",
      };
      toast(options);
    } catch (error) {
      console.error("Error joining team:", error);
      const options = {
        type: "error",
        message: "Failed to join team",
      };
      toast(options);
    }
  },
  leaveTeam: async (teamId, userId) => {
    try {
      // Get current team data
      const teamRef = doc(db, "teams", teamId);
      const teamDoc = await getDoc(teamRef);

      if (!teamDoc.exists) {
        throw new Error("Team not found");
      }

      const teamData = teamDoc.data() as Team;

      // Check if user is a member
      if (!teamData.members.includes(userId)) {
        const options = {
          type: "warning",
          message: "You are not a member of this team",
        };
        toast(options);
        return;
      }

      // Remove user from members array
      const updatedMembers = teamData.members.filter((id) => id !== userId);

      // Update Firestore
      await updateDoc(teamRef, {
        members: updatedMembers,
        updatedAt: Date.now(),
      });

      // Update local state
      const updated = get().teams.map((t) =>
        t.id === teamId
          ? { ...t, members: updatedMembers, updatedAt: Date.now() }
          : t
      );
      set({ teams: updated });

      const options = {
        type: "success",
        message: "Successfully left team",
      };
      toast(options);
    } catch (error) {
      console.error("Error leaving team:", error);
      const options = {
        type: "error",
        message: "Failed to leave team",
      };
      toast(options);
    }
  },
  // Channel CRUD operations
  fetchChannels: async (teamId) => {
    try {
      const channelsRef = collection(db, "teams", teamId, "channels");
      const snapshot = await getDocs(channelsRef);
      const channels = snapshot.docs.map((doc) => doc.data() as Channel);
      set({ channels });
    } catch (error) {
      console.error("Error fetching channels:", error);
      const options = {
        type: "error",
        message: "Failed to load channels",
      };
      toast(options);
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
      const options = {
        type: "success",
        message: "Channel created successfully",
      };
      toast(options);
    } catch (error) {
      console.error("Error creating channel:", error);
      const options = {
        type: "error",
        message: "Failed to create channel",
      };
      toast(options);
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
      const updated = get().channels.map((c) =>
        c.id === channel.id ? channel : c
      );
      set({ channels: updated });
      const options = {
        type: "success",
        message: "Channel updated successfully",
      };
      toast(options);
    } catch (error) {
      console.error("Error updating channel:", error);
      const options = {
        type: "error",
        message: "Failed to update channel",
      };
      toast(options);
    }
  },

  deleteChannel: async (teamId, channelId) => {
    try {
      const channelRef = doc(db, "teams", teamId, "channels", channelId);
      await deleteDoc(channelRef);
      const filtered = get().channels.filter((c) => c.id !== channelId);
      set({ channels: filtered });
      const options = {
        type: "success",
        message: "Channel deleted successfully",
      };
      toast(options);
    } catch (error) {
      console.error("Error deleting channel:", error);
      const options = {
        type: "error",
        message: "Failed to delete channel",
      };
      toast(options);
    }
  },

  getChannelById: async (teamId, channelId) => {
    try {
      const channelRef = doc(db, "teams", teamId, "channels", channelId);
      const channelDoc = await getDoc(channelRef);
      if (channelDoc.exists) {
        return channelDoc.data() as Channel;
      }
      return null;
    } catch (error) {
      console.error("Error getting channel:", error);
      return null;
    }
  },

  joinChannel: async (teamId, channelId, userId) => {
    try {
      // Get current channel data
      const channelRef = doc(db, "teams", teamId, "channels", channelId);
      const channelDoc = await getDoc(channelRef);

      if (!channelDoc.exists) {
        throw new Error("Channel not found");
      }

      const channelData = channelDoc.data() as Channel;

      // Only private channels have members to manage
      if (!channelData.isPrivate) {
        const options = {
          type: "info",
          message: "This is a public channel",
        };
        toast(options);
        return;
      }

      // Check if user is already a member
      if (channelData.members.includes(userId)) {
        const options = {
          type: "warning",
          message: "You are already a member of this channel",
        };
        toast(options);
        return;
      }

      // Add user to members array
      const updatedMembers = [...channelData.members, userId];

      // Update Firestore
      await updateDoc(channelRef, {
        members: updatedMembers,
        updatedAt: Date.now(),
      });

      // Update local state
      const updated = get().channels.map((c) =>
        c.id === channelId
          ? { ...c, members: updatedMembers, updatedAt: Date.now() }
          : c
      );
      set({ channels: updated });

      const options = {
        type: "success",
        message: "Successfully joined channel",
      };
      toast(options);
    } catch (error) {
      console.error("Error joining channel:", error);
      const options = {
        type: "error",
        message: "Failed to join channel",
      };
      toast(options);
    }
  },

  leaveChannel: async (teamId, channelId, userId) => {
    try {
      // Get current channel data
      const channelRef = doc(db, "teams", teamId, "channels", channelId);
      const channelDoc = await getDoc(channelRef);

      if (!channelDoc.exists) {
        throw new Error("Channel not found");
      }

      const channelData = channelDoc.data() as Channel;

      // Only private channels have members to manage
      if (!channelData.isPrivate) {
        const options = {
          type: "info",
          message: "This is a public channel",
        };
        toast(options);
        return;
      }

      // Check if user is a member
      if (!channelData.members.includes(userId)) {
        const options = {
          type: "warning",
          message: "You are not a member of this channel",
        };
        toast(options);
        return;
      }

      // Remove user from members array
      const updatedMembers = channelData.members.filter((id) => id !== userId);

      // Update Firestore
      await updateDoc(channelRef, {
        members: updatedMembers,
        updatedAt: Date.now(),
      });

      // Update local state
      const updated = get().channels.map((c) =>
        c.id === channelId
          ? { ...c, members: updatedMembers, updatedAt: Date.now() }
          : c
      );
      set({ channels: updated });

      const options = {
        type: "success",
        message: "Successfully left channel",
      };
      toast(options);
    } catch (error) {
      console.error("Error leaving channel:", error);
      const options = {
        type: "error",
        message: "Failed to leave channel",
      };
      toast(options);
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
        type: "success",
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
        type: "success",
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
  fetchUnreadMessages: async (userId) => {
    try {
      const teamsSnapshot = await getDocs(collection(db, "teams"));
      const teams = teamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      let unreadMessages: Message[] = [];

      for (const team of teams) {
        const channelsSnapshot = await getDocs(
          collection(db, "teams", team.id, "channels")
        );
        const channels = channelsSnapshot.docs.map((doc) => doc.id);

        for (const channelId of channels) {
          const messagesSnapshot = await getDocs(
            collection(db, "teams", team.id, "channels", channelId, "messages")
          );
          const messages = messagesSnapshot.docs
            .map((doc) => {
              const messageData = doc.data() as Message;
              // Add the teamId to each message so we can navigate properly
              return {
                ...messageData,
                teamId: team.id,
              };
            })
            .filter((message) => message.memberUnread.includes(userId));

          unreadMessages = [...unreadMessages, ...messages];
        }
      }

      // Sort messages by createdAt timestamp (newest first)
      return unreadMessages.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error("Error fetching unread messages:", error);
      return [];
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
}));
