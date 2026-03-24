"use client";

import React, { useEffect, useState } from "react";
import { Memory, getMemories } from "@/utils/Apis/memoryApi";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Calendar, Hash, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";

// Example UI Component for a Memory Card
const MemoryCard = ({ memory }: { memory: Memory }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6 transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-5 border-b border-gray-50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-blue-500" />
                        {memory.title}
                    </h3>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                        {memory.posts.length} {memory.posts.length === 1 ? 'post' : 'posts'}
                    </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {memory.date_range}
                    </span>
                    {/* Assuming first post's tags/location represent the memory's base */}
                    {memory.posts[0]?.location && (
                        <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {memory.posts[0].location}
                        </span>
                    )}
                </div>
            </div>

            {/* Photo Grid */}
            <div className={`p-4 grid gap-2 ${memory.posts.length === 1 ? 'grid-cols-1' :
                memory.posts.length === 2 ? 'grid-cols-2' :
                    memory.posts.length === 3 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'
                }`}>
                {memory.posts.slice(0, 4).map((post, i) => (
                    <div
                        key={post.id}
                        className={`relative rounded-xl overflow-hidden aspect-square bg-gray-100 dark:bg-gray-700 ${memory.posts.length === 3 && i === 0 ? 'col-span-2 row-span-2 aspect-auto' : ''
                            }`}
                    >
                        {post.image_url ? (
                            <img
                                src={post.image_url}
                                alt={`Memory post ${i}`}
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                                <span className="text-gray-400 mb-2">
                                    <ImageIcon className="w-8 h-8 opacity-50" />
                                </span>
                                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-3">
                                    {post.content_text}
                                </p>
                            </div>
                        )}

                        {/* +N overlay on the 4th image if more than 4 posts */}
                        {i === 3 && memory.posts.length > 4 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="text-white text-2xl font-bold">
                                    +{memory.posts.length - 4}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Tag pills from underlying posts */}
            {(() => {
                const uniqueTags = new Set<string>();
                memory.posts.forEach(p => {
                    if (p.title) {
                        // Extract hashtags from title/content optionally, or use the tags array if passed. 
                        // In this implementation we assume the title matching our tag grouping acts as the title,
                        // and we can show some sample topics
                    }
                });
                return null;
            })()}
        </div>
    );
};

export default function MemoryFeed() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMemories();
    }, []);

    const fetchMemories = async () => {
        try {
            setLoading(true);
            const data = await getMemories();
            setMemories(data);
        } catch (error: any) {
            toast.error(error.message || "Failed to load memories");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full max-w-2xl mx-auto py-12 px-4 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-500">Curating your memories...</p>
            </div>
        );
    }

    if (memories.length === 0) {
        return (
            <div className="w-full max-w-2xl mx-auto py-20 px-4 text-center">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                    <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Memories Yet</h2>
                <p className="text-gray-500 max-w-md mx-auto">
                    Keep posting about your trips, moments, and add locations/tags. Postify will automatically curate them into beautiful memories here.
                </p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto py-8 px-4 pb-24 lg:pb-8">
            <div className="mb-8">
                <h1 className="text-3xl items-center flex gap-3 font-bold text-gray-900 dark:text-white">
                    ✨ Your Timeline
                </h1>
                <p className="text-gray-500 mt-2">
                    A beautiful collection of your experiences, grouped by timeline and place.
                </p>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-700 before:to-transparent">
                {memories.map((memory) => (
                    <MemoryCard key={memory.id} memory={memory} />
                ))}
            </div>
        </div>
    );
}
