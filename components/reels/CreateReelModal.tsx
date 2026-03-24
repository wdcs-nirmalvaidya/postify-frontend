"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, UploadCloud, Film, Play, AlertCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useState } from "react";
import { createPost } from "@/utils/Apis/postApi";

interface CreateReelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onReelCreated: (reel: any) => void;
}

export const CreateReelModal = ({ isOpen, onClose, onReelCreated }: CreateReelModalProps) => {
    const { register, handleSubmit, reset, setValue, formState: { isSubmitting } } = useForm();
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [videoFile, setVideoFile] = useState<File | null>(null);

    const fillDummyData = () => {
        setValue("title", "Aesthetic Nature Vibes 🌿");
        setValue("description", "Just testing out the new Reels feature with this amazing video! Let me know what you think 👇 #nature #reels");
        setVideoPreview("https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith("video/")) {
                toast.error("Please select a video file.");
                return;
            }

            setVideoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setVideoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: any) => {
        if (!videoPreview) {
            toast.error("Please upload a video for your Reel.");
            return;
        }

        try {

            const payload = {
                title: data.title || "New Reel",
                content_text: data.description || "",
                image_url: videoPreview, // The backend handles this as media URL
                category_id: "" // Optional
            };

            const response = await createPost(payload);

            if (response && response.post) {
                // Map post to Reel type for local UI
                const newReel = {
                    id: response.post.id,
                    videoUrl: response.post.image_url,
                    username: response.post.author.username,
                    avatarUrl: response.post.author.avatar_url,
                    likes: 0,
                    description: response.post.content_text
                };

                onReelCreated(newReel);
                toast.success("Reel uploaded successfully!");
                handleClose();
            }
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    };

    const handleClose = () => {
        reset();
        setVideoPreview(null);
        setVideoFile(null);
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={handleClose}
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-gray-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-800/50">
                            <div className="flex items-center gap-2 text-white">
                                <Film size={20} className="text-rose-500" />
                                <h3 className="font-bold">Create New Reel</h3>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={fillDummyData}
                                    className="text-xs font-semibold bg-rose-500/20 hover:bg-rose-500/30 text-rose-500 hover:text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-all"
                                >
                                    Load Dummy
                                </button>
                                <button type="button" onClick={handleClose} className="text-gray-400 hover:text-white transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Video Upload Area */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Video File</label>
                                <div
                                    className={`relative aspect-[9/16] max-h-[400px] mx-auto rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center overflow-hidden bg-gray-800/30 ${videoPreview ? 'border-rose-500/50' : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    {videoPreview ? (
                                        <>
                                            <video
                                                src={videoPreview}
                                                className="w-full h-full object-cover"
                                                controls
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setVideoPreview(null); setVideoFile(null); }}
                                                className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full hover:bg-black/80 transition-all z-10"
                                            >
                                                <X size={16} />
                                            </button>
                                        </>
                                    ) : (
                                        <label className="flex flex-col items-center gap-4 cursor-pointer p-10 w-full h-full justify-center">
                                            <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                                <UploadCloud size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-white font-medium">Click to upload video</p>
                                                <p className="text-gray-500 text-xs mt-1">MP4, WebM or MOV (9:16 recommended)</p>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="video/*"
                                                onChange={handleFileChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Caption</label>
                                    <textarea
                                        {...register("description")}
                                        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all resize-none"
                                        placeholder="Add a catchy caption..."
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1.5">Title (Internal)</label>
                                    <input
                                        {...register("title")}
                                        className="w-full bg-gray-800 border border-white/10 rounded-xl px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all"
                                        placeholder="Reel title"
                                    />
                                </div>
                            </div>

                            {/* Tips */}
                            <div className="bg-rose-500/5 border border-rose-500/10 rounded-xl p-4 flex gap-3">
                                <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                                <p className="text-xs text-rose-200/70 leading-relaxed">
                                    Pro-tip: Portrait videos (9:16) look best on Reels. Try to keep your video under 60 seconds.
                                </p>
                            </div>
                        </form>

                        {/* Footer */}
                        <div className="p-4 border-t border-white/10 bg-gray-800/50 flex gap-3">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit(onSubmit)}
                                disabled={isSubmitting || !videoPreview}
                                className="flex-[2] py-2.5 px-4 bg-ig-gradient text-white font-bold rounded-xl shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale disabled:scale-100"
                            >
                                {isSubmitting ? "Uploading..." : "Share Reel"}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
