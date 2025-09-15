import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_CHAT_SOCKET_URL;
    if (!socketUrl) {
      console.error("NEXT_PUBLIC_CHAT_SOCKET_URL is not defined in .env.local");
      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No auth token found, socket connection not initiated.");
      return;
    }

    const newSocket = io(socketUrl, {
      auth: {
        token: token,
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected successfully:", newSocket.id);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return socket;
};

export default useSocket;
