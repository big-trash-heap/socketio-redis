import { Redis } from "ioredis";
import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import express from "express";

import { token } from "./token.mjs";

const app = express();
const serverport = 3012;
const server = app.listen(serverport);

const pubClient = new Redis({
  host: "185.201.28.102",
  port: 6379,
});
const subClient = pubClient.duplicate();

const socketByUserId = new Map();
const userBySocket = new WeakMap();

const io = new Server(server, {
  adapter: createAdapter(pubClient, subClient),
});

io.on("connection", (socket) => {
  const { authToken, userId } = socket.handshake.auth;

  console.log(`${serverport} Пользователь ${userId} подключился`);

  if (token !== authToken || !userId) {
    socket.emitWithAck("unauthorized");
    socket.disconnect();

    console.log(
      `${serverport} Пользователь ${userId} не был аутифицирован и был отключён`
    );
    return;
  }

  socketByUserId.set(userId, socket);
  userBySocket.set(socket, { userId });

  socket.on("disconnect", () => {
    socketByUserId.delete(userId);
    userBySocket.delete(socket);

    io.emit(
      "broadcast-message",
      `Пользователь ${userId} отключился от кластера`
    );

    console.log(`${serverport} Пользователь ${userId} отключился`);
  });

  socket.emitWithAck("authorized");

  io.emit("broadcast-message", `Пользователь ${userId} подключился к кластеру`);

  console.log(`${serverport} Пользователь ${userId} авторизирован`);

  // socket.on("message", (data) => {
  //   io.emit(
  //     "broadcast-message",
  //     `Пользователь ${userId} подключился к кластеру`
  //   );
  // });
});
