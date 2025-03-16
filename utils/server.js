const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Lưu trữ thông tin người dùng đang kết nối
const connectedUsers = {};

app.get("/", (req, res) => {
  res.send("Signaling Server đang chạy");
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Lưu thông tin người dùng kết nối
  connectedUsers[socket.id] = {
    id: socket.id,
    username:
      socket.handshake.query.username || `User_${socket.id.substr(0, 5)}`,
  };

  // Thông báo cho tất cả người dùng khi có người mới kết nối
  io.emit("user-list", Object.values(connectedUsers));

  // Xử lý khi có offer từ người gọi
  socket.on("offer", (data) => {
    console.log(`Offer received from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit("offer", {
        offer: data.offer,
        from: socket.id,
        username: connectedUsers[socket.id].username,
      });
    }
  });

  // Xử lý khi có answer từ người nhận
  socket.on("answer", (data) => {
    console.log(`Answer received from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit("answer", {
        answer: data.answer,
        from: socket.id,
        username: connectedUsers[socket.id].username,
      });
    }
  });

  // Xử lý khi có ICE candidate
  socket.on("ice-candidate", (data) => {
    console.log(`ICE candidate received from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    }
  });

  // Xử lý khi người gọi muốn ngắt cuộc gọi
  socket.on("end-call", (data) => {
    console.log(`Call end request from ${socket.id} to ${data.to}`);
    if (connectedUsers[data.to]) {
      io.to(data.to).emit("end-call", {
        from: socket.id,
      });
    }
  });

  // Xử lý khi người dùng ngắt kết nối
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Thông báo cho tất cả người dùng biết người này đã ngắt kết nối
    io.emit("user-disconnected", socket.id);

    // Xóa khỏi danh sách người dùng kết nối
    delete connectedUsers[socket.id];
    io.emit("user-list", Object.values(connectedUsers));
  });
  let heartbeatInterval = setInterval(() => {
    socket.emit("ping");
  }, 30000); // 30 giây ping một lần

  socket.on("pong", () => {
    // Client vẫn kết nối
    console.log(`Heartbeat received from ${socket.id}`);
  });

  socket.on("disconnect", () => {
    clearInterval(heartbeatInterval);
    // Các xử lý khác...
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(
    "Signaling Server đang chạy, click vào đây để mở ứng dụng: http://localhost:3000"
  );
  console.log(`Signaling Server đang chạy trên cổng ${PORT}`);
  console.log("CTRL + C để dừng server");
});
