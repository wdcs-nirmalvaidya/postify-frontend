"use client";

import { useState, useEffect } from "react";

import { Search } from "lucide-react";
import { getFollowSuggestions, searchUsers } from "@/utils/Apis/userApi";
import { PublicUser } from "@/types/user.type";
import { UserItem } from "../user/UserItem";
import { RightSidebarSkeleton } from "./RightSidebarSkeleton";

export const RightSidebar = () => {
  const [suggestions, setSuggestions] = useState<PublicUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PublicUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getFollowSuggestions();
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSuggestions();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  if (loading) {
    return <RightSidebarSkeleton />;
  }

  const usersToShow = searchQuery.trim() ? searchResults : suggestions;

  return (
    <aside className="w-80 hidden lg:block space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all shadow-sm dark:text-white dark:placeholder-gray-400"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      <div className="p-6 bg-white dark:bg-gray-950 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-gray-200">
          {searchQuery.trim() ? "Search Results" : "Who to Follow"}
        </h3>

        {isSearching && <p className="text-sm text-gray-500">Searching...</p>}

        {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
          <p className="text-sm text-gray-500">No users found.</p>
        )}

        {usersToShow.map((user) => (
          <UserItem key={user.id} user={user} variant="list" />
        ))}
      </div>
    </aside>
  );
};
