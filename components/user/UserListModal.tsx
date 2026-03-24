"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { PublicUser } from "@/types/user.type";
import { UserItem } from "@/components/user/UserItem";

interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  users: PublicUser[];
  loading: boolean;
  isFollowing?: boolean;
}

export const UserListModal = ({
  isOpen,
  onClose,
  title,
  users,
  loading,
  isFollowing,
}: UserListModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-md h-[60vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-xl font-bold text-blue-700">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <p>Loading...</p>
              ) : users.length > 0 ? (
                <div className="space-y-4">
                  {users.map((user) => (
                    <UserItem
                      key={user.id}
                      user={user}
                      isFollowing={isFollowing}
                      variant="list"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center mt-8">
                  No users to display.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
