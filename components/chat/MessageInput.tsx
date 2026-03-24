"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { PaperAirplaneIcon, MicrophoneIcon, PhotoIcon, FaceSmileIcon } from "@heroicons/react/24/outline";
import { StopIcon, TrashIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/utils/hooks/useAuth";
import { useChat } from "@/utils/context/ChatContext";
import { useState, useRef, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";

// Lazy-load the emoji picker to avoid SSR issues
const EmojiPicker = dynamic(
  () => import("@emoji-mart/react").then((m) => m.default),
  { ssr: false }
);

type Inputs = { content: string };

export const MessageInput = ({ conversationId }: { conversationId: string }) => {
  const { sendMessage, dispatch, sendTypingStart, sendTypingStop } = useChat();
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch, setValue } = useForm<Inputs>();
  const content = watch("content");

  const [showEmoji, setShowEmoji] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [emojiData, setEmojiData] = useState<any>(null);

  // Load emoji data
  useEffect(() => {
    import("@emoji-mart/data").then((mod) => setEmojiData(mod.default));
  }, []);

  // ─── Typing indicator ────────────────────────────────────────────────────
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  const handleTyping = useCallback(() => {
    if (!user || !conversationId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTypingStart(conversationId, user.id, user.name || user.username);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTypingStop(conversationId, user.id);
    }, 2000);
  }, [conversationId, user, sendTypingStart, sendTypingStop]);

  // ─── Image upload ────────────────────────────────────────────────────────
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          id: tempId,
          conversationId,
          senderId: user.id,
          contentText: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          mediaUrl: base64,
          mediaType: "image",
          status: "sending",
        },
      });
      sendMessage({ conversationId, senderId: user.id, content: "", tempId, mediaUrl: base64, mediaType: "image" });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ─── Voice recording ─────────────────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onload = () => {
          if (!user) return;
          const base64 = reader.result as string;
          const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              id: tempId,
              conversationId,
              senderId: user.id,
              contentText: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              mediaUrl: base64,
              mediaType: "audio",
              status: "sending",
            },
          });
          sendMessage({ conversationId, senderId: user.id, content: "", tempId, mediaUrl: base64, mediaType: "audio" });
        };
        reader.readAsDataURL(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);
      recordingTimerRef.current = setInterval(() => setRecordingSeconds((s) => s + 1), 1000);
    } catch {
      alert("Microphone access denied.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.ondataavailable = null;
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
    }
    setIsRecording(false);
    audioChunksRef.current = [];
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setRecordingSeconds(0);
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!data.content.trim() || !user) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    isTypingRef.current = false;
    sendTypingStop(conversationId, user.id);
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        id: tempId,
        conversationId,
        senderId: user.id,
        contentText: data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        mediaUrl: null,
        mediaType: null,
        status: "sending",
      },
    });
    sendMessage({ conversationId, senderId: user.id, content: data.content, tempId });
    reset();
    setShowEmoji(false);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative">
      {/* Emoji Picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 z-30"
          >
            {emojiData && (
              <EmojiPicker
                data={emojiData}
                theme="auto"
                onEmojiSelect={(e: { native: string }) => {
                  const current = content || "";
                  setValue("content", current + e.native);
                }}
                previewPosition="none"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {isRecording ? (
        // ─── Recording UI ───
        <div className="p-3 bg-white dark:bg-gray-950 border-t dark:border-gray-800 flex items-center gap-3">
          <button onClick={cancelRecording} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20">
            <TrashIcon className="w-5 h-5" />
          </button>
          <div className="flex-1 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 rounded-full px-4 py-2">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 dark:text-red-400 font-mono">{formatTime(recordingSeconds)}</span>
            <div className="flex-1 h-1 bg-red-200 dark:bg-red-800 rounded-full overflow-hidden">
              <div className="h-full bg-red-500 rounded-full animate-pulse w-full" />
            </div>
          </div>
          <button
            onClick={stopRecording}
            className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        // ─── Normal Input UI ───
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-3 bg-white dark:bg-gray-950 flex items-center gap-2 border-t dark:border-gray-800"
        >
          {/* Emoji button */}
          <button
            type="button"
            onClick={() => setShowEmoji((v) => !v)}
            className={`p-2 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0 ${showEmoji ? "text-blue-600" : "text-gray-500 dark:text-gray-400 hover:text-blue-600"
              }`}
          >
            <FaceSmileIcon className="w-6 h-6" />
          </button>

          {/* Image button */}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
          >
            <PhotoIcon className="w-6 h-6" />
          </button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

          {/* Text input */}
          <input
            type="text"
            {...register("content", { required: false })}
            onKeyDown={handleTyping}
            placeholder="Type a message..."
            autoComplete="off"
            className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-full border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all dark:text-white text-sm"
          />

          {/* Send or Mic */}
          {content && content.trim() !== "" ? (
            <button
              type="submit"
              className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-all duration-200 flex-shrink-0"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </button>
          ) : (
            <button
              type="button"
              onMouseDown={startRecording}
              className="p-3 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors flex-shrink-0"
              title="Hold to record"
            >
              <MicrophoneIcon className="w-5 h-5" />
            </button>
          )}
        </form>
      )}
    </div>
  );
};
