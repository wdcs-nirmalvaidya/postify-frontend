export const UserItemSkeleton = () => {
  return (
    <div className="flex flex-col bg-white dark:bg-gray-950 p-5 rounded-[1.5rem] shadow-sm border border-gray-100 dark:border-gray-800 animate-pulse">
      <div className="flex items-start space-x-4 mb-4">
        <div className="h-16 w-16 bg-gray-200 dark:bg-gray-800 rounded-2xl flex-shrink-0"></div>
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
          <div className="h-3 w-1/2 bg-gray-200 dark:bg-gray-800 rounded-lg"></div>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div className="h-3 w-full bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
        <div className="h-3 w-5/6 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>

        <div className="flex gap-3 pt-1">
          <div className="h-6 w-20 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
          <div className="h-6 w-24 bg-gray-100 dark:bg-gray-900 rounded-lg"></div>
        </div>
      </div>

      <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
    </div>
  );
};
