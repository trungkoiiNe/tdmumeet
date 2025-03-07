async function createRoom(roomName: string): Promise<{ roomName: string }> {
  const response = await fetch(
    `https://${process.env.EXPO_PUBLIC_METERED_DOMAIN}.metered.live/api/v1/room?secretKey=${process.env.EXPO_PUBLIC_METERED_SECRET}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ roomName }),
    }
  );

  if (!response.ok) throw new Error("Failed to create room");
  return response.json();
}

async function joinRoom(roomName: string): Promise<{ roomName: string }> {
  const response = await fetch(
    `https://${process.env.EXPO_PUBLIC_METERED_DOMAIN}.metered.live/api/v1/room/${roomName}/join?secretKey=${process.env.EXPO_PUBLIC_METERED_SECRET}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) throw new Error("Failed to join room");
  return response.json();
}

async function validateRoom(roomName: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${process.env.EXPO_PUBLIC_METERED_DOMAIN}.metered.live/api/v1/room/${roomName}?secretKey=${process.env.EXPO_PUBLIC_METERED_SECRET}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) return false;
    const data = await response.json();
    return Boolean(data.roomName);
  } catch (error) {
    console.error("Error validating room:", error);
    return false;
  }
}

async function endRoom(roomName: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://${process.env.EXPO_PUBLIC_METERED_DOMAIN}.metered.live/api/v1/room/${roomName}?secretKey=${process.env.EXPO_PUBLIC_METERED_SECRET}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error ending room:", error);
    return false;
  }
}

// Helper to get WebRTC ice servers
async function getIceServers(): Promise<RTCIceServer[]> {
  try {
    const response = await fetch(
      `https://${process.env.EXPO_PUBLIC_METERED_DOMAIN}.metered.live/api/v1/turn/credentials?secretKey=${process.env.EXPO_PUBLIC_METERED_SECRET}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get ICE servers");
    }
    const iceServers = await response.json();
    return iceServers;
  } catch (error) {
    console.error("Error getting ICE servers:", error);
    // Return fallback servers
    return [
      {
        urls: "stun:stun.relay.metered.ca:80",
      },
      {
        urls: "turn:asia.relay.metered.ca:80",
        username: "54882df11eccfe0d19390ac3",
        credential: "on3c5CjEcv5HrGvk",
      },
      {
        urls: "turn:asia.relay.metered.ca:80?transport=tcp",
        username: "54882df11eccfe0d19390ac3",
        credential: "on3c5CjEcv5HrGvk",
      },
      {
        urls: "turn:asia.relay.metered.ca:443",
        username: "54882df11eccfe0d19390ac3",
        credential: "on3c5CjEcv5HrGvk",
      },
      {
        urls: "turns:asia.relay.metered.ca:443?transport=tcp",
        username: "54882df11eccfe0d19390ac3",
        credential: "on3c5CjEcv5HrGvk",
      },
    ];
  }
}

const meetingServices = {
  createRoom,
  joinRoom,
  validateRoom,
  endRoom,
  getIceServers,
};

export default meetingServices;
