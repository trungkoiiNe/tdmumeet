# Hướng dẫn đầy đủ triển khai Video Call trên React Native với WebRTC

## Mục lục
1. [Giới thiệu](#giới-thiệu)
2. [Cài đặt môi trường](#cài-đặt-môi-trường)
3. [Cấu hình React Native](#cấu-hình-react-native)
4. [Xây dựng Signaling Server](#xây-dựng-signaling-server)
5. [Xây dựng ứng dụng React Native](#xây-dựng-ứng-dụng-react-native)
6. [Xử lý kết nối WebRTC](#xử-lý-kết-nối-webrtc)
7. [Triển khai giao diện người dùng](#triển-khai-giao-diện-người-dùng)
8. [Xử lý các tình huống lỗi](#xử-lý-các-tình-huống-lỗi)
9. [Tối ưu hóa hiệu suất](#tối-ưu-hóa-hiệu-suất)
10. [Điểm cần lưu ý](#điểm-cần-lưu-ý)

## Giới thiệu

WebRTC (Web Real-Time Communication) là một công nghệ cho phép giao tiếp thời gian thực giữa các trình duyệt và ứng dụng di động. Trong hướng dẫn này, chúng ta sẽ xây dựng một ứng dụng video call đơn giản trên React Native sử dụng WebRTC và STUN server miễn phí của Google.

### Các thành phần của giải pháp:
1. **React Native App**: Ứng dụng di động giao diện người dùng
2. **react-native-webrtc**: Thư viện cung cấp các API WebRTC cho React Native
3. **Signaling Server**: Server trung gian để trao đổi thông tin kết nối
4. **STUN/TURN Server**: Server hỗ trợ kết nối qua NAT (chúng ta sẽ sử dụng STUN server của Google)

## Cài đặt môi trường

### Yêu cầu cơ bản:
- Node.js và npm/yarn
- React Native CLI
- Xcode (cho iOS)
- Android Studio (cho Android)

### Bước 1: Tạo dự án React Native mới

```bash
npx react-native init VideoCallApp
cd VideoCallApp
```

### Bước 2: Cài đặt các thư viện cần thiết

```bash
npm install react-native-webrtc socket.io-client
# hoặc nếu bạn dùng yarn
yarn add react-native-webrtc socket.io-client
```

## Cấu hình React Native

### Cấu hình iOS

1. Mở thư mục `ios` bằng Xcode.
2. Thêm quyền camera và microphone vào file `Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần quyền truy cập camera để thực hiện video call</string>
<key>NSMicrophoneUsageDescription</key>
<string>Ứng dụng cần quyền truy cập microphone để thực hiện video call</string>
```

3. Cài đặt Pods:
```bash
cd ios && pod install && cd ..
```

### Cấu hình Android

1. Mở file `android/app/src/main/AndroidManifest.xml` và thêm các quyền:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
<uses-feature android:name="android.hardware.camera" />
<uses-feature android:name="android.hardware.camera.autofocus" />
```

2. Cập nhật file `android/app/build.gradle`:
```gradle
android {
    defaultConfig {
        // ...
        minSdkVersion 24 // WebRTC cần ít nhất SDK 24
        // ...
    }
    // ...
}
```

3. Mở file `android/gradle.properties` và thêm:
```
android.enableDexingArtifactTransform.desugaring=false
```

## Xây dựng Signaling Server

### Bước 1: Tạo thư mục cho Signaling Server

```bash
mkdir signaling-server
cd signaling-server
npm init -y
npm install express socket.io cors
```

### Bước 2: Tạo file server.js

```javascript
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Lưu trữ thông tin người dùng đang kết nối
const connectedUsers = {};

app.get('/', (req, res) => {
  res.send('Signaling Server đang chạy');
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  // Lưu thông tin người dùng kết nối
  connectedUsers[socket.id] = {
    id: socket.id,
    username: socket.handshake.query.username || `User_${socket.id.substr(0, 5)}`
  };
  
  // Thông báo cho tất cả người dùng khi có người mới kết nối
  io.emit('user-list', Object.values(connectedUsers));
  
  // Xử lý khi có offer từ người gọi
  socket.on('offer', (data) => {
    console.log(`Offer received from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit('offer', {
        offer: data.offer,
        from: socket.id,
        username: connectedUsers[socket.id].username
      });
    }
  });
  
  // Xử lý khi có answer từ người nhận
  socket.on('answer', (data) => {
    console.log(`Answer received from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit('answer', {
        answer: data.answer,
        from: socket.id,
        username: connectedUsers[socket.id].username
      });
    }
  });
  
  // Xử lý khi có ICE candidate
  socket.on('ice-candidate', (data) => {
    console.log(`ICE candidate received from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit('ice-candidate', {
        candidate: data.candidate,
        from: socket.id
      });
    }
  });
  
  // Xử lý khi người gọi muốn ngắt cuộc gọi
  socket.on('end-call', (data) => {
    console.log(`Call end request from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit('end-call', {
        from: socket.id
      });
    }
  });
  
  // Xử lý khi người dùng ngắt kết nối
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Thông báo cho tất cả người dùng biết người này đã ngắt kết nối
    io.emit('user-disconnected', socket.id);
    
    // Xóa khỏi danh sách người dùng kết nối
    delete connectedUsers[socket.id];
    io.emit('user-list', Object.values(connectedUsers));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Signaling Server đang chạy trên cổng ${PORT}`);
});
```

### Bước 3: Khởi động Signaling Server

```bash
node server.js
```

## Xây dựng ứng dụng React Native

### Bước 1: Tạo cấu trúc thư mục

```
src/
├── components/
│   ├── CallScreen.js
│   ├── HomeScreen.js
│   ├── UserList.js
│   └── CallControls.js
├── utils/
│   ├── webrtcUtils.js
│   └── mediaUtils.js
└── App.js
```

### Bước 2: Tạo file App.js chính

```javascript
import React, { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';
import HomeScreen from './components/HomeScreen';
import CallScreen from './components/CallScreen';

const App = () => {
  const [inCall, setInCall] = useState(false);
  const [callData, setCallData] = useState(null);
  const [username, setUsername] = useState('');

  const startCall = (data) => {
    setCallData(data);
    setInCall(true);
  };

  const endCall = () => {
    setInCall(false);
    setCallData(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {!inCall ? (
        <HomeScreen
          username={username}
          setUsername={setUsername}
          startCall={startCall}
        />
      ) : (
        <CallScreen
          callData={callData}
          username={username}
          endCall={endCall}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
});

export default App;
```

### Bước 3: Tạo file utils/mediaUtils.js

```javascript
import { mediaDevices } from 'react-native-webrtc';

export const getLocalStream = async (isFrontCamera = true) => {
  try {
    const sourceInfos = await mediaDevices.enumerateDevices();
    
    const videoSourceId = sourceInfos.find(
      (deviceInfo) =>
        deviceInfo.kind === 'videoinput' &&
        deviceInfo.facing === (isFrontCamera ? 'front' : 'environment')
    );

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        mandatory: {
          minWidth: 640,
          minHeight: 480,
          minFrameRate: 30,
        },
        facingMode: isFrontCamera ? 'user' : 'environment',
        optional: videoSourceId ? [{ sourceId: videoSourceId }] : [],
      },
    });

    return stream;
  } catch (error) {
    console.error('Error getting user media:', error);
    throw error;
  }
};

export const switchCamera = async (currentStream) => {
  if (!currentStream) return null;
  
  // Dừng các track hiện tại
  currentStream.getTracks().forEach(track => track.stop());
  
  // Xác định xem camera hiện tại là front hay rear
  const videoTrack = currentStream.getVideoTracks()[0];
  const currentFacing = videoTrack?.getSettings?.()?.facingMode || 'user';
  const isFrontCamera = currentFacing !== 'environment';
  
  // Lấy stream mới với camera đối diện
  return getLocalStream(!isFrontCamera);
};

export const toggleAudio = (stream, enabled) => {
  if (!stream) return;
  stream.getAudioTracks().forEach(track => {
    track.enabled = enabled;
  });
};

export const toggleVideo = (stream, enabled) => {
  if (!stream) return;
  stream.getVideoTracks().forEach(track => {
    track.enabled = enabled;
  });
};
```

### Bước 4: Tạo file utils/webrtcUtils.js

```javascript
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from 'react-native-webrtc';

export const createPeerConnection = (iceServers = []) => {
  const defaultIceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' },
  ];

  const configuration = {
    iceServers: iceServers.length > 0 ? iceServers : defaultIceServers,
    iceCandidatePoolSize: 10,
  };

  return new RTCPeerConnection(configuration);
};

export const addLocalStreamToPeerConnection = (peerConnection, localStream) => {
  if (!peerConnection || !localStream) return;

  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream);
  });
};

export const createOffer = async (peerConnection) => {
  try {
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true,
    });
    
    await peerConnection.setLocalDescription(offer);
    return offer;
  } catch (error) {
    console.error('Error creating offer:', error);
    throw error;
  }
};

export const createAnswer = async (peerConnection, offer) => {
  try {
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    return answer;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

export const addIceCandidate = async (peerConnection, candidate) => {
  try {
    if (peerConnection && peerConnection.remoteDescription) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }
  } catch (error) {
    console.error('Error adding ice candidate:', error);
  }
};
```

## Xử lý kết nối WebRTC

### Bước 1: Tạo HomeScreen.js

```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import io from 'socket.io-client';
import UserList from './UserList';

const SIGNALING_SERVER_URL = 'http://your-server-ip:5000'; // Thay thế bằng IP thực của bạn

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
      Alert.alert('Lỗi', 'Vui lòng nhập tên của bạn');
      return;
    }

    setIsConnecting(true);

    socketRef.current = io(SIGNALING_SERVER_URL, {
      query: { username },
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to signaling server');
      setIsConnected(true);
      setIsConnecting(false);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      Alert.alert(
        'Lỗi kết nối',
        'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.'
      );
      setIsConnecting(false);
    });

    socketRef.current.on('user-list', (userList) => {
      // Loại bỏ bản thân khỏi danh sách
      const filteredUsers = userList.filter(
        (user) => user.id !== socketRef.current.id
      );
      setUsers(filteredUsers);
    });

    socketRef.current.on('offer', (data) => {
      Alert.alert(
        'Cuộc gọi đến',
        `${data.username || 'Một người dùng'} đang gọi cho bạn`,
        [
          {
            text: 'Từ chối',
            style: 'cancel',
          },
          {
            text: 'Chấp nhận',
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
    
    const selectedUser = users.find(user => user.id === userId);
    
    startCall({
      isIncoming: false,
      to: userId,
      socket: socketRef.current,
      remoteUsername: selectedUser?.username || 'Người dùng',
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
      <Text style={styles.title}>Video Call App</Text>

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
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  connectContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 20,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  connectButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  connectedContainer: {
    flex: 1,
  },
  connectedText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  disconnectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;
```

### Bước 2: Tạo UserList.js

```javascript
import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

const UserList = ({ users, onCallUser }) => {
  if (users.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có người dùng khác trực tuyến</Text>
      </View>
    );
  }

  const renderUserItem = ({ item }) => (
    <View style={styles.userItem}>
      <Text style={styles.username}>{item.username}</Text>
      <TouchableOpacity 
        style={styles.callButton}
        onPress={() => onCallUser(item.id)}
      >
        <Text style={styles.callButtonText}>Gọi</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Người dùng trực tuyến ({users.length})</Text>
      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  username: {
    fontSize: 16,
    flex: 1,
  },
  callButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default UserList;
```

### Bước 3: Tạo CallControls.js

```javascript
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Cài đặt thêm: npm install react-native-vector-icons

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
        style={[styles.button, isMicOn ? styles.activeButton : styles.inactiveButton]}
        onPress={onToggleMic}
      >
        <Icon
          name={isMicOn ? 'mic' : 'mic-off'}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, isVideoOn ? styles.activeButton : styles.inactiveButton]}
        onPress={onToggleVideo}
      >
        <Icon
          name={isVideoOn ? 'videocam' : 'videocam-off'}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.speakerButton, isSpeakerOn ? styles.activeButton : styles.inactiveButton]}
        onPress={onToggleSpeaker}
      >
        <Icon
          name={isSpeakerOn ? 'volume-up' : 'volume-off'}
          size={24}
          color="white"
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.switchButton]}
        onPress={onSwitchCamera}
      >
        <Icon name="switch-camera" size={24} color="white" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.endCallButton]}
        onPress={onEndCall}
      >
        <Icon name="call-end" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    paddingVertical: 15,
    borderRadius: 30,
    marginHorizontal: 10,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#4CAF50',
  },
  inactiveButton: {
    backgroundColor: '#555',
  },
  endCallButton: {
    backgroundColor: '#F44336',
  },
  switchButton: {
    backgroundColor: '#2196F3',
  },
  speakerButton: {
    backgroundColor: '#FF9800',
  },
});

export default CallControls;
```

### Bước 4: Tạo CallScreen.js

```javascript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  BackHandler,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import {
  RTCView,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  mediaDevices,
} from 'react-native-webrtc';
import CallControls from './CallControls';
import {
  createPeerConnection,
  addLocalStreamToPeerConnection,
  createOffer,
  createAnswer,
  addIceCandidate,
} from '../utils/webrtcUtils';
import {
  getLocalStream,
  toggleAudio,
  toggleVideo,
  switchCamera,
} from '../utils/mediaUtils';

const CallScreen = ({ callData, username, endCall }) => {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState(
    callData?.isIncoming ? 'Đang kết nối cuộc gọi đến...' : 'Đang gọi...'
  );

  const peerConnectionRef = useRef(null);
  const socketRef = useRef(callData?.socket);
  const remoteUserRef = useRef(
    callData?.isIncoming ? callData?.from : callData?.to
  );
  const remoteUsernameRef = useRef(
    callData?.remoteUsername || 'Người dùng'
  );

  useEffect(() => {
    // Xử lý quyền truy cập
    const requestPermissions = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.requestMultiple([
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          ]);
          
          if (
            granted[PermissionsAndroid.PERMISSIONS.CAMERA] !== PermissionsAndroid.RESULTS.GRANTED ||
            granted[PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] !== PermissionsAndroid.RESULTS.GRANTED
          ) {
            Alert.alert(
              'Lỗi quyền truy cập',
              'Ứng dụng cần quyền truy cập Camera và Microphone để thực hiện cuộc gọi',
              [{ text: 'OK', onPress: endCall }]
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

    const initializeCall