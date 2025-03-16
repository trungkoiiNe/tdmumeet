import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  BackHandler,
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { RTCSessionDescription, RTCView } from "react-native-webrtc";
import {
  ERROR_TYPES,
  handleConnectionError,
  handleMediaError,
} from "../../../../utils/callError";
import {
  getLocalStream,
  switchCamera,
  toggleAudio,
  toggleVideo,
} from "../../../../utils/media";
import {
  addIceCandidate,
  addLocalStreamToPeerConnection,
  createAnswer,
  createOffer,
  createPeerConnection,
} from "../../../../utils/webRTC";
import CallControls from "./call-control";
const CallScreen = ({ callData, username, endCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState(
    callData?.isIncoming ? "Đang kết nối cuộc gọi đến..." : "Đang gọi..."
  );
  console.log("callData:", callData);
  const peerConnectionRef = useRef(null);
  const socketRef = useRef(callData?.socket);
  const remoteUserRef = useRef(
    callData?.isIncoming ? callData?.from : callData?.to
  );
  const remoteUsernameRef = useRef(callData?.remoteUsername || "Người dùng");
  useEffect(() => {
    socketRef.current.on("ping", () => {
      socketRef.current.emit("pong");
    });

    return () => {
      socketRef.current.off("ping");
    };
  }, []);
  useEffect(() => {
    // Xử lý quyền truy cập
    const requestPermissions = async () => {
      if (Platform.OS === "android") {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);

          if (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] !==
              PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !==
              PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert(
              "Lỗi quyền truy cập",
              "Ứng dụng cần quyền truy cập Camera và Microphone để thực hiện cuộc gọi",
              [{ text: "OK", onPress: endCall }]
            );
            return false;
          }
          return true;
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
      return true;
    };

    const initializeCall = async () => {
      const hasPermissions = await requestPermissions();
      if (!hasPermissions) return;

      try {
        // Lấy local stream
        const stream = await getLocalStream(true);
        setLocalStream(stream);

        // Khởi tạo peer connection
        const peerConnection = createPeerConnection();
        peerConnectionRef.current = peerConnection;

        // Xử lý sự kiện ICE candidate
        const iceCandidateHandler = (event) => {
          if (event.candidate) {
            socketRef.current.emit("ice-candidate", {
              candidate: event.candidate,
              to: remoteUserRef.current,
            });
          }
        };
        peerConnection.addEventListener("icecandidate", iceCandidateHandler);
        // Xử lý sự kiện trạng thái kết nối ICE
        const iceConnectionStateHandler = () => {
          console.log(
            "ICE connection state:",
            peerConnection.iceConnectionState
          );

          if (
            peerConnection.iceConnectionState === "connected" ||
            peerConnection.iceConnectionState === "completed"
          ) {
            setCallStatus("Đã kết nối");
          } else if (
            peerConnection.iceConnectionState === "failed" ||
            peerConnection.iceConnectionState === "disconnected" ||
            peerConnection.iceConnectionState === "closed"
          ) {
            setCallStatus("Mất kết nối");
            setTimeout(() => {
              Alert.alert("Thông báo", "Cuộc gọi đã kết thúc", [
                { text: "OK", onPress: endCall },
              ]);
            }, 2000);
          }
        };
        peerConnection.addEventListener(
          "iceconnectionstatechange",
          iceConnectionStateHandler
        );
        // Xử lý sự kiện nhận remote stream
        const trackHandler = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };
        peerConnection.addEventListener("track", trackHandler);
        // Thêm local stream vào peer connection
        addLocalStreamToPeerConnection(peerConnection, stream);

        // Xử lý cuộc gọi đến hoặc đi
        if (callData.isIncoming) {
          // Cuộc gọi đến - tạo answer
          const answer = await createAnswer(peerConnection, callData.offer);
          socketRef.current.emit("answer", {
            answer,
            to: remoteUserRef.current,
          });
        } else {
          // Cuộc gọi đi - tạo offer
          // Xử lý cuộc gọi đi - tạo offer
          try {
            console.log("Creating offer...");
            const offer = await createOffer(peerConnection);
            socketRef.current.emit("offer", {
              offer,
              to: remoteUserRef.current,
              from: socketRef.current.id, // Add sender's ID
              username: username || "Unknown User", // Add sender's username
            });
            console.log("Offer created");
          } catch (error) {
            console.log("Error creating offer:", error);
          }
        }

        // Cài đặt các listener cho socket
        setupSocketListeners();

        // Xử lý nút back trên Android
        const backHandler = BackHandler.addEventListener(
          "hardwareBackPress",
          () => {
            handleEndCall();
            return true;
          }
        );

        return () => {
          backHandler.remove();
        };
      } catch (error) {
        console.error("Error initializing call:", error);

        let errorInfo;

        if (
          error.name === "NotAllowedError" ||
          error.name === "PermissionDeniedError"
        ) {
          errorInfo = handleMediaError(error);
        } else if (error.message && error.message.includes("network")) {
          errorInfo = handleConnectionError(error);
        } else {
          errorInfo = {
            type: ERROR_TYPES.UNKNOWN_ERROR,
            message: "Không thể khởi tạo cuộc gọi. Vui lòng thử lại sau.",
          };
        }

        Alert.alert("Lỗi", errorInfo.message, [
          { text: "OK", onPress: endCall },
        ]);
      }
    };

    initializeCall();

    return () => {
      // Dọn dẹp khi component unmount
      cleanupCall();
    };
  }, []);

  const setupSocketListeners = () => {
    // Xử lý khi nhận được answer
    socketRef.current.on("answer", async (data) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          setCallStatus("Đang kết nối...");
        }
      } catch (error) {
        console.error("Error setting remote description:", error);
      }
    });

    // Xử lý khi nhận được ICE candidate
    socketRef.current.on("ice-candidate", async (data) => {
      try {
        if (data.from === remoteUserRef.current) {
          await addIceCandidate(peerConnectionRef.current, data.candidate);
        }
      } catch (error) {
        console.error("Error adding ice candidate:", error);
      }
    });

    // Xử lý khi bên kia ngắt cuộc gọi
    socketRef.current.on("end-call", (data) => {
      if (data.from === remoteUserRef.current) {
        Alert.alert("Thông báo", "Cuộc gọi đã kết thúc bởi người dùng khác");
        endCall();
      }
    });

    // Xử lý khi bên kia ngắt kết nối
    socketRef.current.on("user-disconnected", (userId) => {
      if (userId === remoteUserRef.current) {
        Alert.alert("Thông báo", "Người dùng đã ngắt kết nối");
        endCall();
      }
    });
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit("end-call", {
        to: remoteUserRef.current,
      });
    }
    cleanupCall();
    endCall();
  };

  const cleanupCall = () => {
    // Dừng local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    // Đóng peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Xóa socket listeners
    if (socketRef.current) {
      socketRef.current.off("answer");
      socketRef.current.off("ice-candidate");
      socketRef.current.off("end-call");
      socketRef.current.off("user-disconnected");
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
    // Lưu ý: Phần này cần thêm thư viện react-native-incall-manager
    // hoặc sử dụng API đặc biệt tùy từng nền tảng
    setIsSpeakerOn(!isSpeakerOn);
  };

  const handleSwitchCamera = async () => {
    try {
      if (localStream) {
        const newStream = await switchCamera(localStream);
        if (newStream) {
          setLocalStream(newStream);
          if (peerConnectionRef.current) {
            // Remove old tracks
            peerConnectionRef.current.getSenders().forEach((sender) => {
              peerConnectionRef.current.removeTrack(sender);
            });
            // Add new tracks
            newStream.getTracks().forEach((track) => {
              peerConnectionRef.current.addTrack(track, newStream);
            });
          }
        }
      }
    } catch (error) {
      console.error("Error switching camera:", error);
    }
  };

  return (
    <View style={styles.container}>
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
            ? `Đang gọi với ${remoteUsernameRef.current}`
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
          onEndCall={handleEndCall}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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

export default CallScreen;
