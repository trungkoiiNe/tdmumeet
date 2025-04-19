import { toast } from "@baronha/ting";
import getAuth, {
  firebase,
  FirebaseAuthTypes,
  onAuthStateChanged,
  signInWithCredential,
  signOut,
} from "@react-native-firebase/auth";
import {
  doc,
  getDoc,
  getFirestore,
  setDoc,
} from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

const db = getFirestore();

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_API,
});
const auth = getAuth();
auth.languageCode = "vi";

// Create a MMKV storage instance
const storage = new MMKV();

interface AuthStore {
  getUser: () => FirebaseAuthTypes.User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  changeAvatar: (image: string) => Promise<void>;
  getAvatar: () => Promise<string>;
  // New method to retrieve stored token
  getStoredToken: () => string;
  // getUserByUid: (uid: string) => Promise<Object | null>;
  getUserByUid: (uid: string) => Promise<Object | null>;
}
export const useAuthStore = create<AuthStore>((set) => ({
  getUser: () => {
    let user: FirebaseAuthTypes.User | null = null;
    onAuthStateChanged(auth, (currentUser) => {
      user = currentUser;
      set({ getUser: () => user });
    });
    return user;
  },
  login: async () => {
    try {
      const data = (await GoogleSignin.signIn()).data;
      console.log(data);
      const idToken = data.idToken;
      if (!idToken) {
        throw new Error("No ID token found");
      }
      // Store token using MMKV
      storage.set("idToken", idToken);
      // Create a Google credential with the token
      const googleCredential = getAuth.GoogleAuthProvider.credential(idToken);
      // console.log(googleCredential);
      // Sign-in the user with the credential
      await signInWithCredential(auth, googleCredential);
      const user = auth.currentUser;
      if ((await getDoc(doc(db, "users", user.uid))).exists === false) {
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
        });
      }
      const options = {
        type: "success",
        title: "Success",
        message: "Login successful",
      };
      toast(options);
    } catch (error) {
      console.error("error", error);
    }
  },
  logout: async () => {
    try {
      await GoogleSignin.revokeAccess();
      await signOut(auth);
      await GoogleSignin.signOut();
    } catch (error) {
      console.log("ncc", error);
    }
  },
  changeAvatar: async (image: string) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return;
      }
      await setDoc(
        doc(db, "users", user.uid),
        { photoURL: image },
        { merge: true }
      );
      const options = {
        type: "success",
        title: "Success",
        message: "Avatar updated successfully",
      };
      toast(options);
    } catch (error) {}
  },
  getAvatar: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        return "";
      }
      const userDoc = await getDoc(doc(db, "users", user.uid));
      return userDoc.data().photoURL;
    } catch (error) {
      console.error(error);
    }
  },
  // New method to get stored idToken using MMKV
  getStoredToken: () => {
    return storage.getString("idToken") || "";
  },
  // getUserByUid: async (uid: string) => {
  //   try {
  //     const userDoc = await getDocs(query(collection(db, "users"), uid));
  //     return userDoc.docs[0].data();
  //   } catch (error) {
  //     console.error(error);
  //     return null;
  //   }
  // },
  getUserByUid: async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.data();
    } catch (error) {
      console.error(error);
      return null;
    }
  },
}));
