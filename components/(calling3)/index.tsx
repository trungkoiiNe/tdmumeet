import React, { useRef, useState, useEffect } from "react";
// Import user interface elements
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  TextInput,
} from "react-native";
// Import components related to obtaining Android device permissions
import { PermissionsAndroid, Platform } from "react-native";
// Import Agora SDK
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  IRtcEngine,
  RtcSurfaceView,
  RtcConnection,
  IRtcEngineEventHandler,
  VideoSourceType,
} from "react-native-agora";
// Import axios for API requests
import axios from "axios";
// Import auth store
import { useAuthStore } from "../../stores/authStore";

// Define basic information
const appId = process.env.EXPO_PUBLIC_AGORA_APP_ID;
// Token will be fetched from API
const channelNameEnv = process.env.EXPO_PUBLIC_AGORA_CHANNEL;
const localUid = 0; // Local user Uid, no need to modify

const App = () => {
  const agoraEngineRef = useRef<IRtcEngine>(); // IRtcEngine instance
  const [isJoined, setIsJoined] = useState(false); // Whether the local user has joined the channel
  const [isHost, setIsHost] = useState(true); // User role
  const [remoteUid, setRemoteUid] = useState(0); // Uid of the remote user
  const [message, setMessage] = useState(""); // User prompt message
  const [channelName, setChannelName] = useState(channelNameEnv || ""); // Channel name input
  const [token, setToken] = useState(""); // Token will be fetched from API
  const eventHandler = useRef<IRtcEngineEventHandler>(); // Implement callback functions

  // Get user from auth store
  const getUser = useAuthStore((state) => state.getUser);
  const user = getUser();

  useEffect(() => {
    const init = async () => {
      await setupVideoSDKEngine();
      setupEventHandler();
    };
    init();
    return () => {
      cleanupAgoraEngine(); // Ensure this is synchronous
    };
  }, []); // Empty dependency array ensures it runs only once

  // Fetch token from API
  const fetchToken = async () => {
    try {
      if (!channelName) {
        showMessage("Please enter a channel name");
        return null;
      }

      const uid = "0";
      console.log("Fetching token for user:", uid);
      const response = await axios.get("http://192.168.1.133:8088/rtcToken", {
        params: {
          channelName: channelName,
          uid: uid,
        },
      });
      console.log("Token response:", response.data);
      if (response.data.key) {
        setToken(response.data.key);
        showMessage("Token fetched successfully");
        return response.data.key;
      } else {
        showMessage("Failed to fetch token");
        return null;
      }
    } catch (error) {
      console.error("Error fetching token:", error);
      showMessage("Error fetching token");
      return null;
    }
  };

  const setupEventHandler = () => {
    eventHandler.current = {
      onJoinChannelSuccess: () => {
        setMessage("Successfully joined channel: " + channelName);
        setupLocalVideo();
        setIsJoined(true);
      },
      onUserJoined: (_connection: RtcConnection, uid: number) => {
        setMessage("Remote user " + uid + " joined");
        setRemoteUid(uid);
      },
      onUserOffline: (_connection: RtcConnection, uid: number) => {
        setMessage("Remote user " + uid + " left the channel");
        setRemoteUid(uid);
      },
    };
    agoraEngineRef.current?.registerEventHandler(eventHandler.current);
  };

  const setupVideoSDKEngine = async () => {
    try {
      if (Platform.OS === "android") {
        await getPermission();
      }
      agoraEngineRef.current = createAgoraRtcEngine();
      const agoraEngine = agoraEngineRef.current;
      await agoraEngine.initialize({ appId: appId });
    } catch (e) {
      console.error(e);
    }
  };

  const setupLocalVideo = () => {
    agoraEngineRef.current?.enableVideo();
    agoraEngineRef.current?.startPreview();
  };

  // Define the join method called after clicking the join channel button
  const join = async () => {
    if (isJoined) {
      return;
    }

    try {
      // Fetch token before joining channel
      const newToken = await fetchToken();
      if (!newToken) {
        return;
      }

      if (isHost) {
        // Join the channel as a broadcaster
        agoraEngineRef.current?.joinChannel(newToken, channelName, localUid, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          // Set user role to broadcaster
          clientRoleType: ClientRoleType.ClientRoleBroadcaster,
          // Publish audio collected by the microphone
          publishMicrophoneTrack: true,
          // Publish video collected by the camera
          publishCameraTrack: true,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
          // Automatically subscribe to all video streams
          autoSubscribeVideo: true,
        });
      } else {
        // Join the channel as an audience
        agoraEngineRef.current?.joinChannel(newToken, channelName, localUid, {
          // Set channel profile to live broadcast
          channelProfile: ChannelProfileType.ChannelProfileCommunication,
          // Set user role to audience
          clientRoleType: ClientRoleType.ClientRoleAudience,
          // Do not publish audio collected by the microphone
          publishMicrophoneTrack: false,
          // Do not publish video collected by the camera
          publishCameraTrack: false,
          // Automatically subscribe to all audio streams
          autoSubscribeAudio: true,
          // Automatically subscribe to all video streams
          autoSubscribeVideo: true,
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  // Define the leave method called after clicking the leave channel button
  const leave = () => {
    try {
      // Call leaveChannel method to leave the channel
      agoraEngineRef.current?.leaveChannel();
      setRemoteUid(0);
      setIsJoined(false);
      showMessage("Left the channel");
    } catch (e) {
      console.log(e);
    }
  };

  const cleanupAgoraEngine = () => {
    return () => {
      agoraEngineRef.current?.unregisterEventHandler(eventHandler.current!);
      agoraEngineRef.current?.release();
    };
  };

  // Render user interface
  return (
    <SafeAreaView style={styles.main}>
      <Text style={styles.head}>Agora Video SDK Quickstart</Text>
      <View style={styles.inputContainer}>
        <Text>Channel Name:</Text>
        <TextInput
          style={styles.input}
          value={channelName}
          onChangeText={setChannelName}
          placeholder="Enter channel name"
        />
      </View>

      <View style={styles.btnContainer}>
        <Text onPress={join} style={styles.button}>
          Join Channel
        </Text>
        <Text onPress={leave} style={styles.button}>
          Leave Channel
        </Text>
      </View>
      <View style={styles.btnContainer}>
        <Text>Audience</Text>
        <Switch
          onValueChange={(switchValue) => {
            setIsHost(switchValue);
            if (isJoined) {
              leave();
            }
          }}
          value={isHost}
        />
        <Text>Host</Text>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContainer}
      >
        {isJoined ? (
          <React.Fragment key={localUid}>
            <Text>Local user uid: {localUid}</Text>
            <RtcSurfaceView
              canvas={{
                uid: localUid,
                sourceType: VideoSourceType.VideoSourceCamera,
              }}
              style={styles.videoView}
            />
          </React.Fragment>
        ) : (
          <Text>Join a channel</Text>
        )}
        {isJoined && remoteUid !== 0 ? (
          <React.Fragment key={remoteUid}>
            <Text>Remote user uid: {remoteUid}</Text>
            <RtcSurfaceView
              canvas={{
                uid: remoteUid,
                sourceType: VideoSourceType.VideoSourceCamera,
              }}
              style={styles.videoView}
            />
          </React.Fragment>
        ) : (
          <Text>
            {isJoined && !isHost ? "Waiting for remote user to join" : ""}
          </Text>
        )}
        <Text style={styles.info}>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );

  // Display information
  function showMessage(msg: string) {
    setMessage(msg);
  }
};

// Define user interface styles
const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 25,
    paddingVertical: 4,
    fontWeight: "bold",
    color: "#ffffff",
    backgroundColor: "#0055cc",
    margin: 5,
  },
  main: { flex: 1, alignItems: "center" },
  scroll: { flex: 1, backgroundColor: "#ddeeff", width: "100%" },
  scrollContainer: { alignItems: "center" },
  videoView: { width: "90%", height: 200 },
  btnContainer: { flexDirection: "row", justifyContent: "center" },
  head: { fontSize: 20 },
  info: { backgroundColor: "#ffffe0", paddingHorizontal: 8, color: "#0000ff" },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 4,
    padding: 8,
    marginVertical: 8,
    width: 200,
  },
  inputContainer: {
    alignItems: "center",
    marginVertical: 8,
  },
});

const getPermission = async () => {
  if (Platform.OS === "android") {
    await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.CAMERA,
    ]);
  }
};

export default App;
