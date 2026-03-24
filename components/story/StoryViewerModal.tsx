import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { GroupedUserStories, Story } from '../../types/story.types';
import Image from 'next/image';

interface StoryViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    groupedStories: GroupedUserStories[];
    initialGroupIndex: number;
    currentUserId: string | undefined;
    onViewStory: (storyId: string) => void;
    onDeleteStory: (storyId: string) => Promise<void>;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
    isOpen,
    onClose,
    groupedStories,
    initialGroupIndex,
    currentUserId,
    onViewStory,
    onDeleteStory,
}) => {
    const [activeGroupIndex, setActiveGroupIndex] = useState(initialGroupIndex);
    const [activeStoryIndex, setActiveStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const STORY_DURATION = 5000; // 5 seconds per story

    const currentGroup = groupedStories[activeGroupIndex];
    const currentStory = currentGroup?.stories[activeStoryIndex];

    // Auto-advance logic
    const handleNext = useCallback(() => {
        if (!currentGroup) return;

        // Call onViewStory for the current story before skipping
        if (currentStory && !currentStory.isViewed) {
            onViewStory(currentStory.id);
        }

        if (activeStoryIndex < currentGroup.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
            setProgress(0);
        } else if (activeGroupIndex < groupedStories.length - 1) {
            setActiveGroupIndex(prev => prev + 1);
            setActiveStoryIndex(0);
            setProgress(0);
        } else {
            onClose();
        }
    }, [activeGroupIndex, activeStoryIndex, currentGroup, groupedStories.length, currentStory, onClose, onViewStory]);

    const handlePrev = useCallback(() => {
        if (!currentGroup) return;

        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0);
        } else if (activeGroupIndex > 0) {
            setActiveGroupIndex(prev => prev - 1);
            setActiveStoryIndex(groupedStories[activeGroupIndex - 1].stories.length - 1);
            setProgress(0);
        }
    }, [activeGroupIndex, activeStoryIndex, currentGroup, groupedStories]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            // Mark current story viewed immediately if not already viewed
            if (currentStory && !currentStory.isViewed) {
                onViewStory(currentStory.id);
            }
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, currentStory, onViewStory]);

    // Progress Bar Timer
    useEffect(() => {
        if (!isOpen || !currentStory) return;

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    handleNext();
                    return 0;
                }
                return prev + (100 / (STORY_DURATION / 100)); // Update every 100ms
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isOpen, activeGroupIndex, activeStoryIndex, handleNext, currentStory]);

    if (!isOpen || !currentGroup || !currentStory) return null;

    const isOwnStory = currentUserId === currentGroup.user.id;

    const getMediaElement = (url: string) => {
        if (url.match(/\.(mp4|webm|ogg)$/i)) {
            return (
                <video
                    src={url}
                    autoPlay
                    playsInline
                    muted // Start muted for autoplay
                    className="w-full h-full object-contain bg-black"
                />
            );
        }
        return (
            <Image
                src={url}
                alt="Story"
                fill
                className="object-contain bg-black"
                unoptimized
            />
        );
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center"
            >
                <div className="relative w-full max-w-md h-[100dvh] sm:h-[85vh] sm:rounded-2xl overflow-hidden bg-black flex flex-col shadow-2xl">

                    {/* Progress Bars */}
                    <div className="absolute top-0 left-0 right-0 z-20 flex space-x-1 p-2 bg-gradient-to-b from-black/60 to-transparent">
                        {currentGroup.stories.map((s, idx) => (
                            <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all ease-linear"
                                    style={{
                                        width: idx === activeStoryIndex ? `${progress}%` : idx < activeStoryIndex ? '100%' : '0%'
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* User Info Header */}
                    <div className="absolute top-4 left-0 right-0 z-20 px-4 py-2 flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="relative w-8 h-8 rounded-full overflow-hidden ring-2 ring-white">
                                <Image
                                    src={currentGroup.user.avatar_url || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                    alt={currentGroup.user.username}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            </div>
                            <span className="text-white font-semibold text-sm drop-shadow-md">
                                {currentGroup.user.username}
                            </span>
                            <span className="text-white/70 text-xs drop-shadow-md">
                                {/* Optional: Format relative time from expires_at - 24h */}
                                24h
                            </span>
                        </div>
                        <div className="flex space-x-3">
                            {isOwnStory && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onDeleteStory(currentStory.id); handleNext(); }}
                                    className="text-white/80 hover:text-white transition p-1 bg-black/30 rounded-full"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                            <button onClick={onClose} className="text-white p-1">
                                <X className="w-6 h-6 drop-shadow-md" />
                            </button>
                        </div>
                    </div>

                    {/* Tap Navigation Areas */}
                    <div
                        className="absolute top-16 bottom-0 left-0 w-1/3 z-10 cursor-pointer"
                        onClick={handlePrev}
                    />
                    <div
                        className="absolute top-16 bottom-0 right-0 w-2/3 z-10 cursor-pointer"
                        onClick={handleNext}
                    />

                    {/* Media Content */}
                    <div className="relative flex-1 w-full h-full">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStory.id}
                                initial={{ opacity: 0.8, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="w-full h-full"
                            >
                                {getMediaElement(currentStory.media_url)}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Desktop Navigation Arrows (Hidden on Mobile) */}
                    <button
                        onClick={handlePrev}
                        className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full items-center justify-center text-white z-30 transition"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full items-center justify-center text-white z-30 transition"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>

                </div>
            </motion.div>
        </AnimatePresence>
    );
};
