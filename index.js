const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
require("dotenv").config();
const socketIo = require("socket.io")(server, {
  cors: {
    origin: process.env.TARGET_URL,
    credentials: true,
  },
});

const socket = require("./src/socket");

app.use(cors({ origin: process.env.TARGET_URL, credentials: true }));

socket(socketIo);

app.get("/", function (req, res) {
  res.send("WELL COME! DOVB`s SOCKET SERVER");
});

const port = process.env.PORT || 80;

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});