"use client";
import Link from "next/link";

export const WelcomeBanner = () => (
  <div className="bg-blue-600 text-white p-6 rounded-lg shadow-lg mb-8 text-center">
    <h2 className="text-2xl font-bold mb-2">Welcome to Postify!</h2>
    <p className="mb-4">
      Join the community to share, follow, and discover new content.
    </p>
    <Link
      href="/signup"
      className="bg-white text-blue-600 font-bold py-2 px-4 rounded-full hover:bg-blue-50 transition"
    >
      Get Started
    </Link>
  </div>
);
