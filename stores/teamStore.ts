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
} from "@react-native-firebase/firestore";
import { toast } from "@baronha/ting";
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
};

export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  team: null,
  channels: [],
  currentChannel: null,
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
}));
