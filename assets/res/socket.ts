import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const initializeSocket = () => {
  if (!socket) {
    socket = io("http://localhost:8000");
  }
  return socket;
};
