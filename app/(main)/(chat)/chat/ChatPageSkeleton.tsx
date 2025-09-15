import { ConversationSkeleton } from "@/components/chat/skeletons/ConversationSkeleton";
import { MessageSkeleton } from "@/components/chat/skeletons/MessageSkeleton";

export const ChatPageSkeleton = () => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 animate-pulse">
      <div className="w-80 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="p-4">
          <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="p-2 space-y-1">
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton />
          <ConversationSkeleton />
        </div>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b dark:border-gray-700 flex items-center space-x-4">
          <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-3 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <div className="flex-1 p-4 space-y-4 flex flex-col-reverse">
          <MessageSkeleton sent />
          <MessageSkeleton />
          <MessageSkeleton sent />
          <MessageSkeleton />
        </div>
        <div className="p-4 border-t dark:border-gray-700">
          <div className="h-12 w-full bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};
