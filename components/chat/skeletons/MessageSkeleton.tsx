export const MessageSkeleton = () => {
  return (
    <div className="flex items-end gap-2 animate-pulse">
      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="w-2/3 h-12 bg-gray-300 dark:bg-gray-700 rounded-2xl rounded-bl-none"></div>
    </div>
  );
};
