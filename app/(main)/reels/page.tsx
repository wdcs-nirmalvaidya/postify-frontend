"use client";

import { useEffect, useState, useRef } from "react";
import { DUMMY_REELS as dummyReels, Reel } from "@/data/dummyReels";
import { ReelFullscreenItem } from "@/components/reels/ReelFullscreenItem";
import { CreateReelModal } from "@/components/reels/CreateReelModal";
import { Plus } from "lucide-react";
import { getPosts } from "@/utils/Apis/postApi";

export default function ReelsPage() {
    const [reels, setReels] = useState<Reel[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchReels = async () => {
            try {
                // Fetch posts (which might include reels)
                const data = await getPosts(1, 50);
                const posts = data.posts || (Array.isArray(data) ? data : []);

                // Filter video posts
                const videoPosts = posts.filter((p: any) =>
                    p.image_url && (p.image_url.match(/\.(mp4|webm|mov)$/i) || p.image_url.startsWith('data:video'))
                );

                // Map to Reel format
                const fetchedReels: Reel[] = videoPosts.map((p: any) => ({
                    id: p.id,
                    videoUrl: p.image_url,
                    username: p.author?.username || 'user',
                    avatarUrl: p.author?.avatar_url || '',
                    likes: p.likes_count || 0,
                    description: p.content_text || '',
                    song: p.song
                }));

                // Combine fetched reels with dummy reels
                setReels([...fetchedReels, ...dummyReels]);
            } catch (err) {
                console.error("Failed to fetch reels:", err);
                setReels(dummyReels);
            }
        };

        fetchReels();
    }, []);

    const handleAddReel = () => {
        setIsCreateModalOpen(true);
    };

    const handleReelCreated = (newReel: Reel) => {
        // Prepend the new reel to the list
        setReels(prev => [newReel, ...prev]);

        // Scroll to top to see the new reel
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }

        setIsCreateModalOpen(false);
    };

    return (
        <div className="h-[calc(100vh-64px)] w-full bg-gray-50 dark:bg-black overflow-hidden relative flex justify-center">
            {/* Scrollable Container with Snap */}
            <div
                ref={containerRef}
                className="h-full w-full max-w-[500px] overflow-y-scroll snap-y snap-mandatory scrollbar-none relative z-10"
            >
                {reels.map((reel) => (
                    <ReelFullscreenItem key={reel.id} reel={reel} />
                ))}

                {reels.length === 0 && (
                    <div className="h-full w-full flex flex-col items-center justify-center text-white/50 p-6 text-center">
                        <p className="text-xl font-bold mb-2 text-white">No Reels yet</p>
                        <p>Be the first to share a moment!</p>
                    </div>
                )}
            </div>

            {/* Floating Add Button */}
            <button
                onClick={handleAddReel}
                className="fixed bottom-8 right-8 w-14 h-14 bg-ig-gradient text-white rounded-full flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all z-50 border-2 border-white/20"
                title="Add Reel"
            >
                <Plus size={32} strokeWidth={3} />
            </button>

            {/* Create Reel Modal */}
            <CreateReelModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onReelCreated={handleReelCreated}
            />

            <style jsx global>{`
                .scrollbar-none::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-none {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
