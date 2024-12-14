import { create } from "zustand";
import { GoogleSignin, User } from "@react-native-google-signin/google-signin";
GoogleSignin.configure({
  webClientId:
    "494406299402-e5bennlnih02vlga83sbfo31jre6il6d.apps.googleusercontent.com",
});

export const useAuthStore = create((
  set,
  get
) => ({
  user: null,
  setUser: (user: User) => set({ user }),
  signIn: async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      set({ user: userInfo });
    } catch (error) {
      // console.log(error);
    }
  },
  signOut: async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      set({ user: null });
    } catch (error) {
      console.error(error);
    }
  },
}));
