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
type TeamStore = {
  teams: Team[];
  team: Team | null;
  fetchTeams: () => Promise<void>;
  addTeam: (team: Team) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  getTeamById: (teamId: string) => Promise<Team | null>;
  getAvatarUrl: (teamId: string) => Promise<string>;
  setAvatarUrl: (teamId: string, url: string) => Promise<void>;
  joinTeam: (teamId: string, userId: string) => Promise<void>;
  leaveTeam: (teamId: string, userId: string) => Promise<void>;
};
export const useTeamStore = create<TeamStore>((set, get) => ({
  teams: [],
  team: null,
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
}));
