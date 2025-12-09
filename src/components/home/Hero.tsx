// components/home/Hero.tsx
"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, Transition } from "framer-motion";

export default function HeroSection() {
  const router = useRouter();

  const titleTransition: Transition = {
    type: "spring",
    stiffness: 100,
    damping: 15,
    duration: 0.8,
  };

  const buttonHoverTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 20,
  };

  const buttonTransition: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 15,
  };

  const imageTransition: Transition = {
    type: "spring",
    stiffness: 80,
    damping: 15,
  };

  return (
    <div className="relative flex flex-col items-center justify-center text-center bg-[#050F24] overflow-hidden">
      <div className="absolute -top-250 inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(85,150,255,0.18)_0%,_rgba(0,0,0,0.1)_40%,_transparent_75%)]" />
      <div className="absolute -top-250 inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_transparent_65%)] mix-blend-overlay" />

      <motion.div
        className="absolute top-0 left-0 z-20 w-full flex items-center justify-between px-8 py-5"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="flex items-center gap-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Image
            src="/logo.png"
            alt="Walleto Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-semibold text-lg tracking-wide">Walleto</span>
        </motion.div>

        <motion.div
          onClick={() => router.push("/auth")}
          className="bg-black/40 hover:bg-black/70 cursor-pointer text-white px-4 py-1.5 rounded-full border border-white/10 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Đăng nhập
        </motion.div>
      </motion.div>

      <div className="px-4 mt-50 flex flex-col items-center justify-center z-20">
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold mb-4 tracking-wide text-gray-100"
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: titleTransition,
          }}
        >
          WALLETO
        </motion.h1>

        <motion.p
          className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.3,
              duration: 0.6,
            },
          }}
        >
          Giải pháp tài chính tối ưu dành <br /> cho bạn và ví của bạn
        </motion.p>

        <motion.button
          onClick={() => router.push("/auth")}
          className="cursor-pointer bg-black text-white text-sm px-6 py-2 rounded-full shadow-md hover:bg-white hover:text-black transition duration-300"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: 1,
            scale: 1,
            transition: {
              delay: 0.5,
              ...buttonTransition,
            },
          }}
          whileHover={{
            scale: 1.05,
            transition: buttonHoverTransition,
          }}
          whileTap={{ scale: 0.95 }}
        >
          Tạo tài khoản
        </motion.button>

        <motion.div
          className="mt-10 flex flex-col items-center text-gray-400 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <span>Tìm hiểu</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowDown className="w-4 h-4 mt-1" />
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: {
              delay: 0.7,
              duration: 1,
              ...imageTransition,
            },
          }}
        >
          <Image
            src="/HeroImg.png"
            alt="Hero Image"
            width={800}
            height={400}
            className="my-28 bottom-0 opacity-80"
          />
        </motion.div>
      </div>
    </div>
  );
}
