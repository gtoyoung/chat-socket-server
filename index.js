import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";

const app = express();

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: process.env.TARGET_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
  transports: ["websocket"],
});

app.use(cors({}));

const SOCKET_EVENT = {
  JOIN_ROOM: "JOIN_ROOM",
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
  LEAVE_ROOM: "LEAVE_ROOM",
  TYPING_MESSAGE: "TYPING_MESSAGE",
};

// 방에 점속한 인원 수
function countUsers(roomId) {
  return wsServer.sockets.adapter.rooms.get(roomId)?.size;
}

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket event: ${event}`);
  });

  // 방 참가
  socket.on(SOCKET_EVENT.JOIN_ROOM, (requestData) => {
    var type = SOCKET_EVENT.JOIN_ROOM;
    socket.join(requestData.roomId);

    // 현재 접속한 사용자 수
    var connectedClients = countUsers(requestData.roomId);

    const responseData = {
      ...requestData,
      type,
      time: new Date(),
      connectedClients,
    };

    wsServer.sockets.to(requestData.roomId).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
  });

  // 방 퇴장
  socket.on(SOCKET_EVENT.LEAVE_ROOM, (requestData) => {
    var type = SOCKET_EVENT.LEAVE_ROOM;
    socket.leave(requestData.roomId);

    // 현재 접속한 사용자 수
    var connectedClients = countUsers(requestData.roomId);

    const responseData = {
      ...requestData,
      type,
      time: new Date(),
      connectedClients,
    };

    wsServer.sockets.to(requestData.roomId).emit(type, responseData);
  });

  // 메시지 타이핑 중
  socket.on(SOCKET_EVENT.TYPING_MESSAGE, (requestData) => {
    var type = SOCKET_EVENT.TYPING_MESSAGE;

    // 현재 접속한 사용자 수
    var connectedClients = countUsers(requestData.roomId);

    const responseData = {
      ...requestData,
      type,
      time: new Date(),
      connectedClients,
    };

    wsServer.sockets.to(requestData.roomId).emit(type, responseData);
  });

  // 메시지 수신
  socket.on(SOCKET_EVENT.RECEIVE_MESSAGE, (requestData) => {
    var type = SOCKET_EVENT.RECEIVE_MESSAGE;

    // 현재 접속한 사용자 수
    var connectedClients = countUsers(requestData.roomId);

    const responseData = {
      ...requestData,
      type,
      time: new Date(),
      connectedClients,
    };

    wsServer.sockets.to(requestData.roomId).emit(type, responseData);
  });

  socket.on(SOCKET_EVENT.SEND_MESSAGE, (requestData) => {
    var type = SOCKET_EVENT.SEND_MESSAGE;

    // 현재 접속한 사용자 수
    var connectedClients = countUsers(requestData.roomId);

    const responseData = {
      ...requestData,
      type,
      time: new Date(),
      connectedClients,
    };

    wsServer.sockets.to(requestData.roomId).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
  });

  socket.on("disconnect", (reason) => {
    console.log(`"disconnect": ${reason}`);
  });
});

app.get("/", function (req, res) {
  res.send("WELL COME! DOVB`s SOCKET SERVER");
});

const port = process.env.PORT || 5000;

httpServer.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
