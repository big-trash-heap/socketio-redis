import io from "socket.io-client";

import { token } from "./token.mjs";

const user = {
  id: 117,
  token: token,
};

const socket = io("http://localhost:3011", {
  autoConnect: true,
  reconnection: true,
  auth: (authRequest) => {
    authRequest({
      authToken: user.token,
      userId: user.id,
    });
  },
});

socket.on("connect", () => {
  console.log(`Я ${user.id} подключился к кластеру`);
  console.log(`Я ${user.id} пробую авторизироваться в кластере`);
});

socket.on("authorized", () => {
  console.log(`Я ${user.id} успешно авторизирован в кластере`);
});

socket.on("unauthorized", () => {
  console.log(`Я ${user.id} не смог пройти аутификацию в кластере`);
});

socket.on("broadcast-message", (message) => {
  console.log(`Кластер: ${message}`);
});
