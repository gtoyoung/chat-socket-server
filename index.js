const express = require("express");
const app = express();
const server = require("http").createServer(app);
// const cors = require("cors");
require("dotenv").config();
const corsOptions = {
  origin: "*",
};
const socketIo = require("socket.io")(server, {
  cors: {
    origin: process.env.TARGET_URL,
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
});

const socket = require("./src/socket");

app.get("/", function (req, res) {
  res.send("WELL COME! DOVB`s SOCKET SERVER");
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
  console.log(`server is running on port ${port}`);

  socket(socketIo);
});
