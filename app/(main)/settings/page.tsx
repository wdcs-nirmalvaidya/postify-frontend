"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/user/AuthGurd";
import { updateUserPrivacy } from "@/utils/Apis/userApi";
import { motion } from "framer-motion";
import { Bell, Heart, MessageCircle, UserPlus, Mail, AtSign, Megaphone, Lock } from "lucide-react";

type NotificationKey = "likes" | "comments" | "newFollowers" | "messages" | "mentions" | "appUpdates";

const NOTIFICATION_OPTIONS: { key: NotificationKey; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "likes", label: "Likes", desc: "When someone likes your post or reel.", icon: <Heart className="w-5 h-5 text-pink-400" /> },
  { key: "comments", label: "Comments", desc: "When someone comments on your post.", icon: <MessageCircle className="w-5 h-5 text-blue-400" /> },
  { key: "newFollowers", label: "New Followers", desc: "When someone starts following you.", icon: <UserPlus className="w-5 h-5 text-green-400" /> },
  { key: "messages", label: "Messages", desc: "When you receive a new direct message.", icon: <Mail className="w-5 h-5 text-yellow-400" /> },
  { key: "mentions", label: "Mentions", desc: "When someone mentions you in a post or comment.", icon: <AtSign className="w-5 h-5 text-purple-400" /> },
  { key: "appUpdates", label: "App Updates", desc: "Important news and feature announcements.", icon: <Megaphone className="w-5 h-5 text-orange-400" /> },
];

function Toggle({ checked, onChange, id }: { checked: boolean; onChange: (v: boolean) => void; id: string }) {
  return (
    <label htmlFor={id} className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        id={id}
        className="sr-only peer"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div
        className={`w-12 h-6 rounded-full flex items-center transition-all duration-300 px-0.5 
          ${checked ? "bg-ig-gradient shadow-[0_0_12px_rgba(236,72,153,0.4)]" : "bg-white/10"}`}
      >
        <div
          className={`w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${checked ? "translate-x-6" : "translate-x-0"}`}
        />
      </div>
    </label>
  );
}

export default function SettingsPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    likes: true,
    comments: true,
    newFollowers: true,
    messages: true,
    mentions: true,
    appUpdates: false,
  });

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setIsPrivate(user.is_private || false);
    }
    const savedNotifs = localStorage.getItem("notification_settings");
    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
  }, []);

  const handlePrivacyToggle = async (newPrivacyStatus: boolean) => {
    setLoading(true);
    try {
      const response = await updateUserPrivacy(newPrivacyStatus);
      setIsPrivate(newPrivacyStatus);
      toast.success("Privacy setting updated!");
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message || "Failed to update privacy settings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationToggle = (key: NotificationKey, value: boolean) => {
    const updated = { ...notifications, [key]: value };
    setNotifications(updated);
    localStorage.setItem("notification_settings", JSON.stringify(updated));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${value ? "enabled" : "disabled"}.`);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#050a0e]">
        <main className="max-w-2xl mx-auto py-10 px-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-white mb-2 tracking-tight"
          >
            Settings
          </motion.h1>
          <p className="text-gray-500 mb-10 font-medium">Manage your account preferences.</p>

          {/* Account Privacy */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-dark rounded-3xl p-6 mb-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-pink-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Account Privacy</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white">Private Account</p>
                <p className="text-sm text-gray-400 mt-0.5">
                  Only people you approve can see your posts.
                </p>
              </div>
              <Toggle
                id="privacy-toggle"
                checked={isPrivate}
                onChange={handlePrivacyToggle}
              />
            </div>
          </motion.section>

          {/* Notification Settings */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-dark rounded-3xl p-6 border border-white/10"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Notification Settings</h2>
                <p className="text-sm text-gray-400">Control which notifications you receive.</p>
              </div>
            </div>

            <div className="space-y-4">
              {NOTIFICATION_OPTIONS.map((opt, i) => (
                <motion.div
                  key={opt.key}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      {opt.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{opt.label}</p>
                      <p className="text-sm text-gray-400">{opt.desc}</p>
                    </div>
                  </div>
                  <Toggle
                    id={`notif-${opt.key}`}
                    checked={notifications[opt.key]}
                    onChange={(v) => handleNotificationToggle(opt.key, v)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </main>
      </div>
    </AuthGuard>
  );
}
