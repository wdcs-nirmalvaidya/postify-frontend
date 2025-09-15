import { PostCardSkeleton } from "@/components/post/PostCardSkeleton";

export const ProfilePageSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 animate-pulse">
      <main className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <div className="flex items-center">
            <div className="w-32 h-32 bg-gray-300 dark:bg-gray-700 rounded-full mr-8 border-4 border-blue-200"></div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <div className="h-8 w-48 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-5 w-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="h-10 w-28 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              </div>
              <div className="h-4 w-full bg-gray-300 dark:bg-gray-700 rounded mt-4"></div>
              <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-700 rounded mt-2"></div>
              <div className="flex space-x-6 mt-4">
                <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="space-y-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      </main>
    </div>
  );
};
