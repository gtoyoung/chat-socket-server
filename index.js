const express = require("express");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");
// require("dotenv").config();
// const corsOptions = {
//   origin: "*",
// };

const socketIo = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["*"],
    credentials: true,
  },
  transports: ["websocket"],
});

app.use(cors({}));

const socket = require("./src/socket");

socket(socketIo);

app.get("/", function (req, res) {
  res.send("WELL COME! DOVB`s SOCKET SERVER");
});

const port = process.env.PORT || 80;

server.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
