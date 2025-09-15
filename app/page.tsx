"use client";

import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Link from "next/link";
import { isAuthenticated } from "@/utils/auth";

export default function HomePage() {
  const isAuth = isAuthenticated();
  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-white to-blue-50 px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <motion.h1
            className="text-5xl md:text-6xl font-extrabold mb-4 text-gray-900"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome to <span className="text-blue-600">Postify</span> 🚀
          </motion.h1>

          <motion.p
            className="text-lg text-gray-600 mb-8 px-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Your modern social platform to post updates, connect with others,
            and build your community.
          </motion.p>

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mb-10"
          >
            <Link href={isAuth ? "/feedpage" : "/feedpage"}>
              <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-full shadow-lg hover:bg-blue-700 transition">
                Get Started
              </button>
            </Link>
          </motion.div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-10">
          <motion.div
            className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              📝 Create Posts
            </h3>
            <p className="text-gray-600">
              Easily share your ideas and updates with the world.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              👥 Follow Users
            </h3>
            <p className="text-gray-600">
              Connect and follow others to build your network.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              📸 Media Uploads
            </h3>
            <p className="text-gray-600">
              Attach images or videos to enrich your content.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              💬 Comments & Likes
            </h3>
            <p className="text-gray-600">
              Engage with posts using likes and comments.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              🔍 Explore Feed
            </h3>
            <p className="text-gray-600">
              Discover trending content and new creators.
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white rounded-xl shadow hover:shadow-md transition text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl font-semibold text-blue-700 mb-2">
              🧑‍💼 User Profiles
            </h3>
            <p className="text-gray-600">
              Showcase your posts, followers, and info on your profile.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mt-20 text-center"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            How Postify Works
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="bg-white p-5 rounded-lg shadow">
              <h4 className="font-semibold text-blue-600 mb-2">
                1. Create an Account
              </h4>
              <p className="text-gray-600">
                Sign up with your email and set up your profile in seconds.
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h4 className="font-semibold text-blue-600 mb-2">
                2. Start Posting
              </h4>
              <p className="text-gray-600">
                Share text, media, and engage with the community instantly.
              </p>
            </div>
            <div className="bg-white p-5 rounded-lg shadow">
              <h4 className="font-semibold text-blue-600 mb-2">
                3. Grow Your Network
              </h4>
              <p className="text-gray-600">
                Follow users, get followers, and expand your reach.
              </p>
            </div>
          </div>
        </motion.div>

        <div className="max-w-4xl mx-auto mt-20 text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            What Our Users Say
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <p className="text-gray-700 mb-2 italic">
                &quot;Postify is the easiest way I&apos;ve ever shared updates
                and connected with my audience.”
              </p>
              <p className="font-semibold text-gray-800">– Aditi Sharma</p>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg shadow">
              <p className="text-gray-700 mb-2 italic">
                &quot;It&apos;s like a mini social platform just for my niche
                community. I love it!&quot;
              </p>
              <p className="font-semibold text-gray-800">– Karan Patel</p>
            </div>
          </div>
        </div>

        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl font-semibold mb-4 text-gray-800">
            Ready to Join?
          </h2>
          <Link href="/signup">
            <button className="px-8 py-3 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition shadow-lg">
              Sign Up Now
            </button>
          </Link>
        </motion.div>
      </section>
      <Footer />
    </>
  );
}
