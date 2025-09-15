// moved to useChatSocket.ts directly

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { io, Socket } from "socket.io-client";
// import { Message, UnReadnotification } from "@/types/chat.types";
// import { useChat } from "../context/ChatContext";

// let socket: Socket | null = null;

// export const useChatSocket = () => {
//   const { state, dispatch } = useChat();
//   const { activeConversationId } = state;
//   const [isConnected, setIsConnected] = useState(false);
//   const prevConversationRef = useRef<string | null>(null);

//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       console.warn("⚠️ No token found, socket won't connect.");
//       return;
//     }

//     if (!socket) {
//       socket = io(process.env.NEXT_PUBLIC_CHAT_SOCKET_URL || "", {
//         auth: { token },
//         reconnection: true,
//         reconnectionAttempts: 5,
//       });

//       socket.on("connect", () => {
//         console.log("✅ Connected:", socket?.id);
//         setIsConnected(true);
//       });

//       socket.on("disconnect", (reason) => {
//         console.log("❌ Disconnected:", reason);
//         setIsConnected(false);
//       });

//       socket.on("connect_error", (err) => {
//         console.error("⚠️ Connection error:", err.message);
//         setIsConnected(false);
//       });

//       socket.on("receive_message", (message: Message) => {
//         console.log("📩 Received:", message);
//         if (message.tempId) {
//           dispatch({
//             type: "REPLACE_MESSAGE",
//             payload: { tempId: message.tempId, finalMessage: message },
//           });
//         } else {
//           dispatch({ type: "ADD_MESSAGE", payload: message });
//         }
//       });

//       socket.on("unread_notification", (notif: UnReadnotification) => {
//         console.log("🔔 Unread:", notif);
//         dispatch({
//           type: "UPDATE_CONVERSATION_NOTIFICATION",
//           payload: notif,
//         });
//       });
//     }

//     return () => {
//       if (socket) {
//         console.log("🛑 Closing socket:", socket.id);
//         socket.disconnect();
//         socket = null;
//       }
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     if (isConnected && socket) {
//       const prev = prevConversationRef.current;

//       if (prev && prev !== activeConversationId) {
//         socket.emit("leave_conversation", prev);
//         console.log(`🚪 Left room: ${prev}`);
//       }

//       if (activeConversationId) {
//         socket.emit("join_conversation", activeConversationId);
//         console.log(`🚪 Joined room: ${activeConversationId}`);
//       }

//       prevConversationRef.current = activeConversationId;
//     }
//   }, [isConnected, activeConversationId]);

//   const sendMessage = (payload: {
//     conversationId: string;
//     senderId: string;
//     content: string;
//     tempId: string;
//   }) => {
//     if (socket && isConnected) {
//       dispatch({ type: "ADD_MESSAGE", payload });
//       socket.emit("send_message", payload);
//     } else {
//       console.error("⚠️ Socket not connected, cannot send.");
//     }
//   };

//   return { sendMessage, isConnected };
// };
