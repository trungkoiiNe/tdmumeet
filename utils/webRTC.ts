import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
} from "react-native-webrtc";

export const createPeerConnection = (iceServers = []) => {
  const defaultIceServers = [
    {
      urls: "stun:stun.relay.metered.ca:80",
    },
    {
      urls: "turn:asia.relay.metered.ca:80",
      username: "c5eb4e2d4720c1663cee2ba6",
      credential: "0/2/LU6ZFaIYxEGt",
    },
    {
      urls: "turn:asia.relay.metered.ca:80?transport=tcp",
      username: "c5eb4e2d4720c1663cee2ba6",
      credential: "0/2/LU6ZFaIYxEGt",
    },
    {
      urls: "turn:asia.relay.metered.ca:443",
      username: "c5eb4e2d4720c1663cee2ba6",
      credential: "0/2/LU6ZFaIYxEGt",
    },
    {
      urls: "turns:asia.relay.metered.ca:443?transport=tcp",
      username: "c5eb4e2d4720c1663cee2ba6",
      credential: "0/2/LU6ZFaIYxEGt",
    },
  ];

  const configuration = {
    iceServers: iceServers.length > 0 ? iceServers : defaultIceServers,
    iceCandidatePoolSize: 10,
    // Thêm các cấu hình tối ưu
    // sdpSemantics: "unified-plan",
  };

  return new RTCPeerConnection(configuration);
};
export const getOptimizedVideoConstraints = (
  isFrontCamera = true,
  quality = "medium"
) => {
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
      facingMode: isFrontCamera ? "user" : "environment",
    },
  };
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
    console.error("Error creating offer:", error);
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
    console.error("Error creating answer:", error);
    throw error;
  }
};

export const addIceCandidate = async (peerConnection, candidate) => {
  try {
    if (peerConnection && peerConnection.remoteDescription && candidate) {
      await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      console.log("Successfully added ICE Candidate");
    }
  } catch (error) {
    console.error("Error adding ice candidate:", error);
  }
};
