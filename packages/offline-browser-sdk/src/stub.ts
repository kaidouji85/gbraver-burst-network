import { io } from "socket.io-client";

window.onload = () => {
  const socket = io("http://localhost:3000");
  console.log("hello");
};
