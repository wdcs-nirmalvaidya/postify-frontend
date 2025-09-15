"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/utils/hooks/useAuth";
import { useChat } from "@/utils/context/ChatContext";

type Inputs = {
  content: string;
};

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { sendMessage, dispatch } = useChat();
  const { user } = useAuth();
  const { register, handleSubmit, reset, watch } = useForm<Inputs>();
  const content = watch("content");

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!data.content.trim() || !user) return;

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

    sendMessage({
      conversationId,
      senderId: user.id,
      content: data.content,
      tempId,
    });

    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-3 bg-white dark:bg-gray-800 flex items-center gap-3 border-t dark:border-gray-700"
    >
      <button
        type="button"
        className="p-2 text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <PaperClipIcon className="w-6 h-6" />
      </button>
      <input
        type="text"
        {...register("content", { required: true })}
        placeholder="Type a message..."
        autoComplete="off"
        className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-full border-transparent focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <button
        type="submit"
        disabled={!content || content.trim() === ""}
        className={`p-3 text-white rounded-full transition-all duration-300 ease-in-out transform ${
          content && content.trim() !== ""
            ? "bg-blue-600 hover:bg-blue-700 scale-100"
            : "bg-gray-400 dark:bg-gray-600 scale-75 opacity-50"
        }`}
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </form>
  );
};
