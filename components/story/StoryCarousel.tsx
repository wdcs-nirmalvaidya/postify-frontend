import React, { useRef } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { GroupedUserStories } from '../../types/story.types';
import { PublicUser } from '../../types/user.type';

interface StoryCarouselProps {
    groupedStories: GroupedUserStories[];
    currentUser: PublicUser | null;
    onStoryClick: (groupIndex: number) => void;
    onCreateStoryClick: () => void;
}

export const StoryCarousel: React.FC<StoryCarouselProps> = ({
    groupedStories,
    currentUser,
    onStoryClick,
    onCreateStoryClick,
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Filter out the current user's stories from the main list if we want to show it separately first
    const currentUserGroupIndex = groupedStories.findIndex((g) => g.user.id === currentUser?.id);
    const currentUserGroup = currentUserGroupIndex !== -1 ? groupedStories[currentUserGroupIndex] : null;

    return (
        <div className="bg-white dark:bg-gray-950 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
            <div
                ref={scrollRef}
                className="flex space-x-4 overflow-x-auto scrollbar-hide select-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {/* Create Story Button */}
                <div className="flex flex-col items-center flex-shrink-0 cursor-pointer w-20" onClick={onCreateStoryClick}>
                    <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                        <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-950 overflow-hidden relative">
                            <Image
                                src={currentUser?.avatar_url || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                alt="Your Story"
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                        <div className="absolute bottom-0 right-0 bg-pink-500 rounded-full p-1 border-2 border-white dark:border-gray-950 ring-2 ring-white dark:ring-gray-950">
                            <Plus className="w-3 h-3 text-white" />
                        </div>
                    </div>
                    <span className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300 w-full text-center truncate">
                        Your Story
                    </span>
                </div>

                {/* Other Users' Stories */}
                {groupedStories.map((group, index) => {
                    // Skip if we want to handle current user purely via "Your Story"
                    if (group.user.id === currentUser?.id && index === currentUserGroupIndex) return null;

                    // Determine ring colors based on whether all stories are viewed
                    const ringClasses = group.allViewed
                        ? 'bg-gray-200 dark:bg-gray-700'
                        : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500';

                    return (
                        <div
                            key={group.user.id}
                            className="flex flex-col items-center flex-shrink-0 cursor-pointer w-20 transition-transform hover:scale-105"
                            onClick={() => onStoryClick(index)}
                        >
                            <div className={`w-16 h-16 rounded-full p-[3px] ${ringClasses}`}>
                                <div className="w-full h-full rounded-full border-2 border-white dark:border-gray-950 overflow-hidden relative bg-white dark:bg-gray-900">
                                    <Image
                                        src={group.user.avatar_url || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                                        alt={group.user.username}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            </div>
                            <span className="text-xs mt-2 font-medium text-gray-700 dark:text-gray-300 w-full text-center truncate px-1">
                                {group.user.username}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
