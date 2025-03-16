import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import io from "socket.io-client";
import UserList from "./UserList";

const SIGNALING_SERVER_URL = "http://192.168.1.101:5000/"; // Thay thế bằng IP thực của bạn

const HomeScreen = ({ username, setUsername, startCall }) => {
  const [users, setUsers] = useState([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectToServer = () => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
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
        "Lỗi kết nối",
        "Không thể kết nối đến máy chủ. Vui lòng thử lại sau."
      );
      setIsConnecting(false);
    });

    socketRef.current.on("user-list", (userList) => {
      // Loại bỏ bản thân khỏi danh sách
      const filteredUsers = userList.filter(
        (user) => user.id !== socketRef.current.id
      );
      setUsers(filteredUsers);
    });

    socketRef.current.on("offer", (data) => {
      Alert.alert(
        "Cuộc gọi đến",
        `${data.username || "Một người dùng"} đang gọi cho bạn`, // Fixed string interpolation
        [
          {
            text: "Từ chối",
            style: "cancel",
          },
          {
            text: "Chấp nhận",
            onPress: () => {
              startCall({
                isIncoming: true,
                offer: data.offer,
                from: data.from,
                socket: socketRef.current,
              });
            },
          },
        ]
      );
    });
  };

  const initiateCall = (userId) => {
    if (!socketRef.current) return;
    const selectedUser = users.find((user) => user.id === userId);
    startCall({
      isIncoming: false,
      to: userId,
      socket: socketRef.current,
      remoteUsername: selectedUser?.username || "Người dùng",
    });
  };

  const disconnectFromServer = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setUsers([]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Video Cssall App</Text>

      {!isConnected ? (
        <View style={styles.connectContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập tên của bạn"
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
              <Text style={styles.buttonText}>Kết nối</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.connectedContainer}>
          <Text style={styles.connectedText}>
            Đã kết nối với tên: {username}
          </Text>

          <UserList users={users} onCallUser={initiateCall} />

          <TouchableOpacity
            style={[styles.button, styles.disconnectButton]}
            onPress={disconnectFromServer}
          >
            <Text style={styles.buttonText}>Ngắt kết nối</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  connectedContainer: {
    flex: 1,
  },
  connectedText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  disconnectButton: {
    backgroundColor: "#F44336",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default HomeScreen;
