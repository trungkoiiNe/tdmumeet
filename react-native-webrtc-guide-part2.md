### Bước 4: Tiếp tục phần CallScreen.js

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
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            socketRef.current.emit('ice-candidate', {
              candidate: event.candidate,
              to: remoteUserRef.current,
            });
          }
        };

        // Xử lý sự kiện trạng thái kết nối ICE
        peerConnection.oniceconnectionstatechange = () => {
          console.log('ICE connection state:', peerConnection.iceConnectionState);
          
          if (peerConnection.iceConnectionState === 'connected' || 
              peerConnection.iceConnectionState === 'completed') {
            setCallStatus('Đã kết nối');
          } else if (peerConnection.iceConnectionState === 'failed' || 
                     peerConnection.iceConnectionState === 'disconnected' || 
                     peerConnection.iceConnectionState === 'closed') {
            setCallStatus('Mất kết nối');
            setTimeout(() => {
              Alert.alert('Thông báo', 'Cuộc gọi đã kết thúc', [
                { text: 'OK', onPress: endCall }
              ]);
            }, 2000);
          }
        };

        // Xử lý sự kiện nhận remote stream
        peerConnection.ontrack = (event) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        };

        // Thêm local stream vào peer connection
        addLocalStreamToPeerConnection(peerConnection, stream);

        // Xử lý cuộc gọi đến hoặc đi
        if (callData.isIncoming) {
          // Cuộc gọi đến - tạo answer
          const answer = await createAnswer(peerConnection, callData.offer);
          socketRef.current.emit('answer', {
            answer,
            to: remoteUserRef.current,
          });
        } else {
          // Cuộc gọi đi - tạo offer
          const offer = await createOffer(peerConnection);
          socketRef.current.emit('offer', {
            offer,
            to: remoteUserRef.current,
          });
        }

        // Cài đặt các listener cho socket
        setupSocketListeners();

        // Xử lý nút back trên Android
        const backHandler = BackHandler.addEventListener(
          'hardwareBackPress',
          () => {
            handleEndCall();
            return true;
          }
        );

        return () => {
          backHandler.remove();
        };
      } catch (error) {
        console.error('Error initializing call:', error);
        Alert.alert(
          'Lỗi',
          'Không thể khởi tạo cuộc gọi. Vui lòng thử lại sau.',
          [{ text: 'OK', onPress: endCall }]
        );
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
    socketRef.current.on('answer', async (data) => {
      try {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(
            new RTCSessionDescription(data.answer)
          );
          setCallStatus('Đang kết nối...');
        }
      } catch (error) {
        console.error('Error setting remote description:', error);
      }
    });

    // Xử lý khi nhận được ICE candidate
    socketRef.current.on('ice-candidate', async (data) => {
      try {
        if (data.from === remoteUserRef.current) {
          await addIceCandidate(peerConnectionRef.current, data.candidate);
        }
      } catch (error) {
        console.error('Error adding ice candidate:', error);
      }
    });

    // Xử lý khi bên kia ngắt cuộc gọi
    socketRef.current.on('end-call', (data) => {
      if (data.from === remoteUserRef.current) {
        Alert.alert('Thông báo', 'Cuộc gọi đã kết thúc bởi người dùng khác');
        endCall();
      }
    });

    // Xử lý khi bên kia ngắt kết nối
    socketRef.current.on('user-disconnected', (userId) => {
      if (userId === remoteUserRef.current) {
        Alert.alert('Thông báo', 'Người dùng đã ngắt kết nối');
        endCall();
      }
    });
  };

  const handleEndCall = () => {
    if (socketRef.current) {
      socketRef.current.emit('end-call', {
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
      socketRef.current.off('answer');
      socketRef.current.off('ice-candidate');
      socketRef.current.off('end-call');
      socketRef.current.off('user-disconnected');
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
          // Cập nhật local stream
          setLocalStream(newStream);
          
          // Cập nhật PeerConnection
          if (peerConnectionRef.current) {
            // Xóa các track cũ
            const senders = peerConnectionRef.current.getSenders();
            senders.forEach(sender => {
              peerConnectionRef.current.removeTrack(sender);
            });
            
            // Thêm track mới
            newStream.getTracks().forEach(track => {
              peerConnectionRef.current.addTrack(track, newStream);
            });
          }
        }
      }
    } catch (error) {
      console.error('Error switching camera:', error);
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
          {remoteStream ? `Đang gọi với ${remoteUsernameRef.current}` : callStatus}
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
    backgroundColor: '#1c1c1c',
  },
  remoteStream: {
    flex: 1,
  },
  localStream: {
    position: 'absolute',
    top: 20,
    right: 20,
    height: 150,
    width: 100,
    backgroundColor: '#ffff',
    borderRadius: 10,
    zIndex: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c',
  },
  statusText: {
    color: 'white',
    fontSize: 18,
  },
  callStatusContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  callStatusText: {
    color: 'white',
    fontSize: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 20,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
  },
});

export default CallScreen;
```

## Xử lý các tình huống lỗi

### Bước 1: Tạo một lớp trình xử lý lỗi

```javascript
// utils/errorHandler.js
const ERROR_TYPES = {
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  DEVICE_NOT_FOUND: 'DEVICE_NOT_FOUND',
  CONNECTION_ERROR: 'CONNECTION_ERROR',
  PEER_CONNECTION_ERROR: 'PEER_CONNECTION_ERROR',
  SOCKET_ERROR: 'SOCKET_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

const handleMediaError = (error) => {
  console.error('Media Error:', error);
  
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    return {
      type: ERROR_TYPES.PERMISSION_DENIED,
      message: 'Vui lòng cấp quyền truy cập camera và microphone',
    };
  } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
    return {
      type: ERROR_TYPES.DEVICE_NOT_FOUND,
      message: 'Không tìm thấy thiết bị camera hoặc microphone',
    };
  } else {
    return {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: 'Lỗi không xác định khi truy cập thiết bị media',
    };
  }
};

const handleConnectionError = (error) => {
  console.error('Connection Error:', error);
  
  return {
    type: ERROR_TYPES.CONNECTION_ERROR,
    message: 'Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại',
  };
};

const handlePeerConnectionError = (error) => {
  console.error('Peer Connection Error:', error);
  
  return {
    type: ERROR_TYPES.PEER_CONNECTION_ERROR,
    message: 'Lỗi kết nối với người dùng khác. Vui lòng thử lại sau',
  };
};

const handleSocketError = (error) => {
  console.error('Socket Error:', error);
  
  return {
    type: ERROR_TYPES.SOCKET_ERROR,
    message: 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau',
  };
};

export {
  ERROR_TYPES,
  handleMediaError,
  handleConnectionError,
  handlePeerConnectionError,
  handleSocketError,
};
```

### Bước 2: Cập nhật các hàm xử lý lỗi trong CallScreen

```javascript
import {
  ERROR_TYPES,
  handleMediaError,
  handleConnectionError,
  handlePeerConnectionError,
  handleSocketError,
} from '../utils/errorHandler';

// Trong hàm initializeCall, cập nhật phần xử lý lỗi:
try {
  // ... (phần code hiện tại)
} catch (error) {
  console.error('Error initializing call:', error);
  
  let errorInfo;
  
  if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
    errorInfo = handleMediaError(error);
  } else if (error.message && error.message.includes('network')) {
    errorInfo = handleConnectionError(error);
  } else {
    errorInfo = {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: 'Không thể khởi tạo cuộc gọi. Vui lòng thử lại sau.',
    };
  }
  
  Alert.alert('Lỗi', errorInfo.message, [{ text: 'OK', onPress: endCall }]);
}
```

## Tối ưu hóa hiệu suất

### Bước 1: Memoization với React.memo

```javascript
// Ví dụ với CallControls
import React, { memo } from 'react';

const CallControls = ({
  // ... props
}) => {
  // ... component code
};

export default memo(CallControls);
```

### Bước 2: Tối ưu WebRTC

```javascript
// Trong file webrtcUtils.js, cập nhật hàm createPeerConnection
export const createPeerConnection = (iceServers = []) => {
  const defaultIceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  const configuration = {
    iceServers: iceServers.length > 0 ? iceServers : defaultIceServers,
    iceCandidatePoolSize: 10,
    // Thêm các cấu hình tối ưu
    sdpSemantics: 'unified-plan',
    bundlePolicy: 'max-bundle',
    rtcpMuxPolicy: 'require',
  };

  return new RTCPeerConnection(configuration);
};

// Thêm hàm tối ưu video constraints
export const getOptimizedVideoConstraints = (isFrontCamera = true, quality = 'medium') => {
  // Các cấu hình chất lượng video dựa theo băng thông
  const videoQualities = {
    low: {
      width: { ideal: 320 },
      height: { ideal: 240 },
      frameRate: { ideal: 15 },
    },
    medium: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 30 },
    },
    high: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30 },
    },
  };

  return {
    audio: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
    video: {
      ...videoQualities[quality],
      facingMode: isFrontCamera ? 'user' : 'environment',
    },
  };
};
```

### Bước 3: Tối ưu hoạt động mạng

```javascript
// Trong signaling server, thêm cơ chế heartbeat để kiểm tra kết nối
// server.js
io.on('connection', (socket) => {
  // Các xử lý hiện tại...
  
  // Thiết lập heartbeat
  let heartbeatInterval = setInterval(() => {
    socket.emit('ping');
  }, 30000); // 30 giây ping một lần
  
  socket.on('pong', () => {
    // Client vẫn kết nối
    console.log(`Heartbeat received from ${socket.id}`);
  });
  
  socket.on('disconnect', () => {
    clearInterval(heartbeatInterval);
    // Các xử lý khác...
  });
});

// Trong React Native app, thêm xử lý ping/pong
useEffect(() => {
  socketRef.current.on('ping', () => {
    socketRef.current.emit('pong');
  });
  
  return () => {
    socketRef.current.off('ping');
  };
}, []);
```

## Triển khai giao diện người dùng bổ sung

### Bước 1: Tạo màn hình cài đặt

```javascript
// components/SettingsScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Slider,
} from 'react-native';

const SettingsScreen = ({ onClose, settings, onSettingsChange }) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const updateSetting = (key, value) => {
    setLocalSettings({
      ...localSettings,
      [key]: value,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cài đặt</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Đóng</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Video</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Chất lượng video</Text>
            <View style={styles.pickerContainer}>
              {['Thấp', 'Trung bình', 'Cao'].map((quality, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.qualityButton,
                    localSettings.videoQuality === ['low', 'medium', 'high'][index]
                      ? styles.qualityButtonActive
                      : null,
                  ]}
                  onPress={() =>
                    updateSetting('videoQuality', ['low', 'medium', 'high'][index])
                  }
                >
                  <Text
                    style={[
                      styles.qualityButtonText,
                      localSettings.videoQuality === ['low', 'medium', 'high'][index]
                        ? styles.qualityButtonTextActive
                        : null,
                    ]}
                  >
                    {quality}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Màn hình luôn sáng</Text>
            <Switch
              value={localSettings.keepAwake}
              onValueChange={(value) => updateSetting('keepAwake', value)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Âm thanh</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Tự động chống ồn</Text>
            <Switch
              value={localSettings.noiseSuppression}
              onValueChange={(value) => updateSetting('noiseSuppression', value)}
            />
          </View>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Tự động điều chỉnh âm lượng</Text>
            <Switch
              value={localSettings.autoGainControl}
              onValueChange={(value) => updateSetting('autoGainControl', value)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nâng cao</Text>
          
          <View style={styles.settingItem}>
            <Text style={styles.settingLabel}>Sử dụng TURN server</Text>
            <Switch
              value={localSettings.useTurnServer}
              onValueChange={(value) => updateSetting('useTurnServer', value)}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu cài đặt</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  settingLabel: {
    fontSize: 15,
  },
  pickerContainer: {
    flexDirection: 'row',
  },
  qualityButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginLeft: 5,
  },
  qualityButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  qualityButtonText: {
    fontSize: 14,
  },
  qualityButtonTextActive: {
    color: 'white',
  },
  saveButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    margin: 15,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default SettingsScreen;
```

## Điểm cần lưu ý

### 1. Bảo mật
- Sử dụng HTTPS cho signaling server
- Xác thực người dùng trước khi cho phép kết nối
- Sử dụng TURN server khi cần thiết
- Mã hóa dữ liệu truyền tải
  
### 2. Vấn đề kết nối
- Thêm cơ chế thử lại kết nối khi gặp lỗi
- Xử lý tốt các trường hợp mất kết nối
- Kiểm tra chất lượng mạng trước khi kết nối
  
### 3. Các thách thức thường gặp
- Vấn đề NAT Traversal: Nhiều khi STUN server không đủ, bạn cần thêm TURN server
- Chất lượng kết nối không ổn định: Cần có cơ chế giảm chất lượng video khi băng thông thấp
- Tiêu thụ pin và dữ liệu: Cần tối ưu việc sử dụng tài nguyên
  
### 4. Triển khai trên môi trường thực tế
- Sử dụng máy chủ đủ mạnh cho signaling server
- Cân nhắc việc sử dụng dịch vụ TURN server đám mây như Twilio, XirSys
- Theo dõi hiệu suất và độ ổn định của ứng dụng

### 5. Kiểm thử
- Kiểm thử trên nhiều thiết bị khác nhau
- Kiểm thử với các điều kiện mạng khác nhau
- Kiểm thử với số lượng người dùng lớn

## Tài nguyên bổ sung

1. [WebRTC.org](https://webrtc.org/): Tài liệu chính thức về WebRTC
2. [react-native-webrtc](https://github.com/react-native-webrtc/react-native-webrtc): Thư viện WebRTC cho React Native
3. [socket.io](https://socket.io/): Thư viện real-time communication
4. [Google STUN Server List](https://gist.github.com/zziuni/3741933): Danh sách các STUN server của Google
