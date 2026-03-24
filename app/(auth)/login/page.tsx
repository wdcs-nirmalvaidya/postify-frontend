"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loginUser } from "@/utils/Apis/authApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginFormSchema } from "@/validations/login.form";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { LoginForm } from "@/types/auth.types";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginFormSchema),
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const router = useRouter();

  const onSubmit = async (data: LoginForm) => {
    try {
      const response = await loginUser(data);
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      toast.success("Login successful!");
      router.push("/feedpage");
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unexpected error occurred.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050a0e] relative overflow-hidden p-4">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <Link
            href="/"
            className="inline-block text-5xl font-black text-ig-gradient hover:scale-105 transition-transform"
          >
            Postify
          </Link>
          <p className="text-gray-400 mt-4 text-lg">
            Welcome back to the revolution.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-dark-strong p-10 rounded-[2.5rem] border border-white/10 shadow-2xl"
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors"
                  size={20}
                />
                <input
                  type="email"
                  {...register("email")}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:bg-white/10 transition-all text-white placeholder-gray-600"
                  placeholder="name@example.com"
                />
              </div>
              {errors.email && (
                <p className="text-pink-500 text-xs mt-1 ml-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-400 ml-1">Password</label>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-pink-400 transition-colors"
                  size={20}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:bg-white/10 transition-all text-white placeholder-gray-600"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-pink-500 text-xs mt-1 ml-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-ig-gradient text-white py-4 rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(236,72,153,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all disabled:opacity-50 disabled:translate-y-0"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Authenticating..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-10 font-medium">
            New to the tribe?{" "}
            <Link
              href="/signup"
              className="text-pink-500 font-bold hover:text-pink-400 hover:underline transition-all underline-offset-4"
            >
              Join the revolution
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
