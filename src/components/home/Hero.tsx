"use client";

import React from "react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

export default function HeroSection() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  return (
    <div className="relative flex flex-col items-center justify-center text-center bg-[#050F24]">
      <div className="absolute -top-250 inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(85,150,255,0.18)_0%,_rgba(0,0,0,0.1)_40%,_transparent_75%)]" />
      <div className="absolute -top-250 inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.08)_0%,_transparent_65%)] mix-blend-overlay" />

      <div className="absolute top-0 left-0 z-20 w-full flex items-center justify-between px-8 py-5">
        <div className="flex items-center  gap-2 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Walleto Logo"
            width={36}
            height={36}
            className="rounded-full"
          />
          <span className="font-semibold text-lg tracking-wide">Walleto</span>
        </div>

        <div
          onClick={() => router.push("/auth")}
          className="bg-black/40 hover:bg-black/70 cursor-pointer text-white px-4 py-1.5 rounded-full border border-white/10 transition"
        >
          Đăng nhập
        </div>
      </div>

      <div className="px-4 mt-50 flex flex-col items-center justify-center z-20">
        <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-wide text-gray-100">
          WALLETO
        </h1>
        <p className="text-sm md:text-base text-gray-300 mb-6 leading-relaxed">
          Giải pháp tài chính tối ưu dành <br /> cho bạn và ví của bạn
        </p>

        <button
          onClick={() => router.push("/auth")}
          className="cursor-pointer bg-black text-white text-sm px-6 py-2 rounded-full shadow-md hover:bg-white hover:text-black transition duration-300"
        >
          Tạo tài khoản
        </button>

        <div className="mt-10 flex flex-col items-center text-gray-400 text-xs">
          <span>Tìm hiểu</span>
          <ArrowDown className="w-4 h-4 mt-1 animate-bounce" />
        </div>
        <Image
          src="/HeroImg.png"
          alt="Hero Image"
          width={800}
          height={400}
          className="my-28 bottom-0 opacity-80"
        />
      </div>
    </div>
  );
}
