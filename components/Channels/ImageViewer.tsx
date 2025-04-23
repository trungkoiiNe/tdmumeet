import React from "react"
import { useState, useRef, useEffect } from "react"
import { Modal, View, Image, StyleSheet, Dimensions, Animated, StatusBar, Alert } from "react-native"
import { IconButton, ActivityIndicator } from "react-native-paper"
import * as FileSystem from "expo-file-system"
import * as MediaLibrary from "expo-media-library"
import { toast } from "@baronha/ting"

const { width, height } = Dimensions.get("window")

interface ImageViewerProps {
  visible: boolean
  imageUri: string | null
  onClose: () => void
}

const ImageViewer: React.FC<ImageViewerProps> = ({ visible, imageUri, onClose }) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const fadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start()
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start()
    }
  }, [visible, fadeAnim])

  const handleClose = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose()
    })
  }

  const downloadImage = async () => {
    if (!imageUri) {
      toast({ message: "No image to download" })
      return
    }

    try {
      const { status } = await MediaLibrary.requestPermissionsAsync()
      if (status !== "granted") {
        Alert.alert(
          "Permissions Required",
          "Please grant permission to access your photo library to save the image.",
          [{ text: "OK", onPress: () => console.log("OK Pressed") }],
          { cancelable: false },
        )
        return
      }

      toast({ message: "Downloading image..." })
      const filename = imageUri.substring(imageUri.lastIndexOf("/") + 1)
      const fileUri = FileSystem.documentDirectory + filename

      await FileSystem.downloadAsync(imageUri, fileUri)

      await MediaLibrary.saveToLibraryAsync(fileUri)
      toast({ message: "Image saved to gallery!" })
    } catch (e) {
      console.error("Download error:", e)
      toast({ message: `Download failed: ${e}` })
    }
  }

  return (
    <Modal visible={visible} transparent={true} onRequestClose={handleClose}>
      <Animated.View
        style={[
          styles.modalContainer,
          {
            opacity: fadeAnim,
            backgroundColor: "#000",
          },
        ]}
      >
        {/* Top toolbar */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 60,
            zIndex: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingTop: StatusBar.currentHeight || 0,
          }}
        >
          <IconButton
            icon="close"
            iconColor="#fff"
            size={24}
            onPress={handleClose}
            style={{ margin: 0 }}
            accessibilityLabel="Close image viewer"
          />

          <View style={{ flexDirection: "row" }}>
            <IconButton
              icon="download"
              iconColor="#fff"
              size={24}
              onPress={downloadImage}
              style={{ margin: 0 }}
              accessibilityLabel="Download image"
            />
            <IconButton
              icon="pencil"
              iconColor="#fff"
              size={24}
              onPress={() => {
                // Add edit functionality here
                toast({ message: "Edit feature coming soon" })
              }}
              style={{ margin: 0 }}
              accessibilityLabel="Edit image"
            />
            <IconButton
              icon="dots-vertical"
              iconColor="#fff"
              size={24}
              onPress={() => {
                // Add more options menu here
                toast({ message: "More options coming soon" })
              }}
              style={{ margin: 0 }}
              accessibilityLabel="More options"
            />
          </View>
        </View>

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        )}
        {error ? (
          <View style={styles.loadingContainer}>
            <IconButton icon="alert-circle-outline" iconColor="#fff" size={48} />
          </View>
        ) : (
          <Image
            source={{ uri: imageUri }}
            style={[styles.thumbnailImage, { resizeMode: "contain", width: "100%", height: "100%" }]}
            accessibilityLabel="Full size image attachment"
            accessibilityHint="Zooms on pinch, closes with button top left"
            onLoadStart={() => {
              setLoading(true)
              setError(false)
            }}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false)
              setError(true)
              console.log("ImageViewer onError", imageUri ? imageUri.substring(0, 100) : "undefined")
            }}
          />
        )}
      </Animated.View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  thumbnailImage: {
    width: width,
    height: height,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
})

export default ImageViewer;
