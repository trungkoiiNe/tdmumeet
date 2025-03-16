import { mediaDevices } from "react-native-webrtc";

export const getLocalStream = async (isFrontCamera = true) => {
  try {
    const sourceInfos =
      (await mediaDevices.enumerateDevices()) as MediaDeviceInfo[];

    const videoSource = sourceInfos.find(
      (deviceInfo) =>
        deviceInfo.kind === "videoinput" &&
        deviceInfo.label.includes(isFrontCamera ? "front" : "environment")
    );

    const stream = await mediaDevices.getUserMedia({
      audio: true,
      video: {
        width: { min: 640 },
        height: { min: 480 },
        frameRate: { min: 30 },
        facingMode: isFrontCamera ? "user" : "environment",
        deviceId: videoSource ? videoSource.deviceId : undefined,
      },
    });

    return stream;
  } catch (error) {
    console.error("Error getting user media:", error);
    throw error;
  }
};

export const switchCamera = async (currentStream) => {
  if (!currentStream) return null;

  // Stop current tracks
  currentStream.getTracks().forEach((track) => track.stop());

  // Determine current facing mode of camera
  const videoTrack = currentStream.getVideoTracks()[0];
  const currentFacing = videoTrack?.getSettings?.()?.facingMode || "user";
  const isFrontCamera = currentFacing !== "environment";

  // Get new stream with the opposite camera
  return getLocalStream(!isFrontCamera);
};

export const toggleAudio = (stream, enabled) => {
  if (!stream) return;
  stream.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
};

export const toggleVideo = (stream, enabled) => {
  if (!stream) return;
  stream.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
};
