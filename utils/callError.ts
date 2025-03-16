const ERROR_TYPES = {
  PERMISSION_DENIED: "PERMISSION_DENIED",
  DEVICE_NOT_FOUND: "DEVICE_NOT_FOUND",
  CONNECTION_ERROR: "CONNECTION_ERROR",
  PEER_CONNECTION_ERROR: "PEER_CONNECTION_ERROR",
  SOCKET_ERROR: "SOCKET_ERROR",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
};

const handleMediaError = (error) => {
  console.error("Media Error:", error);

  if (
    error.name === "NotAllowedError" ||
    error.name === "PermissionDeniedError"
  ) {
    return {
      type: ERROR_TYPES.PERMISSION_DENIED,
      message: "Vui lòng cấp quyền truy cập camera và microphone",
    };
  } else if (
    error.name === "NotFoundError" ||
    error.name === "DevicesNotFoundError"
  ) {
    return {
      type: ERROR_TYPES.DEVICE_NOT_FOUND,
      message: "Không tìm thấy thiết bị camera hoặc microphone",
    };
  } else {
    return {
      type: ERROR_TYPES.UNKNOWN_ERROR,
      message: "Lỗi không xác định khi truy cập thiết bị media",
    };
  }
};

const handleConnectionError = (error) => {
  console.error("Connection Error:", error);

  return {
    type: ERROR_TYPES.CONNECTION_ERROR,
    message: "Lỗi kết nối. Vui lòng kiểm tra kết nối internet và thử lại",
  };
};

const handlePeerConnectionError = (error) => {
  console.error("Peer Connection Error:", error);

  return {
    type: ERROR_TYPES.PEER_CONNECTION_ERROR,
    message: "Lỗi kết nối với người dùng khác. Vui lòng thử lại sau",
  };
};

const handleSocketError = (error) => {
  console.error("Socket Error:", error);

  return {
    type: ERROR_TYPES.SOCKET_ERROR,
    message: "Lỗi kết nối đến máy chủ. Vui lòng thử lại sau",
  };
};

export {
  ERROR_TYPES,
  handleMediaError,
  handleConnectionError,
  handlePeerConnectionError,
  handleSocketError,
};
