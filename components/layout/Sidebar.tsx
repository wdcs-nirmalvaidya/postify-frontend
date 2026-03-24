"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, Search, MessageCircle, User, Plus, Film, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { CreatePostModal } from "../post/CreatePostModal";
import { Post } from "@/types/post.types";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "null")
      : null;

  useEffect(() => {
    setMounted(true);
    setIsAuthenticated(!!localStorage.getItem("token"));
  }, []);

  const navItems = [
    { name: "Home", href: "/feedpage", icon: <Home size={20} /> },
  ];

  if (mounted && isAuthenticated) {
    navItems.push(
      { name: "Explore", href: "/explore", icon: <Search size={20} /> },
      { name: "Memories", href: "/memories", icon: <Calendar size={20} /> },
      { name: "Messages", href: "/chat", icon: <MessageCircle size={20} /> },
      { name: "Profile", href: `/profile/${user?.username}`, icon: <User size={20} /> },
      { name: "Settings", href: "/settings", icon: <Settings size={20} /> },
      { name: "Reels", href: "/reels", icon: <Film size={20} /> },
    );
  }

  if (!mounted) {
    return (
      <aside className="hidden md:flex flex-col h-screen w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 fixed top-0 left-0 shadow-sm z-40">
        <div className="h-16 flex items-center justify-center border-b dark:border-gray-800">
          <Link href="/feedpage">
            <h1 className="text-2xl font-bold dark:text-white">Postify</h1>
          </Link>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex flex-col h-screen w-64 bg-white dark:bg-gray-950 border-r dark:border-gray-800 fixed top-0 left-0 shadow-sm z-40">
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-800 bg-white/50 dark:bg-gray-950/50 backdrop-blur-sm">
        <Link href="/feedpage">
          <h1 className="text-2xl font-bold text-ig-gradient hover:opacity-80 transition-opacity">Postify</h1>
        </Link>
      </div>

      <nav className="flex flex-col p-4 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${pathname === item.href
              ? "bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-900/30 dark:to-purple-900/30 text-pink-600 dark:text-pink-400 font-bold shadow-sm"
              : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <span className={`mr-3 ${pathname === item.href ? "text-pink-600" : "text-gray-500"}`}>{item.icon}</span>
            {item.name}
          </Link>
        ))}
      </nav>

      {isAuthenticated && (
        <div className="px-4 mt-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full h-12 flex items-center justify-center gap-2 bg-ig-gradient text-white font-bold rounded-xl shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <Plus size={20} strokeWidth={3} />
            <span>Post</span>
          </button>
        </div>
      )}

      {isAuthenticated && (
        <CreatePostModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onPostCreated={(post: Post) => {
            setIsCreateModalOpen(false);
            if (pathname !== "/feedpage") {
              router.push("/feedpage");
            }
          }}
        />
      )}
    </aside>
  );
};

export default Sidebar;
