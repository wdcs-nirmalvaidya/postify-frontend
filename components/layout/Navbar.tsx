"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell } from "lucide-react";
import { PublicUser } from "@/types/user.type";
import NotificationList from "../NotificationList";
import { useNotifications } from "@/utils/context/NotificationsContext";
import { NavbarSkeleton } from "./NavbarSkeleton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const notificationRef = useRef<HTMLDivElement>(null);

  const notificationsContext = useNotifications();
  const unreadCount = notificationsContext?.unreadCount ?? 0;

  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (token && userData) {
      setUser(JSON.parse(userData));
    } else {
      setUser(null);
    }
    setLoading(false);

    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    setIsNotificationOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <Link
      href={href}
      className={`transition ${pathname === href
        ? "text-transparent bg-clip-text bg-ig-gradient font-bold"
        : "text-gray-600 dark:text-gray-300 hover:text-pink-600 dark:hover:text-pink-400 transition-colors"
        }`}
    >
      {children}
    </Link>
  );

  useEffect(() => {
    if (!isNotificationOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  if (loading) return <NavbarSkeleton />;

  return (
    <header className="md:ml-64 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b dark:border-gray-800 shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 py-3 flex justify-between md:justify-end items-center">
        <Link
          href={user ? "/feedpage" : "/"}
          className="md:hidden text-2xl font-bold text-ig-gradient hover:opacity-80 transition-opacity"
        >
          Postify
        </Link>

        <nav className="hidden md:flex space-x-4 items-center text-sm font-medium">
          <ThemeToggle />
          {user ? (
            <>
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen((prev) => !prev)}
                  className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition dark:text-white"
                  aria-label="Notifications"
                >
                  <Bell className="w-6 h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center ring-2 ring-white">
                      {unreadCount}
                    </span>
                  )}
                </button>
                <AnimatePresence>
                  {isNotificationOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 z-20"
                    >
                      <NotificationList />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div>
                <p>Hello, {user.username}</p>
              </div>

              <div className="relative">
                <button onClick={() => setIsProfileMenuOpen((prev) => !prev)}>
                  <Image
                    src={
                      user.avatar_url?.trim() ||
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"
                    }
                    alt={user.name || user.username}
                    width={36}
                    height={36}
                    className="rounded-full ring-2 ring-transparent bg-gradient-to-tr from-ig-orange via-ig-red to-ig-purple p-[2px] hover:scale-105 transition-transform duration-200 object-cover w-9 h-9 aspect-square"
                    unoptimized
                  />
                </button>
                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border dark:border-gray-700 z-10"
                    >
                      <Link
                        href={`/profile/${user.username}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <NavLink href="/login">Login</NavLink>
              <Link
                href="/signup"
                className="px-5 py-2 bg-ig-gradient text-white font-medium rounded-full hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300 transform hover:-translate-y-0.5"
              >
                Sign Up
              </Link>
            </>
          )}
        </nav>

        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen((prev) => !prev)} className="dark:text-white">
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
          >
            <nav className="flex flex-col space-y-4 p-4">
              {user ? (
                <>
                  <NavLink href={`/profile/${user.username}`}>
                    My Profile
                  </NavLink>
                  <button
                    onClick={handleLogout}
                    className="text-left text-red-600"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink href="/login">Login</NavLink>
                  <NavLink href="/signup">Sign Up</NavLink>
                </>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
