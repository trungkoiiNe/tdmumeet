import { create } from "zustand";
import auth from "@react-native-firebase/auth";
import { toast } from "@baronha/ting";
import { Meeting } from "../types";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  runTransaction, 
  serverTimestamp, 
  arrayUnion, 
  onSnapshot,
  orderBy,
  setDoc
} from '@react-native-firebase/firestore';

interface Team {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  members: string[];
  createdAt: Date;
  isPublic: boolean;
  inviteCode: string; // added to comply with rules
}

interface Invitation {
  teamId: string;
  createdTime: Date;
  outdateTime: Date;
}

interface UserData {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

interface Store {
  userProfile: any | null;
  getUserProfile: () => Promise<void>;
  createRoom?: (roomData: Team) => Promise<void>;
  teams: Team[];
  loadingTeams: boolean;
  getTeams: () => Promise<void>;
  createTeam: (teamData: Omit<Team, "id" | "createdAt">) => Promise<void>;
  updateTeam: (teamId: string, teamData: Partial<Team>) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  joinTeam: (inviteCode: string) => Promise<void>;
  getTeamById: (teamId: string) => Promise<Team | null>;
  getTeamMeetings: (teamId: string) => Promise<Meeting[]>;
  createMeeting: (meetingData: Partial<Meeting>) => Promise<void>;
  joinMeeting: (meetingId: string) => Promise<void>;
  leaveTeam: (teamId: string) => Promise<void>;
  getUsersByIds: (userIds: string[]) => Promise<UserData[]>;
  usersCache: Record<string, UserData>;
  subscribeToTeam: (
    teamId: string,
    callback: (team: Team) => void
  ) => () => void;
  subscribeToMeetings: (
    teamId: string,
    callback: (meetings: Meeting[]) => void
  ) => () => void;
}

const generateInviteCode = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

const db = getFirestore();

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
      const userDoc = await getDoc(doc(db, "users", user.uid));
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
      await addDoc(collection(db, "rooms"), roomData);
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
          getDocs(query(collection(db, "teams"), where("createdBy", "==", user.uid))),
          getDocs(query(collection(db, "teams"), where("members", "array-contains", user.uid))),
          getDocs(query(collection(db, "teams"), where("isPublic", "==", true))),
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

      const inviteCode = generateInviteCode(); // generated inviteCode for team document
      const newTeam = {
        ...teamData,
        createdBy: user.uid,
        members: [user.uid],
        inviteCode, // added field
        createdAt: serverTimestamp(),
        isPublic: teamData.isPublic ?? false,
      };

      // Create the team first
      const teamRef = await addDoc(collection(db, "teams"), newTeam);

      // Generate invitation and create invitation document remain unchanged
      const now = new Date();
      const outdateTime = new Date(now.setMonth(now.getMonth() + 1));

      await setDoc(doc(db, "invitations", inviteCode), {
        teamId: teamRef.id,
        createdTime: serverTimestamp(),
        outdateTime: outdateTime,
      });

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
      const teamDocSnap = await getDoc(doc(db, "teams", teamId));
      if (!teamDocSnap.exists) throw new Error("Team not found");
      if (teamDocSnap.data()?.createdBy !== user.uid) {
        throw new Error("Only team creator can update the team");
      }

      await updateDoc(doc(db, "teams", teamId), teamData);

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
      const teamDocSnap = await getDoc(doc(db, "teams", teamId));
      if (!teamDocSnap.exists) throw new Error("Team not found");

      if (teamDocSnap.data()?.createdBy !== user.uid) {
        throw new Error("Only team creator can delete the team");
      }

      await deleteDoc(doc(db, "teams", teamId));

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

  joinTeam: async (inviteCode: string) => {
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("No authenticated user");

      // Get invitation document
      const invitationDocSnap = await getDoc(doc(db, "invitations", inviteCode));

      if (!invitationDocSnap.exists) {
        throw new Error("Invalid invite code");
      }

      const invitation = invitationDocSnap.data() as Invitation;

      // Check if invitation has expired
      // if (new Date() > invitation.outdateTime) {
      //   // Delete expired invitation
      //   await firestore().collection("invitations").doc(inviteCode).delete();
      //   throw new Error("Invitation has expired");
      // }

      // Get team document
      const teamDocSnap = await getDoc(doc(db, "teams", invitation.teamId));

      if (!teamDocSnap.exists) {
        throw new Error("Team not found");
      }

      const teamData = teamDocSnap.data();

      // Check if user is already a member
      if (teamData?.members.includes(user.uid)) {
        throw new Error("You are already a member of this team");
      }

      // Add user to team members
      await updateDoc(doc(db, "teams", invitation.teamId), {
        members: arrayUnion(user.uid),
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

  getTeamById: async (teamId: string) => {
    try {
      const teamDocSnap = await getDoc(doc(db, "teams", teamId));

      if (!teamDocSnap.exists) {console.log("ccac")};

      return {
        id: teamDocSnap.id,
        ...teamDocSnap.data(),
      } as Team;
    } catch (error) {
      console.error("Error fetching team:", error);
      return null;
    }
  },

  getTeamMeetings: async (teamId: string) => {
    try {
      const meetingsQuery = query(
        collection(db, "meetings"),
        where("teamId", "==", teamId),
        where("endTime", ">=", Date.now()),
        orderBy("endTime", "asc")
      );
      const meetingsSnapshot = await getDocs(meetingsQuery);

      return meetingsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Meeting[];
    } catch (error) {
      console.error("Error fetching meetings:", error);
      return [];
    }
  },

  createMeeting: async (meetingData: Partial<Meeting>) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      await addDoc(collection(db, "meetings"), {
        ...meetingData,
        createdBy: currentUser.uid,
        participants: [currentUser.uid],
        createdAt: Date.now(),
      });
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  },

  joinMeeting: async (meetingId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const meetingRef = doc(db, "meetings", meetingId);
      await runTransaction(db, async (transaction) => {
        const meetingDocSnap = await transaction.get(meetingRef);
        if (!meetingDocSnap.exists) throw new Error("Meeting not found");

        const meetingData = meetingDocSnap.data();
        if (!meetingData.participants.includes(currentUser.uid)) {
          transaction.update(meetingRef, {
            participants: [...meetingData.participants, currentUser.uid],
          });
        }
      });
    } catch (error) {
      console.error("Error joining meeting:", error);
      throw error;
    }
  },

  leaveTeam: async (teamId: string) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) throw new Error("Not authenticated");

      const teamRef = doc(db, "teams", teamId);
      await runTransaction(db, async (transaction) => {
        const teamDocSnap = await transaction.get(teamRef);
        if (!teamDocSnap.exists) throw new Error("Team not found");

        const teamData = teamDocSnap.data();
        if (teamData.createdBy === currentUser.uid) {
          throw new Error("Team creator cannot leave the team");
        }

        const updatedMembers = teamData.members.filter(
          (id) => id !== currentUser.uid
        );
        transaction.update(teamRef, { members: updatedMembers });
      });

      // Refresh teams list
      get().getTeams();
    } catch (error) {
      console.error("Error leaving team:", error);
      throw error;
    }
  },

  usersCache: {},

  getUsersByIds: async (userIds: string[]) => {
    try {
      const cache = get().usersCache;
      const uncachedIds = userIds.filter((id) => !cache[id]);

      if (uncachedIds.length > 0) {
        const usersSnapshot = await getDocs(query(collection(db, "users"), where("uid", "in", uncachedIds)));

        const newUsers = {};
        usersSnapshot.forEach((doc) => {
          const userData = doc.data() as UserData;
          newUsers[userData.uid] = userData;
        });

        set((state) => ({
          usersCache: { ...state.usersCache, ...newUsers },
        }));
      }

      return userIds.map(
        (id) => cache[id] || { uid: id, displayName: "Unknown User", email: "" }
      );
    } catch (error) {
      console.error("Error fetching users:", error);
      return userIds.map((id) => ({
        uid: id,
        displayName: "Unknown User",
        email: "",
      }));
    }
  },

  subscribeToTeam: (teamId: string, callback: (team: Team) => void) => {
    const unsub = onSnapshot(doc(db, "teams", teamId), (docSnap) => {
      if (docSnap.exists) {
        callback({
          id: docSnap.id,
          ...docSnap.data(),
        } as Team);
      }
    });

    return unsub;
  },

  subscribeToMeetings: (
    teamId: string,
    callback: (meetings: Meeting[]) => void
  ) => {
    const meetingsQuery = query(
      collection(db, "meetings"),
      where("teamId", "==", teamId),
      where("endTime", ">=", Date.now()),
      orderBy("endTime", "asc")
    );
    const unsub = onSnapshot(meetingsQuery, (snapshot) => {
      const meetings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Meeting[];
      callback(meetings);
    });

    return unsub;
  },
}));
