import { create } from "zustand";
import getAuth, {
  FirebaseAuthTypes,
  signInWithCredential,
  signOut,
  onAuthStateChanged,
} from "@react-native-firebase/auth";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import {
  collection,
  query,
  where,
  getDocs,
  getFirestore,
  setDoc,
  doc,
  getDoc,
} from "@react-native-firebase/firestore";
const db = getFirestore();

GoogleSignin.configure({
  webClientId:
    "999189881408-ib9b35keqg7ngbssb5afmq5mb2on5bt8.apps.googleusercontent.com",
});
const auth = getAuth();
interface AuthStore {
  getUser: () => FirebaseAuthTypes.User | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  changeAvatar: (image: string) => Promise<void>;
  getAvatar: () => Promise<string>;
  // getUserByUid: (uid: string) => Promise<Object | null>;
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
      const { idToken } = (await GoogleSignin.signIn()).data;
      if (!idToken) {
        throw new Error("No ID token found");
      }
      // Create a Google credential with the token
      const googleCredential = getAuth.GoogleAuthProvider.credential(idToken);
      // console.log(googleCredential);
      // Sign-in the user with the credential
      await signInWithCredential(auth, googleCredential);
      const user = auth.currentUser;
      if ((await getDoc(doc(db, "users", user.uid))).exists === false) {
        console.log("User not found in database, creating new user");
        await setDoc(doc(db, "users", user.uid), {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
        });
      }
      console.log("User signed in");
    } catch (error) {
      console.error("error", error);
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
      await GoogleSignin.signOut();
      await GoogleSignin.revokeAccess();
    } catch (error) {
      // console.error(error);
    }
  },
  changeAvatar: async (image: string) => {
    const user = auth.currentUser;
    if (!user) {
      return;
    }
    await setDoc(
      doc(db, "users", user.uid),
      { photoURL: image },
      { merge: true }
    );
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
  // getUserByUid: async (uid: string) => {
  //   try {
  //     const userDoc = await getDocs(query(collection(db, "users"), uid));
  //     return userDoc.docs[0].data();
  //   } catch (error) {
  //     console.error(error);
  //     return null;
  //   }
  // },
}));
