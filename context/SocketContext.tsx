import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import io from "socket.io-client";
import { Alert } from 'react-native';

const SIGNALING_SERVER_URL = "http://192.168.110.8:5000";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const socketRef = useRef(null);
  const [username, setUsername] = useState('');
  
  // Clean up socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectToServer = (username) => {
    if (!username.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên của bạn");
      return;
    }

    setUsername(username);
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
      // Filter out the current user
      const filteredUsers = userList.filter(
        (user) => user.id !== socketRef.current.id
      );
      setUsers(filteredUsers);
    });

    return socketRef.current;
  };

  const disconnectFromServer = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      setIsConnected(false);
      setUsers([]);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        users,
        isConnected,
        isConnecting,
        username,
        setUsername,
        connectToServer,
        disconnectFromServer,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};