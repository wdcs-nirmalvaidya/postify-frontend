export const CommentItemSkeleton = () => {
  return (
    <div className="flex items-start space-x-4 animate-pulse">
      <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-3 w-1/2 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>
    </div>
  );
};
