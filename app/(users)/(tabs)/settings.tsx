import { View, Text, Button, StyleSheet, Image } from "react-native";
import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../../stores/authStore";
import ContentLoader, { Rect } from "react-content-loader/native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
export default function settings() {
  const { getUser, changeAvatar, getAvatar } = useAuthStore();
  const user = getUser();
  const [avatar, setAvatar] = useState<string>("");
  useEffect(() => {
    if (user) {
      setIsImageLoading(true);
      getAvatar().then((avatar) => {
        // console.log(avatar);
        setAvatar("data:image/png;base64,".concat(avatar));
      });
    }
  }, [user]);

  const [isImageLoading, setIsImageLoading] = useState(true);
  const pickupImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    } else if (status === "granted") {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1, // Start with high quality
        base64: false, // Do NOT convert to Base64 yet
      });
      if (!result.canceled) {
        let imageUri = result.assets[0].uri;

        // Compress & Resize the image to fit under 1MB
        let compressedImage = await ImageManipulator.manipulateAsync(
          imageUri,
          [{ resize: { width: 800 } }], // Resize width to 800px (adjust as needed)
          {
            compress: 0.7,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: true,
          }
        );

        // Ensure the base64 size is under 1MB
        let base64Size = (compressedImage.base64.length * (3 / 4)) / 1024; // Convert to KB
        console.log(`Base64 size: ${base64Size.toFixed(2)} KB`);

        if (base64Size > 1000) {
          console.warn(
            "Image still too large. Consider reducing quality or resizing further."
          );
          return;
        }
        await changeAvatar(compressedImage.base64);
        // Update avatar state after changing avatar
        getAvatar().then((newAvatar) => {
          setAvatar("data:image/png;base64,".concat(newAvatar));
        });
      }
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
            source={{ uri: avatar || user.photoURL }}
            onLoadEnd={() => setIsImageLoading(false)}
          />
        )}
      </View>
      {user && (
        <>
          <InfoItem label="Username" value={user.displayName} />
          <InfoItem label="Email" value={user.email} />
          <InfoItem label="Phone" value={user.phoneNumber} />
          <Button title="Change Avatar" onPress={() => pickupImage()} />
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
