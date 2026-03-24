"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import toast from "react-hot-toast";
import { createPost, updatePost, getCategories } from "@/utils/Apis/postApi";
import { PostFormData, PostFormInput, Post } from "@/types/post.types";
import { useState, useEffect } from "react";
import Image from "next/image";
import { PREDEFINED_SONGS, getSongById } from "@/utils/songsData";

interface Category {
  id: string;
  name: string;
}

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (post: Post) => void;
  postToEdit?: Post | null;
  location?: string;
  tags?: string;
}

export const CreatePostModal = ({
  isOpen,
  onClose,
  onPostCreated,
  postToEdit = null,
}: CreatePostModalProps) => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<PostFormInput>({
    defaultValues: {
      title: "",
      content_text: "",
      category_id: "",
      location: "",
      tags: "",
      song: ""
    },
  });

  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fillDummyData = () => {
    setValue("title", "A beautiful evening! 🌅");
    setValue(
      "content_text",
      "Just enjoying the sunset after a long day of work. The colors are absolutely breathtaking today."
    );
    setValue("tags", "sunset, evening, relax");
    setValue("song", "kesariya-brahmastra");
    setMediaPreview(
      "https://images.unsplash.com/photo-1494548162494-384bba4ab999?auto=format&fit=crop&q=80&w=1000"
    );
    setMediaType("image");
    toast.success("Dummy data loaded!");
  };

  useEffect(() => {
    if (postToEdit && isOpen) {
      setValue("title", postToEdit.title);
      setValue("content_text", postToEdit.content_text || "");
      setValue("image_url", postToEdit.image_url || "");
      setValue("category_id", postToEdit.category_id);
      setValue("location", postToEdit.location || "");
      setValue("tags", postToEdit.tags ? postToEdit.tags.join(', ') : "");
      setValue("song", postToEdit.song || "");
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
      if (typeof window !== "undefined") {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            setCurrentUser(JSON.parse(storedUser));
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }
    }
  }, [isOpen]);

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

  const onSubmit = async (data: PostFormInput) => {
    try {
      if (!selectedFile && !mediaPreview && !postToEdit) {
        toast.error("Please select an image or video");
        return;
      }
      if (!currentUser) {
        toast.error("You must be logged in to create a post");
        return;
      }

      setIsSubmitting(true);

      const postData: PostFormData = {
        title: data.title,
        content_text: data.content_text,
        category_id: data.category_id,
        location: data.location || undefined,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()).filter(t => t) : undefined,
        song: data.song || undefined,
        image_url: mediaPreview ?? undefined,
      };

      let response;
      if (postToEdit) {
        response = await updatePost(postToEdit.id, postData);
        toast.success("Post updated successfully!");
      } else {
        response = await createPost(postData);
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
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative"
          >
            <div className="flex items-center justify-between pb-4 border-b dark:border-gray-700">
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-400">
                {postToEdit ? "Edit Post" : "Create a New Post"}
              </h3>
              <div className="flex items-center gap-3">
                {!postToEdit && (
                  <button
                    type="button"
                    onClick={fillDummyData}
                    className="text-xs font-semibold bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 border border-blue-200 px-3 py-1.5 rounded-lg transition-all"
                  >
                    Load Dummy
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="An interesting title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content
                </label>
                <textarea
                  {...register("content_text")}
                  rows={4}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What's on your mind?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image or Video (Optional)
                </label>
                <Controller
                  name="image_url"
                  control={control}
                  render={({ field }) => (
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md bg-white dark:bg-gray-700">
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
                            unoptimized
                          />
                        )}
                        {mediaType === "video" && mediaPreview && (
                          <video
                            src={mediaPreview}
                            controls
                            className="mx-auto h-24 w-auto rounded-md"
                          />
                        )}

                        <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                          <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white dark:bg-gray-700 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none"
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
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Image or Video up to 50MB
                        </p>
                      </div>
                    </div>
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category (Optional)
                </label>
                <select
                  {...register("category_id")}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Default (General)</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location (Optional)
                </label>
                <input
                  {...register("location")}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Paris"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (Optional)
                </label>
                <input
                  {...register("tags")}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. travel, vacation, fun (comma separated)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Song (Optional 20s Hindi Tracks)
                </label>
                <div className="flex flex-col space-y-2">
                  <select
                    {...register("song")}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No Song</option>
                    {PREDEFINED_SONGS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} - {s.artist}
                      </option>
                    ))}
                  </select>

                  {watch("song") && getSongById(watch("song") as string)?.audioUrl && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      <p className="mb-1 text-xs">Preview Audio Snippet:</p>
                      <audio
                        controls
                        className="h-8 w-full outline-none"
                        src={getSongById(watch("song") as string)?.audioUrl}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-gray-700 mt-4 space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-blue-300 dark:disabled:bg-blue-800"
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
