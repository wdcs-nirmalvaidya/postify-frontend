"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { createPost, updatePost, getCategories } from "@/utils/Apis/postApi";
import { PostFormData, Post } from "@/types/post.types";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  postToEdit?: Post | null;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onPostCreated,
  postToEdit,
}: CreatePostModalProps) => {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<PostFormData>();

  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);

  useEffect(() => {
    if (postToEdit && isOpen) {
      setValue("title", postToEdit.title);
      setValue("content_text", postToEdit.content_text || "");
      setValue("image_url", postToEdit.image_url || "");
      setValue("category_id", postToEdit.category_id);
      if (postToEdit.image_url) {
        setMediaPreview(postToEdit.image_url);
        if (postToEdit.image_url.startsWith("data:video")) {
          setMediaType("video");
        } else {
          setMediaType("image");
        }
      }
    } else {
      reset();
      setMediaPreview(null);
      setMediaType(null);
    }
  }, [postToEdit, isOpen, setValue, reset]);

  useEffect(() => {
    if (isOpen) {
      const fetchCategories = async () => {
        try {
          const fetchedCategories = await getCategories();
          setCategories(fetchedCategories);
        } catch (error) {
          if (error instanceof Error) {
            toast.error(error.message || "Failed to fetch categories.");
          }
        }
      };
      fetchCategories();
    } else {
      setMediaPreview(null);
      setMediaType(null);
    }
  }, [isOpen]);

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.type.startsWith("image/")) {
        setMediaType("image");
      } else if (file.type.startsWith("video/")) {
        setMediaType("video");
      } else {
        toast.error("Unsupported file type.");
        setMediaType(null);
        setMediaPreview(null);
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
      setMediaType(null);
    }
  };

  const onSubmit = async (data: PostFormData) => {
    try {
      const payload = { ...data, image_url: mediaPreview ?? undefined };
      let response;
      if (postToEdit) {
        response = await updatePost(postToEdit.id, payload);
        toast.success("Post updated successfully!");
      } else {
        response = await createPost(payload);
        toast.success("Post created successfully!");
      }
      if (response && response.post) {
        reset();
        onPostCreated(response.post);
        onClose();
      } else {
        throw new Error("Failed to receive a valid response from the server.");
      }
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative"
          >
            <div className="flex items-center justify-between pb-4 border-b">
              <h3 className="text-xl font-bold text-blue-700">
                {postToEdit ? "Edit Post" : "Create a New Post"}
              </h3>
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
                  Title
                </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="An interesting title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <textarea
                  {...register("content_text")}
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image or Video (Optional)
                </label>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                      <div className="space-y-1 text-center">
                        {!mediaPreview && (
                          <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                        )}
                        {mediaType === "image" && mediaPreview && (
                          <Image
                            src={mediaPreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="mx-auto h-24 w-auto rounded-md object-cover"
                          />
                        )}
                        {mediaType === "video" && mediaPreview && (
                          <video
                            src={mediaPreview}
                            controls
                            className="mx-auto h-24 w-auto rounded-md"
                          />
                        )}

                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                          >
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*,video/*"
                              onChange={(e) => {
                                const file = e.target.files
                                  ? e.target.files[0]
                                  : null;
                                handleFileChange(file);
                                field.onChange(file);
                              }}
                            />
                          </label>
                        </div>
                        <p className="text-xs text-gray-500">
                          Image or Video up to 50MB
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category (Optional)
                </label>
                <select
                  {...register("category_id")}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default (General)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-6 border-t mt-6 space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-300"
                >
                  {isSubmitting
                    ? "Saving..."
                    : postToEdit
                      ? "Save Changes"
                      : "Post"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
