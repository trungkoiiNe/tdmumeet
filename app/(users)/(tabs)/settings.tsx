import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button, Image, StyleSheet, Text, View, Switch, Alert, ScrollView, TouchableOpacity } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import pickupImage from "../../../utils/avatar";
import { lightTheme, darkTheme } from "../../../utils/themes";
import { Ionicons } from '@expo/vector-icons';

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem: React.FC<InfoItemProps> = ({ label, value }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={styles.row}>
      <Text style={[styles.cellKey, { color: theme.textColor }]}>{label}</Text>
      <Text style={[styles.cellValue, { color: theme.secondaryTextColor }]}>{value}</Text>
    </View>
  );
};

const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionHeaderText, { color: theme.textColor }]}>{title}</Text>
    </View>
  );
};

const SettingsCard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isDarkMode } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <View style={[styles.card, { backgroundColor: theme.tagBackground, shadowColor: theme.shadowColor }]}>
      {children}
    </View>
  );
};

const SettingItem: React.FC<{
  icon: string,
  title: string,
  action?: () => void,
  rightElement?: React.ReactNode
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
        <Ionicons name={icon as any} size={22} color={theme.accentColor} style={styles.settingIcon} />
        <Text style={[styles.settingText, { color: theme.textColor }]}>{title}</Text>
      </View>
      {rightElement || (action && (
        <Ionicons name="chevron-forward" size={20} color={theme.secondaryTextColor} />
      ))}
    </TouchableOpacity>
  );
};

export default function Settings() {
  const { getUser, changeAvatar, getAvatar, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const user = getUser();
  const [avatar, setAvatar] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [dataUsage, setDataUsage] = useState(true);

  // Memoized theme-dependent styles
  const themedStyles = useMemo(() => ({
    container: {
      ...styles.container,
      backgroundColor: theme.backgroundColor,
    },
    title: {
      ...styles.title,
      color: theme.textColor,
    },
  }), [theme]);

  const loaderColors = useMemo(() => ({
    backgroundColor: isDarkMode ? "#374151" : "#f3f3f3",
    foregroundColor: isDarkMode ? "#4b5563" : "#ecebeb",
  }), [isDarkMode]);

  useEffect(() => {
    const loadAvatar = async () => {
      if (user) {
        setIsImageLoading(true);
        try {
          const avatarUrl = await getAvatar();
          setAvatar(avatarUrl);
        } catch (error) {
          Alert.alert("Error", "Failed to load avatar");
          console.error("Avatar loading error:", error);
        }
      }
    };

    loadAvatar();

    setIsImageLoading(false);
  }, [user, getAvatar]);

  const pick = useCallback(async () => {
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
      Alert.alert("Error", "Failed to update avatar");
      console.error("Avatar update error:", error);
    }
  }, [changeAvatar]);

  const handleLogout = useCallback(() => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: () => {
            try {
              logout();
            } catch (error) {
              Alert.alert("Error", "Failed to logout");
              console.error("Logout error:", error);
            }
          }
        }
      ]
    );
  }, [logout]);

  if (!user) return null;

  return (
    <ScrollView style={themedStyles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={themedStyles.title}>Settings</Text>

      {/* Profile Section */}
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
            ) :
              <Image
                style={styles.avatar}
                source={{ uri: avatar }}
              // onLoadEnd={() => setIsImageLoading(false)}
              />}
            <TouchableOpacity style={styles.editButton} onPress={pick}>
              <Ionicons name="camera" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: theme.textColor }]}>{user.displayName || 'User'}</Text>
            <Text style={[styles.userEmail, { color: theme.secondaryTextColor }]}>{user.email || ''}</Text>
          </View>
        </View>

        <InfoItem label="Phone" value={user.phoneNumber || 'Not provided'} />
      </SettingsCard>

      {/* Appearance Section */}
      <SectionHeader title="Appearance" />
      <SettingsCard>
        <SettingItem
          icon="moon-outline"
          title="Dark Mode"
          rightElement={
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: "#767577", true: theme.accentColor + "80" }}
              thumbColor={isDarkMode ? theme.accentColor : "#f4f3f4"}
            />
          }
        />
      </SettingsCard>

      {/* Recommended Settings */}
      <SectionHeader title="Recommended Settings" />
      <SettingsCard>
        <SettingItem
          icon="notifications-outline"
          title="Notifications"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#767577", true: theme.accentColor + "80" }}
              thumbColor={notificationsEnabled ? theme.accentColor : "#f4f3f4"}
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
              trackColor={{ false: "#767577", true: theme.accentColor + "80" }}
              thumbColor={dataUsage ? theme.accentColor : "#f4f3f4"}
            />
          }
        />
      </SettingsCard>

      {/* Account Section */}
      <SectionHeader title="Account" />
      <SettingsCard>
        <SettingItem icon="shield-checkmark-outline" title="Privacy" action={() => Alert.alert("Privacy", "Privacy settings coming soon")} />
        <View style={styles.divider} />
        <SettingItem icon="help-circle-outline" title="Help & Support" action={() => Alert.alert("Support", "Help & Support coming soon")} />
        <View style={styles.divider} />
        <SettingItem icon="information-circle-outline" title="About" action={() => Alert.alert("About", "App version: 1.0.0")} />
      </SettingsCard>

      <TouchableOpacity style={[styles.logoutButton, { backgroundColor: isDarkMode ? "#6B2737" : "#ffebee" }]} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color={isDarkMode ? "#ff8a80" : "#d32f2f"} />
        <Text style={[styles.logoutText, { color: isDarkMode ? "#ff8a80" : "#d32f2f" }]}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

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
    paddingBottom: 40,
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
    backgroundColor: "#4C6EF5",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
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
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    opacity: 0.6,
  },
  sectionHeader: {
    marginBottom: 8,
    marginTop: 8,
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
    marginTop: 8,
    marginBottom: 16,
  },
  logoutText: {
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 16,
  },
});
