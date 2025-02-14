import { create } from "zustand";
import firestore from "@react-native-firebase/firestore";
import auth from "@react-native-firebase/auth";
import { toast } from "@baronha/ting";

interface Team {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
  isPublic: boolean;
  inviteCode: string;
}

interface Store {
  userProfile: any | null;
  getUserProfile: () => Promise<void>;
  createRoom?: (roomData: any) => Promise<void>;
  teams: Team[];
  loadingTeams: boolean;
  getTeams: () => Promise<void>;
  createTeam: (
    teamData: Omit<Team, "id" | "createdAt" | "inviteCode">
  ) => Promise<void>;
  updateTeam: (teamId: string, teamData: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
}

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const useStore = create<Store>((set, get) => ({
  userProfile: null,
  getUserProfile: async () => {
    // Retrieve the current authenticated user from Firebase Auth.
    const user = auth().currentUser;
    if (!user || !user.uid) {
      set({ userProfile: null });
      console.warn("No authenticated user found.");
      return;
    }

    try {
      // Fetch the user document from the Firestore collection "users" using the user's uid.
      const userDoc = await firestore().collection("users").doc(user.uid).get();
      if (userDoc.exists) {
        set({ userProfile: userDoc.data() });
      } else {
        set({ userProfile: null });
        console.warn("User profile not found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  },
  createRoom: async (roomData) => {
    try {
      // Create a new room document in the Firestore collection "rooms".
      await firestore().collection("rooms").add(roomData);
      toast({
        title: "Room Created",
        message: "Your room has been created successfully.",
      });
    } catch (error) {
      console.error("Error creating room:", error);
    }
  },
  teams: [],
  loadingTeams: false,

  getTeams: async () => {
    set({ loadingTeams: true });
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("No authenticated user");

      // Query for teams where user is creator or member
      const [createdTeamsSnapshot, memberTeamsSnapshot, publicTeamsSnapshot] =
        await Promise.all([
          firestore()
            .collection("teams")
            .where("createdBy", "==", user.uid)
            .get(),
          firestore()
            .collection("teams")
            .where("members", "array-contains", user.uid)
            .get(),
          firestore().collection("teams").where("isPublic", "==", true).get(),
        ]);

      const createdTeams = createdTeamsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Team[];

      const memberTeams = memberTeamsSnapshot.docs
        .filter((doc) => doc.data().createdBy !== user.uid)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];

      const publicTeams = publicTeamsSnapshot.docs
        .filter((doc) => {
          const data = doc.data();
          return (
            data.createdBy !== user.uid && !data.members.includes(user.uid)
          );
        })
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Team[];

      const teams = [...createdTeams, ...memberTeams, ...publicTeams];
      set({ teams, loadingTeams: false });
    } catch (error) {
      console.error("Error fetching teams:", error);
      set({ loadingTeams: false });
      toast({
        title: "Error",
        message: "Failed to fetch teams",
      });
    }
  },

  createTeam: async (teamData) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("No authenticated user");

      const newTeam = {
        ...teamData,
        createdBy: user.uid,
        members: [user.uid],
        createdAt: firestore.FieldValue.serverTimestamp(),
        isPublic: teamData.isPublic ?? false,
        inviteCode: generateInviteCode(),
      };

      await firestore().collection("teams").add(newTeam);
      toast({
        title: "Success",
        message: "Team created successfully",
      });
      await get().getTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        message: "Failed to create team",
      });
    }
  },

  updateTeam: async (teamId, teamData) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("No authenticated user");

      // First verify the user is the creator
      const teamDoc = await firestore().collection("teams").doc(teamId).get();
      if (!teamDoc.exists) throw new Error("Team not found");

      if (teamDoc.data()?.createdBy !== user.uid) {
        throw new Error("Only team creator can update the team");
      }

      await firestore().collection("teams").doc(teamId).update(teamData);

      toast({
        title: "Success",
        message: "Team updated successfully",
      });
      await get().getTeams();
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to update team",
      });
    }
  },

  deleteTeam: async (teamId) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("No authenticated user");

      // First verify the user is the creator
      const teamDoc = await firestore().collection("teams").doc(teamId).get();
      if (!teamDoc.exists) throw new Error("Team not found");

      if (teamDoc.data()?.createdBy !== user.uid) {
        throw new Error("Only team creator can delete the team");
      }

      await firestore().collection("teams").doc(teamId).delete();

      toast({
        title: "Success",
        message: "Team deleted successfully",
      });
      set((state) => ({
        teams: state.teams.filter((team) => team.id !== teamId),
      }));
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        message:
          error instanceof Error ? error.message : "Failed to delete team",
      });
    }
  },

  joinTeam: async (providedInviteCode: string) => {
    try {
      const user = auth().currentUser;
      // const inviteCodeSplitted = providedInviteCode.split("");
      // console.log("inviteCodeSplitted", inviteCodeSplitted);
      if (!user) throw new Error("No authenticated user");
      const teamsCollection = firestore().collection("teams");
      const teamsSnapshot = await teamsCollection
        .where("inviteCode", "==", providedInviteCode)
        .get();
      if (teamsSnapshot.empty) {
        throw new Error("Invalid invite code");
      }
      console.log("teamsSnapshot", teamsSnapshot);
      const teamDoc = teamsSnapshot.docs[0];
      const teamData = teamDoc.data();

      // Check if user is already a member
      if (teamData.members.includes(user.uid)) {
        throw new Error("You are already a member of this team");
      }

      // Add user to team members
      await firestore()
        .collection("teams")
        .doc(teamDoc.id)
        .update({
          members: firestore.FieldValue.arrayUnion(user.uid),
        });

      toast({
        title: "Success",
        message: "Successfully joined team",
      });
      await get().getTeams();
    } catch (error) {
      console.error("Error joining team:", error);
      toast({
        title: "Error",
        message: error instanceof Error ? error.message : "Failed to join team",
      });
    }
  },
}));
