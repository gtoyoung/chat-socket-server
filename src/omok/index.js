let publicRoom = [];

// 오목 소켓 Role
const OMOK_EVENT = {
  ROOM_LIST: "room_list",
  ROOM_NEW: "room_new",
  ROOM_ENTER: "room_enter",
  ROOM_LEAVE: "room_leave",
  PLAYER_CHANGE: "player_change",
  PLAYER_SELECT: "player_select",
  PLAYER_SELECTED: "player_selected",
  PLAYER_READY: "player_ready",
  MESSAGE: "message",
  SEND_MESSAGE: "send_message",
};

export const OmokSocket = function (socket, server) {
  // 참여한 게임룸 이름 반환
  function getJoinedRoomName(socket) {
    return Array.from(socket.rooms)[1];
  }

  // 게임 룸 정보 반환
  function getPublicRoom(name) {
    return publicRoom.find((room) => room.name == name);
  }

  // id로 소켓 반환
  function findSocketById(id) {
    return server.sockets.sockets.get(id);
  }

  //이름이 name인 방에 속한 Socket 개수 반환
  function countRoom(name) {
    return server.sockets.adapter.rooms.get(name)?.size;
  }

  //중복된 이름의 방이 존재할 경우 false, 없을 경우 true
  function checkDuplicateRoomName(name) {
    if (server.sockets.adapter.rooms.get(name)) {
      return false;
    } else {
      return true;
    }
  }

  //
  function emitPlayChange(room) {
    server.in(room.name).emit(OMOK_EVENT.PLAYER_CHANGE, {
      blackPlayer: room.blackPlayer,
      whitePlayer: room.whitePlayer,
    });

    if (room.blackPlayer !== "" && room.whitePlayer !== "") {
      room.takes = [];
      findSocketById(room.blackPlayer).emit(OMOK_EVENT.PLAYER_SELECT);
    }
  }

  // 게임방 입장
  function enterRoom(socket, name) {
    const room = getPublicRoom(name);
    console.log(`Socket ${socket.id} is entering room ${name}.`);

    if (room === undefined) {
      socket.emit("error", "정상적인 방이 아닙니다.");
      return;
    }

    socket.join(name);
    socket.emit(OMOK_EVENT.ROOM_ENTER, room);
    server.to(name).emit(OMOK_EVENT.MESSAGE, `${socket.id} 님이 입장하셨습니다.`);
  }

  function leaveRoom(socket) {
    const name = getJoinedRoomName(socket);

    console.log(`Socket ${socket.id} is leaving room ${name}.`);

    if (name != undefined) {
      //현재 Disconnect 하는 Socket이 해당 방의 마지막 소켓일 경우 방 제거
      if (countRoom(name) == 1) {
        console.log(`Remove room ${name}`);
        publicRoom = publicRoom.filter((value) => value.name != name);
        server.sockets.emit(OMOK_EVENT.ROOM_LIST, publicRoom);
      } else {
        const room = getPublicRoom(name);
        // 블랙 알의 소켓이 나갔을 경우
        if (room.blackPlayer === socket.id) {
          room.blackPlayer = "";
          emitPlayChange(room);
          // 흰색 알의 소켓이 나갔을 경우
        } else if (room.whitePlayer === socket.id) {
          room.whitePlayer = "";
          emitPlayChange(room);
        }

        server.to(name).emit(OMOK_EVENT.MESSAGE, `${socket.id} 님이 퇴장하셨습니다.`);
      }
      socket.leave(name);
    }
  }

  //오목 완성 판별
  function checkOmokCompleted(coord, takes) {
    //(0, 1), (1, 1), (1, 0), (1, -1)
    const offset = [
      { x: 1, y: 0 }, //가로
      { x: 1, y: 1 }, //대각선1
      { x: 0, y: 1 }, //세로
      { x: -1, y: 1 }, //대각선2
    ];

    return offset.some((dir) => {
      let streak = 1;
      const type = (takes.length - 1) % 2;

      //정방향
      for (let x = coord.x + dir.x, y = coord.y + dir.y; x > 0 && x < 19 && y > 0 && y < 19; x += dir.x, y += dir.y) {
        if (takes.some((t, index) => t.x == x && t.y == y && index % 2 == type)) streak++;
        else break;
      }

      //반대방향
      for (let x = coord.x - dir.x, y = coord.y - dir.y; x > 0 && x < 19 && y > 0 && y < 19; x -= dir.x, y -= dir.y) {
        if (takes.some((t, index) => t.x == x && t.y == y && index % 2 == type)) streak++;
        else break;
      }

      if (streak === 5) {
        return true;
      }
    });
  }

  // 방 목록 반환
  socket.on(OMOK_EVENT.ROOM_LIST, () => {
    socket.emit(OMOK_EVENT.ROOM_LIST, publicRoom);
  });

  // 방 만들기
  socket.on(OMOK_EVENT.ROOM_NEW, (name) => {
    name = name.trim();
    console.log(`Socket ${socket.id} is creating room ${name}.`);

    //Socket은 ID와 같은 Room을 Default로 갖고 있음
    if (socket.rooms.size > 1) {
      console.log(`socket ${socket.id} is already in room.`);
      console.log(socket.rooms);
      socket.emit("error", "이미 다른 방에 참가중입니다.");
      return;
    }

    //동일한 이름의 방이 존재할 경우
    if (!checkDuplicateRoomName(name)) {
      console.log(`Room name ${name} is already exists.`);
      socket.emit("error", "동일한 방이 이미 존재합니다.");
      return;
    }

    const roomInfo = {
      name: "room",
      blackPlayer: "",
      whitePlayer: "",
      takes: [],
    };

    roomInfo.name = name;
    publicRoom.push(roomInfo);
    server.sockets.emit(OMOK_EVENT.ROOM_LIST, publicRoom);

    enterRoom(socket, name);
  });

  // 기존 방 참가
  socket.on(OMOK_EVENT.ROOM_ENTER, (name) => {
    if (socket.rooms.size > 1) {
      console.log(`socket ${socket.id} is already in room.`);
      console.log(socket.rooms);
      socket.emit("error", "이미 다른 방에 참가중입니다.");
      return;
    }

    enterRoom(socket, name);
  });

  // 방 나감
  socket.on(OMOK_EVENT.ROOM_LEAVE, () => {
    leaveRoom(socket);
    socket.emit(OMOK_EVENT.ROOM_LEAVE);
  });

  // 플레이어 체인지
  socket.on(OMOK_EVENT.PLAYER_CHANGE, (color) => {
    const roomName = getJoinedRoomName(socket);
    const room = getPublicRoom(roomName);

    if (color === "black") {
      if (room.blackPlayer !== "") {
        socket.emit("error", "다른 플레이어가 참가중입니다.");
        return;
      } else {
        // socket id가 이미 흰색으로 참여되어있을 경우 흰색을초기화해줌
        if (room.whitePlayer === socket.id) room.whitePlayer = "";
        room.blackPlayer = socket.id;
      }
    } else if (color === "white") {
      if (room.whitePlayer !== "") {
        socket.emit("error", "다른 플레이어가 참가중입니다.");
        return;
      } else {
        // socket id가 이미 검은색으로 참여되어있을 경우 검은색을초기화해줌
        if (room.blackPlayer === socket.id) room.blackPlayer = "";
        room.whitePlayer = socket.id;
      }
    } else if (color === "spectator") {
      if (room.blackPlayer === socket.id) {
        room.blackPlayer = "";
      } else if (room.whitePlayer === socket.id) {
        room.whitePlayer = "";
      } else {
        return;
      }
    }

    emitPlayChange(room);
  });

  socket.on(OMOK_EVENT.PLAYER_SELECTED, (coord) => {
    const name = getJoinedRoomName(socket);
    const room = getPublicRoom(name);

    if (room === undefined) {
      console.log(`Room ${name} is not exitsting.`);
      return;
    }

    const isBlackTurn = room.takes.length % 2 == 0;

    if (isBlackTurn) {
      // 흑돌
      if (room.blackPlayer !== socket.id) {
        socket.emit("error", "흑돌 플레이어가 아닙니다.");
        return;
      }
    } else {
      // 백돌
      if (room.whitePlayer !== socket.id) {
        socket.emit("error", "백돌 플레이어가 아닙니다.");
        return;
      }
    }

    if (findSocketById(room.blackPlayer) === undefined || findSocketById(room.whitePlayer) === undefined) {
      socket.emit("error", "상대가 존재하지 않습니다.");
      return;
    }

    if (room.takes.find((c) => c.x === coord.x && c.y === coord.y) !== undefined) {
      socket.emit("error", "이미 다른 돌이 위치하고 있습니다.");
      socket.emit(OMOK_EVENT.PLAYER_SELECT);
      return;
    }

    room.takes.push(coord);
    server.in(name).emit(OMOK_EVENT.PLAYER_SELECTED, coord);

    if (checkOmokCompleted(coord, room.takes)) {
      console.log("Omok completed!");
      server.in(name).emit("game_end", isBlackTurn ? "black" : "white");
      server.in(name).emit(OMOK_EVENT.MESSAGE, `${socket.id}님이 승리하셨습니다!`);
      room.blackPlayer = "";
      room.whitePlayer = "";
      emitPlayChange(room);
      return;
    }

    // 현재가 흑돌이면 백돌차례로 셋팅 아니면 반대로
    if (isBlackTurn) {
      findSocketById(room.whitePlayer).emit(OMOK_EVENT.PLAYER_SELECT);
    } else {
      findSocketById(room.blackPlayer).emit(OMOK_EVENT.PLAYER_SELECT);
    }
  });

  socket.on(OMOK_EVENT.PLAYER_READY, () => {});

  socket.on(OMOK_EVENT.SEND_MESSAGE, (message) => {
    const name = getJoinedRoomName(socket);
    server.in(name).emit(OMOK_EVENT.SEND_MESSAGE, `${socket.id} : ${message}`);
  });

  socket.on("disconnection", () => {
    console.log(`Socket ${socket.id} is disconnectiong.`);
    leaveRoom(socket);
  });
};
