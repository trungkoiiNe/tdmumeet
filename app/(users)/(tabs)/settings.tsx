import { View, Text, Button, StyleSheet, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import ContentLoader, { Rect } from "react-content-loader/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import pickupImage from "../../../utils/avatar";
export default function settings() {
  const { getUser, changeAvatar, getAvatar, logout } = useAuthStore();
  const user = getUser();
  const [avatar, setAvatar] = useState<string>("");
  useEffect(() => {
    if (user) {
      setIsImageLoading(true);
      getAvatar().then((avatar) => {
        // console.log(avatar);

        setAvatar(avatar);
      });
    }
  }, [user]);

  const [isImageLoading, setIsImageLoading] = useState(true);
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
  // Reset image loading state when user changes (e.g., logout sets user to null, then later re-login)

  function InfoItem({ label, value }) {
    return (
      <View style={styles.row}>
        <Text style={styles.cellKey}>{label}</Text>
        <Text style={styles.cellValue}>{value}</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Info</Text>
      <View style={styles.avatarContainer}>
        {isImageLoading && (
          <ContentLoader width={100} height={100} viewBox="0 0 100 100">
            <Rect x="0" y="0" rx="50" ry="50" width="100" height="100" />
          </ContentLoader>
        )}
        {user && (
          // <ExpoImage
          //   source={{ uri: images[0] }}

          //   style={styles.avatar}
          //   onLoadEnd={() => setIsImageLoading(false)}
          //   contentFit="cover"
          // />
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
    backgroundColor: "#fff",
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
    color: "#333",
  },
  cellValue: {
    flex: 2,
    color: "#666",
  },
});
