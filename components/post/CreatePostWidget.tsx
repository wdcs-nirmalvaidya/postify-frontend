"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Plus } from "lucide-react";
import Image from "next/image";
import { createPost } from "@/utils/Apis/postApi";
import { Post } from "@/types/post.types";

interface CreatePostWidgetProps {
  onPostCreated: (newPost: Post) => void;
  avatar_url?: string | null;
  openFullModal: () => void;
}

export const CreatePostWidget = ({
  onPostCreated,
  avatar_url,
  openFullModal,
}: CreatePostWidgetProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isValid },
  } = useForm<{ content_text: string }>();

  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        if (!watch("content_text")) {
          setIsExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [watch]);

  const onSubmit = async (data: { content_text: string }) => {
    try {
      const response = await createPost({
        content_text: data.content_text,
        title: " ",
      });
      toast.success("Post created successfully!");
      reset();
      setIsExpanded(false);
      onPostCreated(response.post);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast.error(errorMessage);
    }
  };

  return (
    <div ref={widgetRef} className="bg-white p-4 rounded-lg shadow-md mb-6">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex space-x-4 items-start">
          <Image
            src={
              avatar_url ||
              "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
            }
            alt="Your Avatar"
            width={40}
            height={40}
            className="rounded-full object-cover flex-shrink-0"
          />
          <textarea
            {...register("content_text", { required: true })}
            onFocus={() => setIsExpanded(true)}
            placeholder="Got something epic to share?"
            rows={isExpanded ? 3 : 1}
            className="w-full text-lg border-none focus:ring-0 resize-none p-2 transition-all duration-300"
          />
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex justify-between items-center pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={openFullModal}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                  title="More options"
                >
                  <Plus size={20} />
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !isValid}
                  className="px-4 py-2 bg-blue-600 text-white rounded-full font-semibold text-sm hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Posting..." : "Post"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
};
