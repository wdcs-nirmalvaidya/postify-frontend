export const ConversationSkeleton = () => {
  return (
    <div className="flex items-center p-3 animate-pulse">
      <div className="w-12 h-12 bg-gray-300 dark:bg-gray-700 rounded-full mr-4"></div>
      <div className="flex-1 space-y-2">
        <div className="w-3/4 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="w-1/2 h-4 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};
