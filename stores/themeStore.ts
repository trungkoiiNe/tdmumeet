import { create } from "zustand";
import { MMKV } from "react-native-mmkv";

// Use the same storage instance
const storage = new MMKV();

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  init: () => void;
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDarkMode: false,

  init: () => {
    const storedDarkMode = storage.getBoolean("DARK_MODE");
    set({ isDarkMode: storedDarkMode ?? false });
  },

  toggleTheme: () => {
    set((state) => {
      const newValue = !state.isDarkMode;
      storage.set("DARK_MODE", newValue);
      return { isDarkMode: newValue };
    });
  },

  setDarkMode: (isDark: boolean) => {
    storage.set("DARK_MODE", isDark);
    set({ isDarkMode: isDark });
  },
}));
