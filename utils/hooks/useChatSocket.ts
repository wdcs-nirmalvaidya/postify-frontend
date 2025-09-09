"use client";

import { useEffect, useRef } from "react";
import { Socket, io } from "socket.io-client";
import { Message, UnReadnotification } from "@/types/chat.types";
import { useChat } from "../context/ChatContext";

const socketref: { current: Socket | null } = { current: null };

export const useChatSocket = () => {
  const { state, dispatch } = useChat();

  useEffect(() => {
    if (!socketref.current) {
      const token = localStorage.getItem("token");

      if (token) {
        socketref.current = io(process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "", {
          auth: { token },
        });

        socketref.current.on("connect", () => {
          console.log(
            "Connected To Chat Socket WebSocket:",
            socketref.current?.id,
          );
        });

        socketref.current.on("disconnect", (reason) => {
          console.log("Disconnected from Chat Socket WebSocket:", reason);
        });

        socketref.current.on("connect_error", (err) => {
          console.error("Chat Socket connection error:", err.message);
        });

        socketref.current.on("receive_message", (message: Message) => {
          console.log("Received message:", message);
          dispatch({ type: "ADD_MESSAGE", payload: message });
        });

        socketref.current.on(
          "unread_notification",
          (notif: UnReadnotification) => {
            console.log("Received unread notification:", notif);
            dispatch({
              type: "UPDATE_CONVERSATION_NOTIFICATION",
              payload: notif,
            });
          },
        );
        if (socketref.current && state.activeConversationId) {
          socketref.current.emit(
            "join_conversation",
            state.activeConversationId,
          );
        }

        return () => {
          if (socketref.current) {
            socketref.current.off("receive_message");
            socketref.current.off("unread_message_notification");
          }
        };
      }
    }
  }, [state.activeConversationId, dispatch]);
  const sendMessage = (payload: {
    conversationId: string;
    senderId: string;
    content: string;
  }) => {
    if (socketref.current) {
      socketref.current.emit("send_message", payload);
    }
  };

  return { sendMessage };
};
