import express from "express";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { ChattingSocket } from "./src/chat/index.js";
import { OmokSocket } from "./src/omok/index.js";

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

wsServer.on("connection", (socket) => {
  socket.onAny((event) => {
    console.log(`Socket event: ${event}`);
  });

  // 채팅 소켓 이벤트
  ChattingSocket(socket, wsServer);

  // 오목 소켓 이벤트
  OmokSocket(socket, wsServer);

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
