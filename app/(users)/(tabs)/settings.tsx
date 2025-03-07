import React, { useEffect, useState } from "react";
import { Button, Image, StyleSheet, Text, View, Switch } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { useAuthStore } from "../../../stores/authStore";
import { useThemeStore } from "../../../stores/themeStore";
import pickupImage from "../../../utils/avatar";
import { lightTheme, darkTheme } from "../../../utils/themes";

export default function settings() {
  const { getUser, changeAvatar, getAvatar, logout } = useAuthStore();
  const { isDarkMode, toggleTheme } = useThemeStore();
  const theme = isDarkMode ? darkTheme : lightTheme;

  const user = getUser();
  const [avatar, setAvatar] = useState<string>("");
  const [isImageLoading, setIsImageLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setIsImageLoading(true);
      getAvatar().then((avatar) => {
        setAvatar(avatar);
      });
    }
  }, [user]);

  const pick = async () => {
    let image = await pickupImage();
    if (image) {
      setIsImageLoading(true);
      image = "data:image/jpeg;base64," + image;
      await changeAvatar(image).then(() => {
        setAvatar(image);
      });
    }
  };

  function InfoItem({ label, value }) {
    return (
      <View style={styles.row}>
        <Text style={[styles.cellKey, { color: theme.textColor }]}>{label}</Text>
        <Text style={[styles.cellValue, { color: theme.secondaryTextColor }]}>{value}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <Text style={[styles.title, { color: theme.textColor }]}>User Info</Text>
      <View style={styles.darkModeContainer}>
        <Text style={[styles.darkModeText, { color: theme.textColor }]}>Dark Mode</Text>
        <Switch value={isDarkMode} onValueChange={toggleTheme} />
      </View>
      <View style={styles.avatarContainer}>
        {isImageLoading && (
          <ContentLoader
            width={100}
            height={100}
            viewBox="0 0 100 100"
            backgroundColor={isDarkMode ? "#374151" : "#f3f3f3"}
            foregroundColor={isDarkMode ? "#4b5563" : "#ecebeb"}
          >
            <Rect x="0" y="0" rx="50" ry="50" width="100" height="100" />
          </ContentLoader>
        )}
        {user && (
          <Image
            style={styles.avatar}
            source={{ uri: avatar }}
            onLoadEnd={() => setIsImageLoading(false)}
          />
        )}
      </View>
      {user && (
        <>
          <InfoItem label="Username" value={user.displayName} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Phone" value={user.phoneNumber} />
          <Button title="Change Avatar" onPress={() => pick()} />
          <Button title="Logout" onPress={logout} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  avatarContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    width: 100,
    height: 100,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: "absolute",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 8,
  },
  cellKey: {
    flex: 1,
    fontWeight: "bold",
  },
  cellValue: {
    flex: 2,
  },
  darkModeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  darkModeText: {
    fontSize: 16,
  },
});
