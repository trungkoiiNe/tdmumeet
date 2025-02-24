import { create } from "zustand";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { getFirestore, doc, setDoc } from "@react-native-firebase/firestore";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { toast } from '@baronha/ting';
import { MMKV } from 'react-native-mmkv';
// globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;
// Initialize MMKV
export const storage = new MMKV();

GoogleSignin.configure({
  webClientId:
    "999189881408-ib9b35keqg7ngbssb5afmq5mb2on5bt8.apps.googleusercontent.com",
});

interface AuthState {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  setUser: (user: FirebaseAuthTypes.User | null) => void;
  setLoading: (loading: boolean) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(storage.getString('user') || 'null'),
  loading: false,
  setUser: (user) => {
    storage.set('user', JSON.stringify(user));
    set({ user });
  },
  setLoading: (loading) => set({ loading }),
  signIn: async () => {
    set({ loading: true });
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;
      if (!idToken) throw new Error("No ID token returned from Google SignIn");
      
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const { user: currentUser } = await auth().signInWithCredential(credential);
      
      // Use setUser to persist the user data
      set((state) => {
        state.setUser(currentUser);
        return { loading: false };
      });
      
      try {
        const db = getFirestore();
        await setDoc(
          doc(db, "users", currentUser.uid),
          {
            email: currentUser.email,
            name: currentUser.displayName,
            photo: currentUser.photoURL,
          },
          { merge: true }
        );
        console.log("User profile updated for:", currentUser.uid);
        
      } catch (firestoreError) {
        console.error("Error updating user in Firestore:", firestoreError);
      }
    } catch (error) {
      console.error("Error signing in:", error);
      set({ loading: false });
    }
  },
  signOut: async () => {
    set({ loading: true });
    try {
      await auth().signOut();
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      storage.delete('user');
      set({ user: null });
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
