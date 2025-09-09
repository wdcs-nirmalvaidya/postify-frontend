"use client";

import { useState, useEffect } from "react";

import { Search } from "lucide-react";
import { getFollowSuggestions, searchUsers } from "@/utils/Apis/userApi";
import { PublicUser } from "@/types/user.type";
import { UserItem } from "../user/UserItem";

export const RightSidebar = () => {
  const [suggestions, setSuggestions] = useState<PublicUser[]>([]);
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

  const usersToShow = searchQuery.trim() ? searchResults : suggestions;

  return (
    <aside className="w-80 hidden lg:block space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
      </div>

      <div className="p-4 bg-white border border-gray-200 rounded-lg space-y-4">
        <h3 className="font-bold text-gray-800">
          {searchQuery.trim() ? "Search Results" : "Who to Follow"}
        </h3>

        {isSearching && <p className="text-sm text-gray-500">Searching...</p>}

        {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
          <p className="text-sm text-gray-500">No users found.</p>
        )}

        {usersToShow.map((user) => (
          <UserItem key={user.id} user={user} />
        ))}
      </div>
    </aside>
  );
};
