import React, { useState, useRef, useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { RTCView } from "react-native-webrtc";
import io from "socket.io-client";
import CallControls from "./call-control";
import {
  getLocalStream,
  toggleAudio,
  toggleVideo,
  switchCamera,
} from "../../utils/media";
import {
  createPeerConnection,
  createOffer,
  createAnswer,
  addIceCandidate,
  addLocalStreamToPeerConnection,
} from "../../utils/webRTC";
import { RTCSessionDescription } from "react-native-webrtc";

const SIGNALING_SERVER_URL = "http://192.168.1.171:5000/";

const App = () => {
  // User state
  const [username, setUsername] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState([]);

  // Call state
  const [inCall, setInCall] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callStatus, setCallStatus] = useState("Initializing...");
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  // Refs
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const remoteUserRef = useRef(null);
  const remoteUsernameRef = useRef("User");

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cleanupCall();
    };
  }, []);

  const connectToServer = () => {
    if (!username.trim()) {
      Alert.alert("Error", "Please enter your name");
      return;
    }

    setIsConnecting(true);
    socketRef.current = io(SIGNALING_SERVER_URL, {
      query: { username },
      transports: ["websocket"],
    });

    socketRef.current.on("connect", () => {
      console.log("Connected to signaling server");
      setIsConnected(true);
      setIsConnecting(false);
    });

    socketRef.current.on("connect_error", (error) => {
      console.error("Connection error:", error);
      Alert.alert(
        "Connection Error",
        "Could not connect to server. Please try again later."
      );
      setIsConnecting(false);
    });

    socketRef.current.on("user-list", (userList) => {
      const filteredUsers = userList.filter(
        (user) => user.id !== socketRef.current.id
      );
      setUsers(filteredUsers);
    });

    socketRef.current.on("offer", (data) => {
      Alert.alert(
        "Incoming Call",
        `${data.username || "Someone"} is calling you`,
        [
          { text: "Decline", style: "cancel" },
          {
            text: "Accept",
            onPress: () => startIncomingCall(data),
          },
        ]
      );
    });

    socketRef.current.on("answer", async (data) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          setCallStatus("Connecting...");
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    socketRef.current.on("ice-candidate", async (data) => {
      try {
        if (data.from === remoteUserRef.current && peerConnectionRef.current) {
          console.log("Received ICE candidate:", data.candidate);
          await addIceCandidate(peerConnectionRef.current, data.candidate);
        }
      } catch (error) {
        console.error("Error adding ice candidate:", error);
      }
    });

    socketRef.current.on("end-call", (data) => {
      if (data.from === remoteUserRef.current) {
        Alert.alert("Call Ended", "The other user ended the call");
        endCall();
      }
    });

    socketRef.current.on("user-disconnected", (userId) => {
      if (userId === remoteUserRef.current) {
        Alert.alert("User Disconnected", "The other user disconnected");
        endCall();
      }
    });
  };

  // Updated startIncomingCall function to set the remote description first
  const startIncomingCall = async (data) => {
    remoteUserRef.current = data.from;
    remoteUsernameRef.current = data.username || "User";
    setCallStatus("Incoming call...");

    try {
      const stream = await getLocalStream(true);
      setLocalStream(stream);

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      setupPeerConnectionListeners(peerConnection);

      // Set the remote description with the incoming offer
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );

      // Add the local stream to the PeerConnection
      addLocalStreamToPeerConnection(peerConnection, stream);

      // Create an answer
      const answer = await peerConnection.createAnswer();

      // Set the local description explicitly
      await peerConnection.setLocalDescription(answer);

      // Send the answer to the caller
      socketRef.current.emit("answer", {
        answer: peerConnection.localDescription,
        to: remoteUserRef.current,
      });

      setInCall(true);
    } catch (error) {
      console.error("Error starting incoming call:", error);
      Alert.alert("Call Error", "Could not start the call. Please try again.");
    }
  };
  const startOutgoingCall = async (userId, username) => {
    remoteUserRef.current = userId;
    remoteUsernameRef.current = username || "User";
    setCallStatus("Calling...");

    try {
      const stream = await getLocalStream(true);
      setLocalStream(stream);

      const peerConnection = createPeerConnection();
      peerConnectionRef.current = peerConnection;

      setupPeerConnectionListeners(peerConnection);
      addLocalStreamToPeerConnection(peerConnection, stream);

      const offer = await createOffer(peerConnection);
      socketRef.current.emit("offer", {
        offer,
        to: userId,
        from: socketRef.current.id,
        username: username || "User",
      });

      setInCall(true);
    } catch (error) {
      console.error("Error starting outgoing call:", error);
      Alert.alert("Call Error", "Could not start the call. Please try again.");
    }
  };

  const setupPeerConnectionListeners = (peerConnection) => {
    peerConnection.addEventListener("icecandidate", (event) => {
      if (event.candidate) {
        console.log("Generated ICE candidate:", event.candidate);
        socketRef.current.emit("ice-candidate", {
          candidate: event.candidate,
          to: remoteUserRef.current,
          from: socketRef.current.id, // Add the from field explicitly
        });
      }
    });

    peerConnection.addEventListener("iceconnectionstatechange", () => {
      console.log("ICE connection state:", peerConnection.iceConnectionState);

      if (
        peerConnection.iceConnectionState === "connected" ||
        peerConnection.iceConnectionState === "completed"
      ) {
        setCallStatus("Connected");
      } else if (
        peerConnection.iceConnectionState === "failed" ||
        peerConnection.iceConnectionState === "disconnected" ||
        peerConnection.iceConnectionState === "closed"
      ) {
        setCallStatus("Connection lost");
        setTimeout(() => {
          Alert.alert("Call Ended", "Connection was lost", [
            { text: "OK", onPress: endCall },
          ]);
        }, 2000);
      }
    });
    peerConnection.addEventListener("connectionstatechange", () => {
      console.log("Connection state:", peerConnection.connectionState);
    });
    peerConnection.addEventListener("track", (event) => {
      console.log("Received remote track:", event);
      if (event.streams && event.streams[0]) {
        console.log("Setting remote stream");
        setRemoteStream(event.streams[0]);
      }
    });
  };

  const endCall = () => {
    if (socketRef.current && remoteUserRef.current) {
      socketRef.current.emit("end-call", {
        to: remoteUserRef.current,
      });
    }
    cleanupCall();
    setInCall(false);
  };

  const cleanupCall = () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    setLocalStream(null);
    setRemoteStream(null);
  };

  const disconnectFromServer = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setUsers([]);
    }
  };

  const handleToggleMic = () => {
    if (localStream) {
      toggleAudio(localStream, !isMicOn);
      setIsMicOn(!isMicOn);
    }
  };

  const handleToggleVideo = () => {
    if (localStream) {
      toggleVideo(localStream, !isVideoOn);
      setIsVideoOn(!isVideoOn);
    }
  };

  const handleToggleSpeaker = () => {
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleSwitchCamera = async () => {
    if (localStream) {
      const newStream = await switchCamera(localStream);
      if (newStream) {
        setLocalStream(newStream);
      }
    }
  };

  // Home Screen - Connect and User List
  if (!isConnected && !inCall) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Video Call App</Text>
        <View style={styles.connectContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={username}
            onChangeText={setUsername}
            editable={!isConnecting}
          />
          {isConnecting ? (
            <ActivityIndicator size="large" color="#2196F3" />
          ) : (
            <TouchableOpacity
              style={styles.connectButton}
              onPress={connectToServer}
            >
              <Text style={styles.buttonText}>Connect</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // User List Screen
  if (isConnected && !inCall) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Video Call App</Text>
        <Text style={styles.connectedText}>Connected as: {username}</Text>

        <View style={styles.userListContainer}>
          <Text style={styles.userListTitle}>
            Online Users ({users.length})
          </Text>

          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No other users online</Text>
            </View>
          ) : (
            users.map((user) => (
              <View key={user.id} style={styles.userItem}>
                <Text style={styles.username}>{user.username}</Text>
                <TouchableOpacity
                  style={styles.callButton}
                  onPress={() => startOutgoingCall(user.id, user.username)}
                >
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <TouchableOpacity
          style={[styles.button, styles.disconnectButton]}
          onPress={disconnectFromServer}
        >
          <Text style={styles.buttonText}>Disconnect</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Call Screen
  return (
    <View style={styles.callContainer}>
      {remoteStream ? (
        <RTCView
          streamURL={remoteStream.toURL()}
          style={styles.remoteStream}
          objectFit="cover"
        />
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.statusText}>{callStatus}</Text>
        </View>
      )}

      {localStream && (
        <RTCView
          streamURL={localStream.toURL()}
          style={styles.localStream}
          objectFit="cover"
          zOrder={1}
          mirror
        />
      )}

      <View style={styles.callStatusContainer}>
        <Text style={styles.callStatusText}>
          {remoteStream
            ? `In call with ${remoteUsernameRef.current}`
            : callStatus}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        <CallControls
          isMicOn={isMicOn}
          isVideoOn={isVideoOn}
          isSpeakerOn={isSpeakerOn}
          onToggleMic={handleToggleMic}
          onToggleVideo={handleToggleVideo}
          onToggleSpeaker={handleToggleSpeaker}
          onSwitchCamera={handleSwitchCamera}
          onEndCall={endCall}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  connectContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  connectButton: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  connectedText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  userListContainer: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  userListTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  userItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  username: {
    fontSize: 16,
  },
  callButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  callButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 30,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
  },
  disconnectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  callContainer: {
    flex: 1,
    backgroundColor: "#1c1c1c",
  },
  remoteStream: {
    flex: 1,
  },
  localStream: {
    position: "absolute",
    top: 20,
    right: 20,
    height: 150,
    width: 100,
    backgroundColor: "#ffff",
    borderRadius: 10,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1c1c1c",
  },
  statusText: {
    color: "white",
    fontSize: 18,
  },
  callStatusContainer: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  callStatusText: {
    color: "white",
    fontSize: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 8,
    borderRadius: 20,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
  },
});

export default App;
