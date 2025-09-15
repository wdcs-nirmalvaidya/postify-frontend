export const NavbarSkeleton = () => {
  return (
    <header className="bg-white/80 backdrop-blur-md border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="h-8 w-24 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="hidden md:flex space-x-4 items-center">
          <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-9 w-24 bg-gray-300 dark:bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        <div className="md:hidden h-8 w-8 bg-gray-300 dark:bg-gray-700 rounded animate-pulse"></div>
      </div>
    </header>
  );
};
