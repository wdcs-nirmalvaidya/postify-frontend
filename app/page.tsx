"use client";

import Footer from "@/components/layout/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { isAuthenticated } from "@/utils/auth";
import { useEffect, useState, useRef } from "react";
import { Camera, Users, TrendingUp, Zap, Shield, Globe } from "lucide-react";

export default function HomePage() {
  const [isAuth, setIsAuth] = useState(false);
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8]);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 w-full z-50 px-6 py-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex justify-between items-center glass-dark px-8 py-4 rounded-3xl border-white/5 shadow-2xl">
          <Link href="/" className="text-3xl font-black text-ig-gradient">
            Postify
          </Link>
          <div className="flex gap-8 items-center">
            {isAuth ? (
              <Link href="/feedpage" className="text-white font-bold hover:text-pink-400 transition-colors">
                Enter App
              </Link>
            ) : (
              <>
                <Link href="/login" className="text-white/70 font-bold hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/signup">
                  <button className="px-6 py-2.5 bg-ig-gradient text-white font-bold rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <section ref={targetRef} className="relative min-h-screen overflow-hidden bg-[#050a0e]">
        {/* Animated Background Gradients */}
        <motion.div
          style={{ opacity, scale }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-pink-900/20 via-purple-900/20 to-transparent opacity-60 -z-10"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 -z-10 brightness-50 contrast-150"></div>
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-pink-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[20%] right-[5%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px] -z-10" />

        <div className="container mx-auto px-4 pt-48 pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-block px-4 py-1.5 mb-8 text-sm font-semibold tracking-wider text-pink-400 uppercase bg-pink-500/10 rounded-full border border-pink-500/20 backdrop-blur-sm"
            >
              New: Experience Version 2.0
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              Connect, Share, & <br />
              <span className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent">
                Inspire Together
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Postify is the modern platform for creators and communities.
              Directly influence your world through powerful storytelling.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
            >
              <Link href={isAuth ? "/feedpage" : "/signup"}>
                <button className="px-12 py-5 bg-ig-gradient text-white font-bold rounded-2xl shadow-[0_20px_50px_rgba(236,72,153,0.3)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.5)] hover:-translate-y-1 active:scale-95 transition-all duration-300 text-lg">
                  Get Started for Free
                </button>
              </Link>
              <Link href="/explore">
                <button className="px-12 py-5 glass-dark text-white font-bold rounded-2xl hover:bg-white/10 hover:border-white/30 hover:-translate-y-1 active:scale-95 transition-all duration-300 text-lg">
                  Explore Content
                </button>
              </Link>
            </motion.div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-20 px-4">
            {[
              {
                title: "Create & Share",
                desc: "Express yourself with high-fidelity posts, dynamic carousels, and rich media tools.",
                icon: <Camera className="w-6 h-6" />,
                delay: 0.2
              },
              {
                title: "Build Community",
                desc: "Find your tribe through advanced interest-based matching and curated spaces.",
                icon: <Users className="w-6 h-6" />,
                delay: 0.4
              },
              {
                title: "Engage & Grow",
                desc: "Leverage real-time analytics and meaningful engagement to expand your reach.",
                icon: <TrendingUp className="w-6 h-6" />,
                delay: 0.6
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="group p-10 glass-dark rounded-[2.5rem] hover:glass-dark-strong hover:-translate-y-3 transition-all duration-500 overflow-hidden relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: feature.delay, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-16 h-16 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-8 text-pink-400 border border-pink-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_20px_rgba(236,72,153,0.1)]">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* How It Works Section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="mt-48 max-w-6xl mx-auto"
          >
            <div className="text-center mb-24">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">How It Works</h2>
              <div className="w-24 h-1.5 bg-ig-gradient mx-auto rounded-full shadow-[0_0_20px_rgba(236,72,153,0.5)]" />
            </div>

            <div className="grid md:grid-cols-3 gap-16 relative">
              <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-white/5 -z-10">
                <div className="w-full h-full bg-ig-gradient opacity-20" />
              </div>

              {[
                { step: "01", title: "Join", desc: "Create your profile in seconds and set your interests.", icon: <Globe className="w-5 h-5" /> },
                { step: "02", title: "Connect", desc: "Follow creators and join communities that inspire you.", icon: <Shield className="w-5 h-5" /> },
                { step: "03", title: "Impact", desc: "Share your voice and watch your community thrive.", icon: <Zap className="w-5 h-5" /> }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center group"
                >
                  <div className="w-24 h-24 rounded-full glass-dark-strong border-8 border-[#0a0f14] flex items-center justify-center text-3xl font-black text-white shadow-2xl group-hover:border-pink-500/20 transition-all duration-500 mb-8 relative">
                    <div className="absolute -top-2 -right-2 p-2 bg-ig-gradient rounded-full text-white shadow-lg shadow-pink-500/30">
                      {item.icon}
                    </div>
                    {item.step}
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-pink-400 transition-colors">{item.title}</h4>
                  <p className="text-gray-400 leading-relaxed font-medium">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonials */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-48 text-center"
          >
            <h2 className="text-4xl font-black mb-20 text-white tracking-tight">Voices of the Revolution</h2>
            <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto text-left">
              {[
                {
                  quote: "Postify is the first platform that truly puts content first. The interface is breathe of fresh air for my creativity.",
                  author: "Sarah Jenkins",
                  role: "Visual Artist",
                  avatar: "https://i.pravatar.cc/150?u=sarah"
                },
                {
                  quote: "I found a global audience for my photography faster than any other platform. The engagement is incredibly meaningful.",
                  author: "David Chen",
                  role: "Photographer",
                  avatar: "https://i.pravatar.cc/150?u=david"
                }
              ].map((t, i) => (
                <div key={i} className="glass-dark p-12 rounded-[2.5rem] hover:glass-dark-strong hover:scale-[1.02] transition-all duration-500 flex flex-col justify-between">
                  <p className="text-xl text-gray-300 mb-10 leading-relaxed italic">"{t.quote}"</p>
                  <div className="flex items-center gap-5">
                    <img src={t.avatar} alt={t.author} className="w-14 h-14 rounded-full border-2 border-pink-500/30 p-1 bg-black/40" />
                    <div>
                      <p className="font-bold text-white text-lg">{t.author}</p>
                      <p className="text-pink-400 font-bold text-sm tracking-wide uppercase">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            className="text-center mt-48 mb-20"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="bg-ig-gradient rounded-[4rem] p-16 md:p-32 relative overflow-hidden max-w-6xl mx-auto text-white shadow-[0_40px_100px_-16px_rgba(236,72,153,0.4)] group">
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
              <motion.div
                className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-white/10 rounded-full blur-[120px]"
                animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ duration: 10, repeat: Infinity }}
              />
              <div className="relative z-10">
                <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter leading-none">Ready to lead <br className="hidden md:block" /> the change?</h2>
                <p className="text-white/80 text-xl md:text-3xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed italic">Your community is waiting. Start your digital legacy today.</p>
                <Link href="/signup">
                  <button className="px-16 py-6 bg-white text-[#dc2743] font-black rounded-3xl shadow-2xl hover:bg-gray-100 hover:scale-105 active:scale-95 transition-all duration-300 text-2xl tracking-tighter">
                    Start Your Story Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
      <Footer />
    </>
  );
}