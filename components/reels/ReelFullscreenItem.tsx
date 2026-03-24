"use client";

import { useRef, useState, useEffect } from "react";
import { Reel } from "@/data/dummyReels";
import { Heart, MessageCircle, Share2, Music, UserPlus, Play, Pause, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSongById } from "@/utils/songsData";

interface ReelFullscreenItemProps {
    reel: Reel;
}

export const ReelFullscreenItem = ({ reel }: ReelFullscreenItemProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(reel.likes);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showHeartAnimation, setShowHeartAnimation] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        try {
                            const playPromise = videoRef.current?.play();
                            if (playPromise !== undefined) {
                                playPromise.then(() => {
                                    setIsPlaying(true);
                                }).catch(() => {
                                    setIsPlaying(false);
                                });
                            }
                        } catch (e) {
                            console.error("Video play failed", e);
                        }
                    } else {
                        videoRef.current?.pause();
                        setIsPlaying(false);
                    }
                });
            },
            { threshold: 0.8 }
        );

        if (videoRef.current) {
            observer.observe(videoRef.current);
        }

        return () => observer.disconnect();
    }, []);

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
            } else {
                videoRef.current.play().then(() => {
                    setIsPlaying(true);
                }).catch(() => {
                    setIsPlaying(false);
                });
            }
        }
    };

    const handleDoubleClick = (e: React.MouseEvent) => {
        if (!isLiked) {
            setIsLiked(true);
            setLikesCount(prev => prev + 1);
        }
        setShowHeartAnimation(true);
        setTimeout(() => setShowHeartAnimation(false), 800);
    };

    const toggleLike = () => {
        if (isLiked) {
            setLikesCount(prev => prev - 1);
        } else {
            setLikesCount(prev => prev + 1);
        }
        setIsLiked(!isLiked);
    };

    const formatLikes = (count: number) => {
        if (count >= 1000) return (count / 1000).toFixed(1) + 'k';
        return count.toString();
    };

    const handleVideoError = () => {
        console.log("Video source issue:", reel.videoUrl);
        setError(true);
    };

    return (
        <div className="h-full w-full snap-start relative bg-transparent flex items-center justify-center overflow-hidden">
            {/* Blurred Background for Landscape Videos */}
            <div className="absolute inset-0 opacity-50 blur-3xl scale-110 pointer-events-none">
                <video
                    src={reel.videoUrl}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    autoPlay
                />
            </div>

            {/* Main Video Container (9:16 Aspect Ratio) */}
            <div className="relative h-full w-full max-w-[calc(100vh*9/16)] bg-transparent shadow-2xl flex items-center justify-center z-10">
                {!error ? (
                    <video
                        ref={videoRef}
                        src={reel.videoUrl}
                        className="w-full h-full object-contain cursor-pointer"
                        loop
                        playsInline
                        autoPlay
                        muted
                        onClick={togglePlay}
                        onDoubleClick={handleDoubleClick}
                        onError={handleVideoError}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center text-white/50 p-6 text-center">
                        <AlertCircle size={48} className="mb-4 opacity-20" />
                        <p className="text-sm font-medium">Video could not be loaded</p>
                        <p className="text-xs mt-2 opacity-50">Please check your connection or try again later</p>
                    </div>
                )}

                {/* Overlay - Bottom Information */}
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none z-20">
                    <div className="flex items-center gap-3 mb-4 pointer-events-auto">
                        <div className="w-10 h-10 rounded-full border-2 border-white/50 overflow-hidden bg-gray-500 shadow-lg">
                            <div className="w-full h-full flex items-center justify-center text-white bg-ig-gradient font-bold text-xs">
                                {reel.username.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <span className="text-white font-bold text-sm drop-shadow-md">@{reel.username}</span>
                        <button className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-semibold backdrop-blur-md border border-white/10 transition-all flex items-center gap-1">
                            <UserPlus size={14} />
                            Follow
                        </button>
                    </div>

                    <p className="text-white text-sm mb-4 line-clamp-2 max-w-[90%] pointer-events-auto drop-shadow-sm font-medium">
                        Experiencing the beauty of {reel.username}'s world! ✨ #Reels #Postify
                    </p>

                    <div className="flex flex-col gap-2 w-full sm:w-auto overflow-hidden pointer-events-auto">
                        <div className="flex items-center gap-2 text-white/90">
                            <Music size={14} className={reel.song && getSongById(reel.song) ? "animate-spin-slow text-blue-400" : "animate-spin-slow"} />
                            <span className="text-xs font-medium truncate max-w-[200px]" title={reel.song && getSongById(reel.song) ? `${getSongById(reel.song)!.title} - ${getSongById(reel.song)!.artist}` : `Original Audio - ${reel.username}`}>
                                {reel.song && getSongById(reel.song)
                                    ? `${getSongById(reel.song)!.title} - ${getSongById(reel.song)!.artist}`
                                    : `Original Audio - ${reel.username}`}
                            </span>
                        </div>
                        {reel.song && getSongById(reel.song)?.audioUrl && (
                            <div className="pl-5">
                                <audio controls className="h-6 w-[200px] outline-none opacity-80 hover:opacity-100 transition-opacity" src={getSongById(reel.song)!.audioUrl} preload="none" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Interactions */}
                <div className="absolute right-2 bottom-24 flex flex-col items-center gap-6 z-30">
                    {/* Like */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button
                            onClick={toggleLike}
                            className={`w-12 h-12 rounded-full flex items-center justify-center ${isLiked ? 'text-rose-500' : 'text-white'} hover:bg-white/10 transition-all active:scale-90`}
                        >
                            <Heart size={32} fill={isLiked ? "currentColor" : "none"} strokeWidth={2.5} className="drop-shadow-lg" />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">{formatLikes(likesCount)}</span>
                    </div>

                    {/* Comment */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                            <MessageCircle size={32} strokeWidth={2.5} className="drop-shadow-lg" />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md">1.2k</span>
                    </div>

                    {/* Share */}
                    <div className="flex flex-col items-center gap-1 group">
                        <button className="w-12 h-12 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all active:scale-90">
                            <Share2 size={32} strokeWidth={2.5} className="drop-shadow-lg" />
                        </button>
                        <span className="text-white text-xs font-bold drop-shadow-md text-center">Share</span>
                    </div>
                </div>

                {/* Play/Pause indicator overlay */}
                <AnimatePresence>
                    {!isPlaying && !error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
                        >
                            <div className="w-20 h-20 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl">
                                <Play size={40} className="text-white ml-2" fill="white" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Center Heart Animation (Double Click) */}
                <AnimatePresence>
                    {showHeartAnimation && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.8 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
                        >
                            <Heart size={100} className="text-rose-500 fill-rose-500 drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <style jsx>{`
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};
