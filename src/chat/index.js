const SOCKET_EVENT = {
  JOIN_ROOM: "JOIN_ROOM",
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
  LEAVE_ROOM: "LEAVE_ROOM",
  TYPING_MESSAGE: "TYPING_MESSAGE",
};

export const ChattingSocket = function (socket, server) {
  // 방에 점속한 인원 수
  function countUsers(roomId) {
    return server.sockets.adapter.rooms.get(roomId)?.size;
  }

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

    server.sockets.to(requestData.roomId).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
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

    server.sockets.to(requestData.roomId).emit(type, responseData);
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

    server.sockets.to(requestData.roomId).emit(type, responseData);
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

    server.sockets.to(requestData.roomId).emit(type, responseData);
  });

  // 메시지 전달
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

    server.sockets.to(requestData.roomId).emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
  });
};
