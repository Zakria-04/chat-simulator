import { io, Socket } from "socket.io-client";

let socket: Socket | undefined;

export const initializeSocket = () => {
  if (!socket) {
    socket = io("http://10.0.0.7:8000");
  }
  return socket;
};
