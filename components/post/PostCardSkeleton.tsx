import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export const PostCardSkeleton = () => {
  return (
    <motion.div
      variants={cardVariants}
      className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-6"
    >
      <div className="animate-pulse">
        <div className="flex items-center mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10 mr-4"></div>
          <div>
            <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
            <div className="h-3 bg-gray-300 rounded w-40"></div>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="h-4 bg-gray-300 rounded"></div>
          <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>

        <div className="h-80 bg-gray-300 rounded-lg mb-4"></div>

        <div className="flex items-center space-x-6">
          <div className="h-5 w-12 bg-gray-300 rounded"></div>
          <div className="h-5 w-12 bg-gray-300 rounded"></div>
        </div>
      </div>
    </motion.div>
  );
};
