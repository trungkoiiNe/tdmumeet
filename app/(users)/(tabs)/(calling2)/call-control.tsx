import React, { memo } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome"; // Import FontAwesome icons

const CallControls = ({
  isMicOn,
  isVideoOn,
  isSpeakerOn,
  onToggleMic,
  onToggleVideo,
  onToggleSpeaker,
  onSwitchCamera,
  onEndCall,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          isMicOn ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={onToggleMic}
      >
        <FontAwesome
          name={isMicOn ? "microphone" : "microphone-slash"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          isVideoOn ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={onToggleVideo}
      >
        <FontAwesome
          name={isVideoOn ? "video-camera" : "volume-down"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          styles.speakerButton,
          isSpeakerOn ? styles.activeButton : styles.inactiveButton,
        ]}
        onPress={onToggleSpeaker}
      >
        <FontAwesome
          name={isSpeakerOn ? "volume-up" : "volume-off"}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.switchButton]}
        onPress={onSwitchCamera}
      >
        <FontAwesome name="retweet" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.endCallButton]}
        onPress={onEndCall}
      >
        <FontAwesome name="phone" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  activeButton: {
    backgroundColor: "#4CAF50",
  },
  inactiveButton: {
    backgroundColor: "#555",
  },
  endCallButton: {
    backgroundColor: "#F44336",
  },
  switchButton: {
    backgroundColor: "#2196F3",
  },
  speakerButton: {
    backgroundColor: "#FF9800",
  },
});

export default memo(CallControls);
