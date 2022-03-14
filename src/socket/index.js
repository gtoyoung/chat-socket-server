const SOCKET_EVENT = {
  JOIN_ROOM: "JOIN_ROOM",
  SEND_MESSAGE: "SEND_MESSAGE",
  RECEIVE_MESSAGE: "RECEIVE_MESSAGE",
  LEAVE_ROOM: "LEAVE_ROOM",
  TYPING_MESSAGE: "TYPING_MESSAGE",
};

module.exports = function (socketIo) {
  socketIo.on("connection", function (socket) {
    console.log("socket connection succeeded.");

    Object.keys(SOCKET_EVENT).forEach((typeKey) => {
      const type = SOCKET_EVENT[typeKey];

      socket.on(type, (requestData) => {
        const firstVisit = type === SOCKET_EVENT.JOIN_ROOM;

        if (firstVisit) {
          socket.join(requestData.roomId);
        }

        const responseData = {
          ...requestData,
          type,
          time: new Date(),
        };

        if (type === SOCKET_EVENT.LEAVE_ROOM) {
          socketIo
            .to(requestData.roomId)
            .emit(SOCKET_EVENT.LEAVE_ROOM, responseData);
        } else if (type === SOCKET_EVENT.TYPING_MESSAGE) {
          socketIo
            .to(requestData.roomId)
            .emit(SOCKET_EVENT.TYPING_MESSAGE, responseData);
        } else {
          socketIo
            .to(requestData.roomId)
            .emit(SOCKET_EVENT.RECEIVE_MESSAGE, responseData);
        }

        // 서버는 이벤트를 받은 시각과 함께 데이터를 그대로 중계해주는 역할만 수행
        // 프론트엔드에서 출력 메시지 값 등을 관리
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`"disconnect": ${reason}`);
    });
  });
};
