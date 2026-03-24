"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Heart, MessageCircle, Share2, Music } from "lucide-react";
import { DUMMY_REELS, Reel } from "@/data/dummyReels";

export const ReelsSidebar = () => {
    return (
        <div className="p-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                    <Play size={18} className="text-pink-500 fill-pink-500" />
                    Reels
                </h3>
                <button className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors">
                    Watch All
                </button>
            </div>

            <div className="flex flex-col space-y-4 max-h-[500px] overflow-y-auto no-scrollbar snap-y snap-mandatory">
                {DUMMY_REELS.map((reel) => (
                    <ReelItem key={reel.id} reel={reel} />
                ))}
            </div>
        </div>
    );
};

const ReelItem = ({ reel }: { reel: Reel }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    return (
        <div className="relative group aspect-[9/16] w-full bg-black rounded-xl overflow-hidden snap-start shadow-md hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-800">
            <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reel.thumbnailUrl}
                className="w-full h-full object-cover cursor-pointer"
                loop
                muted
                onClick={togglePlay}
                playsInline
            />

            {/* Overlay info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2 mb-2">
                    <img
                        src={reel.avatarUrl}
                        alt={reel.username}
                        className="w-6 h-6 rounded-full border border-white/50"
                    />
                    <span className="text-white text-[12px] font-semibold truncate">@{reel.username}</span>
                </div>
                <div className="flex items-center gap-3 text-white">
                    <div className="flex items-center gap-1 text-[11px]">
                        <Heart size={12} className="fill-red-500 text-red-500" />
                        {reel.likes}
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                        <Music size={10} className="animate-[spin_3s_linear_infinite]" />
                        Original Audio
                    </div>
                </div>
            </div>

            {/* Play/Pause indicator */}
            <button
                onClick={togglePlay}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/40 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm active:scale-90"
            >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>

            {/* Progress bar (dummy) */}
            <div className="absolute bottom-0 left-0 h-0.5 bg-pink-500/30 w-full overflow-hidden">
                {isPlaying && (
                    <motion.div
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                        className="h-full bg-pink-500"
                    />
                )}
            </div>
        </div>
    );
};
