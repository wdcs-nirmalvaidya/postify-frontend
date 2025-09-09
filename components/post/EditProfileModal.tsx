"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { updateUserProfile } from "@/utils/Apis/userApi";
import { UserProfile } from "@/types/user.type";
import { useEffect } from "react";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onProfileUpdate: (updatedProfile: UserProfile) => void;
}

type ProfileFormData = {
  name: string;
  bio: string;
  avatar_url: string;
};

export const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}: EditProfileModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<ProfileFormData>();

  useEffect(() => {
    if (isOpen) {
      reset({
        name: profile.name || "",
        bio: profile.bio || "",
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [isOpen, profile, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    try {
      const response = await updateUserProfile(data);
      toast.success("Profile updated successfully!");
      onProfileUpdate(response.user);
      onClose();
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update profile.");
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative"
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-xl font-bold text-blue-700">Edit Profile</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  {...register("name")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  {...register("bio")}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Avatar URL
                </label>
                <input
                  {...register("avatar_url")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end pt-6 border-t mt-6 space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
