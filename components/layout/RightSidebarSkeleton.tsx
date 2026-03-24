import { Search } from "lucide-react";

export const RightSidebarSkeleton = () => {
  return (
    <aside className="w-80 hidden lg:block space-y-4 animate-pulse">
      <div className="relative">
        <div className="w-full h-10 bg-gray-200 rounded-full"></div>
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
};
