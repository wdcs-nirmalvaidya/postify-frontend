"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { AuthGuard } from "@/components/user/AuthGurd";
import { updateUserPrivacy } from "@/utils/Apis/userApi";

export default function SettingsPage() {
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setIsPrivate(user.is_private || false);
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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-2xl mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Account Privacy
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-700">Private Account</p>
                <p className="text-sm text-gray-500">
                  When your account is private, only people Follow you can see
                  your posts.
                </p>
              </div>
              <label
                htmlFor="privacy-toggle"
                className="relative inline-flex items-center cursor-pointer"
              >
                <input
                  type="checkbox"
                  id="privacy-toggle"
                  className="sr-only peer"
                  checked={isPrivate}
                  disabled={loading}
                  onChange={(e) => handlePrivacyToggle(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
