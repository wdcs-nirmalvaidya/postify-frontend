"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { PublicUser } from "@/types/user.type";
import { getRandomUsers, searchUsers } from "@/utils/Apis/userApi";
import { AuthGuard } from "@/components/user/AuthGurd";
import { UserItem } from "@/components/user/UserItem";
import { Search } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function ExplorePage() {
  const [users, setUsers] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setIsSearching(false);
      setLoading(true);
      getRandomUsers()
        .then((fetchedUsers) => setUsers(fetchedUsers))
        .catch((error) => {
          toast.error(error?.message || "Failed to load users.");
        })
        .finally(() => setLoading(false));
      return;
    }

    setIsSearching(true);
    setLoading(false);
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery)
        .then((results) => setUsers(results))
        .catch((error) => {
          toast.error(error?.message || "Search failed.");
        })
        .finally(() => {
          setIsSearching(false);
          setLoading(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900">
              Discover Random People
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Expand your feed by following other creators in the community.
            </p>
          </div>

          <div className="mb-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search users by name or username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
            </div>
          </div>

          {loading ? (
            <p className="text-center">Loading suggestions...</p>
          ) : isSearching ? (
            <p className="text-center">Searching...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-500">No users found.</p>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="bg-white p-4 rounded-lg shadow-md border border-gray-200"
                >
                  <UserItem user={user} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
