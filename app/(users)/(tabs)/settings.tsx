import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Button,
  Image,
  StyleSheet,
  Text,
  View,
  Switch,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useAuthStore } from "@/stores/authStore";
import { useThemeStore } from "@/stores/themeStore";
import pickupImage from "@/utils/avatar";
import { lightTheme, darkTheme } from "@/utils/themes";
import { Ionicons } from "@expo/vector-icons";
import CustomModal from "@/components/CustomModal";
import { toast } from "@baronha/ting";
import { MMKV } from 'react-native-mmkv';
const storage = new MMKV();

// --- Helper Components (Keep as is or move to separate files later) ---

interface InfoItemProps {
  label: string;
  value: string;
  editable?: boolean;
  onChangeText?: (text: string) => void;
}
const InfoItem: React.FC<InfoItemProps> = ({ label, value, editable, onChangeText }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <View style={styles.row}>
      <Text style={[styles.cellKey, { color: theme.textColor }]}>{label}</Text>
      {editable ? (
        <TextInput
          style={[styles.cellValue, { color: theme.secondaryTextColor }]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Enter value"
          placeholderTextColor={theme.secondaryTextColor}
        />
      ) : (
        <Text style={[styles.cellValue, { color: theme.secondaryTextColor }]}>
          {value}
        </Text>
      )}
    </View>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: theme.textColor }]}>
        {title}
      </Text>
    </View>
  );
};

const SettingsCard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.tagBackground,
          shadowColor: theme.shadowColor,
        },
      ]}
    >
      {children}
    </View>
  );
};

const SettingItem: React.FC<{
  icon: string;
  title: string;
  action?: () => void;
  rightElement?: React.ReactNode;
}> = ({ icon, title, action, rightElement }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  return (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={action}
      disabled={!action}
    >
      <View style={styles.settingItemLeft}>
        <Ionicons
          name={icon as any}
          size={22}
          color={theme.editButtonBackground}
          style={styles.settingIcon}
        />
        <Text style={[styles.settingText, { color: theme.textColor }]}>
          {title}
        </Text>
      </View>
      {rightElement ||
        (action && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.secondaryTextColor}
          />
        ))}
    </TouchableOpacity>
  );
};

// --- Custom Hooks ---

const useAvatar = (
  user: { displayName?: string; email?: string; phoneNumber?: string } | null,
  showErrorModal: () => void
) => {
  const { getAvatar, changeAvatar } = useAuthStore();
  const [avatar, setAvatar] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    const loadAvatar = async () => {
      if (user) {
        setIsImageLoading(true);
        try {
          const avatarUrl = await getAvatar();
          setAvatar(avatarUrl);
        } catch (error) {
          showErrorModal();
          console.error("Avatar loading error:", error);
        } finally {
          setIsImageLoading(false); // Ensure loading stops even on error
        }
      } else {
        setIsImageLoading(false); // No user, stop loading
      }
    };
    loadAvatar();
  }, [user, getAvatar, showErrorModal]); // Added showErrorModal dependency

  const pickAndChangeAvatar = useCallback(async () => {
    try {
      const imageBase64 = await pickupImage();
      if (imageBase64) {
        setIsImageLoading(true);
        const imageUri = "data:image/jpeg;base64," + imageBase64;
        await changeAvatar(imageUri);
        setAvatar(imageUri);
        setIsImageLoading(false);
      }
    } catch (error) {
      showErrorModal();
      console.error("Avatar update error:", error);
      setIsImageLoading(false); // Stop loading on error
    }
  }, [changeAvatar, showErrorModal]); // Added showErrorModal dependency

  return { avatar, isImageLoading, pickAndChangeAvatar };
};

const useSettingsModals = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAvatarErrorModal, setShowAvatarErrorModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  // Removed Privacy and Support modals as they just show toasts now

  const openLogoutModal = useCallback(() => setShowLogoutModal(true), []);
  const closeLogoutModal = useCallback(() => setShowLogoutModal(false), []);
  const openAvatarErrorModal = useCallback(
    () => setShowAvatarErrorModal(true),
    []
  );
  const closeAvatarErrorModal = useCallback(
    () => setShowAvatarErrorModal(false),
    []
  );
  const openAboutModal = useCallback(() => setShowAboutModal(true), []);
  const closeAboutModal = useCallback(() => setShowAboutModal(false), []);

  return {
    showLogoutModal,
    openLogoutModal,
    closeLogoutModal,
    showAvatarErrorModal,
    openAvatarErrorModal,
    closeAvatarErrorModal,
    showAboutModal,
    openAboutModal,
    closeAboutModal,
  };
};

// --- Extracted Components ---

interface ProfileSectionProps {
  user: {
    displayName?: string;
    email?: string;
    phoneNumber?: string;
    [key: string]: any; // For any other properties
  };
  theme: typeof lightTheme | typeof darkTheme;
  loaderColors: { backgroundColor: string; foregroundColor: string };
  onShowAvatarError: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = React.memo(
  ({ user, theme, loaderColors, onShowAvatarError }) => {
    const { avatar, isImageLoading, pickAndChangeAvatar } = useAvatar(
      user,
      onShowAvatarError
    );

    return (
      <>
        <SectionHeader title="Profile" />
        <SettingsCard>
          <View style={styles.profileSection}>
            <View style={styles.avatarSection}>
              {isImageLoading ? (
                <ContentLoader
                  width={80}
                  height={80}
                  viewBox="0 0 80 80"
                  backgroundColor={loaderColors.backgroundColor}
                  foregroundColor={loaderColors.foregroundColor}
                >
                  <Rect x="0" y="0" rx="40" ry="40" width="80" height="80" />
                </ContentLoader>
              ) : (
                <Image style={styles.avatar} source={{ uri: avatar }} />
              )}
              <TouchableOpacity
                style={styles.editButton}
                onPress={pickAndChangeAvatar}
              >
                <Ionicons name="camera" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.textColor }]}>
                {user.displayName || "User"}
              </Text>
              <Text
                style={[styles.userEmail, { color: theme.secondaryTextColor }]}
              >
                {user.email || ""}
              </Text>
            </View>
          </View>
          <InfoItem label="Phone" value={user.phoneNumber || "Not provided"} />
        </SettingsCard>
      </>
    );
  }
);

interface AppearanceSectionProps {
  theme: typeof lightTheme | typeof darkTheme;
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const BackendConfigSection: React.FC<{ theme: typeof lightTheme | typeof darkTheme }> = React.memo(({ theme }) => {
  const [backendIP, setBackendIP] = useState('http://localhost:8000');

  useEffect(() => {
    const loadBackendIP = () => {
      try {
        const savedIP = storage.getString('backendIP');
        if (savedIP) {
          setBackendIP(savedIP);
        }
      } catch (error) {
        console.error('Failed to load backend IP:', error);
      }
    };
    loadBackendIP();
  }, []);

  const handleIPChange = (ip: string) => {
    setBackendIP(ip);
    try {
      storage.set('backendIP', ip);
    } catch (error) {
      console.error('Failed to save backend IP:', error);
    }
  };

  return (
    <>
      <SectionHeader title="Backend Configuration" />
      <SettingsCard>
        <InfoItem
          label="Backend IP"
          value={backendIP}
          editable={true}
          onChangeText={handleIPChange}
        />
      </SettingsCard>
    </>
  );
});

const AppearanceSection: React.FC<AppearanceSectionProps> = React.memo(
  ({ theme, isDarkMode, toggleTheme }) => {
    return (
      <>
        <SectionHeader title="Appearance" />
        <SettingsCard>
          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                trackColor={{
                  false: "#767577",
                  true: theme.editButtonBackground + "80",
                }}
                thumbColor={isDarkMode ? theme.editButtonBackground : "#f4f3f4"}
              />
            }
          />
        </SettingsCard>
      </>
    );
  }
);

interface RecommendedSettingsSectionProps {
  theme: typeof lightTheme | typeof darkTheme;
}

const RecommendedSettingsSection: React.FC<
  RecommendedSettingsSectionProps
> = React.memo(({ theme }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataUsage, setDataUsage] = useState(true);

  return (
    <>
      <SectionHeader title="Recommended Settings" />
      <SettingsCard>
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: theme.editButtonBackground + "80" }}
              thumbColor={notificationsEnabled ? theme.editButtonBackground : "#f4f3f4"}
            />
          }
        />
        <View style={styles.divider} />
        <SettingItem
          icon="cellular-outline"
          title="Reduce Data Usage"
          rightElement={
            <Switch
              value={dataUsage}
              onValueChange={setDataUsage}
              trackColor={{ false: "#767577", true: theme.editButtonBackground + "80" }}
              thumbColor={dataUsage ? theme.editButtonBackground : "#f4f3f4"}
            />
          }
        />
      </SettingsCard>
    </>
  );
});

interface AccountSectionProps {
  onShowAbout: () => void;
}

const showComingSoonToast = () => {
  toast({
    title: "Coming Soon",
    message: "This feature is coming soon! Please check back later.",
  });
};

const AccountSection: React.FC<AccountSectionProps> = React.memo(
  ({ onShowAbout }) => {
    return (
      <>
        <SectionHeader title="Account" />
        <SettingsCard>
          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy"
            action={showComingSoonToast}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="help-circle-outline"
            title="Help & Support"
            action={showComingSoonToast}
          />
          <View style={styles.divider} />
          <SettingItem
            icon="information-circle-outline"
            title="About"
            action={onShowAbout}
          />
        </SettingsCard>
      </>
    );
  }
);

interface LogoutButtonProps {
  theme: typeof lightTheme | typeof darkTheme;
  isDarkMode: boolean;
  onPress: () => void;
}

const LogoutButton: React.FC<LogoutButtonProps> = React.memo(
  ({ theme, isDarkMode, onPress }) => {
    return (
      <TouchableOpacity
        style={[
          styles.logoutButton,
          { backgroundColor: isDarkMode ? "#6B2737" : "#ffebee" },
        ]}
        onPress={onPress}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color={isDarkMode ? "#ff8a80" : "#d32f2f"}
        />
        <Text
          style={[
            styles.logoutText,
            { color: isDarkMode ? "#ff8a80" : "#d32f2f" },
          ]}
        >
          Log Out
        </Text>
      </TouchableOpacity>
    );
  }
);

interface SettingsModalsProps {
  modalStates: ReturnType<typeof useSettingsModals>;
  onConfirmLogout: () => void;
}

const SettingsModals: React.FC<SettingsModalsProps> = React.memo(
  ({ modalStates, onConfirmLogout }) => {
    return (
      <>
        {/* Logout Confirmation Modal */}
        <CustomModal
          visible={modalStates.showLogoutModal}
          modalType="logoutConfirm"
          title="Log Out"
          message="Are you sure you want to log out?"
          onClose={modalStates.closeLogoutModal}
          onConfirm={onConfirmLogout}
        />

        {/* Avatar Error Modal */}
        <CustomModal
          visible={modalStates.showAvatarErrorModal}
          modalType="alert"
          title="Error"
          message="Failed to load or update avatar."
          onClose={modalStates.closeAvatarErrorModal}
        />

        {/* Information Modal */}
        <CustomModal
          visible={modalStates.showAboutModal}
          modalType="information"
          title="About"
          message="App version: 1.0.0"
          onClose={modalStates.closeAboutModal}
        />
      </>
    );
  }
);

// --- Main Settings Component ---

export default function Settings() {
  const { getUser, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;
  const user = getUser();

  const modalActions = useSettingsModals();

  // Memoized theme-dependent styles
  const themedStyles = useMemo(
    () => ({
      container: {
        ...styles.container,
        backgroundColor: theme.backgroundColor,
      },
      title: {
        ...styles.title,
        color: theme.textColor,
      },
    }),
    [theme]
  );

  const loaderColors = useMemo(
    () => ({
      backgroundColor: isDarkMode ? "#374151" : "#f3f3f3",
      foregroundColor: isDarkMode ? "#4b5563" : "#ecebeb",
    }),
    [isDarkMode]
  );

  const handleLogout = useCallback(() => {
    modalActions.openLogoutModal();
  }, [modalActions]);

  const confirmLogout = useCallback(() => {
    try {
      logout();
      // No need to manually close modal here if logout causes navigation/unmount
    } catch (error) {
      console.error("Logout error:", error);
      // Optionally show an error modal here
    }
    modalActions.closeLogoutModal(); // Close modal regardless of success/error
  }, [logout, modalActions]);

  if (!user) return null; // Keep the guard clause

  return (
    <>
      <ScrollView
        style={themedStyles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={themedStyles.title}>Settings</Text>

        <ProfileSection
          user={user}
          theme={theme}
          loaderColors={loaderColors}
          onShowAvatarError={modalActions.openAvatarErrorModal}
        />

        <BackendConfigSection theme={theme} />

        <AppearanceSection
          theme={theme}
          isDarkMode={isDarkMode}
          toggleTheme={toggleTheme}
        />

        <RecommendedSettingsSection theme={theme} />

        <AccountSection onShowAbout={modalActions.openAboutModal} />

        <LogoutButton
          theme={theme}
          isDarkMode={isDarkMode}
          onPress={handleLogout}
        />
      </ScrollView>

      <SettingsModals
        modalStates={modalActions}
        onConfirmLogout={confirmLogout}
      />
    </>
  );
}

// --- Styles (Keep as is) ---
const styles = StyleSheet.create({
  cellKey: {
    flex: 1,
    fontWeight: "bold",
  },
  cellValue: {
    flex: 2,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40, // Adjusted padding
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    marginTop: 10,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarSection: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  editButton: {
    position: "absolute",
    right: -5,
    bottom: -5,
    backgroundColor: "#4C6EF5", // Consider using theme color
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white", // Consider using theme background
  },
  userInfo: {
    flex: 1,
    justifyContent: "center",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 1, // Added for clarity within InfoItem context if needed elsewhere
    borderBottomColor: "#e0e0e0", // Use theme color potentially
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0", // Use theme color potentially
    opacity: 0.6,
    marginVertical: 4, // Added margin for spacing
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 16, // Added top margin for spacing between sections
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.8,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    fontSize: 16,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    marginTop: 16, // Added margin
    // marginBottom: 16, // Removed as contentContainerStyle handles bottom padding
  },
  logoutText: {
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});
