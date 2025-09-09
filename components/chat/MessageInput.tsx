"use client";
import { useForm, SubmitHandler } from "react-hook-form";
import { PaperAirplaneIcon, PaperClipIcon } from "@heroicons/react/20/solid";
import { useChatSocket } from "@/utils/hooks/useChatSocket";
import { useAuth } from "@/utils/hooks/useAuth";

type Inputs = {
  content: string;
};

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { sendMessage } = useChatSocket();
  const { user } = useAuth();
  const { register, handleSubmit, reset } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = (data) => {
    if (!data.content.trim()) return;

    sendMessage({
      conversationId,
      senderId: user!.id,
      content: data.content,
    });

    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-4 border-t bg-white flex items-center"
    >
      <button type="button" className="p-2 text-gray-500 hover:text-blue-600">
        <PaperClipIcon className="w-6 h-6" />
      </button>
      <input
        type="text"
        {...register("content", { required: true })}
        placeholder="Type a message..."
        autoComplete="off"
        className="flex-1 px-4 py-2 mx-2 bg-gray-100 rounded-full border-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="submit"
        className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 transition"
      >
        <PaperAirplaneIcon className="w-6 h-6" />
      </button>
    </form>
  );
};
