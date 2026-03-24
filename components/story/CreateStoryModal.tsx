import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, Video, UploadCloud, Loader2 } from 'lucide-react';
import { createStory } from '../../utils/Apis/storyApi';
import toast from 'react-hot-toast';

interface CreateStoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onStoryCreated: () => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({ isOpen, onClose, onStoryCreated }) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const selectedFile = e.target.files[0];
            // Size limit e.g. 50MB
            if (selectedFile.size > 50 * 1024 * 1024) {
                toast.error('File size exceeds 50MB limit');
                return;
            }
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    };

    const clearSelection = () => {
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('media', file); // Needs to match backend expectations. Assume we handle media upload logic either via local file or Cloudinary.

            // Note: If the backend currently expects 'media_url' as a string in the body instead of a file upload, 
            // we would need an upload service here first. We'll pass it as multipart/form-data.
            await createStory(formData);

            toast.success('Story posted successfully!');
            onStoryCreated();
            clearSelection();
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to post story');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            >
                <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.95, y: 20 }}
                    className="bg-white dark:bg-gray-950 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border dark:border-gray-800 flex flex-col"
                >
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                        <h3 className="font-bold text-lg dark:text-white flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-pink-500" />
                            Add to Story
                        </h3>
                        <button
                            onClick={() => { clearSelection(); onClose(); }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition"
                        >
                            <X className="w-5 h-5 dark:text-gray-300" />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col items-center">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*,video/mp4,video/webm"
                            className="hidden"
                        />

                        {!preview ? (
                            <div
                                className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="flex space-x-3 mb-4 text-gray-400 group-hover:text-pink-500 transition-colors">
                                    <ImageIcon className="w-8 h-8" />
                                    <Video className="w-8 h-8" />
                                </div>
                                <p className="font-medium text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                                    Click to select a photo or video
                                </p>
                                <p className="text-xs text-gray-400 mt-2">Max limit 50MB</p>
                            </div>
                        ) : (
                            <div className="relative w-full aspect-[9/16] max-h-96 rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-inner group">
                                {file?.type.startsWith('video/') ? (
                                    <video src={preview} autoPlay loop muted className="max-w-full max-h-full object-contain" />
                                ) : (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={preview} alt="Preview" className="max-w-full max-h-full object-contain" />
                                )}

                                <button
                                    onClick={clearSelection}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white hover:bg-red-500 transition opacity-0 group-hover:opacity-100"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        <button
                            onClick={handleUpload}
                            disabled={!file || loading}
                            className={`mt-6 w-full py-3 rounded-full font-bold flex items-center justify-center space-x-2 transition-all ${!file || loading
                                    ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    : 'bg-ig-gradient text-white shadow-lg hover:shadow-pink-500/25 hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Posting...</span>
                                </>
                            ) : (
                                <span>Share to Story</span>
                            )}
                        </button>
                    </div>

                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
